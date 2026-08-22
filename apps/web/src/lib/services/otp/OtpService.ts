import { randomInt } from 'crypto'
import bcrypt from 'bcryptjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { OtpProvider, OtpVerifyResult } from './types'
import { DevConsoleOtpProvider } from './DevConsoleOtpProvider'
import { DevFixedOtpProvider } from './DevFixedOtpProvider'
import { ProductionOtpProvider } from './ProductionOtpProvider'

const OTP_TTL_MINUTES = 10
const MAX_ATTEMPTS = 5

// Server-only constant — never sent to clients, never logged in production
const DEV_FIXED_CODE = '010700'

function generateOtp(): string {
  return String(randomInt(100000, 999999))
}

/**
 * OtpService — owns challenge lifecycle.
 * Stores hashed OTPs in otp_challenges via the Supabase admin client.
 * Raw OTP is passed to the provider and never stored or returned in API responses.
 */
export class OtpService {
  constructor(
    private provider: OtpProvider,
    // When set, challenge() uses this code instead of a random one (DEV_AUTH_MODE only)
    private devFixedCode?: string
  ) {}

  async challenge(
    mobile: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabaseAdmin: SupabaseClient<any>
  ): Promise<{ sent: boolean; error?: string }> {
    const otp = this.devFixedCode ?? generateOtp()
    const hash = await bcrypt.hash(otp, 10)
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

    // Invalidate any existing unexpired challenges for this mobile
    await supabaseAdmin
      .from('otp_challenges')
      .update({ used: true })
      .eq('mobile', mobile)
      .eq('used', false)

    const { error: insertError } = await supabaseAdmin
      .from('otp_challenges')
      .insert({
        mobile,
        otp_hash: hash,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        used: false,
      })

    if (insertError) {
      console.error('[OtpService] challenge insert error:', insertError.message)
      return { sent: false, error: 'Failed to create OTP challenge' }
    }

    const result = await this.provider.send(mobile, otp)
    return { sent: result.success, error: result.error }
  }

  async verify(
    mobile: string,
    otp: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabaseAdmin: SupabaseClient<any>
  ): Promise<OtpVerifyResult> {
    const { data: challenge, error } = await supabaseAdmin
      .from('otp_challenges')
      .select('*')
      .eq('mobile', mobile)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !challenge) {
      return { valid: false, reason: 'invalid' }
    }

    if (new Date(challenge.expires_at as string) < new Date()) {
      return { valid: false, reason: 'expired' }
    }

    const attempts = challenge.attempts as number
    if (attempts >= MAX_ATTEMPTS) {
      return { valid: false, reason: 'max_attempts' }
    }

    // Increment attempt count before checking (prevents race condition)
    await supabaseAdmin
      .from('otp_challenges')
      .update({ attempts: attempts + 1 })
      .eq('id', challenge.id)

    const valid = await bcrypt.compare(otp, challenge.otp_hash as string)

    if (!valid) {
      return { valid: false, reason: 'invalid' }
    }

    // Mark as used on success
    await supabaseAdmin
      .from('otp_challenges')
      .update({ used: true })
      .eq('id', challenge.id)

    return { valid: true }
  }
}

/**
 * Factory — selects OTP provider and mode from environment variables.
 *
 * DEV_AUTH_MODE=true  →  fixed 6-digit dev code (no SMS), blocked in production.
 * OTP_PROVIDER=production  →  real SMS provider (ProductionOtpProvider stub).
 * Default  →  DevConsoleOtpProvider (random OTP printed to server console).
 */
export function createOtpService(): OtpService {
  const isProduction = process.env.NODE_ENV === 'production'
  const devAuthRequested = process.env.DEV_AUTH_MODE === 'true'

  // Hard block: DEV_AUTH_MODE must never run in production
  if (devAuthRequested && isProduction) {
    throw new Error(
      '[SECURITY] DEV_AUTH_MODE=true is not permitted when NODE_ENV=production. ' +
      'Remove DEV_AUTH_MODE from your production environment.'
    )
  }

  if (devAuthRequested) {
    // DEV/STAGING: fixed code, no SMS
    return new OtpService(new DevFixedOtpProvider(), DEV_FIXED_CODE)
  }

  const provider =
    process.env.OTP_PROVIDER === 'production'
      ? new ProductionOtpProvider()
      : new DevConsoleOtpProvider()

  return new OtpService(provider)
}
