interface ContactEmailData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  message: string
}

export function contactEmailHtml(data: ContactEmailData): string {
  const { firstName, lastName, email, phone, message } = data
  const escapedMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
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
              <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:22px;font-weight:normal;color:#ffffff;letter-spacing:1px;">New Contact Message</h1>
            </td>
          </tr>

          <!-- Divider accent -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#c9a96e,#e8d5a3,#c9a96e);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                A new message has been submitted through the StoneIWC contact form.
              </p>

              <!-- Info table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0ddd5;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 20px;background:#f9f8f5;border-bottom:1px solid #e0ddd5;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Full Name</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#1a1a1a;">${firstName} ${lastName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e0ddd5;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Email</p>
                    <p style="margin:4px 0 0;font-size:16px;">
                      <a href="mailto:${email}" style="color:#c9a96e;text-decoration:none;">${email}</a>
                    </p>
                  </td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e0ddd5;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Phone</p>
                    <p style="margin:4px 0 0;font-size:16px;">
                      <a href="tel:${phone.replace(/\s/g, "")}" style="color:#c9a96e;text-decoration:none;">${phone}</a>
                    </p>
                  </td>
                </tr>` : ""}
              </table>

              <!-- Message -->
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Message</p>
              <div style="border-left:3px solid #c9a96e;padding:16px 20px;background:#f9f8f5;font-size:15px;color:#333;line-height:1.8;">
                ${escapedMessage}
              </div>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td style="background:#1a1a1a;padding:14px 28px;">
                    <a href="mailto:${email}" style="font-family:Georgia,serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;text-decoration:none;">
                      Reply to ${firstName} →
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
                This message was sent from the contact form at stoneiwc.com
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

export function contactEmailText(data: ContactEmailData): string {
  const { firstName, lastName, email, phone, message } = data
  return [
    "New Contact Form Submission — StoneIWC",
    "=".repeat(40),
    `Name:    ${firstName} ${lastName}`,
    `Email:   ${email}`,
    phone ? `Phone:   ${phone}` : null,
    "",
    "Message:",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n")
}
