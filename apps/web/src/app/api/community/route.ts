import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

const VALID_TYPES = ['caste', 'sub_caste', 'gotra', 'mool', 'gram']

export async function GET(request: NextRequest) {
  const account = await getSessionAccount()
  if (!account) return NextResponse.json({ ok: false }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? ''
  const q = (searchParams.get('q') ?? '').trim()

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ ok: false, message: 'Invalid type' }, { status: 400 })
  }

  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin as any)
    .from('community_masters')
    .select('id, value, label_en, label_hi, label_mai, is_mithila')
    .eq('type', type)
    .order('sort_order', { ascending: true })
    .order('label_en', { ascending: true })
    .limit(30)

  if (q.length >= 1) {
    query = query.ilike('label_en', `%${q}%`)
  }

  const { data, error } = await query
  if (error) {
    console.error('[community] query error:', error.message)
    return NextResponse.json({ ok: false, message: 'Search failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, results: data ?? [] })
}
