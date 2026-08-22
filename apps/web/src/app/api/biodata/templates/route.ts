import 'server-only'
import { NextResponse } from 'next/server'
import { getSessionAccount } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { data: templates } = await admin
    .from('biodata_templates')
    .select('id, slug, label_en, label_hi, label_mai, renderer, active')
    .eq('active', true)
    .order('sort_order')

  return NextResponse.json({ ok: true, templates: templates ?? [] })
}
