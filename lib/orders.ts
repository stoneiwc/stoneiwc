import 'server-only'
import { client } from './sanity.client'

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
  const random = Array.from(
    { length: 4 },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
  ).join('')
  return `SIWC-${datePart}-${random}`
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

  for (let attempt = 0; attempt < 5; attempt++) {
    const orderNumber = generateOrderNumber()
    const collision = await client.fetch<{ _id: string } | null>(
      `*[_type == "order" && orderNumber == $orderNumber][0]{ _id }`,
      { orderNumber },
    )
    if (collision) continue

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

  throw new Error('Failed to generate a unique order number after 5 attempts.')
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
    (PaidOrderSnapshot & { status: OrderStatus }) | null
  >(
    `*[_type == "order" && stripePaymentIntentId == $pid][0]{
      _id, orderNumber, status, customer, shippingAddress,
      items, subtotal, couponCode, couponDiscount,
      shippingMethod, shippingCost, giftCardCode, giftCardApplied, total
    }`,
    { pid: stripePaymentIntentId },
  )
  if (!order) {
    console.error(`markOrderPaid: no order for PaymentIntent ${stripePaymentIntentId}`)
    return { transitioned: false, order: null }
  }
  // Idempotent: only advance from pending or failed to paid. Don't downgrade
  // from shipped/delivered if those were set manually before the webhook arrived.
  if (order.status !== 'pending' && order.status !== 'failed') {
    return { transitioned: false, order }
  }

  await client
    .patch(order._id)
    .set({ status: 'paid', paidAt: new Date().toISOString() })
    .commit()

  return { transitioned: true, order }
}

export async function markOrderFailed(stripePaymentIntentId: string): Promise<void> {
  const order = await client.fetch<{ _id: string; status: OrderStatus } | null>(
    `*[_type == "order" && stripePaymentIntentId == $pid][0]{ _id, status }`,
    { pid: stripePaymentIntentId },
  )
  if (!order) return
  if (order.status !== 'pending') return

  await client.patch(order._id).set({ status: 'failed' }).commit()
}
