import 'server-only'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

export async function GET() {
  const session = await getSessionAccount()
  if (!session || (session.role !== 'admin' && session.role !== 'moderator')) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  const admin = await createAdminClient()

  const { data: photos, error } = await admin
    .from('profile_photos')
    .select('id, profile_id, is_primary, created_at, storage_path')
    .eq('status', 'pending_moderation')
    .order('created_at')
    .limit(30)

  if (error) {
    console.error('[admin/photos GET] query error:', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  if (!photos || photos.length === 0) {
    return NextResponse.json({ ok: true, photos: [] })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileIds = [...new Set((photos as any[]).map((p) => p.profile_id))]

  const { data: profileRows } = await admin
    .from('profiles')
    .select('id, first_name, last_name')
    .in('id', profileIds)

  const nameMap: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(profileRows as any[] ?? []).forEach((p) => {
    nameMap[p.id] = [p.first_name, p.last_name].filter(Boolean).join(' ')
  })

  const result = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (photos as any[]).map(async (photo) => {
      const { data: signedData } = await admin.storage
        .from('profile-photos')
        .createSignedUrl(photo.storage_path, 3600)

      return {
        id: photo.id,
        profile_id: photo.profile_id,
        profile_name: nameMap[photo.profile_id] ?? null,
        is_primary: photo.is_primary,
        photo_url: signedData?.signedUrl ?? null,
        created_at: photo.created_at,
      }
    })
  )

  return NextResponse.json({ ok: true, photos: result })
}
