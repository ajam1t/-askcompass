'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Consent = {
  type: string
  version: string
  consented: boolean
  created_at: string
  withdrawn_at: string | null
}

const CONSENT_LABELS: Record<string, string> = {
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  data_processing: 'Data Processing',
  marketing: 'Marketing Communications',
  third_party_sharing: 'Third-Party Sharing',
}

const REQUIRED_TYPES = ['terms', 'privacy', 'data_processing']

function latestByType(consents: Consent[]): Map<string, Consent> {
  const map = new Map<string, Consent>()
  for (const c of consents) {
    if (!map.has(c.type)) map.set(c.type, c)
  }
  return map
}

export default function SettingsContent() {
  const router = useRouter()
  const [consents, setConsents] = useState<Consent[]>([])
  const [loadingConsents, setLoadingConsents] = useState(true)
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const [withdrawMsg, setWithdrawMsg] = useState<Record<string, string>>({})
  const [exporting, setExporting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetch('/api/legal/consents')
      .then(r => r.json())
      .then(j => { if (j.ok) setConsents(j.consents) })
      .finally(() => setLoadingConsents(false))
  }, [])

  async function withdraw(type: string) {
    setWithdrawing(type)
    const res = await fetch('/api/legal/consents/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    const json = await res.json()
    if (json.ok) {
      setConsents(cs => cs.map(c => c.type === type && c.consented && !c.withdrawn_at
        ? { ...c, withdrawn_at: new Date().toISOString() }
        : c
      ))
      setWithdrawMsg(m => ({ ...m, [type]: 'Consent withdrawn.' }))
    } else {
      setWithdrawMsg(m => ({ ...m, [type]: json.message ?? 'Error withdrawing consent.' }))
    }
    setWithdrawing(null)
  }

  async function requestExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/account/export', { method: 'POST' })
      if (!res.ok) { alert('Export failed. Please try again.'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mithila-jodi-data-export.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed. Please check your connection and try again.')
    } finally {
      setExporting(false)
    }
  }

  async function deleteAccount() {
    if (deleteText !== 'DELETE') { setDeleteError('Please type DELETE to confirm.'); return }
    setDeleting(true)
    setDeleteError('')
    const res = await fetch('/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: true }),
    })
    const json = await res.json()
    if (json.ok) {
      router.push('/login?deactivated=1')
    } else {
      setDeleteError(json.message ?? 'Could not deactivate account. Please try again.')
      setDeleting(false)
    }
  }

  const byType = latestByType(consents)

  return (
    <div className="wrap py-8 max-w-2xl">
      <h1 className="font-serif text-2xl text-ink mb-8">Account Settings</h1>

      {/* Consents */}
      <section className="card p-6 mb-6">
        <h2 className="font-serif text-lg text-ink mb-1">My Consents</h2>
        <p className="text-xs text-ink-soft mb-5">
          Required consents cannot be withdrawn. You may withdraw optional consents at any time.
        </p>

        {loadingConsents ? (
          <p className="text-ink-soft text-sm animate-pulse">Loading…</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(CONSENT_LABELS).map(([type, label]) => {
              const c = byType.get(type)
              const active = c?.consented && !c.withdrawn_at
              const required = REQUIRED_TYPES.includes(type)
              return (
                <div key={type} className="flex items-center justify-between gap-4 py-2 border-b border-paper-3 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{label}</p>
                    <p className="text-xs text-ink-soft">
                      {active
                        ? `Consented ${new Date(c!.created_at).toLocaleDateString('en-IN')}`
                        : c?.withdrawn_at
                          ? `Withdrawn ${new Date(c.withdrawn_at).toLocaleDateString('en-IN')}`
                          : 'Not consented'}
                    </p>
                    {withdrawMsg[type] && <p className="text-xs text-maroon mt-0.5">{withdrawMsg[type]}</p>}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-paper-3 text-ink-soft'}`}>
                      {active ? 'Active' : c?.withdrawn_at ? 'Withdrawn' : 'None'}
                    </span>
                    {!required && active && (
                      <button
                        type="button"
                        onClick={() => withdraw(type)}
                        disabled={withdrawing === type}
                        className="text-xs text-terra hover:underline disabled:opacity-50"
                      >
                        {withdrawing === type ? 'Withdrawing…' : 'Withdraw'}
                      </button>
                    )}
                    {required && (
                      <span className="text-xs text-ink-soft italic">Required</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-paper-3">
          <p className="text-xs text-ink-soft">
            To review the documents you consented to, see our{' '}
            <Link href="/legal/terms" target="_blank" className="text-maroon hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/legal/privacy" target="_blank" className="text-maroon hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </section>

      {/* Data Export */}
      <section className="card p-6 mb-6">
        <h2 className="font-serif text-lg text-ink mb-1">Download My Data</h2>
        <p className="text-sm text-ink-soft mb-4 leading-relaxed">
          Under the Digital Personal Data Protection Act, 2023, you have the right to access your personal data. Download a copy of your data in JSON format.
        </p>
        <button
          type="button"
          onClick={requestExport}
          disabled={exporting}
          className="btn btn-secondary text-sm py-2 px-4 disabled:opacity-60"
        >
          {exporting ? 'Preparing export…' : 'Download my data'}
        </button>
      </section>

      {/* Account Deactivation */}
      <section className="card p-6 border-2 border-red-200">
        <h2 className="font-serif text-lg text-red-700 mb-1">Deactivate Account</h2>
        <p className="text-sm text-ink-soft mb-4 leading-relaxed">
          Deactivating your account will hide your profile and prevent you from logging in. Your data is retained per our{' '}
          <Link href="/legal/privacy" target="_blank" className="text-maroon hover:underline">Privacy Policy</Link>{' '}
          and is never deleted solely because your account is deactivated. This action can be reversed by contacting us.
        </p>

        {!deleteConfirm ? (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="text-sm text-red-600 border border-red-300 rounded-mj-sm px-4 py-2 hover:bg-red-50 transition-colors"
          >
            Deactivate my account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-700">
              Are you sure? Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={e => { setDeleteError(''); setDeleteText(e.target.value) }}
              placeholder="Type DELETE"
              className="border border-red-300 rounded-mj-sm px-3 py-2 text-sm focus:outline-none focus:border-red-500 w-full max-w-xs"
            />
            {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleting}
                className="text-sm bg-red-600 text-white rounded-mj-sm px-4 py-2 hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {deleting ? 'Deactivating…' : 'Confirm deactivation'}
              </button>
              <button
                type="button"
                onClick={() => { setDeleteConfirm(false); setDeleteText(''); setDeleteError('') }}
                className="text-sm text-ink-soft hover:text-ink hover:underline px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
