-- ========================================
-- VALIDACIÓN DE DATA PARA PROMOTIONS SCREEN
-- ========================================

-- 1. PROMOCIONES (getPromotions)
-- Endpoint: GET /api/promotions?user_id&search
-- Tabla esperada: promotions
SELECT 
  '1. PROMOCIONES' as seccion,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as con_imagen,
  COUNT(CASE WHEN valid_until IS NOT NULL THEN 1 END) as con_fecha_valida
FROM promotions
WHERE active = true;

-- Ver primeras 3 promociones
SELECT 
  id,
  title,
  discount,
  image_url,
  valid_until,
  location,
  created_at
FROM promotions
WHERE active = true
ORDER BY created_at DESC
LIMIT 3;

-- ========================================

-- 2. PERSONAS SUGERIDAS (getSuggestedPeople)
-- Endpoint: GET /api/users/:userId/suggested-people
-- Tabla esperada: users
SELECT 
  '2. PERSONAS SUGERIDAS' as seccion,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as con_avatar,
  COUNT(CASE WHEN rol IS NOT NULL THEN 1 END) as con_rol
FROM users
WHERE id != '00000000-0000-0000-0000-000000000000'; -- Excluir usuario actual (placeholder)

-- Ver primeras 3 personas con sus intereses
SELECT 
  u.id,
  u.nombre_completo as name,
  u.avatar_url,
  u.rol as role,
  COALESCE(
    (SELECT json_agg(i.nombre) 
     FROM user_interests ui 
     JOIN interests i ON ui.interest_id = i.id 
     WHERE ui.user_id = u.id 
     LIMIT 3),
    '[]'::json
  ) as interests
FROM users u
WHERE u.id != '00000000-0000-0000-0000-000000000000'
ORDER BY u.created_at DESC
LIMIT 3;

-- ========================================

-- 3. COMUNIDADES SUGERIDAS (getSuggestedCommunities)
-- Endpoint: GET /api/users/:userId/suggested-communities
-- Tabla esperada: communities
SELECT 
  '3. COMUNIDADES SUGERIDAS' as seccion,
  COUNT(*) as total_comunidades,
  COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as con_imagen,
  COUNT(CASE WHEN tipo IS NOT NULL THEN 1 END) as con_tipo
FROM communities
WHERE active = true;

-- Ver primeras 3 comunidades con conteo de miembros
SELECT 
  c.id,
  c.nombre as name,
  c.image_url,
  c.tipo as type,
  COALESCE(
    (SELECT COUNT(*) 
     FROM community_members cm 
     WHERE cm.community_id = c.id),
    0
  ) as members_count
FROM communities c
WHERE c.active = true
ORDER BY c.created_at DESC
LIMIT 3;

-- ========================================

-- 4. PUBLICACIONES RECIENTES (getRecentPosts)
-- Endpoint: GET /api/posts/recent?filter
-- Tabla esperada: posts
SELECT 
  '4. PUBLICACIONES RECIENTES' as seccion,
  COUNT(*) as total_posts,
  COUNT(CASE WHEN media_url IS NOT NULL THEN 1 END) as con_imagen,
  COUNT(CASE WHEN likes_count > 0 THEN 1 END) as con_likes
FROM posts;

-- Ver primeras 3 publicaciones con autor y métricas
SELECT 
  p.id,
  p.contenido as content,
  p.media_url as image,
  COALESCE(p.likes_count, 0) as likes,
  COALESCE(p.comments_count, 0) as comments,
  COALESCE(p.shares_count, 0) as shares,
  json_build_object(
    'id', u.id,
    'name', u.nombre_completo,
    'avatar', u.avatar_url,
    'role', u.rol
  ) as author,
  p.created_at
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 3;

-- ========================================
-- RESUMEN GENERAL
-- ========================================

SELECT 
  'RESUMEN GENERAL' as titulo,
  (SELECT COUNT(*) FROM promotions WHERE active = true) as promociones,
  (SELECT COUNT(*) FROM users) as usuarios,
  (SELECT COUNT(*) FROM communities WHERE active = true) as comunidades,
  (SELECT COUNT(*) FROM posts) as publicaciones;

-- ========================================
-- VALIDACIÓN DE ESTRUCTURA DE TABLAS
-- ========================================

-- Verificar que existan las tablas necesarias
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('promotions', 'users', 'communities', 'posts', 
                        'user_interests', 'interests', 'community_members') 
    THEN '✅ Existe'
    ELSE '❌ Falta'
  END as estado
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('promotions', 'users', 'communities', 'posts', 
                     'user_interests', 'interests', 'community_members')
ORDER BY table_name;

-- ========================================
-- DATOS DE PRUEBA MÍNIMOS NECESARIOS
-- ========================================

-- Si alguna tabla está vacía, aquí hay inserts de ejemplo:

-- EJEMPLO: Insertar promoción de prueba (si no hay data)
-- INSERT INTO promotions (id, title, discount, image_url, valid_until, location, active)
-- VALUES (
--   gen_random_uuid(),
--   'Software para Nicaragua',
--   'Hasta 50% de descuento',
--   'https://via.placeholder.com/280x140',
--   NOW() + INTERVAL '30 days',
--   'Nicaragua',
--   true
-- );

-- EJEMPLO: Insertar comunidad de prueba (si no hay data)
-- INSERT INTO communities (id, nombre, image_url, tipo, active)
-- VALUES (
--   gen_random_uuid(),
--   'Inversiones para principiantes',
--   'https://via.placeholder.com/100x64',
--   'Comunidad pública',
--   true
-- );
