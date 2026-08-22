import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/server'

const MAX_ATTEMPTS = 3

export async function POST(request: NextRequest) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body' }, { status: 400 })
  }

  const { challenge_id, answer } = (body ?? {}) as Record<string, unknown>

  if (typeof challenge_id !== 'string' || !challenge_id) {
    return NextResponse.json({ ok: false, message: 'Challenge ID required' }, { status: 400 })
  }

  const answerStr = typeof answer === 'number'
    ? String(answer)
    : typeof answer === 'string' ? answer.trim() : ''

  if (!answerStr || !/^\d+$/.test(answerStr)) {
    return NextResponse.json({ ok: false, message: 'Enter a whole number as your answer' }, { status: 400 })
  }

  try {
    const admin = await createAdminClient()

    const { data: challenge, error } = await admin
      .from('math_challenges')
      .select('id, answer_hash, attempts, expires_at')
      .eq('session_key', challenge_id)
      .eq('used', false)
      .maybeSingle()

    if (error || !challenge) {
      return NextResponse.json(
        { ok: false, message: 'Challenge not found or already used. Request a new one.' },
        { status: 400 },
      )
    }

    if (new Date(challenge.expires_at as string) < new Date()) {
      return NextResponse.json(
        { ok: false, message: 'Challenge has expired. Please request a new one.' },
        { status: 400 },
      )
    }

    const attempts = challenge.attempts as number
    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { ok: false, message: 'Too many incorrect attempts. Please request a new challenge.' },
        { status: 400 },
      )
    }

    // Increment before checking (prevents race)
    await admin
      .from('math_challenges')
      .update({ attempts: attempts + 1 })
      .eq('id', challenge.id)

    const valid = await bcrypt.compare(answerStr, challenge.answer_hash as string)
    if (!valid) {
      const remaining = MAX_ATTEMPTS - (attempts + 1)
      const msg = remaining > 0
        ? `Incorrect. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
        : 'Too many incorrect attempts. Please request a new challenge.'
      return NextResponse.json({ ok: false, message: msg }, { status: 400 })
    }

    await admin
      .from('math_challenges')
      .update({ used: true })
      .eq('id', challenge.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[human/verify] error:', err)
    return NextResponse.json({ ok: false, message: 'Server error. Please try again.' }, { status: 500 })
  }
}
