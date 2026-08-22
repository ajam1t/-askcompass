'use client'

import { useState, useEffect } from 'react'

type Photo = {
  id: string
  profile_id: string
  profile_name: string
  is_primary: boolean
  photo_url: string | null
  created_at: string
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [reason, setReason] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/admin/photos')
      .then(r => r.json())
      .then(j => { if (j.ok) setPhotos(j.photos) })
      .finally(() => setLoading(false))
  }, [])

  async function act(photoId: string, action: 'approve' | 'reject') {
    setBusy(photoId)
    const res = await fetch(`/api/admin/photos/${photoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason: reason[photoId] }),
    })
    const json = await res.json()
    if (json.ok) setPhotos(p => p.filter(x => x.id !== photoId))
    setBusy(null)
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-serif text-2xl text-ink mb-6">Photo Moderation</h1>
      {loading ? (
        <p className="text-ink-soft text-sm animate-pulse">Loading…</p>
      ) : photos.length === 0 ? (
        <div className="card p-8 text-center text-ink-soft text-sm">No photos awaiting moderation.</div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {photos.map(photo => (
            <div key={photo.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-ink">{photo.profile_name}</p>
                  <p className="text-xs text-ink-soft">
                    {photo.is_primary ? 'Primary photo · ' : ''}
                    {new Date(photo.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {photo.photo_url ? (
                <div className="w-full aspect-[4/5] overflow-hidden rounded-mj-sm bg-paper-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.photo_url} alt="Pending photo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full aspect-[4/5] bg-paper-3 rounded-mj-sm flex items-center justify-center text-ink-soft text-xs">
                  URL expired — re-fetch to view
                </div>
              )}

              <input
                type="text"
                placeholder="Rejection reason (required if rejecting)"
                value={reason[photo.id] ?? ''}
                onChange={e => setReason(r => ({ ...r, [photo.id]: e.target.value }))}
                className="w-full text-xs border border-paper-3 rounded-mj-sm px-3 py-2 focus:outline-none focus:border-maroon/50"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => act(photo.id, 'approve')}
                  disabled={busy === photo.id}
                  className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => act(photo.id, 'reject')}
                  disabled={busy === photo.id || !reason[photo.id]?.trim()}
                  className="btn-ghost text-xs py-1.5 px-3 flex-1 justify-center disabled:opacity-60 text-red-600 border-red-200 hover:bg-red-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
