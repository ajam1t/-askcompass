import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const admin = await createAdminClient()

  // Step 2: get my profile ID
  const { data: myProfileRow } = await admin
    .from('profiles')
    .select('id')
    .eq('account_id', session.id)
    .neq('profile_status', 'deleted')
    .is('deleted_at', null)
    .maybeSingle()

  if (!myProfileRow) return NextResponse.json({ ok: false, message: 'Profile not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myProfileId = (myProfileRow as any).id as string

  // Step 3: fetch the conversation
  const { data: convRow } = await admin
    .from('conversations')
    .select('id, profile_a, profile_b, status')
    .eq('id', id)
    .maybeSingle()

  if (!convRow) return NextResponse.json({ ok: false, message: 'Conversation not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conv = convRow as any

  // Step 5: verify membership
  if ((conv.profile_a as string) !== myProfileId && (conv.profile_b as string) !== myProfileId) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
  }

  // Step 6: read optional cursor param
  const { searchParams } = new URL(request.url)
  const beforeParam = searchParams.get('before') ?? null

  // Step 7: build paginated query
  let query = admin
    .from('messages')
    .select('id, sender_id, body, sent_at, read_at')
    .eq('conversation_id', id)
    .is('deleted_at', null)
    .order('sent_at', { ascending: false })
    .limit(40)

  if (beforeParam) {
    // Get sent_at of the cursor message
    const { data: cursorRow } = await admin
      .from('messages')
      .select('sent_at')
      .eq('id', beforeParam)
      .maybeSingle()

    if (cursorRow) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cursorSentAt = (cursorRow as any).sent_at as string
      query = query.lt('sent_at', cursorSentAt)
    }
  }

  const { data: messagesData } = await query

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = messagesData ?? []

  // Step 8: mark unread messages as read
  await admin
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)
    .neq('sender_id', myProfileId)
    .eq('conversation_id', id)

  // Step 9: reverse to ascending order and return
  const ascending = [...messages].reverse()

  return NextResponse.json({
    ok: true,
    conversation_id: id,
    messages: ascending.map((m) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: (m as any).id as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sender_id: (m as any).sender_id as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: (m as any).body as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sent_at: (m as any).sent_at as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      is_mine: (m as any).sender_id === myProfileId,
    })),
    has_more: messages.length === 40,
  })
}
