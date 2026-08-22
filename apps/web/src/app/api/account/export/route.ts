import 'server-only'
import { NextResponse } from 'next/server'
import { getSessionAccount } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

// POST /api/account/export — generate and return a data export for the authenticated user
export async function POST() {
  const session = await getSessionAccount()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorised' }, { status: 401 })

  const supabase = await createAdminClient()

  // Fetch account and profile first to get profile_id
  const [accountRes, profileRes] = await Promise.all([
    supabase.from('accounts').select('id, mobile, role, account_status, created_at').eq('id', session.id).maybeSingle(),
    supabase.from('profiles').select('id, first_name, last_name, gender, dob, religion, caste, profile_for, profile_status, gotra, subcaste, education_level, education_field, profession, annual_income_lpa, state_id, district_id, hometown, height_cm, complexion, diet, mother_tongue, manglik, about_me, family_desc, created_at, updated_at').eq('account_id', session.id).maybeSingle(),
  ])

  const profileId = profileRes.data?.id ?? null

  const [
    profilePrivateRes,
    membershipsRes,
    interestsSentRes,
    interestsReceivedRes,
    shortlistsRes,
    conversationsRes,
    consentsRes,
  ] = await Promise.all([
    supabase.from('profile_private').select('contact_mobile, email, address').eq('account_id', session.id).maybeSingle(),
    supabase.from('memberships').select('plan, status, starts_at, expires_at, created_at').eq('account_id', session.id).order('created_at', { ascending: false }),
    profileId
      ? supabase.from('interests').select('to_profile_id, status, created_at, updated_at').eq('from_profile_id', profileId).limit(500)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('interests').select('from_profile_id, status, created_at, updated_at').eq('to_profile_id', profileId).limit(500)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('shortlists').select('saved_id, created_at').eq('profile_id', profileId).limit(500)
      : Promise.resolve({ data: [] }),
    profileId
      ? supabase.from('conversations').select('id, created_at').or(`profile_a.eq.${profileId},profile_b.eq.${profileId}`).limit(100)
      : Promise.resolve({ data: [] }),
    supabase.from('legal_consents').select('type, version, consented, created_at, withdrawn_at, withdrawal_reason').eq('account_id', session.id).order('created_at', { ascending: false }),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    note: 'This is your personal data export from Mithila Jodi. Handle this file with care.',
    account: accountRes.data ?? null,
    profile: profileRes.data ?? null,
    profile_private: profilePrivateRes.data ?? null,
    memberships: membershipsRes.data ?? [],
    interests_sent: interestsSentRes.data ?? [],
    interests_received: interestsReceivedRes.data ?? [],
    shortlists: shortlistsRes.data ?? [],
    conversations: conversationsRes.data ?? [],
    legal_consents: consentsRes.data ?? [],
  }

  await supabase.from('admin_audit_logs').insert({
    actor_id: session.id,
    action: 'account_data_export',
    target_type: 'account',
    target_id: session.id,
    payload: { mobile: session.mobile },
  })

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="mithila-jodi-data-export.json"',
    },
  })
}
