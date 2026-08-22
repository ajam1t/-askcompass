import 'server-only'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSessionAccount } from '@/lib/auth'

export async function GET() {
  const session = await getSessionAccount()
  if (!session || (session.role !== 'admin' && session.role !== 'moderator')) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  const admin = await createAdminClient()

  const [
    pendingPhotosRes,
    pendingProfilesRes,
    openReportsRes,
    unresolvedFlagsRes,
    activeMembershipsRes,
    totalAccountsRes,
  ] = await Promise.all([
    admin
      .from('profile_photos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_moderation'),
    admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('profile_status', 'pending_review'),
    admin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),
    admin
      .from('moderation_flags')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false),
    admin
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'expiring_soon', 'grace']),
    admin
      .from('accounts')
      .select('*', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    ok: true,
    stats: {
      pending_photos: pendingPhotosRes.count ?? 0,
      pending_profiles: pendingProfilesRes.count ?? 0,
      open_reports: openReportsRes.count ?? 0,
      unresolved_flags: unresolvedFlagsRes.count ?? 0,
      active_memberships: activeMembershipsRes.count ?? 0,
      total_accounts: totalAccountsRes.count ?? 0,
    },
  })
}
