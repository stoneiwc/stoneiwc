interface GiftCardEmailData {
  code: string
  amount: number
  senderName: string
  recipientName?: string
  recipientEmail: string
  purchaserEmail: string
  note?: string
  expiresAt: string
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function giftCardEmailHtml(data: GiftCardEmailData): string {
  const { code, amount, senderName, recipientName, note, expiresAt } = data

  const greeting = recipientName ? `Hello ${escapeHtml(recipientName)},` : 'Hello,'
  const intro = `${escapeHtml(senderName)} has sent you a Stone IWC gift card.`

  const noteBlock = note
    ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #c9a96e;background:#faf8f3;margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Message from ${escapeHtml(senderName)}</p>
                    <p style="margin:0;font-size:15px;color:#333;line-height:1.6;font-style:italic;">${escapeHtml(note).replace(/\n/g, '<br/>')}</p>
                  </td>
                </tr>
              </table>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Stone IWC Gift Card</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e0ddd5;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;">Stone International Wellness Center</p>
              <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:normal;color:#ffffff;letter-spacing:1px;">A Gift For You</h1>
            </td>
          </tr>

          <!-- Accent -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#c9a96e,#e8d5a3,#c9a96e);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 12px;font-size:16px;color:#1a1a1a;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.7;">${intro} Use the code below at checkout to redeem.</p>

              ${noteBlock}

              <!-- Gift Card Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;margin-bottom:32px;">
                <tr>
                  <td style="padding:36px 40px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;">Gift Card Value</p>
                    <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:48px;font-weight:normal;color:#ffffff;">$${amount}</p>
                    <p style="margin:0 0 12px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#999;">Your Code</p>
                    <p style="margin:0;font-family:'Courier New',monospace;font-size:28px;letter-spacing:6px;color:#c9a96e;background:#111;padding:16px 24px;display:inline-block;">${code}</p>
                  </td>
                </tr>
              </table>

              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0ddd5;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 20px;background:#f9f8f5;border-bottom:1px solid #e0ddd5;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Valid Until</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#1a1a1a;">${expiresAt}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">How to Use</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#555;line-height:1.6;">Enter the code above during checkout on stoneiwc.com. Any unused balance stays on your card for next time.</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#1a1a1a;padding:14px 32px;">
                    <a href="https://stoneiwc.com/products" style="font-family:Georgia,serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;text-decoration:none;">
                      Shop Now →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f8f5;border-top:1px solid #e0ddd5;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                Questions? Contact us at info@stoneiwc.com
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

export function giftCardEmailText(data: GiftCardEmailData): string {
  const { code, amount, senderName, recipientName, note, expiresAt } = data
  const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,'
  const lines = [
    greeting,
    '',
    `${senderName} has sent you a Stone IWC gift card.`,
    '',
  ]
  if (note) {
    lines.push(`Message from ${senderName}:`, note, '')
  }
  lines.push(
    '='.repeat(40),
    `Value:       $${amount}`,
    `Code:        ${code}`,
    `Valid Until: ${expiresAt}`,
    '='.repeat(40),
    '',
    'Enter the code during checkout at stoneiwc.com. Any unused balance stays on your card for next time.',
    '',
    'Questions? Contact info@stoneiwc.com',
  )
  return lines.join('\n')
}

interface GiftCardPurchaseConfirmationData {
  amount: number
  senderName: string
  recipientName?: string
  recipientEmail: string
  expiresAt: string
}

export function giftCardPurchaseConfirmationHtml(data: GiftCardPurchaseConfirmationData): string {
  const { amount, recipientName, recipientEmail, expiresAt } = data
  const sentToLabel = recipientName
    ? `${escapeHtml(recipientName)} (${escapeHtml(recipientEmail)})`
    : escapeHtml(recipientEmail)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gift Card Purchase Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e0ddd5;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;">Stone International Wellness Center</p>
              <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:normal;color:#ffffff;letter-spacing:1px;">Gift Card Sent</h1>
            </td>
          </tr>

          <!-- Accent -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#c9a96e,#e8d5a3,#c9a96e);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.7;text-align:center;">
                Thank you for your purchase. Your gift card has been delivered to the recipient.
              </p>

              <!-- Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0ddd5;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 20px;background:#f9f8f5;border-bottom:1px solid #e0ddd5;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Gift Card Value</p>
                    <p style="margin:4px 0 0;font-size:18px;color:#1a1a1a;">$${amount}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e0ddd5;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Sent To</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#1a1a1a;">${sentToLabel}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Valid Until</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#1a1a1a;">${expiresAt}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:#777;line-height:1.6;text-align:center;">
                For security, the gift card code is sent only to the recipient. If they did not receive it, please ask them to check their spam folder before contacting us.
              </p>

              <!-- Footer -->
            </td>
          </tr>

          <tr>
            <td style="background:#f9f8f5;border-top:1px solid #e0ddd5;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                Questions? Contact us at info@stoneiwc.com
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

export function giftCardPurchaseConfirmationText(data: GiftCardPurchaseConfirmationData): string {
  const { amount, recipientName, recipientEmail, expiresAt } = data
  const sentTo = recipientName ? `${recipientName} (${recipientEmail})` : recipientEmail
  return [
    'Stone IWC — Gift Card Purchase Confirmation',
    '='.repeat(40),
    `Value:       $${amount}`,
    `Sent To:     ${sentTo}`,
    `Valid Until: ${expiresAt}`,
    '',
    'Thank you for your purchase. The gift card code has been emailed directly to the recipient.',
    '',
    'Questions? Contact info@stoneiwc.com',
  ].join('\n')
}
