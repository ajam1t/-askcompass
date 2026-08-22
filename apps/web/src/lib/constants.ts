// Edge-safe constants — no Node.js APIs, safe to import from middleware

export const SESSION_COOKIE = 'mj-session'
export const SESSION_DAYS = 30

/** Indian mobile: 10 digits starting with 6–9 */
export const INDIA_MOBILE_RE = /^[6-9]\d{9}$/

/** Normalise a user-supplied mobile string to E.164 Indian format */
export function toE164(digits: string): string {
  return `+91${digits}`
}
