-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 012 — Profile Photos Storage Bucket
-- Creates the private profile-photos bucket in Supabase Storage.
-- All photo access goes through the server API (service role key).
-- Clients never access Storage directly.
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  false,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;
