'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Step = 'mobile' | 'sent' | 'otp'

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
      setStep('sent')
      setOtp('')
      // Auto-advance to OTP entry after animation
      setTimeout(() => setStep('otp'), 1800)
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
    if (otp.length < 6) {
      setError('Enter the OTP')
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
        {step === 'sent' ? (
          <OtpSentAnimation mobile={maskedMobile} />
        ) : step === 'mobile' ? (
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
        ) : step === 'otp' ? (
          <>
            <p className="eyebrow mb-2">Verify &amp; Agree</p>
            <h2 className="text-xl font-display text-ink mb-1">Enter the OTP</h2>
            <p className="text-sm text-ink-soft mb-5">
              Sent to <span className="font-mono text-ink">{maskedMobile}</span>
            </p>

            <form onSubmit={handleRegister} noValidate>
              <label className="block mb-1.5">
                <span className="text-sm font-medium text-ink">OTP</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="— — — — — —"
                  value={otp}
                  onChange={e => {
                    setError('')
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))
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
                    <Link href="/legal/terms" target="_blank" className="text-maroon hover:underline">
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
                    <Link href="/legal/privacy" target="_blank" className="text-maroon hover:underline">
                      Privacy Policy
                    </Link>
                    {' '}and consent to processing of my personal data
                  </span>
                </label>
              </div>

              {error && <p className="mt-3 text-sm text-terra">{error}</p>}

              <button
                type="submit"
                disabled={loading || otp.length < 6 || !consentTerms || !consentPrivacy}
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
        ) : null}
      </div>
    </div>
  )
}

/* ── OTP Sent Animation ── */
function OtpSentAnimation({ mobile }: { mobile: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 60); return () => clearTimeout(t) }, [])
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      {/* Animated checkmark ring */}
      <div
        className="relative w-20 h-20"
        style={{ transform: show ? 'scale(1)' : 'scale(0.5)', opacity: show ? 1 : 0, transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease' }}
      >
        {/* Outer gold ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gold animate-ping opacity-30" />
        <div className="absolute inset-0 rounded-full border-4 border-gold" />
        {/* Maroon circle */}
        <div className="absolute inset-2 rounded-full bg-maroon flex items-center justify-center shadow-mj-xs">
          {/* Checkmark SVG */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M 7 16 L 13 22 L 25 10"
              stroke="#E4C572"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: show ? 0 : 24,
                transition: 'stroke-dashoffset 0.45s ease 0.25s',
              }}
            />
          </svg>
        </div>
      </div>

      {/* Message */}
      <div style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.35s ease 0.3s, transform 0.35s ease 0.3s' }}>
        <p className="font-serif text-xl text-maroon">OTP Sent!</p>
        <p className="text-sm text-ink-soft mt-1">
          Code sent to <span className="font-mono text-ink">{mobile}</span>
        </p>
        <p className="text-xs text-ink-soft mt-3 opacity-60">Taking you to verification…</p>
      </div>

      {/* Marigold dots animation */}
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-marigold"
            style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite alternate` }}
          />
        ))}
      </div>

      <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }`}</style>
    </div>
  )
}
