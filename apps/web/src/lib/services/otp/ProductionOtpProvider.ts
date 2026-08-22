import type { OtpProvider, OtpSendResult } from './types'

/**
 * Production SMS OTP provider — STUB.
 * Throws until a real SMS provider SDK is wired in.
 *
 * To activate:
 * 1. Install the SMS provider SDK (e.g. MSG91, AWS SNS, etc.)
 * 2. Replace the throw with the SDK call
 * 3. Set OTP_PROVIDER=production in the environment
 * 4. Add the API key to SUPABASE_SERVICE_ROLE_KEY / OTP_SMS_API_KEY
 */
export class ProductionOtpProvider implements OtpProvider {
  async send(_mobile: string, _otp: string): Promise<OtpSendResult> {
    throw new Error(
      'SMS OTP provider is not yet activated. ' +
      'Wire a real SMS provider into ProductionOtpProvider before going live.'
    )
  }
}
