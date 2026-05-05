interface GiftCardEmailData {
  code: string
  amount: number
  recipientEmail: string
  purchaserEmail: string
  expiresAt: string
}

export function giftCardEmailHtml(data: GiftCardEmailData): string {
  const { code, amount, expiresAt } = data

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
              <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:normal;color:#ffffff;letter-spacing:1px;">Your Gift Card</h1>
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
                A gift of wellness awaits you. Present this code at checkout to redeem your gift card.
              </p>

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
                    <p style="margin:4px 0 0;font-size:15px;color:#555;line-height:1.6;">Enter the code above during checkout on stoneiwc.com to apply the gift card to your order.</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#1a1a1a;padding:14px 32px;">
                    <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/products" style="font-family:Georgia,serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;text-decoration:none;">
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

export function giftCardEmailText(data: GiftCardEmailData): string {
  const { code, amount, expiresAt } = data
  return [
    'Your Stone IWC Gift Card',
    '='.repeat(40),
    `Value:      $${amount}`,
    `Code:       ${code}`,
    `Valid Until: ${expiresAt}`,
    '',
    'Enter the code during checkout at stoneiwc.com to redeem.',
    '',
    'Questions? Contact support@stoneiwc.com',
  ].join('\n')
}
