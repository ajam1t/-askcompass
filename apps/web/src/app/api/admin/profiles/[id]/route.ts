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
  const { action, reason } = body as { action: 'approve' | 'reject'; reason?: string }

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ ok: false, message: 'Invalid action.' }, { status: 400 })
  }

  const admin = await createAdminClient()

  if (action === 'approve') {
    const { error } = await admin
      .from('profiles')
      .update({ profile_status: 'active', status_reason: null })
      .eq('id', id)

    if (error) {
      console.error('[admin/profiles/[id] PATCH] approve error:', error.message)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    await admin.from('admin_audit_logs').insert({
      actor_id: session.id,
      action: 'approve_profile',
      target_type: 'profile',
      target_id: id,
      payload: {},
    })
  } else {
    const statusReason = reason ?? 'Rejected by admin'

    const { error } = await admin
      .from('profiles')
      .update({ profile_status: 'draft', status_reason: statusReason })
      .eq('id', id)

    if (error) {
      console.error('[admin/profiles/[id] PATCH] reject error:', error.message)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    await admin.from('admin_audit_logs').insert({
      actor_id: session.id,
      action: 'reject_profile',
      target_type: 'profile',
      target_id: id,
      payload: { reason: statusReason },
    })
  }

  return NextResponse.json({ ok: true })
}
