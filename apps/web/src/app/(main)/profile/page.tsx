'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type AccountInfo = { id: string; mobile: string; role: string }

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  gender: string | null
  dob: string | null
  profile_for: string | null
  self_gotra: string | null
  maternal_gotra: string | null
  mool: string | null
  gram: string | null
  about_me: string | null
  discoverable: boolean
  profile_complete: number | null
  profile_status: string | null
}

type Photo = {
  id: string
  is_primary: boolean
  status: string
  signed_url: string | null
}

function CompletionBar({ pct }: { pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-ink-soft mb-1">
        <span>Profile completeness</span>
        <span className="font-medium text-ink">{pct}%</span>
      </div>
      <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-maroon rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct < 85 && (
        <p className="text-xs text-ink-soft mt-1">
          Add a photo to reach 85%. Complete all fields for best match results.
        </p>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/profile').then(r => r.json()),
    ])
      .then(([authData, profileData]) => {
        if (!authData.ok) {
          router.replace('/login')
          return
        }
        setAccount(authData.account ?? null)
        if (profileData.profile) setProfile(profileData.profile)
        setPhotos(profileData.photos ?? [])
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    setLogoutLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-ink-soft">Loading…</p>
      </main>
    )
  }

  if (!account) return null

  const maskedMobile = account.mobile.replace(/^(\+91)(\d{5})(\d{5})$/, '$1 $2•••••')
  const primaryPhoto = photos.find(p => p.is_primary) ?? photos[0] ?? null
  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'No name yet'
    : null

  return (
    <main className="min-h-screen bg-paper py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow mb-1">Your Account</p>
            <h1 className="font-serif text-3xl text-ink">
              {displayName ?? 'Complete Your Profile'}
            </h1>
            <p className="text-ink-soft text-sm mt-1">{maskedMobile}</p>
          </div>
          <button type="button" onClick={handleLogout} disabled={logoutLoading}
            className="btn-ghost text-sm">
            {logoutLoading ? 'Logging out…' : 'Log Out'}
          </button>
        </div>

        {!profile ? (
          /* ── No profile yet ── */
          <div className="card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-cream border-2 border-dashed border-ink/20 mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl text-ink-soft">+</span>
            </div>
            <h2 className="font-serif text-xl text-ink mb-2">Create Your Profile</h2>
            <p className="text-ink-soft text-sm mb-6 max-w-sm mx-auto">
              Help families find the right match. Add your name, community details, and a photo to get started.
            </p>
            <Link href="/profile/edit" className="btn-primary inline-block">
              Create Profile
            </Link>
          </div>
        ) : (
          <>
            {/* ── Profile card ── */}
            <div className="card p-6">
              <div className="flex gap-5 mb-5">
                {/* Avatar */}
                <div className="shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-ink/10 bg-cream flex items-center justify-center">
                  {primaryPhoto?.signed_url ? (
                    <img src={primaryPhoto.signed_url} alt={displayName ?? 'Profile'}
                      className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-ink-soft">
                      {profile.first_name?.[0]?.toUpperCase() ?? '?'}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-serif text-xl text-ink leading-tight">{displayName}</h2>
                      {profile.dob && (
                        <p className="text-ink-soft text-sm">
                          {Math.floor((Date.now() - new Date(profile.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                          {profile.gender && ` · ${profile.gender}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${profile.discoverable ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink-soft'}`}>
                        {profile.discoverable ? 'Visible' : 'Hidden'}
                      </span>
                      <Link href="/profile/edit" className="btn-ghost text-sm py-1 px-3">
                        Edit
                      </Link>
                    </div>
                  </div>

                  <div className="mt-3">
                    <CompletionBar pct={profile.profile_complete ?? 0} />
                  </div>
                </div>
              </div>

              {/* Community details */}
              {(profile.self_gotra || profile.maternal_gotra || profile.mool || profile.gram) && (
                <div className="border-t border-ink/10 pt-4 grid grid-cols-2 gap-3">
                  {profile.self_gotra && (
                    <div>
                      <dt className="text-xs text-ink-soft uppercase tracking-wide">Self Gotra</dt>
                      <dd className="text-sm text-ink">{profile.self_gotra}</dd>
                    </div>
                  )}
                  {profile.maternal_gotra && (
                    <div>
                      <dt className="text-xs text-ink-soft uppercase tracking-wide">Maternal Gotra</dt>
                      <dd className="text-sm text-ink">{profile.maternal_gotra}</dd>
                    </div>
                  )}
                  {profile.mool && (
                    <div>
                      <dt className="text-xs text-ink-soft uppercase tracking-wide">Mool</dt>
                      <dd className="text-sm text-ink">{profile.mool}</dd>
                    </div>
                  )}
                  {profile.gram && (
                    <div>
                      <dt className="text-xs text-ink-soft uppercase tracking-wide">Gram</dt>
                      <dd className="text-sm text-ink">{profile.gram}</dd>
                    </div>
                  )}
                </div>
              )}

              {/* About */}
              {profile.about_me && (
                <div className="border-t border-ink/10 pt-4 mt-4">
                  <p className="text-sm text-ink leading-relaxed">{profile.about_me}</p>
                </div>
              )}
            </div>

            {/* ── Photos ── */}
            {photos.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-ink">Photos</h3>
                  <Link href="/profile/edit" className="text-sm text-maroon hover:underline">Manage</Link>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {photos.map(photo => (
                    <div key={photo.id}
                      className="aspect-square rounded-mj-sm overflow-hidden border border-ink/10 bg-cream relative">
                      {photo.signed_url ? (
                        <img src={photo.signed_url} alt="Profile photo"
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs">
                          No preview
                        </div>
                      )}
                      {photo.status === 'pending_moderation' && (
                        <div className="absolute inset-0 bg-ink/30 flex items-center justify-center">
                          <span className="text-white text-[9px] font-medium px-1 text-center leading-tight">Under review</span>
                        </div>
                      )}
                      {photo.is_primary && photo.status === 'approved' && (
                        <div className="absolute top-1 left-1 bg-maroon text-white text-[9px] px-1 rounded">★</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Account details ── */}
            <div className="card p-6">
              <h3 className="font-semibold text-ink mb-4">Account</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-ink-soft">Mobile</dt>
                  <dd className="text-sm font-mono text-ink">{maskedMobile}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-ink-soft">Role</dt>
                  <dd className="text-sm text-ink capitalize">{account.role}</dd>
                </div>
                {profile.profile_status && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-ink-soft">Profile status</dt>
                    <dd className="text-sm text-ink capitalize">{profile.profile_status.replace(/_/g, ' ')}</dd>
                  </div>
                )}
              </dl>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
