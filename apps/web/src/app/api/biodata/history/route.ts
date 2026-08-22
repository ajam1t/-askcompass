import 'server-only'
import { NextResponse } from 'next/server'
import { getSessionAccount } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('account_id', session.id)
    .neq('profile_status', 'deleted')
    .is('deleted_at', null)
    .maybeSingle()

  if (!profile) return NextResponse.json({ ok: true, generations: [] })

  const { data: gens } = await admin
    .from('biodata_generations')
    .select('id, template_id, language, fields_included, status, generated_at, completed_at, expires_at')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq('profile_id', (profile as any).id)
    .order('generated_at', { ascending: false })
    .limit(10)

  // Fetch template labels
  const templateIds = [...new Set((gens ?? []).map((g: unknown) => (g as { template_id: number }).template_id))]
  const labelMap: Record<number, string> = {}
  if (templateIds.length > 0) {
    const { data: templates } = await admin
      .from('biodata_templates')
      .select('id, label_en')
      .in('id', templateIds)
    for (const t of templates ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      labelMap[(t as any).id] = (t as any).label_en
    }
  }

  const result = (gens ?? []).map((g: unknown) => {
    const gen = g as {
      id: string
      template_id: number
      language: string
      status: string
      generated_at: string
      completed_at: string | null
      expires_at: string | null
    }
    return {
      id: gen.id,
      template_label: labelMap[gen.template_id] ?? 'Unknown',
      language: gen.language,
      status: gen.status,
      generated_at: gen.generated_at,
      expires_at: gen.expires_at,
    }
  })

  return NextResponse.json({ ok: true, generations: result })
}
