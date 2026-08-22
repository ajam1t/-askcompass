import 'server-only'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

export async function POST() {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

  const { error } = await admin
    .from('notifications')
    .update({ read: true })
    .eq('account_id', session.id)
    .eq('read', false)

  if (error) {
    console.error('[notifications/read POST] error:', error.message)
    return NextResponse.json({ ok: false, message: 'Failed to mark notifications as read' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
