import 'server-only'
import { NextResponse } from 'next/server'
import { getSessionAccount } from '@/lib/auth'
import { getActiveMembership, getActivePlan } from '@/lib/membership'

export async function GET() {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const [membership, plan] = await Promise.all([
    getActiveMembership(session.id),
    getActivePlan(),
  ])

  return NextResponse.json({ ok: true, membership, plan })
}
