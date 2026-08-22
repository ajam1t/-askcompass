'use client'
import { useState } from 'react'
import Link from 'next/link'

type Step = 'mobile' | 'otp'

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('mobile')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [consentTerms, setConsentTerms] = useState(false)
  const [consentPrivacy, setConsentPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(false)

  const maskedMobile = mobile.length === 10
    ? `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`
    : mobile

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (mobile.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })
      const data: { ok: boolean; message?: string } = await res.json()
      if (!data.ok) {
        setError(data.message ?? 'Could not send OTP. Please try again.')
        return
      }
      setStep('otp')
      setOtp('')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCooldown) return
    setError('')
    setResendCooldown(true)
    setTimeout(() => setResendCooldown(false), 30000)
    try {
      const res = await fetch('/api/auth/otp/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })
      const data: { ok: boolean; message?: string } = await res.json()
      if (!data.ok) setError(data.message ?? 'Could not resend OTP.')
    } catch {
      setError('Network error. Please try again.')
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP')
      return
    }
    if (!consentTerms) {
      setError('Please accept the Terms of Service to continue')
      return
    }
    if (!consentPrivacy) {
      setError('Please accept the Privacy Policy to continue')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          code: otp,
          intent: 'register',
          consent_terms: consentTerms,
          consent_privacy: consentPrivacy,
        }),
      })
      const data: { ok: boolean; message?: string } = await res.json()
      if (!data.ok) {
        setError(data.message ?? 'Registration failed. Please try again.')
        return
      }
      window.location.href = '/profile'
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Brand */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-display text-maroon tracking-wide">Mithila Jodi</h1>
        </Link>
        <p className="text-ink-soft font-serif italic text-base mt-1">
          Find your match. Keep your roots.
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        {step === 'mobile' ? (
          <>
            <p className="eyebrow mb-2">Register</p>
            <h2 className="text-xl font-display text-ink mb-6">Create your account</h2>

            <form onSubmit={handleSendOtp} noValidate>
              <label className="block mb-1.5">
                <span className="text-sm font-medium text-ink">Mobile number</span>
                <div className="mt-1.5 flex items-center border border-ink/20 rounded-mj bg-white overflow-hidden focus-within:ring-2 focus-within:ring-maroon/30">
                  <span className="px-3 py-3 text-ink-soft text-sm bg-paper border-r border-ink/20 font-mono select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={mobile}
                    onChange={e => {
                      setError('')
                      setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }}
                    autoFocus
                    className="flex-1 px-4 py-3 text-ink bg-transparent focus:outline-none text-base font-mono"
                  />
                </div>
              </label>

              {error && <p className="mt-3 text-sm text-terra">{error}</p>}

              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="btn btn-primary w-full mt-5"
              >
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-ink-soft">
              Already registered?{' '}
              <Link href="/login" className="text-maroon font-medium hover:underline">
                Log in
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow mb-2">Verify &amp; Agree</p>
            <h2 className="text-xl font-display text-ink mb-1">Enter the OTP</h2>
            <p className="text-sm text-ink-soft mb-5">
              Sent to <span className="font-mono text-ink">{maskedMobile}</span>
            </p>

            <form onSubmit={handleRegister} noValidate>
              <label className="block mb-1.5">
                <span className="text-sm font-medium text-ink">6-digit OTP</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="— — — — — —"
                  value={otp}
                  onChange={e => {
                    setError('')
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }}
                  autoComplete="one-time-code"
                  autoFocus
                  className="mt-1.5 block w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] border border-ink/20 rounded-mj focus:ring-2 focus:ring-maroon/30 focus:outline-none bg-white text-ink"
                />
              </label>

              {/* Consent — DPDP required, separate for terms and privacy */}
              <div className="mt-5 space-y-3 border-t border-ink/10 pt-5">
                <p className="text-xs text-ink-soft font-medium uppercase tracking-wide">Required consents</p>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentTerms}
                    onChange={e => { setError(''); setConsentTerms(e.target.checked) }}
                    className="mt-0.5 h-4 w-4 rounded accent-maroon flex-shrink-0"
                  />
                  <span className="text-sm text-ink-soft leading-relaxed">
                    I have read and agree to the{' '}
                    <Link href="/terms" target="_blank" className="text-maroon hover:underline">
                      Terms of Service
                    </Link>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentPrivacy}
                    onChange={e => { setError(''); setConsentPrivacy(e.target.checked) }}
                    className="mt-0.5 h-4 w-4 rounded accent-maroon flex-shrink-0"
                  />
                  <span className="text-sm text-ink-soft leading-relaxed">
                    I have read and agree to the{' '}
                    <Link href="/privacy" target="_blank" className="text-maroon hover:underline">
                      Privacy Policy
                    </Link>
                    {' '}and consent to processing of my personal data
                  </span>
                </label>
              </div>

              {error && <p className="mt-3 text-sm text-terra">{error}</p>}

              <button
                type="submit"
                disabled={loading || otp.length !== 6 || !consentTerms || !consentPrivacy}
                className="btn btn-primary w-full mt-5"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm text-ink-soft">
              <button
                type="button"
                onClick={() => { setStep('mobile'); setOtp(''); setError('') }}
                className="hover:text-ink hover:underline"
              >
                ← Change number
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown}
                className="hover:text-ink hover:underline disabled:opacity-40"
              >
                {resendCooldown ? 'Resend in 30s' : 'Resend OTP'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
