import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

type RouteContext = { params: Promise<{ profileId: string }> }

export async function POST(_request: NextRequest, { params }: RouteContext) {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { profileId } = await params

  const admin = await createAdminClient()

  const { data: myProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('account_id', session.id)
    .is('deleted_at', null)
    .neq('profile_status', 'deleted')
    .limit(1)
    .maybeSingle()

  if (!myProfile) return NextResponse.json({ ok: false, message: 'Profile not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myId = (myProfile as any).id as string

  if (myId === profileId) {
    return NextResponse.json({ ok: false, message: 'Cannot shortlist yourself' }, { status: 400 })
  }

  const { data: targetProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .is('deleted_at', null)
    .maybeSingle()

  if (!targetProfile) return NextResponse.json({ ok: false, message: 'Profile not found' }, { status: 404 })

  const { error } = await admin
    .from('shortlists')
    .upsert({ profile_id: myId, saved_id: profileId }, { onConflict: 'profile_id,saved_id' })

  if (error) {
    console.error('[shortlists POST] upsert error:', error.message)
    return NextResponse.json({ ok: false, message: 'Failed to save shortlist' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { profileId } = await params

  const admin = await createAdminClient()

  const { data: myProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('account_id', session.id)
    .is('deleted_at', null)
    .neq('profile_status', 'deleted')
    .limit(1)
    .maybeSingle()

  if (!myProfile) return NextResponse.json({ ok: false, message: 'Profile not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myId = (myProfile as any).id as string

  const { error } = await admin
    .from('shortlists')
    .delete()
    .eq('profile_id', myId)
    .eq('saved_id', profileId)

  if (error) {
    console.error('[shortlists DELETE] error:', error.message)
    return NextResponse.json({ ok: false, message: 'Failed to remove shortlist' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
