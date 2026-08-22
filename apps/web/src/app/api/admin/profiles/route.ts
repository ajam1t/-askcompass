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

  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, first_name, last_name, gender, profile_complete, created_at, account_id')
    .eq('profile_status', 'pending_review')
    .order('created_at')
    .limit(20)

  if (error) {
    console.error('[admin/profiles GET] query error:', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true, profiles: profiles ?? [] })
}
