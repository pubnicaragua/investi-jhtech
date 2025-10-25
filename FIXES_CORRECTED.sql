-- =====================================================
-- FIXES CORREGIDOS PARA INVESTI
-- =====================================================

-- 1. CREAR USUARIOS PROFESIONALES (sin auth.users, solo public.users)
-- =====================================================
-- Primero crear usuarios en auth.users manualmente desde Supabase Dashboard
-- Luego ejecutar esto para crear los perfiles:

INSERT INTO public.users (id, email, username, full_name, nombre, role, onboarding_step)
SELECT 
  id,
  email,
  'sebastian' || ROW_NUMBER() OVER (ORDER BY email),
  'Sebastian ' || ROW_NUMBER() OVER (ORDER BY email),
  'Sebastian ' || ROW_NUMBER() OVER (ORDER BY email),
  'Analista Financiero',
  'completed'
FROM auth.users
WHERE email LIKE 'sebastian%@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM public.users WHERE public.users.id = auth.users.id)
ON CONFLICT (id) DO UPDATE SET onboarding_step = 'completed';

-- 2. CREAR CONEXIONES PARA EL USUARIO c7812eb1-c3b1-429f-aabe-ba8da052201f
-- =====================================================
INSERT INTO public.user_follows (follower_id, following_id, source)
SELECT 
  'c7812eb1-c3b1-429f-aabe-ba8da052201f'::uuid,
  id,
  'manual'
FROM public.users
WHERE email LIKE 'sebastian%@gmail.com'
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- También hacer que ellos sigan al usuario
INSERT INTO public.user_follows (follower_id, following_id, source)
SELECT 
  id,
  'c7812eb1-c3b1-429f-aabe-ba8da052201f'::uuid,
  'manual'
FROM public.users
WHERE email LIKE 'sebastian%@gmail.com'
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- 3. CREAR NOTIFICACIONES DE EJEMPLO (sin columna title)
-- =====================================================
INSERT INTO public.notifications (user_id, type, message, from_user_id, read)
SELECT 
  'c7812eb1-c3b1-429f-aabe-ba8da052201f'::uuid,
  'follow',
  full_name || ' ha comenzado a seguirte',
  id,
  false
FROM public.users
WHERE email LIKE 'sebastian%@gmail.com'
LIMIT 5;

-- 4. ELIMINAR FUNCIÓN EXISTENTE Y RECREAR
-- =====================================================
DROP FUNCTION IF EXISTS search_all(text, uuid);

CREATE OR REPLACE FUNCTION search_all(search_query text, user_id_param uuid DEFAULT NULL)
RETURNS TABLE (
  result_type text,
  result_id uuid,
  title text,
  description text,
  image_url text,
  relevance float
) AS $$
BEGIN
  RETURN QUERY
  -- Buscar posts
  SELECT 
    'post'::text,
    p.id,
    COALESCE(u.full_name, u.nombre, 'Usuario') as title,
    LEFT(COALESCE(p.content, p.contenido, ''), 200) as description,
    u.avatar_url as image_url,
    ts_rank(to_tsvector('spanish', COALESCE(p.content, p.contenido, '')), plainto_tsquery('spanish', search_query)) as relevance
  FROM posts p
  JOIN users u ON p.user_id = u.id
  WHERE to_tsvector('spanish', COALESCE(p.content, p.contenido, '')) @@ plainto_tsquery('spanish', search_query)
  
  UNION ALL
  
  -- Buscar usuarios
  SELECT 
    'user'::text,
    u.id,
    COALESCE(u.full_name, u.nombre, u.username) as title,
    COALESCE(u.role, 'Usuario') as description,
    u.avatar_url as image_url,
    ts_rank(to_tsvector('spanish', COALESCE(u.full_name, '') || ' ' || COALESCE(u.nombre, '') || ' ' || COALESCE(u.username, '')), plainto_tsquery('spanish', search_query)) as relevance
  FROM users u
  WHERE to_tsvector('spanish', COALESCE(u.full_name, '') || ' ' || COALESCE(u.nombre, '') || ' ' || COALESCE(u.username, '')) @@ plainto_tsquery('spanish', search_query)
  
  UNION ALL
  
  -- Buscar comunidades
  SELECT 
    'community'::text,
    c.id,
    c.name as title,
    COALESCE(c.descripcion, '') as description,
    COALESCE(c.image_url, c.icono_url) as image_url,
    ts_rank(to_tsvector('spanish', c.name || ' ' || COALESCE(c.descripcion, '')), plainto_tsquery('spanish', search_query)) as relevance
  FROM communities c
  WHERE to_tsvector('spanish', c.name || ' ' || COALESCE(c.descripcion, '')) @@ plainto_tsquery('spanish', search_query)
  
  ORDER BY relevance DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- 5. CREAR POSTS PARA USUARIO db96e748-9bfa-4d79-bfcc-a5a92f5daf98 EN TODAS LAS COMUNIDADES
-- =====================================================

-- Primero, unir al usuario a todas las comunidades
INSERT INTO public.community_members (community_id, user_id, role, status)
SELECT 
  c.id,
  'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'::uuid,
  'member',
  'active'
FROM communities c
WHERE NOT EXISTS (
  SELECT 1 FROM community_members cm 
  WHERE cm.community_id = c.id 
  AND cm.user_id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'
);

-- Crear posts en cada comunidad
INSERT INTO public.posts (user_id, community_id, content, contenido, likes_count, comment_count, shares_count)
SELECT 
  'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'::uuid,
  c.id,
  '¡Hola a todos! 👋 Estoy muy emocionado de unirme a esta comunidad de ' || c.name || '. Espero aprender mucho y compartir experiencias con todos ustedes. ¿Alguien tiene consejos para un nuevo miembro? 🚀',
  '¡Hola a todos! 👋 Estoy muy emocionado de unirme a esta comunidad de ' || c.name || '. Espero aprender mucho y compartir experiencias con todos ustedes. ¿Alguien tiene consejos para un nuevo miembro? 🚀',
  0,
  0,
  0
FROM communities c;

-- Crear posts adicionales variados
INSERT INTO public.posts (user_id, community_id, content, contenido, likes_count, comment_count, shares_count)
SELECT 
  'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'::uuid,
  c.id,
  CASE (ROW_NUMBER() OVER (ORDER BY c.created_at)) % 5
    WHEN 0 THEN '📊 ¿Alguien tiene experiencia con inversiones en ' || c.name || '? Me gustaría conocer sus estrategias.'
    WHEN 1 THEN '💡 Acabo de leer un artículo interesante sobre ' || c.name || '. ¿Les gustaría que lo comparta?'
    WHEN 2 THEN '🎯 Mi objetivo este mes es aprender más sobre ' || c.name || '. ¿Qué recursos recomiendan?'
    WHEN 3 THEN '🤝 Busco conectar con personas interesadas en ' || c.name || '. ¡Conectemos!'
    ELSE '✨ Excelente comunidad! Gracias por crear este espacio para hablar de ' || c.name
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY c.created_at)) % 5
    WHEN 0 THEN '📊 ¿Alguien tiene experiencia con inversiones en ' || c.name || '? Me gustaría conocer sus estrategias.'
    WHEN 1 THEN '💡 Acabo de leer un artículo interesante sobre ' || c.name || '. ¿Les gustaría que lo comparta?'
    WHEN 2 THEN '🎯 Mi objetivo este mes es aprender más sobre ' || c.name || '. ¿Qué recursos recomiendan?'
    WHEN 3 THEN '🤝 Busco conectar con personas interesadas en ' || c.name || '. ¡Conectemos!'
    ELSE '✨ Excelente comunidad! Gracias por crear este espacio para hablar de ' || c.name
  END,
  FLOOR(RANDOM() * 10)::int,
  FLOOR(RANDOM() * 5)::int,
  FLOOR(RANDOM() * 3)::int
FROM communities c;

-- 6. VERIFICAR ONBOARDING - Asegurar que el usuario tenga onboarding_step = 'completed'
-- =====================================================
UPDATE public.users
SET onboarding_step = 'completed'
WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- 7. MEJORAR RECOMENDACIONES DE COMUNIDADES
-- =====================================================
-- Esta función recomienda comunidades basadas en intereses y nivel de conocimiento
CREATE OR REPLACE FUNCTION get_recommended_communities(user_id_param uuid, limit_param int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  name text,
  descripcion text,
  image_url text,
  icono_url text,
  member_count int,
  is_member boolean,
  relevance_score float
) AS $$
BEGIN
  RETURN QUERY
  WITH user_data AS (
    SELECT 
      COALESCE(array_agg(DISTINCT ui.interest_id), ARRAY[]::uuid[]) as interests,
      COALESCE((SELECT level FROM user_knowledge WHERE user_id = user_id_param LIMIT 1), 'beginner') as knowledge_level
    FROM user_interests ui
    WHERE ui.user_id = user_id_param
  ),
  community_scores AS (
    SELECT 
      c.id,
      c.name,
      c.descripcion,
      c.image_url,
      c.icono_url,
      c.member_count,
      EXISTS(SELECT 1 FROM community_members WHERE community_id = c.id AND user_id = user_id_param) as is_member,
      -- Calcular relevancia basada en múltiples factores
      (
        -- Factor 1: Coincidencia de intereses (40%)
        CASE 
          WHEN EXISTS(
            SELECT 1 FROM user_data ud
            WHERE ud.interests && ARRAY(
              SELECT interest_id FROM community_interests WHERE community_id = c.id
            )
          ) THEN 0.4
          ELSE 0.0
        END +
        -- Factor 2: Nivel de conocimiento apropiado (30%)
        CASE 
          WHEN (SELECT knowledge_level FROM user_data) = 'beginner' AND c.member_count < 100 THEN 0.3
          WHEN (SELECT knowledge_level FROM user_data) = 'intermediate' AND c.member_count BETWEEN 50 AND 500 THEN 0.3
          WHEN (SELECT knowledge_level FROM user_data) = 'expert' AND c.member_count > 100 THEN 0.3
          ELSE 0.1
        END +
        -- Factor 3: Actividad reciente (20%)
        CASE 
          WHEN EXISTS(
            SELECT 1 FROM posts p 
            WHERE p.community_id = c.id 
            AND p.created_at > NOW() - INTERVAL '7 days'
          ) THEN 0.2
          ELSE 0.0
        END +
        -- Factor 4: Popularidad moderada (10%)
        CASE 
          WHEN c.member_count BETWEEN 10 AND 1000 THEN 0.1
          ELSE 0.05
        END
      ) as relevance_score
    FROM communities c
    WHERE NOT EXISTS(SELECT 1 FROM community_members WHERE community_id = c.id AND user_id = user_id_param)
  )
  SELECT 
    cs.id,
    cs.name,
    cs.descripcion,
    cs.image_url,
    cs.icono_url,
    cs.member_count,
    cs.is_member,
    cs.relevance_score
  FROM community_scores cs
  ORDER BY cs.relevance_score DESC, RANDOM()
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- 8. MEJORAR RECOMENDACIONES DE PERSONAS
-- =====================================================
CREATE OR REPLACE FUNCTION get_recommended_people(user_id_param uuid, limit_param int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  full_name text,
  nombre text,
  username text,
  avatar_url text,
  role text,
  is_following boolean,
  mutual_connections int,
  relevance_score float
) AS $$
BEGIN
  RETURN QUERY
  WITH user_data AS (
    SELECT 
      COALESCE(array_agg(DISTINCT ui.interest_id), ARRAY[]::uuid[]) as interests,
      COALESCE(array_agg(DISTINCT uf.following_id), ARRAY[]::uuid[]) as following
    FROM user_interests ui
    LEFT JOIN user_follows uf ON uf.follower_id = user_id_param
    WHERE ui.user_id = user_id_param
  ),
  candidate_scores AS (
    SELECT 
      u.id,
      u.full_name,
      u.nombre,
      u.username,
      u.avatar_url,
      u.role,
      EXISTS(SELECT 1 FROM user_follows WHERE follower_id = user_id_param AND following_id = u.id) as is_following,
      -- Contar conexiones mutuas
      (
        SELECT COUNT(*)::int
        FROM user_follows uf1
        WHERE uf1.follower_id = u.id
        AND uf1.following_id IN (SELECT following_id FROM user_follows WHERE follower_id = user_id_param)
      ) as mutual_connections,
      -- Calcular relevancia
      (
        -- Factor 1: Intereses compartidos (40%)
        CASE 
          WHEN EXISTS(
            SELECT 1 FROM user_data ud
            WHERE ud.interests && ARRAY(
              SELECT interest_id FROM user_interests WHERE user_id = u.id
            )
          ) THEN 0.4
          ELSE 0.0
        END +
        -- Factor 2: Conexiones mutuas (30%)
        LEAST(
          (SELECT COUNT(*) FROM user_follows uf1
           WHERE uf1.follower_id = u.id
           AND uf1.following_id IN (SELECT following_id FROM user_follows WHERE follower_id = user_id_param))::float * 0.1,
          0.3
        ) +
        -- Factor 3: Actividad reciente (20%)
        CASE 
          WHEN EXISTS(
            SELECT 1 FROM posts p 
            WHERE p.user_id = u.id 
            AND p.created_at > NOW() - INTERVAL '7 days'
          ) THEN 0.2
          ELSE 0.0
        END +
        -- Factor 4: Mismo rol o industria (10%)
        CASE 
          WHEN u.role = (SELECT role FROM users WHERE id = user_id_param) THEN 0.1
          ELSE 0.05
        END
      ) as relevance_score
    FROM users u
    WHERE u.id != user_id_param
    AND NOT EXISTS(SELECT 1 FROM user_follows WHERE follower_id = user_id_param AND following_id = u.id)
    AND u.onboarding_step = 'completed'
  )
  SELECT 
    cs.id,
    cs.full_name,
    cs.nombre,
    cs.username,
    cs.avatar_url,
    cs.role,
    cs.is_following,
    cs.mutual_connections,
    cs.relevance_score
  FROM candidate_scores cs
  ORDER BY cs.relevance_score DESC, RANDOM()
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- 9. VERIFICACIÓN FINAL
-- =====================================================
SELECT 
  'Posts creados para Sebastian 22' as metric,
  COUNT(*)::text as value
FROM posts
WHERE user_id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'
UNION ALL
SELECT 
  'Comunidades donde es miembro',
  COUNT(*)::text
FROM community_members
WHERE user_id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'
UNION ALL
SELECT 
  'Conexiones del usuario test',
  COUNT(*)::text
FROM user_follows
WHERE follower_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';
