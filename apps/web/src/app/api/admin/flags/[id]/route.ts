import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionAccount()
  if (!session || (session.role !== 'admin' && session.role !== 'moderator')) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { resolved, notes } = body as { resolved: boolean; notes?: string }

  if (resolved !== true) {
    return NextResponse.json({ ok: false, message: 'resolved must be true.' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const now = new Date().toISOString()

  const { error } = await admin
    .from('moderation_flags')
    .update({
      resolved: true,
      resolved_by: session.id,
      resolved_at: now,
    })
    .eq('id', id)

  if (error) {
    console.error('[admin/flags/[id] PATCH] update error:', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  await admin.from('admin_audit_logs').insert({
    actor_id: session.id,
    action: 'resolve_flag',
    target_type: 'flag',
    target_id: id,
    payload: { notes: notes ?? null },
  })

  return NextResponse.json({ ok: true })
}
