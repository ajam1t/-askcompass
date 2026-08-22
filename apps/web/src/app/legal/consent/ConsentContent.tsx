'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ConsentContent() {
  const router = useRouter()
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!terms) { setError('Please accept the Terms of Service to continue'); return }
    if (!privacy) { setError('Please accept the Privacy Policy to continue'); return }
    setError('')
    setLoading(true)
    try {
      const results = await Promise.all([
        fetch('/api/legal/consents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'terms' }),
        }).then(r => r.json()),
        fetch('/api/legal/consents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'privacy' }),
        }).then(r => r.json()),
        fetch('/api/legal/consents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'data_processing' }),
        }).then(r => r.json()),
      ])
      const failed = results.find(r => !r.ok)
      if (failed) { setError(failed.message ?? 'Could not record consent. Please try again.'); return }
      router.push('/profile')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-display text-maroon tracking-wide">Mithila Jodi</h1>
          </Link>
        </div>

        <div className="card p-6 sm:p-8">
          <p className="eyebrow mb-2">Action required</p>
          <h2 className="text-xl font-display text-ink mb-3">Review &amp; Accept Terms</h2>
          <p className="text-sm text-ink-soft mb-6 leading-relaxed">
            We&apos;ve updated our Terms of Service and Privacy Policy. Please read and accept them to continue using Mithila Jodi.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4 border-t border-ink/10 pt-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={e => { setError(''); setTerms(e.target.checked) }}
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
                  checked={privacy}
                  onChange={e => { setError(''); setPrivacy(e.target.checked) }}
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

            {error && <p className="mt-4 text-sm text-terra">{error}</p>}

            <button
              type="submit"
              disabled={loading || !terms || !privacy}
              className="btn btn-primary w-full mt-6"
            >
              {loading ? 'Recording consent…' : 'Accept and Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
