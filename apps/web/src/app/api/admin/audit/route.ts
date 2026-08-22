import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSessionAccount()
  if (!session || (session.role !== 'admin' && session.role !== 'moderator')) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10) || 0)

  const admin = await createAdminClient()

  const { data: logs, error } = await admin
    .from('admin_audit_logs')
    .select('id, actor_id, action, target_type, target_id, payload, created_at')
    .order('created_at', { ascending: false })
    .range(page * 30, page * 30 + 29)

  if (error) {
    console.error('[admin/audit GET] query error:', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  if (!logs || logs.length === 0) {
    return NextResponse.json({ ok: true, logs: [] })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actorIds = [...new Set((logs as any[]).map((l) => l.actor_id).filter(Boolean))]

  const { data: actorRows } = await admin
    .from('accounts')
    .select('id, mobile')
    .in('id', actorIds)

  const mobileMap: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(actorRows as any[] ?? []).forEach((a) => {
    mobileMap[a.id] = a.mobile
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (logs as any[]).map((l) => ({
    id: l.id,
    action: l.action,
    target_type: l.target_type,
    target_id: l.target_id,
    payload: l.payload,
    created_at: l.created_at,
    actor_mobile: l.actor_id ? (mobileMap[l.actor_id] ?? null) : null,
  }))

  return NextResponse.json({ ok: true, logs: result })
}
