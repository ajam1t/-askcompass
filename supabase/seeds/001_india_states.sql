-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: India Locations — Country + States + Bihar Mithila districts
-- Idempotent: uses ON CONFLICT DO NOTHING
-- INDIA ONLY — no Nepal
-- ═══════════════════════════════════════════════════════════════════════════

-- Country root (fixed id=1)
INSERT INTO india_locations (id, parent_id, level, name_en, name_hi, state_code)
VALUES (1, NULL, 'country', 'India', 'भारत', 'IN')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence past 1 so auto-inserts don't collide
SELECT setval('india_locations_id_seq', GREATEST(2, (SELECT MAX(id) FROM india_locations)));

-- States (auto-generated IDs)
INSERT INTO india_locations (parent_id, level, name_en, name_hi, name_mai, state_code)
SELECT * FROM (VALUES
  (1::bigint, 'state'::location_level, 'Bihar',             'बिहार',             'बिहार',         'IN-BR'),
  (1, 'state', 'Jharkhand',         'झारखंड',            'झारखंड',        'IN-JH'),
  (1, 'state', 'Uttar Pradesh',     'उत्तर प्रदेश',       'उत्तर प्रदेश',  'IN-UP'),
  (1, 'state', 'West Bengal',       'पश्चिम बंगाल',       NULL,            'IN-WB'),
  (1, 'state', 'Delhi',             'दिल्ली',            NULL,            'IN-DL'),
  (1, 'state', 'Maharashtra',       'महाराष्ट्र',         NULL,            'IN-MH'),
  (1, 'state', 'Karnataka',         'कर्नाटक',           NULL,            'IN-KA'),
  (1, 'state', 'Tamil Nadu',        'तमिलनाडु',          NULL,            'IN-TN'),
  (1, 'state', 'Gujarat',           'गुजरात',            NULL,            'IN-GJ'),
  (1, 'state', 'Rajasthan',         'राजस्थान',          NULL,            'IN-RJ'),
  (1, 'state', 'Madhya Pradesh',    'मध्य प्रदेश',        NULL,            'IN-MP'),
  (1, 'state', 'Andhra Pradesh',    'आंध्र प्रदेश',       NULL,            'IN-AP'),
  (1, 'state', 'Telangana',         'तेलंगाना',          NULL,            'IN-TS'),
  (1, 'state', 'Haryana',           'हरियाणा',           NULL,            'IN-HR'),
  (1, 'state', 'Punjab',            'पंजाब',             NULL,            'IN-PB'),
  (1, 'state', 'Uttarakhand',       'उत्तराखंड',         NULL,            'IN-UK'),
  (1, 'state', 'Himachal Pradesh',  'हिमाचल प्रदेश',     NULL,            'IN-HP'),
  (1, 'state', 'Assam',             'असम',               NULL,            'IN-AS'),
  (1, 'state', 'Odisha',            'ओडिशा',             NULL,            'IN-OR'),
  (1, 'state', 'Chhattisgarh',      'छत्तीसगढ़',         NULL,            'IN-CT'),
  (1, 'state', 'Kerala',            'केरल',              NULL,            'IN-KL'),
  (1, 'state', 'Goa',               'गोवा',              NULL,            'IN-GA')
) AS v(parent_id, level, name_en, name_hi, name_mai, state_code)
WHERE NOT EXISTS (
  SELECT 1 FROM india_locations il WHERE il.state_code = v.state_code AND il.level = 'state'
);

-- Bihar districts (Mithila heartland)
DO $$
DECLARE
  bihar_id bigint;
BEGIN
  SELECT id INTO bihar_id FROM india_locations WHERE state_code = 'IN-BR' AND level = 'state';
  IF bihar_id IS NULL THEN
    RAISE NOTICE 'Bihar state not found, skipping districts';
    RETURN;
  END IF;

  INSERT INTO india_locations (parent_id, level, name_en, name_hi, name_mai, state_code, is_mithila_region)
  SELECT * FROM (VALUES
    (bihar_id, 'district'::location_level, 'Darbhanga',   'दरभंगा',     'दरभंगा',     'IN-BR', true),
    (bihar_id, 'district', 'Madhubani',   'मधुबनी',     'मधुबनी',     'IN-BR', true),
    (bihar_id, 'district', 'Sitamarhi',   'सीतामढ़ी',   'सीतामढ़ी',   'IN-BR', true),
    (bihar_id, 'district', 'Muzaffarpur', 'मुजफ्फरपुर', 'मुजफ्फरपुर', 'IN-BR', true),
    (bihar_id, 'district', 'Samastipur',  'समस्तीपुर',  'समस्तीपुर',  'IN-BR', true),
    (bihar_id, 'district', 'Begusarai',   'बेगूसराय',   'बेगूसराय',   'IN-BR', true),
    (bihar_id, 'district', 'Khagaria',    'खगड़िया',    'खगड़िया',    'IN-BR', true),
    (bihar_id, 'district', 'Supaul',      'सुपौल',      'सुपौल',      'IN-BR', true),
    (bihar_id, 'district', 'Madhepura',   'मधेपुरा',    'मधेपुरा',    'IN-BR', true),
    (bihar_id, 'district', 'Saharsaa',    'सहरसा',      'सहरसा',      'IN-BR', true),
    (bihar_id, 'district', 'Purnea',      'पूर्णिया',   'पूर्णिया',   'IN-BR', false),
    (bihar_id, 'district', 'Patna',       'पटना',       'पटना',       'IN-BR', false),
    (bihar_id, 'district', 'Gaya',        'गया',        'गया',        'IN-BR', false),
    (bihar_id, 'district', 'Bhagalpur',   'भागलपुर',    'भागलपुर',    'IN-BR', false),
    (bihar_id, 'district', 'Nalanda',     'नालंदा',     'नालंदा',     'IN-BR', false)
  ) AS v(parent_id, level, name_en, name_hi, name_mai, state_code, is_mithila_region)
  WHERE NOT EXISTS (
    SELECT 1 FROM india_locations il
    WHERE il.parent_id = v.parent_id AND il.name_en = v.name_en
  );
END $$;
