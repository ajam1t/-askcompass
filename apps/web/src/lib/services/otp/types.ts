export interface OtpSendResult {
  success: boolean
  ref?: string       // provider reference ID (for tracking)
  error?: string
}

export interface OtpVerifyResult {
  valid: boolean
  reason?: 'expired' | 'invalid' | 'max_attempts' | 'used'
}

/** Every OTP provider must implement this interface.
 *  The real SMS provider is wired here when activated. */
export interface OtpProvider {
  send(mobile: string, otp: string): Promise<OtpSendResult>
}
