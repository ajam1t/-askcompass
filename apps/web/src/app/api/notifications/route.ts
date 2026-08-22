import 'server-only'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

export async function GET() {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

  const { data: rows, error } = await admin
    .from('notifications')
    .select('id, type, payload, read, created_at')
    .eq('account_id', session.id)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    console.error('[notifications GET] error:', error.message)
    return NextResponse.json({ ok: false, message: 'Failed to fetch notifications' }, { status: 500 })
  }

  const notifications = rows ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unread_count = notifications.filter((n: any) => !n.read).length

  return NextResponse.json({ ok: true, notifications, unread_count })
}
