-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 007 — Verifications
-- Architecture complete; DigiLocker provider DEFERRED.
-- Admin review workflow operational from day one.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE verification_type AS ENUM (
  'mobile',
  'email',
  'digilocker',    -- DEFERRED — stub only
  'manual_review'  -- admin-initiated
);

CREATE TYPE verification_status AS ENUM (
  'pending',
  'verified',
  'failed',
  'expired',
  'revoked'
);

CREATE TABLE verifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            verification_type NOT NULL,
  status          verification_status NOT NULL DEFAULT 'pending',

  -- Provider details (DigiLocker fields populated when activated)
  provider        text NOT NULL DEFAULT 'internal',
  provider_ref    text,
  -- NEVER store full Aadhaar number — DPDP compliance
  masked_id       text,   -- last 4 digits only

  -- Admin review
  reviewed_by     uuid REFERENCES accounts(id),
  review_notes    text,

  verified_at     timestamptz,
  expires_at      timestamptz,
  revoked_at      timestamptz,
  revocation_reason text,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX verifications_profile_idx ON verifications (profile_id, type, status);

CREATE TRIGGER verifications_updated_at
  BEFORE UPDATE ON verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
