// Input checks shared by API routes and the forms that call them.

export const EMAIL_MAX_LENGTH = 254

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: unknown): email is string {
  return (
    typeof email === "string" &&
    email.length <= EMAIL_MAX_LENGTH &&
    EMAIL_PATTERN.test(email)
  )
}
