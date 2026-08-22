export interface VerificationResult {
  verified: boolean
  documentType?: string
  maskedId?: string    // partial ID only — never store full Aadhaar
  consentRef: string
}

export interface VerificationProvider {
  initiateConsent(
    profileId: string,
    redirectUri: string
  ): Promise<{ redirectUrl: string; sessionRef: string }>

  handleCallback(
    sessionRef: string,
    code: string
  ): Promise<VerificationResult>
}

/**
 * DigiLocker provider — STUB.
 * Architecture is complete; activation requires:
 * 1. DigiLocker API credentials
 * 2. Setting DIGILOCKER_CLIENT_ID + DIGILOCKER_CLIENT_SECRET in env
 * 3. Explicit production approval
 *
 * The verifications table and admin review workflow are fully operational.
 * Until activated, verification shows as "Pending Manual Review" in admin.
 */
export class DigiLockerProvider implements VerificationProvider {
  async initiateConsent(
    _profileId: string,
    _redirectUri: string
  ): Promise<{ redirectUrl: string; sessionRef: string }> {
    throw new Error(
      'DigiLocker integration is not yet activated. ' +
      'Set DIGILOCKER_CLIENT_ID and DIGILOCKER_CLIENT_SECRET when ready.'
    )
  }

  async handleCallback(
    _sessionRef: string,
    _code: string
  ): Promise<VerificationResult> {
    throw new Error('DigiLocker integration is not yet activated.')
  }
}
