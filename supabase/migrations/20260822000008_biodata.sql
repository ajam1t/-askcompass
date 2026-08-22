-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 008 — Biodata
-- Profile remains the source of truth.
-- Biodata generator reads profile, renders template, generates PDF.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE biodata_language AS ENUM ('en', 'hi', 'mai', 'sa');
CREATE TYPE biodata_generation_status AS ENUM ('pending', 'processing', 'ready', 'failed', 'expired');

CREATE TABLE biodata_templates (
  id          serial PRIMARY KEY,
  slug        text UNIQUE NOT NULL,  -- classic | elegant | mithila | modern | premium_wedding
  label_en    text NOT NULL,
  label_hi    text,
  label_mai   text,
  -- Mithila template: rendered via Puppeteer (needs CSS art)
  -- Other templates: @react-pdf/renderer
  renderer    text NOT NULL DEFAULT 'react-pdf',  -- react-pdf | puppeteer
  active      boolean NOT NULL DEFAULT true,
  preview_path text,   -- storage path for template preview image
  sort_order  integer NOT NULL DEFAULT 0
);

-- Audit trail of every biodata generation (for analytics + compliance)
CREATE TABLE biodata_generations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  template_id     integer NOT NULL REFERENCES biodata_templates(id),
  language        biodata_language NOT NULL,

  -- Which profile fields were included (user-controlled)
  fields_included jsonb NOT NULL DEFAULT '[]',

  -- Async generation
  status          biodata_generation_status NOT NULL DEFAULT 'pending',
  storage_path    text,           -- private Supabase Storage path
  error_message   text,

  -- Signed URL metadata (never store the URL itself — regenerate on demand)
  file_size_bytes integer,

  -- Expiry — old files cleaned up by Edge Function
  expires_at      timestamptz,

  generated_at    timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz
);

CREATE INDEX biodata_generations_profile_idx ON biodata_generations (profile_id, generated_at DESC);
CREATE INDEX biodata_generations_status_idx  ON biodata_generations (status) WHERE status IN ('pending', 'processing');
