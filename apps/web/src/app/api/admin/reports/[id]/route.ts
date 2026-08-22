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
  const { status, review_notes } = body as {
    status: 'under_review' | 'actioned' | 'dismissed'
    review_notes?: string
  }

  const validStatuses = ['under_review', 'actioned', 'dismissed'] as const
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ ok: false, message: 'Invalid status.' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const now = new Date().toISOString()

  const { error } = await admin
    .from('reports')
    .update({
      status,
      review_notes: review_notes ?? null,
      reviewed_by: session.id,
      actioned_at: status === 'actioned' ? now : null,
    })
    .eq('id', id)

  if (error) {
    console.error('[admin/reports/[id] PATCH] update error:', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  await admin.from('admin_audit_logs').insert({
    actor_id: session.id,
    action: 'update_report',
    target_type: 'report',
    target_id: id,
    payload: { status, review_notes: review_notes ?? null },
  })

  return NextResponse.json({ ok: true })
}
