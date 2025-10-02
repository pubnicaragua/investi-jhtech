-- ========================================
-- POBLAR DATA FALTANTE PARA PROMOTIONS SCREEN
-- ========================================

-- 1. Actualizar más usuarios con avatares (para tener variedad)
UPDATE users 
SET avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=72&h=72&fit=crop&crop=face'
WHERE avatar_url IS NULL AND nombre = 'adonas';

UPDATE users 
SET avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=72&h=72&fit=crop&crop=face'
WHERE avatar_url IS NULL AND nombre = 'abede';

UPDATE users 
SET avatar_url = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=72&h=72&fit=crop&crop=face'
WHERE avatar_url IS NULL AND nombre = 'ABC2';

-- 2. Agregar más comunidades con imágenes
UPDATE communities 
SET image_url = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&h=64&fit=crop'
WHERE image_url IS NULL 
LIMIT 3;

-- 3. Actualizar member_count en comunidades (simular miembros)
UPDATE communities 
SET member_count = 12000 + (random() * 8000)::int
WHERE nombre LIKE '%Inversiones%';

UPDATE communities 
SET member_count = 2000 + (random() * 3000)::int
WHERE nombre LIKE '%Criptomonedas%';

UPDATE communities 
SET member_count = 5000 + (random() * 5000)::int
WHERE nombre LIKE '%Finanzas%';

-- 4. Agregar algunas imágenes a posts (para variedad visual)
UPDATE posts 
SET media_url = ARRAY['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop']
WHERE media_url = '[]'::jsonb 
  AND contenido LIKE '%bolsa%'
LIMIT 5;

UPDATE posts 
SET media_url = ARRAY['https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop']
WHERE media_url = '[]'::jsonb 
  AND contenido LIKE '%criptomonedas%'
LIMIT 5;

-- 5. Actualizar valid_until de promociones para que sean futuras
UPDATE promotions 
SET valid_until = CURRENT_DATE + INTERVAL '30 days'
WHERE valid_until < CURRENT_DATE;

-- ========================================
-- VALIDACIÓN FINAL
-- ========================================

-- Verificar que todo esté poblado correctamente
SELECT 
  'VALIDACIÓN FINAL' as titulo,
  (SELECT COUNT(*) FROM promotions WHERE active = true AND image_url IS NOT NULL) as promociones_con_imagen,
  (SELECT COUNT(*) FROM users WHERE avatar_url IS NOT NULL) as usuarios_con_avatar,
  (SELECT COUNT(*) FROM communities WHERE image_url IS NOT NULL) as comunidades_con_imagen,
  (SELECT COUNT(*) FROM posts WHERE array_length(media_url, 1) > 0) as posts_con_imagen;

-- Ver muestra de data completa
SELECT 
  'Promociones' as tipo,
  COUNT(*) as total,
  COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as con_imagen
FROM promotions WHERE active = true
UNION ALL
SELECT 
  'Usuarios' as tipo,
  COUNT(*) as total,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as con_avatar
FROM users
UNION ALL
SELECT 
  'Comunidades' as tipo,
  COUNT(*) as total,
  COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as con_imagen
FROM communities
UNION ALL
SELECT 
  'Posts' as tipo,
  COUNT(*) as total,
  COUNT(CASE WHEN array_length(media_url, 1) > 0 THEN 1 END) as con_imagen
FROM posts;
