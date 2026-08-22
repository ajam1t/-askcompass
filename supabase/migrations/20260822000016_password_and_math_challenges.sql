-- ─── Migration 016: Password Auth + Math Challenges ────────────────────────
-- Adds password authentication support and server-side arithmetic
-- human-verification challenges.
-- Accounts already exist from migration 001/011; we add columns non-destructively.

-- 1. Password fields on accounts
ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS password_hash            text,
  ADD COLUMN IF NOT EXISTS password_reset_token_hash text,
  ADD COLUMN IF NOT EXISTS password_reset_expires_at timestamptz;

-- 2. Arithmetic human-verification challenges
--    question   : plain text shown to user e.g. "10 + 17 = ?"
--    answer_hash: bcrypt of the numeric answer string (never stored plain)
--    session_key: random hex returned to client as challenge_id
--    used       : true once verified successfully OR expired
--    attempts   : incremented on every wrong answer; capped at 3
CREATE TABLE IF NOT EXISTS math_challenges (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  question    text        NOT NULL,
  answer_hash text        NOT NULL,
  session_key text        NOT NULL,
  used        boolean     NOT NULL DEFAULT false,
  attempts    integer     NOT NULL DEFAULT 0,
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS math_challenges_session_key_idx
  ON math_challenges (session_key);

CREATE INDEX IF NOT EXISTS math_challenges_cleanup_idx
  ON math_challenges (expires_at)
  WHERE NOT used;
