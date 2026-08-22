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

  const { data: flags, error } = await admin
    .from('moderation_flags')
    .select('id, profile_id, account_id, type, confidence, notes, created_at')
    .eq('resolved', false)
    .order('created_at')
    .limit(30)

  if (error) {
    console.error('[admin/flags GET] query error:', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  if (!flags || flags.length === 0) {
    return NextResponse.json({ ok: true, flags: [] })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileIds = [...new Set((flags as any[]).map((f) => f.profile_id).filter(Boolean))]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accountIds = [...new Set((flags as any[]).map((f) => f.account_id).filter(Boolean))]

  const [profileRows, accountRows] = await Promise.all([
    profileIds.length > 0
      ? admin.from('profiles').select('id, first_name, last_name').in('id', profileIds)
      : { data: [] },
    accountIds.length > 0
      ? admin.from('accounts').select('id, mobile').in('id', accountIds)
      : { data: [] },
  ])

  const profileNameMap: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(profileRows.data as any[] ?? []).forEach((p) => {
    profileNameMap[p.id] = [p.first_name, p.last_name].filter(Boolean).join(' ')
  })

  const mobileMap: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(accountRows.data as any[] ?? []).forEach((a) => {
    mobileMap[a.id] = a.mobile
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (flags as any[]).map((f) => ({
    id: f.id,
    type: f.type,
    confidence: f.confidence,
    notes: f.notes,
    created_at: f.created_at,
    profile_name: f.profile_id ? (profileNameMap[f.profile_id] ?? null) : null,
    mobile: f.account_id ? (mobileMap[f.account_id] ?? null) : null,
  }))

  return NextResponse.json({ ok: true, flags: result })
}
