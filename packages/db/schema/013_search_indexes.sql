-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 013 — Discovery Search Indexes
-- Additional indexes on profiles for Phase 4 search filters.
-- The profile_discoverable projection (005) already has its own indexes.
-- These cover direct queries on the profiles table during search.
-- ═══════════════════════════════════════════════════════════════════════════

-- Filter columns used in search API
CREATE INDEX IF NOT EXISTS profiles_caste_idx     ON profiles (caste)       WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS profiles_mool_idx      ON profiles (mool)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS profiles_gram_idx      ON profiles (gram)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS profiles_religion_idx  ON profiles (religion)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS profiles_diet_idx      ON profiles (diet)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS profiles_height_idx    ON profiles (height_cm)   WHERE deleted_at IS NULL;

-- Compound index: discoverable profiles by status + updated_at (covers most search queries)
CREATE INDEX IF NOT EXISTS profiles_discover_updated_idx
  ON profiles (discoverable, profile_status, updated_at DESC)
  WHERE deleted_at IS NULL;

-- DOB index for age-range filters
CREATE INDEX IF NOT EXISTS profiles_dob_idx ON profiles (dob) WHERE deleted_at IS NULL;

-- Location indexes for state-level search
CREATE INDEX IF NOT EXISTS profiles_native_loc_idx  ON profiles (native_place_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS profiles_current_loc_idx ON profiles (current_loc_id)  WHERE deleted_at IS NULL;

-- Partial index: only rows that can appear in search results
CREATE INDEX IF NOT EXISTS profiles_searchable_idx
  ON profiles (profile_complete DESC, updated_at DESC)
  WHERE discoverable = true
    AND profile_status NOT IN ('deleted', 'deactivated')
    AND deleted_at IS NULL;

-- profile_photos: fast lookup of primary approved photo per profile
CREATE INDEX IF NOT EXISTS profile_photos_primary_approved_idx
  ON profile_photos (profile_id, is_primary, status)
  WHERE is_primary = true AND status = 'approved';
