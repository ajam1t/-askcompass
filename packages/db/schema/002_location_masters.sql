-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 002 — Location + Community Masters
-- Must run BEFORE profiles (002 is referenced by profiles FKs)
-- INDIA ONLY — no Nepal, no foreign countries
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
  name_mai    text,
  state_code  text,
  pincode     text,
  is_mithila_region boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX india_locations_parent_idx    ON india_locations (parent_id);
CREATE INDEX india_locations_level_idx     ON india_locations (level);
CREATE INDEX india_locations_state_idx     ON india_locations (state_code);
CREATE INDEX india_locations_mithila_idx   ON india_locations (is_mithila_region) WHERE is_mithila_region = true;
CREATE INDEX india_locations_name_fts      ON india_locations
  USING gin(to_tsvector('simple', name_en || ' ' || COALESCE(name_hi,'') || ' ' || COALESCE(name_mai,'')));

CREATE TABLE community_masters (
  id          serial PRIMARY KEY,
  type        text NOT NULL,
  value       text NOT NULL,
  label_en    text NOT NULL,
  label_hi    text,
  label_mai   text,
  is_mithila  boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  UNIQUE (type, value)
);

CREATE INDEX community_masters_type_idx ON community_masters (type);

-- Education + career masters (also needed before profiles)
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
