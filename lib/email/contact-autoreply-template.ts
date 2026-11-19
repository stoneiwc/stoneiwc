import { CONTACT_INFO } from '../navigation'

export interface ContactAutoReplyData {
  firstName: string
}

// The route sends this with replyTo set to the team inbox, so replies reach a
// person; urgent questions go to the phone rather than back to the same inbox.
const PHONE_DISPLAY = CONTACT_INFO.phone
const PHONE_HREF = `tel:${CONTACT_INFO.phone.replace(/[^+\d]/g, '')}`

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function contactAutoReplyHtml(data: ContactAutoReplyData): string {
  const { firstName } = data
  const greeting = firstName ? `Hello ${escapeHtml(firstName)},` : 'Hello,'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We received your message</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e0ddd5;">

          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a96e;">Stone International Wellness Center</p>
              <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:normal;color:#ffffff;letter-spacing:1px;">We received your message</h1>
            </td>
          </tr>

          <tr><td style="height:4px;background:linear-gradient(90deg,#c9a96e,#e8d5a3,#c9a96e);"></td></tr>

          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1a1a1a;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">
                Thank you for reaching out to Stone International Wellness Center.
                We've received your message and a member of our team will get back to you as soon as possible.
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.7;">
                If your inquiry is urgent, please call us at
                <a href="${PHONE_HREF}" style="color:#c9a96e;text-decoration:none;">${PHONE_DISPLAY}</a>.
              </p>
              <p style="margin:24px 0 0;font-size:15px;color:#555;line-height:1.7;">
                Warm regards,<br/>
                The Stone IWC Team
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f9f8f5;border-top:1px solid #e0ddd5;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                This is an automated confirmation. You can reply to this email to add anything to your message.
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

export function contactAutoReplyText(data: ContactAutoReplyData): string {
  const { firstName } = data
  return [
    firstName ? `Hello ${firstName},` : 'Hello,',
    '',
    "Thank you for reaching out to Stone International Wellness Center.",
    "We've received your message and a member of our team will get back to you as soon as possible.",
    '',
    `If your inquiry is urgent, please call us at ${PHONE_DISPLAY}.`,
    '',
    'Warm regards,',
    'The Stone IWC Team',
    '',
    '— This is an automated confirmation. You can reply to this email to add anything to your message.',
  ].join('\n')
}
