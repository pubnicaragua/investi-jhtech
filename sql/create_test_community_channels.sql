-- ============================================================================
-- CREAR CANALES DE PRUEBA PARA COMUNIDADES
-- ============================================================================
-- Este script crea canales de chat para las comunidades existentes
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- Primero, obtener los IDs de las comunidades existentes
-- (ajusta estos IDs según tu base de datos)

-- Ejemplo 1: Crear canales para "Inversión en Bienes Raíces"
-- Reemplaza 'community-id-aqui' con el ID real de tu comunidad

INSERT INTO community_channels (id, community_id, name, description, type, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    (SELECT id FROM communities WHERE name ILIKE '%Inversión en Bienes%' LIMIT 1),
    'General',
    'Canal general para discusión de inversiones inmobiliarias',
    'text',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM communities WHERE name ILIKE '%Inversión en Bienes%' LIMIT 1),
    'Oportunidades',
    'Comparte y discute oportunidades de inversión',
    'text',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM communities WHERE name ILIKE '%Inversión en Bienes%' LIMIT 1),
    'Análisis de Mercado',
    'Análisis y tendencias del mercado inmobiliario',
    'text',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM communities WHERE name ILIKE '%Inversión en Bienes%' LIMIT 1),
    'Experiencias',
    'Comparte tus experiencias y aprende de otros',
    'text',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Crear canales para todas las comunidades existentes (genéricos)
INSERT INTO community_channels (id, community_id, name, description, type, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  c.id,
  'General',
  'Canal general de ' || c.name,
  'text',
  NOW(),
  NOW()
FROM communities c
WHERE NOT EXISTS (
  SELECT 1 FROM community_channels cc 
  WHERE cc.community_id = c.id AND cc.name = 'General'
)
ON CONFLICT DO NOTHING;

-- Crear canal de anuncios para todas las comunidades
INSERT INTO community_channels (id, community_id, name, description, type, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  c.id,
  'Anuncios',
  'Canal de anuncios importantes de ' || c.name,
  'text',
  NOW(),
  NOW()
FROM communities c
WHERE NOT EXISTS (
  SELECT 1 FROM community_channels cc 
  WHERE cc.community_id = c.id AND cc.name = 'Anuncios'
)
ON CONFLICT DO NOTHING;

-- Verificar los canales creados
SELECT 
  cc.id,
  cc.name as canal,
  cc.description,
  c.name as comunidad,
  cc.created_at
FROM community_channels cc
JOIN communities c ON cc.community_id = c.id
ORDER BY c.name, cc.name;

-- ============================================================================
-- NOTA: Si necesitas el ID específico de tu comunidad, ejecuta primero:
-- SELECT id, name FROM communities WHERE name ILIKE '%Inversión%';
-- ============================================================================
