'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Profile = {
  id: string
  first_name: string
  last_name: string | null
  gender: string
  profile_complete: number
  created_at: string
  account_id: string
}

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [reason, setReason] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/admin/profiles')
      .then(r => r.json())
      .then(j => { if (j.ok) setProfiles(j.profiles) })
      .finally(() => setLoading(false))
  }, [])

  async function act(profileId: string, action: 'approve' | 'reject') {
    setBusy(profileId)
    const res = await fetch(`/api/admin/profiles/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason: reason[profileId] }),
    })
    const json = await res.json()
    if (json.ok) setProfiles(p => p.filter(x => x.id !== profileId))
    setBusy(null)
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-serif text-2xl text-ink mb-6">Profile Review Queue</h1>

      {loading ? (
        <p className="text-ink-soft text-sm animate-pulse">Loading…</p>
      ) : profiles.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft text-sm">No profiles awaiting review.</div>
      ) : (
        <div className="space-y-3">
          {profiles.map(p => {
            const name = p.last_name ? `${p.first_name} ${p.last_name}` : p.first_name
            return (
              <div key={p.id} className="card p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${p.id}`} target="_blank" className="font-semibold text-ink hover:text-maroon">
                      {name}
                    </Link>
                    <span className="text-xs text-ink-soft capitalize">{p.gender}</span>
                    <span className="text-xs bg-paper-3 text-ink-soft px-2 py-0.5 rounded-full">
                      {p.profile_complete}% complete
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft">
                    Submitted {new Date(p.created_at).toLocaleDateString('en-IN')}
                  </p>
                  <input
                    type="text"
                    placeholder="Rejection reason (required if rejecting)"
                    value={reason[p.id] ?? ''}
                    onChange={e => setReason(r => ({ ...r, [p.id]: e.target.value }))}
                    className="w-full text-xs border border-paper-3 rounded-mj-sm px-3 py-1.5 mt-1 focus:outline-none focus:border-maroon/50"
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => act(p.id, 'approve')}
                    disabled={busy === p.id}
                    className="btn-primary text-xs py-1.5 px-3 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => act(p.id, 'reject')}
                    disabled={busy === p.id || !reason[p.id]?.trim()}
                    className="text-xs py-1.5 px-3 border border-red-200 text-red-600 rounded-mj-sm hover:bg-red-50 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
