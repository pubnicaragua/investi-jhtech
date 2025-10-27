-- ============================================================================
-- Script para limpiar comunidades y datos NO relacionados con finanzas
-- ============================================================================
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- IMPORTANTE: Eliminar registros relacionados PRIMERO para evitar errores de foreign key

-- 0. Eliminar canales de comunidades que vamos a borrar
DELETE FROM community_channels
WHERE community_id IN (
  SELECT id FROM communities
  WHERE 
    nombre ILIKE '%demo%'
    OR nombre ILIKE '%prueba%'
    OR nombre ILIKE '%test%'
    OR descripcion ILIKE '%demo%'
    OR nombre = 'Nueva comunidad'
    OR nombre = 'Futuros'
    OR nombre = 'IA y Finanzas'
    OR nombre = 'Fondos Indexados'
    OR nombre = 'Economía Global'
    OR tags && ARRAY['Deportes', 'Arte', 'Música', 'Salud', 'Viajes', 'Ciencia']::text[]
    OR nombre ILIKE '%deporte%'
    OR nombre ILIKE '%arte%'
    OR nombre ILIKE '%música%'
    OR nombre ILIKE '%musica%'
    OR nombre ILIKE '%salud%'
    OR nombre ILIKE '%viaje%'
    OR nombre ILIKE '%ciencia%'
    OR descripcion ILIKE '%deporte%'
    OR descripcion ILIKE '%arte%'
    OR descripcion ILIKE '%música%'
    OR descripcion ILIKE '%musica%'
    OR descripcion ILIKE '%salud%'
    OR descripcion ILIKE '%viaje%'
    OR descripcion ILIKE '%ciencia%'
);

-- 0b. Eliminar miembros de comunidades que vamos a borrar
DELETE FROM community_members
WHERE community_id IN (
  SELECT id FROM communities
  WHERE 
    nombre ILIKE '%demo%'
    OR nombre ILIKE '%prueba%'
    OR nombre ILIKE '%test%'
    OR descripcion ILIKE '%demo%'
    OR nombre = 'Nueva comunidad'
    OR nombre = 'Futuros'
    OR nombre = 'IA y Finanzas'
    OR nombre = 'Fondos Indexados'
    OR nombre = 'Economía Global'
    OR tags && ARRAY['Deportes', 'Arte', 'Música', 'Salud', 'Viajes', 'Ciencia']::text[]
);

-- 0c. Eliminar posts de comunidades que vamos a borrar
DELETE FROM posts
WHERE community_id IN (
  SELECT id FROM communities
  WHERE 
    nombre ILIKE '%demo%'
    OR nombre ILIKE '%prueba%'
    OR nombre ILIKE '%test%'
    OR descripcion ILIKE '%demo%'
    OR nombre = 'Nueva comunidad'
    OR nombre = 'Futuros'
    OR nombre = 'IA y Finanzas'
    OR nombre = 'Fondos Indexados'
    OR nombre = 'Economía Global'
    OR tags && ARRAY['Deportes', 'Arte', 'Música', 'Salud', 'Viajes', 'Ciencia']::text[]
);

-- 1. Eliminar comunidades de DEMO y pruebas
DELETE FROM communities
WHERE 
  nombre ILIKE '%demo%'
  OR nombre ILIKE '%prueba%'
  OR nombre ILIKE '%test%'
  OR descripcion ILIKE '%demo%'
  OR nombre = 'Nueva comunidad'
  OR nombre = 'Futuros'
  OR nombre = 'IA y Finanzas'
  OR nombre = 'Fondos Indexados'
  OR nombre = 'Economía Global';

-- 2. Eliminar comunidades con tags irrelevantes (Deportes, Arte, Música, etc.)
DELETE FROM communities
WHERE 
  tags && ARRAY['Deportes', 'Arte', 'Música', 'Salud', 'Viajes', 'Ciencia']::text[]
  OR nombre ILIKE '%deporte%'
  OR nombre ILIKE '%arte%'
  OR nombre ILIKE '%música%'
  OR nombre ILIKE '%musica%'
  OR nombre ILIKE '%salud%'
  OR nombre ILIKE '%viaje%'
  OR nombre ILIKE '%ciencia%'
  OR descripcion ILIKE '%deporte%'
  OR descripcion ILIKE '%arte%'
  OR descripcion ILIKE '%música%'
  OR descripcion ILIKE '%musica%'
  OR descripcion ILIKE '%salud%'
  OR descripcion ILIKE '%viaje%'
  OR descripcion ILIKE '%ciencia%';

-- 3. Eliminar comunidades duplicadas (mantener la más antigua)
DELETE FROM communities a
USING communities b
WHERE a.id > b.id
  AND a.nombre = b.nombre
  AND a.descripcion = b.descripcion;

-- 2. Actualizar tags de comunidades existentes para remover tags irrelevantes
UPDATE communities
SET tags = ARRAY(
  SELECT unnest(tags)
  EXCEPT
  SELECT unnest(ARRAY['Deportes', 'Arte', 'Música', 'Salud', 'Viajes', 'Ciencia', 'Tecnología']::text[])
)
WHERE tags && ARRAY['Deportes', 'Arte', 'Música', 'Salud', 'Viajes', 'Ciencia', 'Tecnología']::text[];

-- 3. Verificar comunidades restantes
SELECT id, nombre, tags, descripcion
FROM communities
ORDER BY created_at DESC
LIMIT 20;

-- 4. Contar comunidades por tag (para validar)
SELECT unnest(tags) as tag, COUNT(*) as count
FROM communities
GROUP BY tag
ORDER BY count DESC;

-- ============================================================================
-- NOTA: Ejecuta este script en el SQL Editor de Supabase
-- Revisa los resultados antes de hacer cambios permanentes
-- ============================================================================
