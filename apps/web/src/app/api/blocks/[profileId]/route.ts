import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

type RouteContext = { params: Promise<{ profileId: string }> }

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { profileId } = await params

  let body: unknown
  try { body = await request.json() } catch {
    body = {}
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reason = (body as any)?.reason ?? null

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
    return NextResponse.json({ ok: false, message: 'Cannot block yourself' }, { status: 400 })
  }

  const { error: blockError } = await admin
    .from('blocks')
    .insert({ blocker_id: myId, blocked_id: profileId, reason: reason ?? null })

  if (blockError) {
    if (blockError.code === '23505') {
      return NextResponse.json({ ok: true })
    }
    console.error('[blocks POST] insert error:', blockError.message)
    return NextResponse.json({ ok: false, message: 'Failed to block profile' }, { status: 500 })
  }

  // Withdraw any pending interests in either direction so they can no longer interact
  await Promise.all([
    admin
      .from('interests')
      .update({ status: 'withdrawn', responded_at: new Date().toISOString() })
      .eq('from_profile', myId)
      .eq('to_profile', profileId)
      .eq('status', 'sent'),
    admin
      .from('interests')
      .update({ status: 'withdrawn', responded_at: new Date().toISOString() })
      .eq('from_profile', profileId)
      .eq('to_profile', myId)
      .eq('status', 'sent'),
  ])

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
    .from('blocks')
    .delete()
    .eq('blocker_id', myId)
    .eq('blocked_id', profileId)

  if (error) {
    console.error('[blocks DELETE] error:', error.message)
    return NextResponse.json({ ok: false, message: 'Failed to unblock profile' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
