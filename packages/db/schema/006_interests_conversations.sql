-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 006 — Interests, Shortlists, Blocks, Conversations, Messages
-- Messaging only after MUTUAL interest acceptance.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE interest_status AS ENUM (
  'sent',
  'accepted',
  'declined',
  'withdrawn'
);

CREATE TYPE conversation_status AS ENUM ('open', 'closed', 'blocked');
CREATE TYPE block_reason AS ENUM ('harassment', 'fake_profile', 'inappropriate', 'other');

-- ── Interests ────────────────────────────────────────────────────────────
CREATE TABLE interests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_profile    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_profile      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status          interest_status NOT NULL DEFAULT 'sent',
  message         text,                -- optional short introduction message
  sent_at         timestamptz NOT NULL DEFAULT now(),
  responded_at    timestamptz,
  UNIQUE (from_profile, to_profile),
  CHECK (from_profile != to_profile)
);

CREATE INDEX interests_from_idx ON interests (from_profile, status);
CREATE INDEX interests_to_idx   ON interests (to_profile, status);

-- ── Shortlists ────────────────────────────────────────────────────────────
CREATE TABLE shortlists (
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  saved_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  saved_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, saved_id),
  CHECK (profile_id != saved_id)
);

CREATE INDEX shortlists_profile_idx ON shortlists (profile_id);

-- ── Blocks ────────────────────────────────────────────────────────────────
CREATE TABLE blocks (
  blocker_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason      block_reason,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- ── Conversations (created ONLY after mutual interest) ────────────────────
CREATE TABLE conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_a   uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  profile_b   uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status      conversation_status NOT NULL DEFAULT 'open',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_a, profile_b),
  CHECK (profile_a < profile_b)  -- canonical ordering to prevent duplicates
);

CREATE INDEX conversations_a_idx ON conversations (profile_a, status);
CREATE INDEX conversations_b_idx ON conversations (profile_b, status);

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Messages ──────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  body            text NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  sent_at         timestamptz NOT NULL DEFAULT now(),
  read_at         timestamptz,
  deleted_at      timestamptz    -- soft delete
);

CREATE INDEX messages_conv_idx ON messages (conversation_id, sent_at DESC);

-- ── Notifications ─────────────────────────────────────────────────────────
CREATE TYPE notification_type AS ENUM (
  'interest_received',
  'interest_accepted',
  'interest_declined',
  'new_message',
  'profile_viewed',
  'membership_expiring',
  'membership_expired',
  'photo_approved',
  'photo_rejected',
  'profile_approved',
  'profile_rejected',
  'system'
);

CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  payload     jsonb NOT NULL DEFAULT '{}',
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_account_idx ON notifications (account_id, read, created_at DESC);

-- Trigger: create conversation after mutual interest acceptance
CREATE OR REPLACE FUNCTION create_conversation_on_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  reciprocal_interest interests%ROWTYPE;
  p_a uuid;
  p_b uuid;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'sent' THEN
    -- Check for reciprocal interest
    SELECT * INTO reciprocal_interest
    FROM interests
    WHERE from_profile = NEW.to_profile
      AND to_profile = NEW.from_profile
      AND status = 'accepted';

    IF FOUND THEN
      -- Canonical order: smaller UUID first
      p_a := LEAST(NEW.from_profile, NEW.to_profile);
      p_b := GREATEST(NEW.from_profile, NEW.to_profile);

      INSERT INTO conversations (profile_a, profile_b)
      VALUES (p_a, p_b)
      ON CONFLICT (profile_a, profile_b) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interests_create_conversation
  AFTER UPDATE ON interests
  FOR EACH ROW EXECUTE FUNCTION create_conversation_on_acceptance();
