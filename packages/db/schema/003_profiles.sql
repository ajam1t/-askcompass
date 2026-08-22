-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 003 — Profiles
-- Depends on: 001 (accounts), 002 (india_locations, education_levels, professions)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE profile_for AS ENUM ('self', 'son', 'daughter', 'sibling', 'other');
CREATE TYPE profile_gender AS ENUM ('male', 'female');
CREATE TYPE profile_status AS ENUM ('draft', 'pending_review', 'active', 'deactivated', 'deleted');
CREATE TYPE profile_permission_level AS ENUM ('view', 'edit', 'full');
CREATE TYPE photo_status AS ENUM ('pending_moderation', 'approved', 'rejected', 'deleted');

-- ── Core profile ──────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id          uuid NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  profile_for         profile_for NOT NULL DEFAULT 'self',
  first_name          text NOT NULL,
  last_name           text,
  gender              profile_gender NOT NULL,
  dob                 date NOT NULL,
  religion            text NOT NULL DEFAULT 'Hindu',
  caste               text,
  sub_caste           text,
  self_gotra          text,
  maternal_gotra      text,
  mool                text,
  gram                text,
  -- India-only location FKs
  native_place_id     bigint REFERENCES india_locations(id),
  current_loc_id      bigint REFERENCES india_locations(id),
  job_loc_id          bigint REFERENCES india_locations(id),
  -- Education & career FKs
  education_level_id  integer REFERENCES education_levels(id),
  education_detail    text,
  profession_id       integer REFERENCES professions(id),
  profession_detail   text,
  employer            text,
  height_cm           integer CHECK (height_cm BETWEEN 100 AND 250),
  diet                text,
  smoking             text,
  drinking            text,
  about_me            text,
  family_about        text,
  profile_status      profile_status NOT NULL DEFAULT 'draft',
  discoverable        boolean NOT NULL DEFAULT false,
  profile_complete    integer NOT NULL DEFAULT 0 CHECK (profile_complete BETWEEN 0 AND 100),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  activated_at        timestamptz,
  deleted_at          timestamptz,
  status_reason       text,
  search_needs_rebuild boolean NOT NULL DEFAULT true
);

CREATE INDEX profiles_account_idx ON profiles (account_id);
CREATE INDEX profiles_status_idx  ON profiles (profile_status, discoverable);
CREATE INDEX profiles_gender_idx  ON profiles (gender);
CREATE INDEX profiles_gotra_idx   ON profiles (self_gotra);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Age validation at activation — server-side, not just frontend
CREATE OR REPLACE FUNCTION enforce_minimum_age()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_status = 'active' AND OLD.profile_status != 'active' THEN
    IF NEW.dob > (CURRENT_DATE - INTERVAL '18 years') THEN
      RAISE EXCEPTION 'Profile cannot be activated: minimum age requirement not met';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_age_check
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_minimum_age();

-- ── Profile private ───────────────────────────────────────────────────────
CREATE TABLE profile_private (
  profile_id      uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  income_min_lpa  integer,
  income_max_lpa  integer,
  rashi           text,
  nakshatra       text,
  mangalik        text,
  contact_mobile  text,
  contact_email   text,
  address         text,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Profile photos ────────────────────────────────────────────────────────
CREATE TABLE profile_photos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path    text NOT NULL,
  is_primary      boolean NOT NULL DEFAULT false,
  display_order   integer NOT NULL DEFAULT 0,
  status          photo_status NOT NULL DEFAULT 'pending_moderation',
  moderation_note text,
  moderated_by    uuid REFERENCES accounts(id),
  moderated_at    timestamptz,
  blurhash        text,
  width_px        integer,
  height_px       integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profile_photos_profile_idx ON profile_photos (profile_id, status);
CREATE UNIQUE INDEX profile_photos_primary_idx
  ON profile_photos (profile_id)
  WHERE is_primary = true AND status = 'approved';

-- ── Family permissions ────────────────────────────────────────────────────
CREATE TABLE family_permissions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delegate_account_id   uuid REFERENCES accounts(id) ON DELETE SET NULL,
  delegate_mobile       text NOT NULL,
  delegate_name         text,
  permission_level      profile_permission_level NOT NULL DEFAULT 'view',
  invited_at            timestamptz NOT NULL DEFAULT now(),
  accepted_at           timestamptz,
  revoked_at            timestamptz,
  ownership_transfer    boolean NOT NULL DEFAULT false,
  transfer_completed_at timestamptz
);

CREATE INDEX family_permissions_profile_idx  ON family_permissions (profile_id);
CREATE INDEX family_permissions_delegate_idx ON family_permissions (delegate_account_id);

-- ── Marriage preferences ──────────────────────────────────────────────────
CREATE TABLE profile_preferences (
  profile_id      uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  pref_age_min    integer CHECK (pref_age_min >= 18),
  pref_age_max    integer,
  pref_gender     profile_gender,
  pref_caste      text[],
  pref_gotra_safe boolean NOT NULL DEFAULT true,
  pref_education  integer[],
  pref_location   bigint[],
  pref_diet       text[],
  pref_notes      text,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
