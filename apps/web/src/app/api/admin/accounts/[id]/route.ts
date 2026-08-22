import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionAccount()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { account_status, reason } = body as {
    account_status: 'active' | 'suspended' | 'banned'
    reason?: string
  }

  const validStatuses = ['active', 'suspended', 'banned'] as const
  if (!validStatuses.includes(account_status)) {
    return NextResponse.json({ ok: false, message: 'Invalid account_status.' }, { status: 400 })
  }

  const admin = await createAdminClient()

  const { error } = await admin
    .from('accounts')
    .update({ account_status, status_reason: reason ?? null })
    .eq('id', id)

  if (error) {
    console.error('[admin/accounts/[id] PATCH] update error:', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  await admin.from('admin_audit_logs').insert({
    actor_id: session.id,
    action: 'update_account_status',
    target_type: 'account',
    target_id: id,
    payload: { new_status: account_status, reason: reason ?? null },
  })

  return NextResponse.json({ ok: true })
}
