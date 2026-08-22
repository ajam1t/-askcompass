import { redirect } from 'next/navigation'
import { getSessionAccount } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import ConsentContent from './ConsentContent'

export const dynamic = 'force-dynamic'

export default async function ConsentPage() {
  const session = await getSessionAccount()
  if (!session) redirect('/login?next=/legal/consent')

  const supabase = await createAdminClient()

  // Check if user already has active (non-withdrawn) consents for terms and privacy
  const { data: consents } = await supabase
    .from('legal_consents')
    .select('type, consented, withdrawn_at')
    .eq('account_id', session.id)
    .in('type', ['terms', 'privacy'])
    .order('created_at', { ascending: false })

  type ConsentRow = { type: string; consented: boolean; withdrawn_at: string | null }
  const rows: ConsentRow[] = consents ?? []
  const hasTerms = rows.some(c => c.type === 'terms' && c.consented && !c.withdrawn_at)
  const hasPrivacy = rows.some(c => c.type === 'privacy' && c.consented && !c.withdrawn_at)

  if (hasTerms && hasPrivacy) redirect('/profile')

  return <ConsentContent />
}
