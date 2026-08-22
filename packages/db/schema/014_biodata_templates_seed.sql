-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 014 — Biodata template seed data
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO biodata_templates (slug, label_en, label_hi, label_mai, renderer, active, sort_order)
VALUES
  ('classic', 'Classic',  'क्लासिक', 'क्लासिक', 'react-pdf', true,  1),
  ('elegant', 'Elegant',  'एलिगेंट', 'एलिगेंट', 'react-pdf', true,  2),
  ('mithila', 'Mithila',  'मिथिला',  'मिथिला',  'puppeteer', false, 3)
ON CONFLICT (slug) DO NOTHING;
