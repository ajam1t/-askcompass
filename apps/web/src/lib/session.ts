import 'server-only'
import { createHash, randomBytes } from 'crypto'
import { SESSION_DAYS } from './constants'

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function sessionExpiresAt(): Date {
  const d = new Date()
  d.setDate(d.getDate() + SESSION_DAYS)
  return d
}
