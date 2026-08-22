-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 003 — India Locations
-- INDIA ONLY — no Nepal, no Pakistan, no foreign locations
-- Hierarchy: country → state → district → city/town → village
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE location_level AS ENUM (
  'country',
  'state',
  'district',
  'city',
  'town',
  'village'
);

CREATE TABLE india_locations (
  id          bigserial PRIMARY KEY,
  parent_id   bigint REFERENCES india_locations(id),
  level       location_level NOT NULL,
  name_en     text NOT NULL,
  name_hi     text,
  name_mai    text,          -- Maithili name (especially important for Mithila region)
  state_code  text,          -- ISO 3166-2:IN (e.g. 'IN-BR' for Bihar)
  pincode     text,          -- leaf nodes only
  is_mithila_region boolean NOT NULL DEFAULT false,  -- flag Mithila heartland districts
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX india_locations_parent_idx ON india_locations (parent_id);
CREATE INDEX india_locations_level_idx ON india_locations (level);
CREATE INDEX india_locations_state_code_idx ON india_locations (state_code);
CREATE INDEX india_locations_mithila_idx ON india_locations (is_mithila_region) WHERE is_mithila_region = true;

-- Full-text search on location names
CREATE INDEX india_locations_name_fts ON india_locations
  USING gin(to_tsvector('simple', name_en || ' ' || COALESCE(name_hi, '') || ' ' || COALESCE(name_mai, '')));

-- Community masters (Gotra, Mool, etc.)
CREATE TABLE community_masters (
  id          serial PRIMARY KEY,
  type        text NOT NULL,    -- caste | sub_caste | gotra | mool | gram
  value       text NOT NULL,    -- normalized key
  label_en    text NOT NULL,
  label_hi    text,
  label_mai   text,
  is_mithila  boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  UNIQUE (type, value)
);

CREATE INDEX community_masters_type_idx ON community_masters (type);
