-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 015 — Close anonymous PostgREST read access to profile PII
--
-- WHY
--   Migration 011 decoupled `accounts` from Supabase Auth; the app authenticates
--   with its own `account_sessions` tokens and never issues a Supabase Auth JWT,
--   so auth.uid() is always NULL. All application reads go through the
--   service-role client (which bypasses RLS entirely).
--
--   Three RLS policies had USING clauses that do NOT reference auth.uid() and so
--   granted the PUBLIC `anon` role a column-unrestricted SELECT. Because the anon
--   key + project URL are public by design, anyone could call the PostgREST REST
--   endpoint directly (e.g. GET /rest/v1/profiles?select=*) and read columns the
--   application deliberately hides — dob (exact date of birth), family_about,
--   account_id, and photo storage_path — for every discoverable profile.
--
-- IMPACT
--   - Removes the anon/public read surface only. No application feature depends
--     on these policies (the app reads via service-role), so nothing in the
--     product breaks.
--   - Owner/admin access is unaffected (those paths already go via service-role).
--   - Reversible: the original policies are reproduced in the DOWN section below.
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS profiles_public_discovery ON profiles;
DROP POLICY IF EXISTS pd_public_read           ON profile_discoverable;
DROP POLICY IF EXISTS photos_public_approved    ON profile_photos;

-- Defense in depth: ensure the anon role holds no direct table privileges on
-- these tables (RLS still applies, but this removes the grant entirely).
REVOKE SELECT ON profiles              FROM anon;
REVOKE SELECT ON profile_discoverable  FROM anon;
REVOKE SELECT ON profile_photos        FROM anon;

-- ── DOWN (manual rollback) ─────────────────────────────────────────────────
-- To restore the previous (insecure) behaviour, run:
--
--   CREATE POLICY profiles_public_discovery ON profiles
--     FOR SELECT USING (profile_status = 'active' AND discoverable = true AND deleted_at IS NULL);
--   CREATE POLICY pd_public_read ON profile_discoverable
--     FOR SELECT USING (membership_active = true);
--   CREATE POLICY photos_public_approved ON profile_photos
--     FOR SELECT USING (status = 'approved');
--   GRANT SELECT ON profiles, profile_discoverable, profile_photos TO anon;
