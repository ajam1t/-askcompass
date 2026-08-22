import type { OtpProvider, OtpSendResult } from './types'

/**
 * DEV/TESTING OTP provider.
 * Skips SMS; the OTP stored in otp_challenges is always the fixed dev code.
 * Only instantiated when DEV_OTP_ENABLED === 'true' (see createOtpService).
 * The fixed code is never returned in any HTTP response — only logged server-side.
 */
export class DevFixedOtpProvider implements OtpProvider {
  async send(mobile: string, _otp: string): Promise<OtpSendResult> {
    // Server-side only — the code never appears in any HTTP response
    console.log(`\n[DEV_OTP] ────────────────────────────────────`)
    console.log(`  Mobile : ${mobile}`)
    console.log(`  Mode   : fixed testing OTP (no SMS sent)`)
    console.log(`  Expires: 10 minutes`)
    console.log(`──────────────────────────────────────────────\n`)
    return { success: true, ref: `dev-fixed-${Date.now()}` }
  }
}
