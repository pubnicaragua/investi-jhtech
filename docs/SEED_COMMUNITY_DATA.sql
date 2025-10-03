-- ============================================================================
-- SCRIPT PARA NUTRIR COMUNIDADES CON DATA DE PRUEBA
-- ============================================================================
-- Ejecutar en Supabase SQL Editor
-- Fecha: 2025-10-02
-- ============================================================================

-- 1. CREAR POSTS DE PRUEBA PARA LA COMUNIDAD
-- ============================================================================
-- Reemplaza 'TU_COMMUNITY_ID' con el ID real de tu comunidad
-- Reemplaza 'TU_USER_ID' con tu ID de usuario

-- Post 1: Análisis de mercado con gráfico
INSERT INTO posts (user_id, community_id, contenido, likes_count, comment_count, image_url, created_at)
VALUES (
  'TU_USER_ID',
  'TU_COMMUNITY_ID',
  'Invertir en la bolsa puede ser una excelente manera de aumentar su patrimonio con el tiempo. Sin embargo, es importante comprender los riesgos y tomar decisiones informadas. Aquí les comparto un análisis del mercado actual.',
  100,
  100,
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  NOW() - INTERVAL '2 hours'
);

-- Post 2: Pregunta sobre inversiones inmobiliarias
INSERT INTO posts (user_id, community_id, contenido, likes_count, comment_count, created_at)
VALUES (
  'TU_USER_ID',
  'TU_COMMUNITY_ID',
  '¿Alguien tiene experiencia con inversiones inmobiliarias en Chile? Estoy considerando comprar mi primera propiedad para rentar y me gustaría conocer sus opiniones.',
  50,
  25,
  NOW() - INTERVAL '5 hours'
);

-- Post 3: Consejo de diversificación
INSERT INTO posts (user_id, community_id, contenido, likes_count, comment_count, image_url, created_at)
VALUES (
  'TU_USER_ID',
  'TU_COMMUNITY_ID',
  'La diversificación es clave en cualquier portafolio de inversión. No pongas todos los huevos en la misma canasta. Aquí un ejemplo de cómo diversificar correctamente.',
  75,
  30,
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
  NOW() - INTERVAL '1 day'
);

-- Post 4: Oportunidad de inversión
INSERT INTO posts (user_id, community_id, contenido, likes_count, comment_count, created_at)
VALUES (
  'TU_USER_ID',
  'TU_COMMUNITY_ID',
  'Acabo de encontrar una oportunidad interesante en el sector tecnológico. Startup chilena buscando inversionistas ángeles. ¿Alguien interesado en conocer más detalles?',
  120,
  45,
  NOW() - INTERVAL '3 hours'
);

-- Post 5: Celebración de logro
INSERT INTO posts (user_id, community_id, contenido, likes_count, comment_count, created_at)
VALUES (
  'TU_USER_ID',
  'TU_COMMUNITY_ID',
  '🎉 ¡Gran noticia! Mi portafolio ha crecido un 15% este trimestre. Gracias a todos por sus consejos y apoyo en esta comunidad.',
  200,
  80,
  NOW() - INTERVAL '6 hours'
);

-- ============================================================================
-- 2. CREAR CANALES DE CHAT PARA LA COMUNIDAD
-- ============================================================================

INSERT INTO community_channels (community_id, name, description, type, created_at)
VALUES 
  ('TU_COMMUNITY_ID', 'General', 'Conversaciones generales sobre inversiones', 'text', NOW()),
  ('TU_COMMUNITY_ID', 'Oportunidades', 'Comparte oportunidades de inversión', 'text', NOW()),
  ('TU_COMMUNITY_ID', 'Análisis', 'Análisis técnico y fundamental', 'text', NOW()),
  ('TU_COMMUNITY_ID', 'Dudas', 'Pregunta lo que necesites saber', 'text', NOW());

-- ============================================================================
-- 3. ACTUALIZAR COMUNIDAD CON IMAGEN DE PORTADA (OPCIONAL)
-- ============================================================================

UPDATE communities
SET cover_image_url = 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1200'
WHERE id = 'TU_COMMUNITY_ID';

-- ============================================================================
-- 4. VERIFICAR QUE ESTÁS UNIDO A LA COMUNIDAD
-- ============================================================================

-- Verificar si ya estás unido
SELECT * FROM user_communities 
WHERE user_id = 'TU_USER_ID' AND community_id = 'TU_COMMUNITY_ID';

-- Si no estás unido, ejecutar:
INSERT INTO user_communities (user_id, community_id, joined_at)
VALUES ('TU_USER_ID', 'TU_COMMUNITY_ID', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. QUERIES ÚTILES PARA DEBUGGING
-- ============================================================================

-- Ver todos los posts de la comunidad
SELECT 
  p.id,
  p.contenido,
  p.likes_count,
  p.comment_count,
  p.created_at,
  u.nombre as autor,
  u.full_name,
  u.role
FROM posts p
LEFT JOIN users u ON p.user_id = u.id
WHERE p.community_id = 'TU_COMMUNITY_ID'
ORDER BY p.created_at DESC;

-- Ver miembros de la comunidad
SELECT 
  u.id,
  u.nombre,
  u.full_name,
  u.username,
  u.role,
  uc.joined_at
FROM user_communities uc
JOIN users u ON uc.user_id = u.id
WHERE uc.community_id = 'TU_COMMUNITY_ID'
ORDER BY uc.joined_at DESC;

-- Ver canales de la comunidad
SELECT * FROM community_channels 
WHERE community_id = 'TU_COMMUNITY_ID'
ORDER BY created_at ASC;

-- ============================================================================
-- 6. OBTENER IDs REALES PARA REEMPLAZAR
-- ============================================================================

-- Obtener tu user ID
SELECT id, nombre, email FROM users WHERE email = 'TU_EMAIL@example.com';

-- Obtener community ID
SELECT id, nombre, descripcion FROM communities WHERE nombre LIKE '%Inmobiliarias%';

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. Reemplaza 'TU_USER_ID' con tu ID real de usuario
-- 2. Reemplaza 'TU_COMMUNITY_ID' con el ID real de la comunidad
-- 3. Reemplaza 'TU_EMAIL@example.com' con tu email real
-- 4. Ejecuta las queries de verificación al final para confirmar que todo funcionó
-- 5. Los posts se crean con diferentes timestamps para simular actividad real
-- ============================================================================
