import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createOtpService } from '@/lib/services/otp/OtpService'
import { INDIA_MOBILE_RE, toE164 } from '@/lib/constants'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body' }, { status: 400 })
  }

  const raw = (body as Record<string, unknown>)?.mobile
  if (typeof raw !== 'string') {
    return NextResponse.json({ ok: false, message: 'Mobile number required' }, { status: 400 })
  }

  const digits = raw.replace(/\D/g, '')
  if (!INDIA_MOBILE_RE.test(digits)) {
    return NextResponse.json(
      { ok: false, message: 'Enter a valid 10-digit Indian mobile number starting with 6–9' },
      { status: 400 }
    )
  }

  const mobile = toE164(digits)
  const admin = await createAdminClient()
  const otpService = createOtpService()

  const { sent, error } = await otpService.challenge(mobile, admin)
  if (!sent) {
    console.error('[otp/challenge] provider error:', error)
    return NextResponse.json({ ok: false, message: 'Could not send OTP. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, expires_in: 600 })
}
