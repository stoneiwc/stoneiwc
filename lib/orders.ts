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
  // Idempotency: if an order already exists for this PaymentIntent, return it.
  const existing = await client.fetch<{ _id: string; orderNumber: string } | null>(
    `*[_type == "order" && stripePaymentIntentId == $pid][0]{ _id, orderNumber }`,
    { pid: input.stripePaymentIntentId },
  )
  if (existing) return existing

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

export async function markOrderPaid(stripePaymentIntentId: string): Promise<void> {
  const order = await client.fetch<{ _id: string; status: OrderStatus } | null>(
    `*[_type == "order" && stripePaymentIntentId == $pid][0]{ _id, status }`,
    { pid: stripePaymentIntentId },
  )
  if (!order) {
    console.error(`markOrderPaid: no order for PaymentIntent ${stripePaymentIntentId}`)
    return
  }
  // Idempotent: only advance from pending to paid. Don't downgrade from
  // shipped/delivered if those were set manually before the webhook arrived.
  if (order.status !== 'pending' && order.status !== 'failed') return

  await client
    .patch(order._id)
    .set({ status: 'paid', paidAt: new Date().toISOString() })
    .commit()
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
