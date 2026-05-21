export interface OrderConfirmationLineItem {
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface OrderConfirmationAddress {
  line1?: string
  line2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface OrderConfirmationData {
  orderNumber: string
  firstName?: string
  items: OrderConfirmationLineItem[]
  subtotal: number
  couponCode?: string
  couponDiscount?: number
  shippingMethod: string
  shippingCost: number
  giftCardCode?: string
  giftCardApplied?: number
  total: number
  shippingAddress: OrderConfirmationAddress
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatAddressLines(addr: OrderConfirmationAddress): string[] {
  const lines: string[] = []
  if (addr.line1) lines.push(addr.line1)
  if (addr.line2) lines.push(addr.line2)
  const cityLine = [addr.city, addr.state].filter(Boolean).join(', ')
  const cityZip = [cityLine, addr.postalCode].filter(Boolean).join(' ')
  if (cityZip) lines.push(cityZip)
  if (addr.country) lines.push(addr.country)
  return lines
}

function money(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function orderConfirmationEmailHtml(data: OrderConfirmationData): string {
  const {
    orderNumber,
    firstName,
    items,
    subtotal,
    couponCode,
    couponDiscount,
    shippingMethod,
    shippingCost,
    giftCardCode,
    giftCardApplied,
    total,
    shippingAddress,
  } = data

  const greeting = firstName ? `Hello ${escapeHtml(firstName)},` : 'Hello,'

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;">
            <p style="margin:0;font-size:14px;color:#1a1a1a;">${escapeHtml(item.name)}</p>
            <p style="margin:2px 0 0;font-size:12px;color:#888;">Qty ${item.quantity} × ${money(item.unitPrice)}</p>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px;color:#1a1a1a;">
            ${money(item.lineTotal)}
          </td>
        </tr>`,
    )
    .join('')

  const couponRow = couponCode && couponDiscount
    ? `<tr><td style="padding:6px 0;color:#555;">Coupon (${escapeHtml(couponCode)})</td><td style="padding:6px 0;text-align:right;color:#1a1a1a;">−${money(couponDiscount)}</td></tr>`
    : ''
  const giftCardRow = giftCardCode && giftCardApplied
    ? `<tr><td style="padding:6px 0;color:#555;">Gift card (${escapeHtml(giftCardCode)})</td><td style="padding:6px 0;text-align:right;color:#1a1a1a;">−${money(giftCardApplied)}</td></tr>`
    : ''

  const addressHtml = formatAddressLines(shippingAddress)
    .map((line) => `<p style="margin:0;font-size:14px;color:#555;line-height:1.6;">${escapeHtml(line)}</p>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order ${escapeHtml(orderNumber)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e0ddd5;">

          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;">Stone International Wellness Center</p>
              <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:normal;color:#ffffff;letter-spacing:1px;">Order confirmed</h1>
            </td>
          </tr>

          <tr><td style="height:4px;background:linear-gradient(90deg,#c9a96e,#e8d5a3,#c9a96e);"></td></tr>

          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 12px;font-size:16px;color:#1a1a1a;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
                Thank you for your order. We've received your payment and will send a shipping update once your package is on its way.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0ddd5;background:#f9f8f5;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Order number</p>
                    <p style="margin:4px 0 0;font-family:'Courier New',monospace;font-size:18px;color:#1a1a1a;letter-spacing:2px;">${escapeHtml(orderNumber)}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Items</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                ${itemRows}
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-bottom:28px;">
                <tr><td style="padding:6px 0;color:#555;">Subtotal</td><td style="padding:6px 0;text-align:right;color:#1a1a1a;">${money(subtotal)}</td></tr>
                ${couponRow}
                <tr><td style="padding:6px 0;color:#555;">Shipping (${escapeHtml(shippingMethod)})</td><td style="padding:6px 0;text-align:right;color:#1a1a1a;">${money(shippingCost)}</td></tr>
                ${giftCardRow}
                <tr>
                  <td style="padding:12px 0 0;border-top:1px solid #e0ddd5;color:#1a1a1a;font-size:16px;font-weight:bold;">Total charged</td>
                  <td style="padding:12px 0 0;border-top:1px solid #e0ddd5;text-align:right;color:#1a1a1a;font-size:16px;font-weight:bold;">${money(total)}</td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Shipping to</p>
              <div style="margin-bottom:24px;">
                ${addressHtml}
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#f9f8f5;border-top:1px solid #e0ddd5;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                Questions? Contact us at support@stoneiwc.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function orderConfirmationEmailText(data: OrderConfirmationData): string {
  const {
    orderNumber,
    firstName,
    items,
    subtotal,
    couponCode,
    couponDiscount,
    shippingMethod,
    shippingCost,
    giftCardCode,
    giftCardApplied,
    total,
    shippingAddress,
  } = data

  const lines: string[] = [
    firstName ? `Hello ${firstName},` : 'Hello,',
    '',
    'Thank you for your order at Stone IWC.',
    '',
    `Order number: ${orderNumber}`,
    '',
    'Items:',
  ]

  for (const item of items) {
    lines.push(`  ${item.quantity}× ${item.name} — ${money(item.lineTotal)}`)
  }

  lines.push('', '─'.repeat(40))
  lines.push(`Subtotal:        ${money(subtotal)}`)
  if (couponCode && couponDiscount) {
    lines.push(`Coupon ${couponCode}:  −${money(couponDiscount)}`)
  }
  lines.push(`Shipping (${shippingMethod}):  ${money(shippingCost)}`)
  if (giftCardCode && giftCardApplied) {
    lines.push(`Gift card ${giftCardCode}: −${money(giftCardApplied)}`)
  }
  lines.push(`Total charged:   ${money(total)}`)
  lines.push('─'.repeat(40))

  lines.push('', 'Shipping to:')
  for (const line of formatAddressLines(shippingAddress)) {
    lines.push(`  ${line}`)
  }

  lines.push(
    '',
    "We'll email you again once your package ships.",
    '',
    'Questions? Contact support@stoneiwc.com',
  )

  return lines.join('\n')
}
