import type { OtpProvider, OtpSendResult } from './types'

/**
 * Development-only OTP provider.
 * Prints the OTP to the SERVER console only — never to the HTTP response.
 * This provider MUST NOT be used in production.
 */
export class DevConsoleOtpProvider implements OtpProvider {
  async send(mobile: string, otp: string): Promise<OtpSendResult> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'DevConsoleOtpProvider must not be used in production. Set OTP_PROVIDER=production and configure a real SMS provider.'
      )
    }
    // Server-side log only — the OTP never appears in the API response body
    console.log(`\n[DEV OTP] ─────────────────────────────────`)
    console.log(`  Mobile : ${mobile}`)
    console.log(`  OTP    : ${otp}`)
    console.log(`  Expires: 10 minutes`)
    console.log(`────────────────────────────────────────────\n`)
    return { success: true, ref: `dev-${Date.now()}` }
  }
}
