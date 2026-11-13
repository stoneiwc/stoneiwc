import 'server-only'
import { randomInt } from 'node:crypto'
import { writeClient as client } from './sanity.client'
import { isSanityConflict } from './sanity-errors'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'failed'

export interface OrderAddress {
  line1?: string
  line2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface OrderCustomer {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
}

export interface OrderLineItem {
  productId?: string
  name: string
  slug?: string
  quantity: number
  unitPrice: number
  lineTotal: number
  image?: string
}

export interface CreateOrderInput {
  stripePaymentIntentId: string
  customer: OrderCustomer
  shippingAddress: OrderAddress
  billingAddress: OrderAddress
  billingSameAsShipping?: boolean
  items: OrderLineItem[]
  subtotal: number
  couponCode?: string
  couponDiscount?: number
  shippingMethod: string
  shippingCost: number
  giftCardCode?: string
  giftCardApplied?: number
  total: number
}

export function generateOrderNumber(now: Date = new Date()): string {
  const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(
    now.getUTCDate(),
  ).padStart(2, '0')}`
  const random = Array.from({ length: 4 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join('')
  return `SIWC-${datePart}-${random}`
}

// An order number no existing order uses. Tries `preferred` first, so a
// recovered order can keep the number the customer was already shown.
async function uniqueOrderNumber(preferred?: string): Promise<string> {
  const candidates = [preferred, ...Array.from({ length: 5 }, () => generateOrderNumber())]
  for (const orderNumber of candidates) {
    if (!orderNumber) continue
    const collision = await client.fetch<{ _id: string } | null>(
      `*[_type == "order" && orderNumber == $orderNumber][0]{ _id }`,
      { orderNumber },
      { cache: 'no-store' },
    )
    if (!collision) return orderNumber
  }
  throw new Error('Failed to generate a unique order number after 5 attempts.')
}

export async function createPendingOrder(
  input: CreateOrderInput,
): Promise<{ _id: string; orderNumber: string }> {
  // Idempotency: at most one order per PaymentIntent. A PaymentIntent can be
  // re-initialized for the same checkout (e.g. the customer edits their details
  // and continues again), so if one already exists we refresh it in place
  // rather than creating a duplicate. Never modify an order that has advanced
  // past pending — its data is already committed.
  const existing = await client.fetch<{
    _id: string
    orderNumber: string
    status: OrderStatus
  } | null>(
    `*[_type == "order" && stripePaymentIntentId == $pid][0]{ _id, orderNumber, status }`,
    { pid: input.stripePaymentIntentId },
    { cache: 'no-store' },
  )
  if (existing) {
    if (existing.status === 'pending') {
      const patch = client.patch(existing._id).set({
        customer: input.customer,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress,
        billingSameAsShipping: input.billingSameAsShipping ?? false,
        items: input.items.map((item) => ({
          _key: `${item.productId ?? item.name}-${Math.random().toString(36).slice(2, 8)}`,
          ...item,
        })),
        subtotal: input.subtotal,
        shippingMethod: input.shippingMethod,
        shippingCost: input.shippingCost,
        total: input.total,
      })

      // Optional discount fields: set when present, unset when removed so a
      // cleared coupon/gift card doesn't linger from an earlier attempt.
      const setFields: Record<string, unknown> = {}
      const unsetFields: string[] = []
      if (input.couponCode != null) {
        setFields.couponCode = input.couponCode
        setFields.couponDiscount = input.couponDiscount
      } else {
        unsetFields.push('couponCode', 'couponDiscount')
      }
      if (input.giftCardCode != null) {
        setFields.giftCardCode = input.giftCardCode
        setFields.giftCardApplied = input.giftCardApplied
      } else {
        unsetFields.push('giftCardCode', 'giftCardApplied')
      }

      await patch.set(setFields).unset(unsetFields).commit()
    }
    return { _id: existing._id, orderNumber: existing.orderNumber }
  }

  const orderNumber = await uniqueOrderNumber()
  const created = await client.create({
    _type: 'order',
    orderNumber,
    status: 'pending' as OrderStatus,
    createdAt: new Date().toISOString(),
    stripePaymentIntentId: input.stripePaymentIntentId,
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    billingSameAsShipping: input.billingSameAsShipping ?? false,
    items: input.items.map((item) => ({
      _key: `${item.productId ?? item.name}-${Math.random().toString(36).slice(2, 8)}`,
      ...item,
    })),
    subtotal: input.subtotal,
    couponCode: input.couponCode,
    couponDiscount: input.couponDiscount,
    shippingMethod: input.shippingMethod,
    shippingCost: input.shippingCost,
    giftCardCode: input.giftCardCode,
    giftCardApplied: input.giftCardApplied,
    total: input.total,
  })

  return { _id: created._id, orderNumber }
}

export interface PaidOrderSnapshot {
  _id: string
  orderNumber: string
  customer: OrderCustomer
  shippingAddress: OrderAddress
  items: OrderLineItem[]
  subtotal: number
  couponCode?: string
  couponDiscount?: number
  shippingMethod: string
  shippingCost: number
  giftCardCode?: string
  giftCardApplied?: number
  total: number
}

export async function markOrderPaid(
  stripePaymentIntentId: string,
): Promise<{ transitioned: boolean; order: PaidOrderSnapshot | null }> {
  const order = await client.fetch<
    (PaidOrderSnapshot & { _rev: string; status: OrderStatus }) | null
  >(
    `*[_type == "order" && stripePaymentIntentId == $pid][0]{
      _id, _rev, orderNumber, status, customer, shippingAddress,
      items, subtotal, couponCode, couponDiscount,
      shippingMethod, shippingCost, giftCardCode, giftCardApplied, total
    }`,
    { pid: stripePaymentIntentId },
    { cache: 'no-store' },
  )
  if (!order) {
    return { transitioned: false, order: null }
  }
  // Idempotent: only advance from pending or failed to paid. Don't downgrade
  // from shipped/delivered if those were set manually before the webhook arrived.
  if (order.status !== 'pending' && order.status !== 'failed') {
    return { transitioned: false, order }
  }

  // Commit only against the revision we read. If two deliveries of the same
  // event race, exactly one wins the transition, so emails go out once.
  try {
    await client
      .patch(order._id)
      .ifRevisionId(order._rev)
      .set({ status: 'paid', paidAt: new Date().toISOString() })
      .commit()
  } catch (err) {
    if (isSanityConflict(err)) return { transitioned: false, order }
    throw err
  }

  return { transitioned: true, order }
}

// The fields of a succeeded PaymentIntent that recoverPaidOrder reads.
export interface RecoverablePaymentIntent {
  id: string
  amount: number
  receipt_email?: string | null
  metadata?: Record<string, string> | null
}

// A storefront payment succeeded but no order exists for it, because the
// order write at checkout failed or someone deleted the pending order.
// Rebuilds a paid order from the PaymentIntent metadata so the sale isn't
// lost. Line items can't be rebuilt (only a text summary is in metadata), so
// the order is flagged for review in internalNotes.
//
// Idempotent: the _id is derived from the PaymentIntent, so a second
// delivery's create fails with 409 and reports created: false.
export async function recoverPaidOrder(
  pi: RecoverablePaymentIntent,
): Promise<{ created: boolean; order: PaidOrderSnapshot }> {
  const m = pi.metadata ?? {}
  const amount = (value?: string) => {
    const n = Number(value)
    return value && Number.isFinite(n) ? n : undefined
  }
  const [firstName, ...lastNames] = (m.customer_name ?? '').trim().split(/\s+/)
  const now = new Date().toISOString()

  const order: PaidOrderSnapshot = {
    _id: `order-recovered-${pi.id}`,
    orderNumber: await uniqueOrderNumber(m.order_number),
    customer: {
      email: pi.receipt_email || m.customer_email || '',
      firstName: firstName || undefined,
      lastName: lastNames.join(' ') || undefined,
      phone: m.customer_phone,
    },
    shippingAddress: {
      line1: m.ship_line1,
      line2: m.ship_line2,
      city: m.ship_city,
      state: m.ship_state,
      postalCode: m.ship_postal,
      country: m.ship_country,
    },
    items: [],
    subtotal: amount(m.subtotal) ?? 0,
    couponCode: m.coupon_code,
    couponDiscount: amount(m.coupon_discount),
    shippingMethod: m.shipping_method || 'standard',
    shippingCost: amount(m.shipping_cost) ?? 0,
    giftCardCode: m.gift_card_code,
    giftCardApplied: amount(m.gift_card_applied_amount),
    total: pi.amount / 100,
  }

  try {
    await client.create({
      ...order,
      _type: 'order',
      status: 'paid' as OrderStatus,
      createdAt: now,
      paidAt: now,
      stripePaymentIntentId: pi.id,
      billingAddress: {},
      internalNotes:
        `Recovered from Stripe: no order was recorded at checkout. ` +
        `Items: ${m.items_summary || 'unknown'}. ` +
        `Confirm the contents against Stripe payment ${pi.id} before fulfilling.`,
    })
  } catch (err) {
    if (isSanityConflict(err)) return { created: false, order }
    throw err
  }
  return { created: true, order }
}

export async function markOrderFailed(stripePaymentIntentId: string): Promise<void> {
  const order = await client.fetch<{ _id: string; status: OrderStatus } | null>(
    `*[_type == "order" && stripePaymentIntentId == $pid][0]{ _id, status }`,
    { pid: stripePaymentIntentId },
    { cache: 'no-store' },
  )
  if (!order) return
  if (order.status !== 'pending') return

  await client.patch(order._id).set({ status: 'failed' }).commit()
}

export async function markOrderCanceled(stripePaymentIntentId: string): Promise<void> {
  const order = await client.fetch<{ _id: string; status: OrderStatus } | null>(
    `*[_type == "order" && stripePaymentIntentId == $pid][0]{ _id, status }`,
    { pid: stripePaymentIntentId },
    { cache: 'no-store' },
  )
  if (!order) return
  if (order.status !== 'pending') return
  await client.patch(order._id).set({ status: 'cancelled' }).commit()
}
