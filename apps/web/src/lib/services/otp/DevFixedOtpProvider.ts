import type { OtpProvider, OtpSendResult } from './types'

/**
 * DEV/STAGING-only OTP provider.
 * Skips SMS; the OTP stored in otp_challenges is always the fixed dev code.
 * Must never be instantiated when NODE_ENV === 'production'.
 */
export class DevFixedOtpProvider implements OtpProvider {
  async send(mobile: string, _otp: string): Promise<OtpSendResult> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DevFixedOtpProvider must not be used in production.')
    }
    // Server-side only — the code never appears in any HTTP response
    console.log(`\n[DEV_AUTH_MODE] ─────────────────────────────`)
    console.log(`  Mobile : ${mobile}`)
    console.log(`  Mode   : fixed dev OTP (no SMS sent)`)
    console.log(`  Expires: 10 minutes`)
    console.log(`─────────────────────────────────────────────\n`)
    return { success: true, ref: `dev-fixed-${Date.now()}` }
  }
}
