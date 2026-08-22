import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'
import { isPasswordValid } from '@/lib/password'

export async function POST(request: NextRequest) {
  const account = await getSessionAccount()
  if (!account) {
    return NextResponse.json({ ok: false, message: 'Not authenticated' }, { status: 401 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body' }, { status: 400 })
  }

  const { password } = (body ?? {}) as Record<string, unknown>

  if (typeof password !== 'string' || !password) {
    return NextResponse.json({ ok: false, message: 'Password required' }, { status: 400 })
  }

  if (!isPasswordValid(password)) {
    return NextResponse.json(
      { ok: false, message: 'Password must be at least 8 characters with uppercase, lowercase, and a number.' },
      { status: 400 },
    )
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12)
    const admin = await createAdminClient()

    const { error } = await admin
      .from('accounts')
      .update({ password_hash: passwordHash })
      .eq('id', account.id)

    if (error) {
      console.error('[password/set] update error:', error.message)
      return NextResponse.json({ ok: false, message: 'Could not save password. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[password/set] error:', err)
    return NextResponse.json({ ok: false, message: 'Server error. Please try again.' }, { status: 500 })
  }
}
