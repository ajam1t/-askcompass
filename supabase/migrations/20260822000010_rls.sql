-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 010 — Row Level Security Policies
-- Apply AFTER all tables are created.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Enable RLS ────────────────────────────────────────────────────────────
ALTER TABLE accounts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_challenges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_consents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_private       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_discoverable  ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_preferences   ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_permissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests             ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists            ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports               ENABLE ROW LEVEL SECURITY;
ALTER TABLE biodata_generations   ENABLE ROW LEVEL SECURITY;

-- Helper: get current account id (maps auth.uid() → accounts.id)
CREATE OR REPLACE FUNCTION current_account_id()
RETURNS uuid AS $$
  SELECT id FROM accounts WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is current user admin or moderator
CREATE OR REPLACE FUNCTION is_admin_or_moderator()
RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 FROM accounts WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: does current account own this profile (or have family permission)?
CREATE OR REPLACE FUNCTION can_access_profile(p_profile_id uuid, min_level text DEFAULT 'view')
RETURNS boolean AS $$
  SELECT
    -- Direct owner
    EXISTS(SELECT 1 FROM profiles WHERE id = p_profile_id AND account_id = auth.uid())
    OR
    -- Family delegate with sufficient permission
    EXISTS(
      SELECT 1 FROM family_permissions
      WHERE profile_id = p_profile_id
        AND delegate_account_id = auth.uid()
        AND accepted_at IS NOT NULL
        AND revoked_at IS NULL
        AND (
          min_level = 'view'
          OR (min_level = 'edit' AND permission_level IN ('edit', 'full'))
          OR (min_level = 'full' AND permission_level = 'full')
        )
    )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── accounts ──────────────────────────────────────────────────────────────
CREATE POLICY accounts_own_read ON accounts
  FOR SELECT USING (id = auth.uid());

CREATE POLICY accounts_own_update ON accounts
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY accounts_admin_all ON accounts
  FOR ALL USING (is_admin_or_moderator());

-- ── profiles (public discovery: active + discoverable only) ───────────────
CREATE POLICY profiles_own_all ON profiles
  FOR ALL USING (can_access_profile(id, 'view'));

CREATE POLICY profiles_public_discovery ON profiles
  FOR SELECT USING (
    profile_status = 'active'
    AND discoverable = true
    AND deleted_at IS NULL
  );

CREATE POLICY profiles_admin_all ON profiles
  FOR ALL USING (is_admin_or_moderator());

-- ── profile_private (own account only — no other users ever) ──────────────
CREATE POLICY profile_private_own ON profile_private
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = profile_id AND account_id = auth.uid())
  );

CREATE POLICY profile_private_admin ON profile_private
  FOR SELECT USING (is_admin_or_moderator());

-- ── profile_discoverable (only active+discoverable rows visible to others) ─
CREATE POLICY pd_public_read ON profile_discoverable
  FOR SELECT USING (membership_active = true);

CREATE POLICY pd_own_read ON profile_discoverable
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = profile_id AND account_id = auth.uid())
  );

CREATE POLICY pd_admin ON profile_discoverable
  FOR ALL USING (is_admin_or_moderator());

-- ── profile_photos ────────────────────────────────────────────────────────
-- Only approved photos visible to others; own photos always visible to owner
CREATE POLICY photos_own ON profile_photos
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = profile_id AND account_id = auth.uid())
  );

CREATE POLICY photos_public_approved ON profile_photos
  FOR SELECT USING (status = 'approved');

CREATE POLICY photos_admin ON profile_photos
  FOR ALL USING (is_admin_or_moderator());

-- ── memberships (own account only) ────────────────────────────────────────
CREATE POLICY memberships_own ON memberships
  FOR SELECT USING (account_id = auth.uid());

CREATE POLICY memberships_admin ON memberships
  FOR ALL USING (is_admin_or_moderator());

-- ── payments (own account only) ───────────────────────────────────────────
CREATE POLICY payments_own ON payments
  FOR SELECT USING (account_id = auth.uid());

CREATE POLICY payments_admin ON payments
  FOR ALL USING (is_admin_or_moderator());

-- ── interests ─────────────────────────────────────────────────────────────
CREATE POLICY interests_participant ON interests
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = from_profile AND account_id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = to_profile AND account_id = auth.uid())
  );

-- ── conversations + messages (participants only) ──────────────────────────
CREATE POLICY conversations_participant ON conversations
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = profile_a AND account_id = auth.uid())
    OR EXISTS(SELECT 1 FROM profiles WHERE id = profile_b AND account_id = auth.uid())
  );

CREATE POLICY messages_participant ON messages
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM conversations c
      JOIN profiles pa ON pa.id = c.profile_a
      JOIN profiles pb ON pb.id = c.profile_b
      WHERE c.id = conversation_id
        AND (pa.account_id = auth.uid() OR pb.account_id = auth.uid())
    )
  );

CREATE POLICY messages_sender_insert ON messages
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM profiles WHERE id = sender_id AND account_id = auth.uid())
  );

-- ── notifications (own account only) ─────────────────────────────────────
CREATE POLICY notifications_own ON notifications
  FOR ALL USING (account_id = auth.uid());

-- ── otp_challenges (service role only — never readable by client) ──────────
-- No SELECT policy = blocked for all non-service-role users

-- ── biodata_generations (own profile only) ────────────────────────────────
CREATE POLICY biodata_own ON biodata_generations
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = profile_id AND account_id = auth.uid())
  );

-- ── reports (reporter can create; admin can see all) ──────────────────────
CREATE POLICY reports_create ON reports
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM profiles WHERE id = reporter_id AND account_id = auth.uid())
  );

CREATE POLICY reports_admin ON reports
  FOR ALL USING (is_admin_or_moderator());

-- ── admin_audit_logs (admin only — immutable) ─────────────────────────────
CREATE POLICY audit_admin_read ON admin_audit_logs
  FOR SELECT USING (is_admin_or_moderator());
