import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

type Action = 'accept' | 'decline' | 'withdraw'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const action = (body as any)?.action as string | undefined

  if (action !== 'accept' && action !== 'decline' && action !== 'withdraw') {
    return NextResponse.json(
      { ok: false, message: 'action must be accept, decline, or withdraw' },
      { status: 400 },
    )
  }

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

  const { data: interest } = await admin
    .from('interests')
    .select('id, from_profile, to_profile, status')
    .eq('id', id)
    .maybeSingle()

  if (!interest) return NextResponse.json({ ok: false, message: 'Interest not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iv = interest as any

  if (iv.status !== 'sent') {
    return NextResponse.json(
      { ok: false, message: 'Only a pending interest can be responded to or withdrawn' },
      { status: 422 },
    )
  }

  const typedAction = action as Action

  if ((typedAction === 'accept' || typedAction === 'decline') && iv.to_profile !== myId) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
  }

  if (typedAction === 'withdraw' && iv.from_profile !== myId) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
  }

  const newStatus = typedAction === 'accept' ? 'accepted' : typedAction === 'decline' ? 'declined' : 'withdrawn'

  const { error: updateError } = await admin
    .from('interests')
    .update({ status: newStatus, responded_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    console.error('[interests PATCH] update error:', updateError.message)
    return NextResponse.json({ ok: false, message: 'Failed to update interest' }, { status: 500 })
  }

  if (typedAction === 'accept' || typedAction === 'decline') {
    const notifType = typedAction === 'accept' ? 'interest_accepted' : 'interest_declined'

    // Get sender's account_id to target the notification correctly
    const { data: senderProfile } = await admin
      .from('profiles')
      .select('account_id, first_name, last_name')
      .eq('id', iv.from_profile)
      .maybeSingle()

    if (senderProfile) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sp = senderProfile as any
      await admin.from('notifications').insert({
        account_id: sp.account_id,
        type: notifType,
        payload: { interest_id: id },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
