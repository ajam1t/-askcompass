-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 009 — Admin, Moderation, Reports, Audit Logs
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE report_status AS ENUM ('open', 'under_review', 'actioned', 'dismissed');
CREATE TYPE report_reason AS ENUM (
  'fake_profile',
  'harassment',
  'inappropriate_photo',
  'spam',
  'underage',
  'fraud',
  'other'
);

-- Reports
CREATE TABLE reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  reported_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  reason          report_reason NOT NULL,
  notes           text,
  status          report_status NOT NULL DEFAULT 'open',
  reviewed_by     uuid REFERENCES accounts(id),
  review_notes    text,
  actioned_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (reporter_id != reported_id)
);

CREATE INDEX reports_status_idx     ON reports (status, created_at DESC);
CREATE INDEX reports_reported_idx   ON reports (reported_id, status);

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Moderation flags (automated risk signals → admin review queue)
CREATE TYPE moderation_flag_type AS ENUM (
  'duplicate_mobile',
  'suspicious_photo',
  'profile_spam',
  'multiple_accounts',
  'age_mismatch',
  'manual'
);

CREATE TABLE moderation_flags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  account_id  uuid REFERENCES accounts(id) ON DELETE SET NULL,
  type        moderation_flag_type NOT NULL,
  confidence  numeric(3,2),    -- 0.00–1.00 if from automated signal
  notes       text,
  resolved    boolean NOT NULL DEFAULT false,
  resolved_by uuid REFERENCES accounts(id),
  resolved_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX moderation_flags_unresolved_idx ON moderation_flags (resolved, created_at DESC) WHERE resolved = false;

-- Admin audit log (immutable — no UPDATE/DELETE on this table)
CREATE TABLE admin_audit_logs (
  id          bigserial PRIMARY KEY,
  actor_id    uuid REFERENCES accounts(id) ON DELETE SET NULL,
  action      text NOT NULL,     -- e.g. 'suspend_account', 'approve_photo'
  target_type text,              -- e.g. 'account', 'profile', 'photo'
  target_id   uuid,
  payload     jsonb,             -- before/after values for important changes
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX admin_audit_actor_idx  ON admin_audit_logs (actor_id, created_at DESC);
CREATE INDEX admin_audit_target_idx ON admin_audit_logs (target_type, target_id, created_at DESC);

-- Duplicate/fraud detection helper
CREATE TABLE duplicate_flags (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id_a    uuid NOT NULL REFERENCES accounts(id),
  account_id_b    uuid NOT NULL REFERENCES accounts(id),
  similarity_score numeric(3,2),
  flagged_reason  text,
  reviewed        boolean NOT NULL DEFAULT false,
  reviewed_by     uuid REFERENCES accounts(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (account_id_a < account_id_b)
);
