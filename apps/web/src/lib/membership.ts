import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'

export type MembershipStatus =
  | 'none' | 'pending' | 'active' | 'expiring_soon'
  | 'grace' | 'expired' | 'cancelled' | 'refunded' | 'payment_failed'

export type ActiveMembership = {
  id: string
  plan: string
  status: MembershipStatus
  started_at: string | null
  expires_at: string | null
  grace_until: string | null
}

export type PlanConfig = {
  plan: string
  price_paise: number
  duration_days: number
  grace_days: number
  expiring_soon_days: number
  label_en: string
  label_hi: string | null
  label_mai: string | null
  active: boolean
}

export async function getActiveMembership(accountId: string): Promise<ActiveMembership | null> {
  const admin = await createAdminClient()
  const { data } = await admin
    .from('memberships')
    .select('id, plan, status, started_at, expires_at, grace_until')
    .eq('account_id', accountId)
    .in('status', ['active', 'expiring_soon', 'grace', 'pending', 'payment_failed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return null
  return data as ActiveMembership
}

export async function getActivePlan(): Promise<PlanConfig | null> {
  const admin = await createAdminClient()
  const { data } = await admin
    .from('plan_config')
    .select('*')
    .eq('active', true)
    .order('price_paise', { ascending: true })
    .limit(1)
    .maybeSingle()

  return data as PlanConfig | null
}

export function isMembershipLive(status: MembershipStatus): boolean {
  return ['active', 'expiring_soon', 'grace'].includes(status)
}
