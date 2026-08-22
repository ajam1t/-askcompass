import { NextResponse } from 'next/server'
import { getSessionAccount } from '@/lib/auth'

export async function GET() {
  const account = await getSessionAccount()
  if (!account) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  return NextResponse.json({
    ok: true,
    account: {
      id: account.id,
      mobile: account.mobile,
      role: account.role,
    },
  })
}
