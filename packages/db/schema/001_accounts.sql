-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 001 — Accounts
-- Core account table tied to Supabase auth.users
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE account_status AS ENUM (
  'pending_verification',
  'active',
  'suspended',
  'banned',
  'deactivated',
  'deleted'
);

CREATE TYPE account_role AS ENUM (
  'user',
  'moderator',
  'admin'
);

CREATE TABLE accounts (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mobile          text UNIQUE NOT NULL,          -- E.164 format (+91XXXXXXXXXX)
  mobile_verified boolean NOT NULL DEFAULT false,
  email           text,
  email_verified  boolean NOT NULL DEFAULT false,
  account_status  account_status NOT NULL DEFAULT 'pending_verification',
  role            account_role NOT NULL DEFAULT 'user',
  -- DPDP: track when account was created and last modified
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  -- Soft delete — data preserved until hard-delete workflow completes
  deleted_at      timestamptz,
  -- Deletion / deactivation reason (for audit)
  status_reason   text,
  -- Failed login tracking for rate-limiting
  failed_login_attempts integer NOT NULL DEFAULT 0,
  locked_until    timestamptz
);

-- OTP challenge table (deferred SMS; architecture complete)
CREATE TABLE otp_challenges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile      text NOT NULL,
  otp_hash    text NOT NULL,    -- bcrypt hash — raw OTP never stored
  attempts    integer NOT NULL DEFAULT 0,
  expires_at  timestamptz NOT NULL,
  used        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX otp_challenges_mobile_idx ON otp_challenges (mobile, used);

-- Account sessions (device tracking for security audit)
CREATE TABLE account_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_hash text,             -- hashed user-agent + IP fingerprint
  user_agent  text,
  ip_address  inet,
  last_seen   timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX account_sessions_account_idx ON account_sessions (account_id);

-- Legal consents (DPDP — purpose-specific, versioned, timestamped)
CREATE TYPE consent_type AS ENUM (
  'terms',
  'privacy',
  'data_processing',
  'marketing',
  'third_party_sharing'
);

CREATE TABLE legal_consents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type        consent_type NOT NULL,
  version     text NOT NULL,
  consented   boolean NOT NULL,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- Withdrawal tracking
  withdrawn_at timestamptz,
  withdrawal_reason text
);

CREATE INDEX legal_consents_account_idx ON legal_consents (account_id, type);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
