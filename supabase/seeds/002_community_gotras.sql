-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: Community Masters — Mithila Gotras, Mools, Castes
-- Source: Traditional Mithila community knowledge (human-reviewed)
-- INDIA ONLY — No Nepal references
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Castes ────────────────────────────────────────────────────────────────
INSERT INTO community_masters (type, value, label_en, label_hi, label_mai) VALUES
  ('caste', 'brahmin',    'Brahmin',      'ब्राह्मण',    'ब्राह्मण'),
  ('caste', 'kayastha',   'Kayastha',     'कायस्थ',      'कायस्थ'),
  ('caste', 'bhumihar',   'Bhumihar',     'भूमिहार',     'भूमिहार'),
  ('caste', 'kshatriya',  'Kshatriya',    'क्षत्रिय',    'क्षत्रिय'),
  ('caste', 'vaishya',    'Vaishya',      'वैश्य',       'वैश्य'),
  ('caste', 'yadav',      'Yadav',        'यादव',        'यादव'),
  ('caste', 'other_obc',  'Other OBC',    'अन्य ओबीसी',  'अन्य ओबीसी'),
  ('caste', 'other',      'Other',        'अन्य',        'अन्य');

-- ── Sub-castes (Brahmin sub-divisions common in Mithila) ─────────────────
INSERT INTO community_masters (type, value, label_en, label_hi, label_mai) VALUES
  ('sub_caste', 'maithil_brahmin',   'Maithil Brahmin',   'मैथिल ब्राह्मण',  'मैथिल ब्राह्मण'),
  ('sub_caste', 'srotiya',           'Srotiya',           'श्रोत्रिय',        'श्रोत्रिय'),
  ('sub_caste', 'yogya',             'Yogya',             'योग्य',            'योग्य'),
  ('sub_caste', 'panji',             'Panji',             'पांजि',            'पाञ्जि'),
  ('sub_caste', 'other',             'Other',             'अन्य',             'अन्य');

-- ── Gotras (common Mithila Brahmin gotras — human-reviewed) ──────────────
INSERT INTO community_masters (type, value, label_en, label_hi, label_mai) VALUES
  ('gotra', 'kashyap',       'Kashyap',      'कश्यप',      'कश्यप'),
  ('gotra', 'bharadwaj',     'Bharadwaj',    'भारद्वाज',   'भारद्वाज'),
  ('gotra', 'vatsa',         'Vatsa',        'वत्स',       'वत्स'),
  ('gotra', 'parashar',      'Parashar',     'पराशर',      'पराशर'),
  ('gotra', 'sandilya',      'Sandilya',     'शांडिल्य',   'शाण्डिल्य'),
  ('gotra', 'vishwamitra',   'Vishwamitra',  'विश्वामित्र', 'विश्वामित्र'),
  ('gotra', 'gautam',        'Gautam',       'गौतम',       'गौतम'),
  ('gotra', 'vashishtha',    'Vashishtha',   'वशिष्ठ',     'वशिष्ठ'),
  ('gotra', 'atri',          'Atri',         'अत्रि',      'अत्रि'),
  ('gotra', 'garg',          'Garg',         'गर्ग',       'गर्ग'),
  ('gotra', 'shrivatsa',     'Shrivatsa',    'श्रीवत्स',   'श्रीवत्स'),
  ('gotra', 'kaushik',       'Kaushik',      'कौशिक',      'कौशिक'),
  ('gotra', 'mandavya',      'Mandavya',     'माण्डव्य',   'माण्डव्य'),
  ('gotra', 'upamanyu',      'Upamanyu',     'उपमन्यु',    'उपमन्यु'),
  ('gotra', 'maudgal',       'Maudgal',      'मौद्गल्य',   'मौद्गल्य'),
  ('gotra', 'dhananjay',     'Dhananjay',    'धनंजय',      'धनंजय'),
  ('gotra', 'other',         'Other',        'अन्य',       'अन्य');

-- ── Mools (ancestral clan markers — Mithila specific) ─────────────────────
INSERT INTO community_masters (type, value, label_en, label_hi, label_mai) VALUES
  ('mool', 'sonwar',     'Sonwar',     'सोनवार',     'सोनवार'),
  ('mool', 'rajwar',     'Rajwar',     'राजवार',     'राजवार'),
  ('mool', 'ganaur',     'Ganaur',     'गनौर',       'गनौर'),
  ('mool', 'saptasati',  'Saptasati',  'सप्तसती',    'सप्तसती'),
  ('mool', 'palikwar',   'Palikwar',   'पालिकवार',   'पालिकवार'),
  ('mool', 'other',      'Other',      'अन्य',       'अन्य');
