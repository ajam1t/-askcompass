import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'
import { getActiveMembership, isMembershipLive } from '@/lib/membership'

function toDisplayName(firstName: string, lastName: string | null): string {
  if (lastName) return `${firstName} ${lastName[0]}.`
  return firstName
}

export async function GET() {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

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

  const [receivedRes, sentRes, mutualRes] = await Promise.all([
    admin
      .from('interests')
      .select('id, from_profile, to_profile, status, message, sent_at, responded_at')
      .eq('to_profile', myId)
      .eq('status', 'sent'),
    admin
      .from('interests')
      .select('id, from_profile, to_profile, status, message, sent_at, responded_at')
      .eq('from_profile', myId),
    admin
      .from('interests')
      .select('id, from_profile, to_profile, status, message, sent_at, responded_at')
      .eq('status', 'accepted')
      .or(`from_profile.eq.${myId},to_profile.eq.${myId}`),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const received: any[] = receivedRes.data ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sent: any[] = sentRes.data ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mutual: any[] = mutualRes.data ?? []

  const otherIds = new Set<string>()
  for (const r of received) otherIds.add(r.from_profile as string)
  for (const s of sent) otherIds.add(s.to_profile as string)
  for (const m of mutual) {
    otherIds.add(m.from_profile === myId ? m.to_profile : m.from_profile)
  }

  const profileMap = new Map<string, { first_name: string; last_name: string | null }>()
  if (otherIds.size > 0) {
    const { data: nameRows } = await admin
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', [...otherIds])
    for (const row of (nameRows ?? [])) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = row as any
      profileMap.set(r.id, { first_name: r.first_name, last_name: r.last_name ?? null })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function toCard(interest: any, otherProfileId: string) {
    const p = profileMap.get(otherProfileId)
    return {
      interest_id: interest.id,
      profile_id: otherProfileId,
      display_name: p ? toDisplayName(p.first_name, p.last_name) : null,
      status: interest.status,
      sent_at: interest.sent_at,
      responded_at: interest.responded_at ?? null,
      message: interest.message ?? null,
    }
  }

  return NextResponse.json({
    ok: true,
    received: received.map((r) => toCard(r, r.from_profile)),
    sent: sent.map((s) => toCard(s, s.to_profile)),
    mutual: mutual.map((m) => toCard(m, m.from_profile === myId ? m.to_profile : m.from_profile)),
  })
}

export async function POST(request: NextRequest) {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { to_profile_id, message } = body as any

  if (!to_profile_id || typeof to_profile_id !== 'string') {
    return NextResponse.json({ ok: false, message: 'to_profile_id is required' }, { status: 400 })
  }

  const membership = await getActiveMembership(session.id)
  if (!membership || !isMembershipLive(membership.status)) {
    return NextResponse.json(
      { ok: false, message: 'An active membership is required to send interests' },
      { status: 403 },
    )
  }

  const admin = await createAdminClient()

  const { data: myProfile } = await admin
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('account_id', session.id)
    .is('deleted_at', null)
    .neq('profile_status', 'deleted')
    .limit(1)
    .maybeSingle()

  if (!myProfile) return NextResponse.json({ ok: false, message: 'Profile not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const me = myProfile as any

  if (me.id === to_profile_id) {
    return NextResponse.json({ ok: false, message: 'Cannot send interest to yourself' }, { status: 400 })
  }

  const { data: targetProfile } = await admin
    .from('profiles')
    .select('id, account_id, profile_status, discoverable')
    .eq('id', to_profile_id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!targetProfile) return NextResponse.json({ ok: false, message: 'Profile not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const target = targetProfile as any

  if (target.profile_status !== 'active' || !target.discoverable) {
    return NextResponse.json({ ok: false, message: 'This profile is not available' }, { status: 422 })
  }

  const { data: blockRow } = await admin
    .from('blocks')
    .select('blocker_id')
    .or(
      `and(blocker_id.eq.${me.id},blocked_id.eq.${to_profile_id}),and(blocker_id.eq.${to_profile_id},blocked_id.eq.${me.id})`,
    )
    .limit(1)
    .maybeSingle()

  if (blockRow) {
    return NextResponse.json({ ok: false, message: 'Unable to send interest' }, { status: 422 })
  }

  const { data: newInterest, error: insertError } = await admin
    .from('interests')
    .insert({
      from_profile: me.id,
      to_profile: to_profile_id,
      status: 'sent',
      message: message ?? null,
    })
    .select('id')
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ ok: false, message: 'Interest already sent' }, { status: 409 })
    }
    console.error('[interests POST] insert error:', insertError.message)
    return NextResponse.json({ ok: false, message: 'Failed to send interest' }, { status: 500 })
  }

  await admin.from('notifications').insert({
    account_id: target.account_id,
    type: 'interest_received',
    payload: {
      from_profile_id: me.id,
      from_name: toDisplayName(me.first_name, me.last_name ?? null),
    },
  })

  return NextResponse.json({ ok: true, interest_id: newInterest.id }, { status: 201 })
}
