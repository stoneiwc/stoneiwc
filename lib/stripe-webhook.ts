import 'server-only'
import type Stripe from 'stripe'
import { Resend } from 'resend'
import {
  giftCardEmailHtml,
  giftCardEmailText,
  giftCardPurchaseConfirmationHtml,
  giftCardPurchaseConfirmationText,
} from '@/lib/email/gift-card-template'
import {
  orderConfirmationEmailHtml,
  orderConfirmationEmailText,
  ownerOrderNotificationHtml,
  ownerOrderNotificationText,
  recoveredOrderAlertHtml,
  recoveredOrderAlertText,
} from '@/lib/email/order-confirmation-template'
import {
  claimGiftCardEmail,
  getOrCreateGiftCardForPayment,
  redeemGiftCard,
  releaseGiftCardEmail,
} from '@/lib/gift-cards'
import {
  markOrderCanceled,
  markOrderFailed,
  markOrderPaid,
  recoverPaidOrder,
  type PaidOrderSnapshot,
} from '@/lib/orders'

// What the route sends back to Stripe. Any non-2xx makes Stripe retry the
// event (for up to 3 days), so every handler below must be safe to repeat.
export interface WebhookResult {
  status: number
  body: Record<string, unknown>
}

const RECEIVED: WebhookResult = { status: 200, body: { received: true } }

function retryLater(error: string, status = 500): WebhookResult {
  return { status, body: { error } }
}

let resendClient: Resend | null = null
function resend(): Resend {
  resendClient ??= new Resend(process.env.RESEND_API_KEY)
  return resendClient
}

interface Email {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

// Returns false instead of throwing, so callers decide whether a failed send
// should make Stripe retry.
async function sendEmail(email: Email): Promise<boolean> {
  try {
    const { error } = await resend().emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      replyTo: process.env.CONTACT_EMAIL_TO!,
      ...email,
    })
    if (error) {
      console.error(`Email send error (${email.subject}):`, error)
      return false
    }
    return true
  } catch (err) {
    console.error(`Email send threw (${email.subject}):`, err)
    return false
  }
}

export async function handleStripeEvent(event: Stripe.Event): Promise<WebhookResult> {
  switch (event.type) {
    case 'payment_intent.succeeded':
      return handlePaymentSucceeded(event.data.object)
    case 'payment_intent.payment_failed':
      return updateStorefrontStatus(event.data.object, markOrderFailed, 'failed')
    case 'payment_intent.canceled':
      return updateStorefrontStatus(event.data.object, markOrderCanceled, 'cancelled')
    default:
      return RECEIVED
  }
}

async function updateStorefrontStatus(
  pi: Stripe.PaymentIntent,
  update: (paymentIntentId: string) => Promise<void>,
  label: string,
): Promise<WebhookResult> {
  if (pi.metadata?.order_type !== 'storefront') return RECEIVED
  try {
    await update(pi.id)
    return RECEIVED
  } catch (err) {
    console.error(`Failed to mark order as ${label}:`, err)
    return retryLater(`Failed to mark order as ${label}.`)
  }
}

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent): Promise<WebhookResult> {
  const meta = pi.metadata ?? {}

  if (meta.order_type === 'storefront') {
    const failure = await settleStorefrontOrder(pi)
    if (failure) return failure
  }

  // Deduct the balance of any gift card used on this order. redeemGiftCard
  // skips orders it already recorded, so a retry never deducts twice.
  const redeemedCode = meta.gift_card_code
  const appliedAmount = parseFloat(meta.gift_card_applied_amount ?? '')
  if (redeemedCode && appliedAmount > 0) {
    try {
      const redemption = await redeemGiftCard(redeemedCode, appliedAmount, pi.id)
      if (redemption.applied < appliedAmount) {
        // Charged for more than the card still held: another order spent it first.
        console.error('Gift card shortfall', pi.id, { appliedAmount, applied: redemption.applied })
      }
    } catch (err) {
      console.error('Gift card redemption failed:', err)
      return retryLater('Gift card redemption failed.')
    }
  }

  if (meta.order_type === 'gift_card') {
    return fulfillGiftCardPurchase(pi)
  }
  return RECEIVED
}

// Marks the storefront order paid and sends the order emails. Returns a
// failure result to send back to Stripe, or null to carry on.
async function settleStorefrontOrder(pi: Stripe.PaymentIntent): Promise<WebhookResult | null> {
  let result: Awaited<ReturnType<typeof markOrderPaid>>
  try {
    result = await markOrderPaid(pi.id)
  } catch (err) {
    console.error('Failed to mark order as paid:', err)
    return retryLater('Failed to mark order as paid.')
  }

  if (!result.order) {
    console.error(`No order for paid PaymentIntent ${pi.id}; recovering it from Stripe metadata`)
    try {
      const recovered = await recoverPaidOrder(pi)
      // Alert only when this delivery created the order, so retries don't
      // repeat it. The customer already has Stripe's receipt; the owner
      // follows up once the items are confirmed.
      if (recovered.created) await sendRecoveredOrderAlert(recovered.order, pi)
    } catch (err) {
      console.error('Failed to recover order:', err)
      return retryLater('Failed to recover order.')
    }
    return null
  }

  // Emails go out only on the pending → paid transition, which exactly one
  // delivery can win, so a retry or a race never duplicates them.
  if (result.transitioned) await sendOrderEmails(result.order)
  return null
}

async function sendOrderEmails(order: PaidOrderSnapshot): Promise<void> {
  const customerEmail = order.customer?.email
  const emailData = {
    orderNumber: order.orderNumber,
    firstName: order.customer?.firstName,
    items: (order.items ?? []).map((it) => ({
      name: it.name,
      quantity: Number(it.quantity ?? 0),
      unitPrice: Number(it.unitPrice ?? 0),
      lineTotal: Number(it.lineTotal ?? 0),
    })),
    subtotal: Number(order.subtotal ?? 0),
    couponCode: order.couponCode,
    couponDiscount: order.couponDiscount != null ? Number(order.couponDiscount) : undefined,
    shippingMethod: order.shippingMethod ?? 'standard',
    shippingCost: Number(order.shippingCost ?? 0),
    giftCardCode: order.giftCardCode,
    giftCardApplied: order.giftCardApplied != null ? Number(order.giftCardApplied) : undefined,
    total: Number(order.total ?? 0),
    shippingAddress: order.shippingAddress ?? {},
  }

  if (customerEmail) {
    await sendEmail({
      to: customerEmail,
      subject: `Order ${order.orderNumber} confirmed`,
      html: orderConfirmationEmailHtml(emailData),
      text: orderConfirmationEmailText(emailData),
    })
  } else {
    console.error('Order paid but no customer email to send confirmation', order._id)
  }

  const ownerData = {
    ...emailData,
    customerEmail,
    customerName:
      [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') || undefined,
  }
  await sendEmail({
    to: process.env.CONTACT_EMAIL_TO!,
    ...(customerEmail ? { replyTo: customerEmail } : {}),
    subject: `New order ${order.orderNumber} — $${emailData.total.toFixed(2)}`,
    html: ownerOrderNotificationHtml(ownerData),
    text: ownerOrderNotificationText(ownerData),
  })
}

async function sendRecoveredOrderAlert(order: PaidOrderSnapshot, pi: Stripe.PaymentIntent): Promise<void> {
  const data = {
    orderNumber: order.orderNumber,
    paymentIntentId: pi.id,
    customerName: [order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ') || undefined,
    customerEmail: order.customer.email || undefined,
    itemsSummary: pi.metadata?.items_summary,
    total: order.total,
    shippingAddress: order.shippingAddress,
  }
  await sendEmail({
    to: process.env.CONTACT_EMAIL_TO!,
    ...(data.customerEmail ? { replyTo: data.customerEmail } : {}),
    subject: `[Needs review] Paid order ${order.orderNumber} — $${order.total.toFixed(2)}`,
    html: recoveredOrderAlertHtml(data),
    text: recoveredOrderAlertText(data),
  })
}

// Creates the purchased gift card and emails it, once. A retry after the
// email went out does nothing; a retry after a failed send tries again.
async function fulfillGiftCardPurchase(pi: Stripe.PaymentIntent): Promise<WebhookResult> {
  const meta = pi.metadata ?? {}
  const customerEmail = pi.receipt_email ?? meta.customer_email
  const recipientEmail = meta.recipient_email || customerEmail
  const senderName = meta.sender_name

  if (!customerEmail || !recipientEmail || !senderName) {
    console.error('Gift card webhook: required metadata missing', pi.id)
    return retryLater('Required gift card metadata missing.', 400)
  }

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  let card: Awaited<ReturnType<typeof getOrCreateGiftCardForPayment>>
  let claimed: boolean
  try {
    card = await getOrCreateGiftCardForPayment({
      amount: pi.amount / 100,
      purchaserName: senderName,
      purchaserEmail: customerEmail,
      recipientName: meta.recipient_name,
      recipientEmail,
      note: meta.gift_card_note,
      paymentIntentId: pi.id,
      expiresAt,
    })
    claimed = await claimGiftCardEmail(card)
  } catch (err) {
    console.error('Gift card Sanity error:', err)
    return retryLater('Failed to create gift card.')
  }
  if (!claimed) return RECEIVED

  // The stored card is the source of truth, including on retries.
  const expiresLabel = new Date(card.expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const sender = card.purchaserName ?? senderName

  const sent = await sendEmail({
    to: card.recipientEmail,
    subject: `${sender} sent you a Stone IWC gift`,
    html: giftCardEmailHtml({
      code: card.code,
      amount: card.originalAmount,
      senderName: sender,
      recipientName: card.recipientName,
      recipientEmail: card.recipientEmail,
      purchaserEmail: card.purchaserEmail,
      note: card.note,
      expiresAt: expiresLabel,
    }),
    text: giftCardEmailText({
      code: card.code,
      amount: card.originalAmount,
      senderName: sender,
      recipientName: card.recipientName,
      recipientEmail: card.recipientEmail,
      purchaserEmail: card.purchaserEmail,
      note: card.note,
      expiresAt: expiresLabel,
    }),
  })
  if (!sent) {
    try {
      await releaseGiftCardEmail(card._id)
    } catch (err) {
      console.error('Could not release gift card email claim', card._id, err)
    }
    return retryLater('Gift card email failed.')
  }

  if (card.recipientEmail.toLowerCase() !== card.purchaserEmail.toLowerCase()) {
    const confirmation = {
      amount: card.originalAmount,
      senderName: sender,
      recipientName: card.recipientName,
      recipientEmail: card.recipientEmail,
      expiresAt: expiresLabel,
    }
    // Best effort: the gift itself is delivered, so don't retry for this.
    await sendEmail({
      to: card.purchaserEmail,
      subject: 'Your Stone IWC gift card has been sent',
      html: giftCardPurchaseConfirmationHtml(confirmation),
      text: giftCardPurchaseConfirmationText(confirmation),
    })
  }

  return RECEIVED
}
