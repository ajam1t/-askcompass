import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/server'

type Op = '+' | '−' | '×'

function makeChallenge(): { question: string; answer: number } {
  const ops: Op[] = ['+', '−', '×']
  const op = ops[Math.floor(Math.random() * ops.length)]

  let a: number, b: number

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * 22) + 7   // 7–28
      b = Math.floor(Math.random() * 18) + 4   // 4–21
      return { question: `${a} + ${b} = ?`, answer: a + b }

    case '−':
      a = Math.floor(Math.random() * 20) + 15  // 15–34
      b = Math.floor(Math.random() * 12) + 3   // 3–14
      if (b >= a) b = Math.max(1, a - Math.floor(Math.random() * 5) - 1)
      return { question: `${a} − ${b} = ?`, answer: a - b }

    case '×':
      a = Math.floor(Math.random() * 8) + 2    // 2–9
      b = Math.floor(Math.random() * 8) + 2    // 2–9
      return { question: `${a} × ${b} = ?`, answer: a * b }
  }
}

export async function POST() {
  try {
    const { question, answer } = makeChallenge()
    const sessionKey = randomBytes(16).toString('hex')
    const answerHash = await bcrypt.hash(String(answer), 10)
    const expiresAt  = new Date(Date.now() + 5 * 60 * 1000) // 5 min

    const admin = await createAdminClient()
    const { error } = await admin.from('math_challenges').insert({
      question,
      answer_hash: answerHash,
      session_key: sessionKey,
      expires_at:  expiresAt.toISOString(),
    })

    if (error) {
      console.error('[human/challenge] insert error:', error.message)
      return NextResponse.json(
        { ok: false, message: 'Could not generate challenge. Please try again.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, challenge_id: sessionKey, question, expires_in: 300 })
  } catch (err) {
    console.error('[human/challenge] error:', err)
    return NextResponse.json({ ok: false, message: 'Server error. Please try again.' }, { status: 500 })
  }
}
