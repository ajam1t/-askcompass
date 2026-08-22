-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 004 — Memberships & Payments
-- ₹111 / 1 year, MANUAL renewal only (no recurring mandates)
-- Price/duration stored in plan_config — NOT hardcoded in application
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE membership_status AS ENUM (
  'pending',
  'active',
  'expiring_soon',    -- within 30 days of expiry
  'grace',            -- past expiry, within grace period (default 7 days)
  'expired',
  'cancelled',
  'refunded',
  'payment_failed'
);

CREATE TYPE payment_status AS ENUM (
  'created',
  'authorized',
  'captured',
  'failed',
  'refunded',
  'partially_refunded'
);

-- Plan configuration — never hardcode ₹111 in application code
CREATE TABLE plan_config (
  plan          text PRIMARY KEY,
  price_paise   integer NOT NULL,      -- 11100 = ₹111.00
  duration_days integer NOT NULL,      -- 365
  grace_days    integer NOT NULL DEFAULT 7,
  expiring_soon_days integer NOT NULL DEFAULT 30,
  label_en      text NOT NULL,
  label_hi      text,
  label_mai     text,
  active        boolean NOT NULL DEFAULT true,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Payments (Razorpay; gateway abstraction via `gateway` field)
CREATE TABLE payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id          uuid NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  -- Membership link (nullable until created post-capture)
  membership_id       uuid,

  -- Gateway details (Razorpay)
  gateway             text NOT NULL DEFAULT 'razorpay',
  gateway_order_id    text,                    -- Razorpay order_id
  gateway_payment_id  text,                    -- Razorpay payment_id (set on capture)
  gateway_signature   text,                    -- Razorpay HMAC signature (for verification)

  -- Amount
  amount_paise        integer NOT NULL,
  currency            text NOT NULL DEFAULT 'INR',
  plan                text NOT NULL REFERENCES plan_config(plan),

  -- Status
  status              payment_status NOT NULL DEFAULT 'created',

  -- Idempotency — prevents duplicate webhook processing
  idempotency_key     text UNIQUE NOT NULL,   -- generated server-side at order creation

  -- Failure info
  failure_code        text,
  failure_description text,

  -- Refund info
  refund_id           text,
  refunded_amount_paise integer,
  refunded_at         timestamptz,

  -- Raw webhook payloads (for audit/replay)
  raw_webhook         jsonb,

  -- Timestamps
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payments_account_idx ON payments (account_id);
CREATE INDEX payments_gateway_order_idx ON payments (gateway_order_id);
CREATE INDEX payments_gateway_payment_idx ON payments (gateway_payment_id);
CREATE INDEX payments_status_idx ON payments (status);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Memberships
CREATE TABLE memberships (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  payment_id  uuid REFERENCES payments(id),
  plan        text NOT NULL REFERENCES plan_config(plan),
  status      membership_status NOT NULL DEFAULT 'pending',

  -- Lifecycle
  started_at  timestamptz,
  expires_at  timestamptz,
  grace_until timestamptz,

  -- Cancellation / refund
  cancelled_at     timestamptz,
  cancellation_reason text,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX memberships_account_idx ON memberships (account_id, status);
CREATE INDEX memberships_expires_idx ON memberships (expires_at) WHERE status = 'active';

CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add FK from payments back to memberships (circular; deferred)
ALTER TABLE payments
  ADD CONSTRAINT payments_membership_fk
  FOREIGN KEY (membership_id) REFERENCES memberships(id) DEFERRABLE INITIALLY DEFERRED;

-- Nightly job: update expiring_soon and grace statuses
-- (Called from a Supabase scheduled Edge Function or pg_cron)
CREATE OR REPLACE FUNCTION refresh_membership_statuses()
RETURNS void AS $$
BEGIN
  -- active → expiring_soon
  UPDATE memberships m
  SET status = 'expiring_soon', updated_at = now()
  FROM plan_config pc
  WHERE m.plan = pc.plan
    AND m.status = 'active'
    AND m.expires_at <= (now() + (pc.expiring_soon_days || ' days')::interval)
    AND m.expires_at > now();

  -- active/expiring_soon → grace
  UPDATE memberships m
  SET status = 'grace', grace_until = m.expires_at + (pc.grace_days || ' days')::interval, updated_at = now()
  FROM plan_config pc
  WHERE m.plan = pc.plan
    AND m.status IN ('active', 'expiring_soon')
    AND m.expires_at < now();

  -- grace → expired
  UPDATE memberships
  SET status = 'expired', updated_at = now()
  WHERE status = 'grace'
    AND grace_until < now();

  -- Sync profile discoverable flag (expired membership → hidden)
  UPDATE profiles p
  SET discoverable = false, updated_at = now()
  WHERE EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.account_id = p.account_id
      AND m.status = 'expired'
  )
  AND NOT EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.account_id = p.account_id
      AND m.status IN ('active', 'expiring_soon', 'grace')
  )
  AND p.discoverable = true;
END;
$$ LANGUAGE plpgsql;
