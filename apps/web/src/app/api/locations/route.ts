import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const account = await getSessionAccount()
  if (!account) return NextResponse.json({ ok: false }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim()
  const level = searchParams.get('level') // state | district | city | town | village
  const parentId = searchParams.get('parent_id')

  if (q.length < 2 && !parentId) {
    return NextResponse.json({ ok: true, results: [] })
  }

  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin as any)
    .from('india_locations')
    .select('id, level, name_en, name_hi, name_mai, state_code, is_mithila_region, parent_id')
    .order('is_mithila_region', { ascending: false })
    .order('name_en', { ascending: true })
    .limit(20)

  if (level) {
    const levels = level.split(',')
    if (levels.length === 1) {
      query = query.eq('level', level)
    } else {
      query = query.in('level', levels)
    }
  }

  if (parentId) {
    query = query.eq('parent_id', parseInt(parentId, 10))
  }

  if (q.length >= 2) {
    query = query.ilike('name_en', `%${q}%`)
  }

  const { data, error } = await query
  if (error) {
    console.error('[locations] query error:', error.message)
    return NextResponse.json({ ok: false, message: 'Search failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, results: data ?? [] })
}
