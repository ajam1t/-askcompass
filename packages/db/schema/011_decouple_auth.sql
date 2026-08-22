-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 011 — Decouple accounts from auth.users + add session tokens
--
-- Phase 2 uses custom OTP + custom session management (account_sessions).
-- accounts.id no longer references auth.users.id — it is its own UUID.
-- account_sessions gains token_hash (SHA-256 of cookie token) and expires_at.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Drop FK from accounts.id → auth.users.id (safe regardless of constraint name)
DO $$
DECLARE
  v_constraint text;
BEGIN
  SELECT conname INTO v_constraint
  FROM pg_constraint
  WHERE conrelid = 'public.accounts'::regclass
    AND confrelid = 'auth.users'::regclass
    AND contype = 'f'
  LIMIT 1;

  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.accounts DROP CONSTRAINT %I', v_constraint);
    RAISE NOTICE 'Migration 011: dropped FK constraint % on accounts → auth.users', v_constraint;
  ELSE
    RAISE NOTICE 'Migration 011: no FK found on accounts → auth.users — already decoupled';
  END IF;
END $$;

-- Ensure accounts.id has a default (was previously relying on auth.users to provide it)
ALTER TABLE accounts ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Add session token fields to account_sessions
--    No existing rows expected at this migration point (Phase 1 schema only, no data).
ALTER TABLE account_sessions
  ADD COLUMN IF NOT EXISTS token_hash text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Enforce NOT NULL after add (safe because no rows exist yet)
UPDATE account_sessions SET token_hash = gen_random_uuid()::text, expires_at = now()
  WHERE token_hash IS NULL;

ALTER TABLE account_sessions
  ALTER COLUMN token_hash SET NOT NULL,
  ALTER COLUMN expires_at SET NOT NULL;

-- Unique index for O(1) session lookup by token
CREATE UNIQUE INDEX IF NOT EXISTS account_sessions_token_hash_idx
  ON account_sessions (token_hash);

-- Index for expiry cleanup jobs
CREATE INDEX IF NOT EXISTS account_sessions_expires_idx
  ON account_sessions (expires_at)
  WHERE revoked_at IS NULL;
