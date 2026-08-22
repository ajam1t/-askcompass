'use client'

import { useState, useEffect } from 'react'
import type { ActiveMembership, MembershipStatus, PlanConfig } from '@/lib/membership'

// Razorpay checkout.js types
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

type ApiData = {
  membership: ActiveMembership | null
  plan: PlanConfig | null
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatPrice(paise: number): string {
  return '₹' + (paise / 100).toFixed(0)
}

function StatusBadge({ status }: { status: MembershipStatus }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    active:         { label: 'Active',          cls: 'bg-green-100 text-green-700' },
    expiring_soon:  { label: 'Expiring soon',   cls: 'bg-amber-100 text-amber-700' },
    grace:          { label: 'Grace period',    cls: 'bg-orange-100 text-orange-700' },
    pending:        { label: 'Payment pending', cls: 'bg-blue-100 text-blue-700' },
    expired:        { label: 'Expired',         cls: 'bg-red-100 text-red-700' },
    payment_failed: { label: 'Payment failed',  cls: 'bg-red-100 text-red-700' },
    cancelled:      { label: 'Cancelled',       cls: 'bg-ink/10 text-ink-soft' },
    refunded:       { label: 'Refunded',        cls: 'bg-ink/10 text-ink-soft' },
    none:           { label: 'No membership',   cls: 'bg-ink/10 text-ink-soft' },
  }
  const { label, cls } = cfg[status] ?? cfg.none
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  )
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function MembershipContent() {
  const [data, setData] = useState<ApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [buying, setBuying] = useState(false)
  const [success, setSuccess] = useState<{ expires_at: string } | null>(null)

  useEffect(() => {
    fetch('/api/membership')
      .then(r => r.json())
      .then(j => {
        if (j.ok) setData({ membership: j.membership, plan: j.plan })
        else setError(j.message ?? 'Failed to load membership details')
      })
      .catch(() => setError('Could not load membership details'))
      .finally(() => setLoading(false))
  }, [])

  async function handleBuy() {
    if (!data?.plan) return
    setBuying(true)
    setError('')

    try {
      // Create Razorpay order server-side
      const orderRes = await fetch('/api/membership/orders', { method: 'POST' })
      const orderJson = await orderRes.json()
      if (!orderRes.ok || !orderJson.ok) {
        setError(orderJson.message ?? 'Could not create order. Try again.')
        return
      }

      // Load Razorpay checkout script
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setError('Could not load payment gateway. Check your connection and try again.')
        return
      }

      // Open Razorpay modal
      await new Promise<void>((resolve) => {
        const rzp = new window.Razorpay({
          key: orderJson.key,
          amount: orderJson.amount,
          currency: orderJson.currency,
          order_id: orderJson.orderId,
          name: 'Mithila Jodi',
          description: `${orderJson.plan.label} — ${orderJson.plan.duration_days} days`,
          theme: { color: '#6B2737' },
          modal: {
            ondismiss() { resolve() },
          },
          handler: async (response: {
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }) => {
            try {
              const verifyRes = await fetch('/api/membership/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              })
              const verifyJson = await verifyRes.json()
              if (verifyJson.ok) {
                setSuccess({ expires_at: verifyJson.expires_at })
                // Refresh membership data
                const refreshRes = await fetch('/api/membership')
                const refreshJson = await refreshRes.json()
                if (refreshJson.ok) setData({ membership: refreshJson.membership, plan: refreshJson.plan })
              } else {
                setError(verifyJson.message ?? 'Payment verification failed. Contact support.')
              }
            } catch {
              setError('Verification failed. Contact support if amount was deducted.')
            } finally {
              resolve()
            }
          },
        })
        rzp.on('payment.failed', (resp: { error: { description: string } }) => {
          setError(resp.error?.description ?? 'Payment failed. Try again.')
          resolve()
        })
        rzp.open()
      })
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-paper">
        <div className="wrap py-10">
          <div className="max-w-lg mx-auto space-y-4 animate-pulse">
            <div className="h-8 bg-paper-3 rounded w-1/3" />
            <div className="card p-6 space-y-3">
              <div className="h-5 bg-paper-3 rounded w-1/2" />
              <div className="h-4 bg-paper-3 rounded w-2/3" />
              <div className="h-10 bg-paper-3 rounded" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  const { membership, plan } = data ?? {}
  const isLive = membership && ['active', 'expiring_soon', 'grace'].includes(membership.status)
  const canBuy = !isLive && plan

  return (
    <main className="min-h-screen bg-paper">
      <div className="wrap py-10">
        <div className="max-w-lg mx-auto space-y-6">
          <h1 className="font-serif text-3xl text-ink">Membership</h1>

          {/* Success banner */}
          {success && (
            <div className="rounded-mj-sm bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm">
              Payment successful! Your membership is active until{' '}
              <strong>{formatDate(success.expires_at)}</strong>. Your profile is now discoverable in search.
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="rounded-mj-sm bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Current membership status */}
          {membership && (
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ink">Current membership</h2>
                <StatusBadge status={membership.status} />
              </div>
              <dl className="text-sm space-y-1.5">
                {membership.started_at && (
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Started</dt>
                    <dd className="text-ink font-medium">{formatDate(membership.started_at)}</dd>
                  </div>
                )}
                {membership.expires_at && (
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">
                      {membership.status === 'grace' ? 'Expired' : 'Expires'}
                    </dt>
                    <dd className="text-ink font-medium">{formatDate(membership.expires_at)}</dd>
                  </div>
                )}
                {membership.status === 'grace' && membership.grace_until && (
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Grace ends</dt>
                    <dd className="text-amber-700 font-medium">{formatDate(membership.grace_until)}</dd>
                  </div>
                )}
              </dl>
              {membership.status === 'expiring_soon' && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-mj-sm px-3 py-2">
                  Your membership expires soon. Renew to stay discoverable in search.
                </p>
              )}
              {membership.status === 'grace' && (
                <p className="text-xs text-orange-700 bg-orange-50 rounded-mj-sm px-3 py-2">
                  Your membership has expired but you are in the grace period. Renew now to avoid losing visibility.
                </p>
              )}
            </div>
          )}

          {/* Plan card */}
          {plan && (
            <div className="card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-serif text-xl text-ink">{plan.label_en}</h2>
                  {plan.label_mai && (
                    <p className="text-sm text-ink-soft mt-0.5">{plan.label_mai}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-serif text-2xl text-maroon">{formatPrice(plan.price_paise)}</p>
                  <p className="text-xs text-ink-soft">{plan.duration_days} days</p>
                </div>
              </div>

              <ul className="text-sm text-ink space-y-1.5">
                {[
                  'Discoverable in search by other members',
                  'Send and receive interest requests',
                  'View contact details of mutual interests',
                  'Upload and manage profile photos',
                  'Download biodata PDF',
                ].map(feature => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <p className="text-xs text-ink-soft border-t border-paper-3 pt-3">
                Manual renewal only — no automatic charges. Your profile and data are retained after expiry.
              </p>

              {canBuy && (
                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={buying}
                  className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {buying
                    ? 'Opening payment…'
                    : isLive
                    ? `Renew for ${formatPrice(plan.price_paise)}`
                    : `Activate membership — ${formatPrice(plan.price_paise)}`}
                </button>
              )}

              {isLive && !success && (
                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={buying}
                  className="btn-ghost w-full justify-center py-2.5 text-sm disabled:opacity-60"
                >
                  {buying ? 'Opening payment…' : `Renew for ${formatPrice(plan.price_paise)}`}
                </button>
              )}
            </div>
          )}

          {!plan && !loading && (
            <div className="card p-5 text-center text-ink-soft text-sm">
              No membership plans are currently available. Please check back later.
            </div>
          )}

          <p className="text-xs text-ink-soft text-center">
            Secure payment via Razorpay. UPI, cards, net banking accepted.
          </p>
        </div>
      </div>
    </main>
  )
}
