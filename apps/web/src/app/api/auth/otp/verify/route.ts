import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { createOtpService } from '@/lib/services/otp/OtpService'
import { generateSessionToken, hashSessionToken, sessionExpiresAt } from '@/lib/session'
import { INDIA_MOBILE_RE, SESSION_COOKIE, SESSION_DAYS, toE164 } from '@/lib/constants'
import type { ConsentType } from '@/types/database'

const VerifySchema = z.object({
  mobile: z.string(),
  code: z.string().regex(/^\d{6,8}$/, 'OTP must be 6 digits'),
  intent: z.enum(['login', 'register']),
  consent_terms: z.boolean().optional(),
  consent_privacy: z.boolean().optional(),
})

const OTP_REASON_MESSAGES: Record<string, string> = {
  expired: 'OTP has expired. Please request a new one.',
  max_attempts: 'Too many incorrect attempts. Request a new OTP.',
  invalid: 'Incorrect OTP. Please try again.',
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body' }, { status: 400 })
  }

  const parsed = VerifySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 })
  }

  const { mobile: rawMobile, code, intent, consent_terms, consent_privacy } = parsed.data
  const digits = rawMobile.replace(/\D/g, '')
  if (!INDIA_MOBILE_RE.test(digits)) {
    return NextResponse.json({ ok: false, message: 'Invalid mobile number' }, { status: 400 })
  }
  const mobile = toE164(digits)

  if (intent === 'register' && (!consent_terms || !consent_privacy)) {
    return NextResponse.json(
      { ok: false, message: 'You must accept the Terms of Service and Privacy Policy to register' },
      { status: 400 }
    )
  }

  try {
  const admin = await createAdminClient()
  const otpService = createOtpService()

  const verifyResult = await otpService.verify(mobile, code, admin)
  if (!verifyResult.valid) {
    const message = OTP_REASON_MESSAGES[verifyResult.reason ?? 'invalid'] ?? 'Invalid OTP'
    return NextResponse.json({ ok: false, message }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
             request.headers.get('x-real-ip') ??
             null
  const ua = request.headers.get('user-agent') ?? null

  let accountId: string
  let isNew = false

  if (intent === 'register') {
    const { data: existing } = await admin
      .from('accounts')
      .select('id')
      .eq('mobile', mobile)
      .is('deleted_at', null)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { ok: false, message: 'This number is already registered. Please log in instead.' },
        { status: 409 }
      )
    }

    const { data: newAccount, error: createError } = await admin
      .from('accounts')
      .insert({
        mobile,
        mobile_verified: true,
        account_status: 'active',
        role: 'user',
      })
      .select('id')
      .single()

    if (createError || !newAccount) {
      console.error('[otp/verify] account insert error:', createError?.message)
      return NextResponse.json({ ok: false, message: 'Account creation failed. Please try again.' }, { status: 500 })
    }

    accountId = newAccount.id
    isNew = true

    const termsVer = process.env.TERMS_VERSION ?? '1.0'
    const privacyVer = process.env.PRIVACY_POLICY_VERSION ?? '1.0'

    const consents: Array<{
      account_id: string
      type: ConsentType
      version: string
      consented: boolean
      ip_address: string | null
      user_agent: string | null
    }> = [
      { account_id: accountId, type: 'terms', version: termsVer, consented: true, ip_address: ip, user_agent: ua },
      { account_id: accountId, type: 'privacy', version: privacyVer, consented: true, ip_address: ip, user_agent: ua },
      { account_id: accountId, type: 'data_processing', version: privacyVer, consented: true, ip_address: ip, user_agent: ua },
    ]

    const { error: consentError } = await admin.from('legal_consents').insert(consents)
    if (consentError) {
      console.error('[otp/verify] consent insert error:', consentError.message)
    }

  } else {
    const { data: account } = await admin
      .from('accounts')
      .select('id, account_status')
      .eq('mobile', mobile)
      .is('deleted_at', null)
      .maybeSingle()

    if (!account) {
      return NextResponse.json(
        { ok: false, message: 'No account found with this number. Please register first.' },
        { status: 404 }
      )
    }

    if (account.account_status === 'banned') {
      return NextResponse.json(
        { ok: false, message: 'This account has been suspended. Contact support.' },
        { status: 403 }
      )
    }

    if (account.account_status === 'suspended') {
      return NextResponse.json(
        { ok: false, message: 'This account is temporarily suspended. Contact support.' },
        { status: 403 }
      )
    }

    accountId = account.id
  }

  // Create session
  const token = generateSessionToken()
  const tokenHash = hashSessionToken(token)
  const expiresAt = sessionExpiresAt()

  const { error: sessionError } = await admin.from('account_sessions').insert({
    account_id: accountId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    user_agent: ua,
    ip_address: ip,
  })

  if (sessionError) {
    console.error('[otp/verify] session insert error:', sessionError.message)
    return NextResponse.json({ ok: false, message: 'Could not create session. Please try again.' }, { status: 500 })
  }

  const response = NextResponse.json({ ok: true, is_new: isNew })
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: '/',
  })
  return response
  } catch (err) {
    // Return a clear JSON error rather than an opaque empty 500.
    console.error('[otp/verify] unhandled error:', err)
    return NextResponse.json(
      { ok: false, message: 'Could not verify OTP right now. Please try again in a moment.' },
      { status: 500 },
    )
  }
}
