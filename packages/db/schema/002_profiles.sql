-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 002 — Profiles
-- Separated into: profiles (safe), profile_private (sensitive),
--                 profile_photos, family_permissions
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

  -- Who the profile is for
  profile_for         profile_for NOT NULL DEFAULT 'self',

  -- Basic identity
  first_name          text NOT NULL,
  last_name           text,
  gender              profile_gender NOT NULL,
  dob                 date NOT NULL,

  -- Age enforcement: must be >= 18 at time of activation
  -- CHECK enforced at profile activation trigger, not here (dob alone insufficient)

  -- Religion / caste / community — Mithila-specific
  religion            text NOT NULL DEFAULT 'Hindu',
  caste               text,
  sub_caste           text,
  self_gotra          text,        -- Gotra exclusion in matching
  maternal_gotra      text,        -- additional matching dimension
  mool                text,        -- ancestral marker
  gram                text,        -- ancestral village name

  -- Locations (FK to india_locations; India-only — no Nepal)
  native_place_id     bigint REFERENCES india_locations(id),
  current_loc_id      bigint REFERENCES india_locations(id),
  job_loc_id          bigint REFERENCES india_locations(id),

  -- Education & career (FKs to master tables)
  education_level_id  integer REFERENCES education_levels(id),
  education_detail    text,
  profession_id       integer REFERENCES professions(id),
  profession_detail   text,
  employer            text,

  -- Physical
  height_cm           integer CHECK (height_cm BETWEEN 100 AND 250),

  -- Lifestyle
  diet                text,        -- vegetarian | non-vegetarian | eggetarian | vegan
  smoking             text,        -- no | occasionally | yes
  drinking            text,        -- no | occasionally | yes

  -- About
  about_me            text,        -- free text, max 1000 chars
  family_about        text,

  -- Profile status & lifecycle
  profile_status      profile_status NOT NULL DEFAULT 'draft',
  discoverable        boolean NOT NULL DEFAULT false,
  profile_complete    integer NOT NULL DEFAULT 0 CHECK (profile_complete BETWEEN 0 AND 100),

  -- Timestamps
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  activated_at        timestamptz,
  deleted_at          timestamptz,
  status_reason       text,

  -- Search refresh trigger
  search_needs_rebuild boolean NOT NULL DEFAULT true
);

CREATE INDEX profiles_account_idx ON profiles (account_id);
CREATE INDEX profiles_status_idx ON profiles (profile_status, discoverable);
CREATE INDEX profiles_gender_idx ON profiles (gender);
CREATE INDEX profiles_gotra_idx ON profiles (self_gotra);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Age validation at activation (server-side, not just frontend)
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

-- ── Profile private (sensitive fields — tighter RLS) ──────────────────────
CREATE TABLE profile_private (
  profile_id      uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  income_min_lpa  integer,        -- annual income in lakhs INR
  income_max_lpa  integer,
  -- Horoscope (optional, user-controlled)
  rashi           text,
  nakshatra       text,
  mangalik        text,           -- yes | no | partial | unknown
  -- Contact (shown only after mutual interest)
  contact_mobile  text,
  contact_email   text,
  address         text,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Profile photos ────────────────────────────────────────────────────────
CREATE TABLE profile_photos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path    text NOT NULL,           -- private Supabase Storage path (never public)
  is_primary      boolean NOT NULL DEFAULT false,
  display_order   integer NOT NULL DEFAULT 0,
  status          photo_status NOT NULL DEFAULT 'pending_moderation',
  moderation_note text,
  moderated_by    uuid REFERENCES accounts(id),
  moderated_at    timestamptz,
  -- BlurHash for smooth loading placeholders
  blurhash        text,
  width_px        integer,
  height_px       integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profile_photos_profile_idx ON profile_photos (profile_id, status);

-- Only one primary photo per profile
CREATE UNIQUE INDEX profile_photos_primary_idx
  ON profile_photos (profile_id)
  WHERE is_primary = true AND status = 'approved';

-- ── Family permissions (delegation + ownership transfer support) ──────────
CREATE TABLE family_permissions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- The account being granted access
  delegate_account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  delegate_mobile     text NOT NULL,   -- stored even if account not yet created
  delegate_name       text,
  permission_level    profile_permission_level NOT NULL DEFAULT 'view',
  -- Lifecycle
  invited_at          timestamptz NOT NULL DEFAULT now(),
  accepted_at         timestamptz,
  revoked_at          timestamptz,
  -- Ownership transfer: when subject takes direct control
  ownership_transfer  boolean NOT NULL DEFAULT false,
  transfer_completed_at timestamptz
);

CREATE INDEX family_permissions_profile_idx ON family_permissions (profile_id);
CREATE INDEX family_permissions_delegate_idx ON family_permissions (delegate_account_id);

-- ── Education & career masters ────────────────────────────────────────────
CREATE TABLE education_levels (
  id          serial PRIMARY KEY,
  label_en    text NOT NULL,
  label_hi    text,
  label_mai   text,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE TABLE professions (
  id          serial PRIMARY KEY,
  category    text NOT NULL,
  label_en    text NOT NULL,
  label_hi    text,
  label_mai   text,
  sort_order  integer NOT NULL DEFAULT 0
);

-- ── Marriage preferences (stored separately for clean search projection) ──
CREATE TABLE profile_preferences (
  profile_id      uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  pref_age_min    integer CHECK (pref_age_min >= 18),
  pref_age_max    integer,
  pref_gender     profile_gender,
  pref_caste      text[],          -- array of acceptable castes (NULL = any)
  pref_gotra_safe boolean NOT NULL DEFAULT true,   -- always enforce gotra safety
  pref_education  integer[],       -- education_level ids
  pref_location   bigint[],        -- india_location ids (state level)
  pref_diet       text[],
  pref_notes      text,
  updated_at      timestamptz NOT NULL DEFAULT now()
);
