-- =====================================================
-- SQL MASTER - TODAS LAS CORRECCIONES Y VERIFICACIONES
-- =====================================================

-- 1. ÍNDICES PARA BÚSQUEDA RÁPIDA (PromotionsScreen)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_search 
ON users USING gin(to_tsvector('spanish', 
  coalesce(full_name, '') || ' ' || 
  coalesce(nombre, '') || ' ' || 
  coalesce(username, '') || ' ' || 
  coalesce(bio, '')
));

CREATE INDEX IF NOT EXISTS idx_posts_search 
ON posts USING gin(to_tsvector('spanish', 
  coalesce(contenido, '') || ' ' || 
  coalesce(content, '')
));

CREATE INDEX IF NOT EXISTS idx_communities_search 
ON communities USING gin(to_tsvector('spanish', 
  coalesce(name, '') || ' ' || 
  coalesce(nombre, '') || ' ' || 
  coalesce(description, '')
));

-- 2. FUNCIÓN: COMUNIDADES RECOMENDADAS MEJORADA
-- =====================================================
CREATE OR REPLACE FUNCTION get_recommended_communities(
  user_id_param UUID, 
  limit_param INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  nombre TEXT,
  description TEXT,
  members_count BIGINT,
  relevance_score FLOAT,
  tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH user_interests AS (
    SELECT unnest(interests) as interest
    FROM users
    WHERE id = user_id_param
  ),
  user_communities AS (
    SELECT community_id
    FROM community_members
    WHERE user_id = user_id_param
  ),
  user_level AS (
    SELECT knowledge_level
    FROM users
    WHERE id = user_id_param
  )
  SELECT 
    c.id,
    c.name,
    c.nombre,
    c.description,
    COUNT(DISTINCT cm.user_id) as members_count,
    (
      -- Score basado en intereses coincidentes
      (SELECT COUNT(*)::FLOAT FROM user_interests ui WHERE ui.interest = ANY(c.tags)) * 2.0 +
      -- Score basado en nivel de conocimiento
      CASE 
        WHEN c.difficulty_level = (SELECT knowledge_level FROM user_level) THEN 1.5
        ELSE 0.5
      END +
      -- Penalizar comunidades muy grandes o muy pequeñas
      CASE 
        WHEN COUNT(DISTINCT cm.user_id) BETWEEN 10 AND 100 THEN 1.0
        ELSE 0.3
      END
    ) / GREATEST(array_length(c.tags, 1), 1)::FLOAT as relevance_score,
    c.tags
  FROM communities c
  LEFT JOIN community_members cm ON cm.community_id = c.id
  WHERE c.id NOT IN (SELECT community_id FROM user_communities)
  AND c.tipo = 'public'
  GROUP BY c.id
  HAVING (
    SELECT COUNT(*)
    FROM user_interests ui
    WHERE ui.interest = ANY(c.tags)
  ) > 0
  ORDER BY relevance_score DESC, members_count DESC, RANDOM()
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- 3. FUNCIÓN: USUARIOS RECOMENDADOS MEJORADA
-- =====================================================
CREATE OR REPLACE FUNCTION get_recommended_users(
  user_id_param UUID,
  limit_param INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  nombre TEXT,
  username TEXT,
  avatar_url TEXT,
  photo_url TEXT,
  bio TEXT,
  common_interests INT,
  mutual_friends INT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_interests AS (
    SELECT unnest(interests) as interest
    FROM users
    WHERE id = user_id_param
  ),
  user_follows AS (
    SELECT following_id
    FROM user_follows
    WHERE follower_id = user_id_param
  ),
  user_communities AS (
    SELECT community_id
    FROM community_members
    WHERE user_id = user_id_param
  )
  SELECT 
    u.id,
    u.full_name,
    u.nombre,
    u.username,
    u.avatar_url,
    u.photo_url,
    u.bio,
    (
      SELECT COUNT(*)::INT
      FROM user_interests ui
      WHERE ui.interest = ANY(u.interests)
    ) as common_interests,
    (
      SELECT COUNT(*)::INT
      FROM user_follows uf
      WHERE uf.follower_id IN (SELECT following_id FROM user_follows WHERE follower_id = user_id_param)
      AND uf.following_id = u.id
    ) as mutual_friends
  FROM users u
  WHERE u.id != user_id_param
  AND u.id NOT IN (SELECT following_id FROM user_follows)
  AND (
    -- Usuarios con intereses comunes
    EXISTS (
      SELECT 1 FROM user_interests ui WHERE ui.interest = ANY(u.interests)
    )
    OR
    -- Usuarios en las mismas comunidades
    EXISTS (
      SELECT 1 FROM community_members cm 
      WHERE cm.user_id = u.id 
      AND cm.community_id IN (SELECT community_id FROM user_communities)
    )
  )
  ORDER BY common_interests DESC, mutual_friends DESC, RANDOM()
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- 4. VERIFICACIÓN: EditProfile
-- =====================================================
SELECT 
  id,
  full_name,
  nombre,
  username,
  email,
  bio,
  avatar_url,
  photo_url,
  pais,
  interests,
  knowledge_level
FROM users
WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- 5. VERIFICACIÓN: CommunityMembers
-- =====================================================
SELECT 
  cm.user_id,
  COALESCE(u.full_name, u.nombre, u.username, 'Usuario') as display_name,
  u.username,
  u.avatar_url,
  u.photo_url,
  cm.role,
  cm.joined_at
FROM community_members cm
JOIN users u ON u.id = cm.user_id
WHERE cm.community_id = (
  SELECT id FROM communities LIMIT 1
)
ORDER BY cm.joined_at DESC;

-- 6. VERIFICACIÓN: Followers
-- =====================================================
SELECT 
  uf.follower_id,
  COALESCE(u.full_name, u.nombre, u.username, 'Usuario') as display_name,
  u.username,
  u.avatar_url,
  u.photo_url,
  u.bio
FROM user_follows uf
JOIN users u ON u.id = uf.follower_id
WHERE uf.following_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY uf.created_at DESC;

-- 7. VERIFICACIÓN: Posts en Perfil
-- =====================================================
SELECT 
  p.id,
  p.user_id,
  p.contenido,
  p.content,
  p.image_url,
  p.media_url,
  p.likes_count,
  p.comment_count,
  p.shares_count,
  p.created_at,
  u.full_name,
  u.nombre,
  u.username
FROM posts p
JOIN users u ON u.id = p.user_id
WHERE p.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY p.created_at DESC
LIMIT 20;

-- 8. TRIGGER: Actualizar posts_count en users
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users 
    SET posts_count = COALESCE(posts_count, 0) + 1
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users 
    SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0)
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_posts_count ON posts;
CREATE TRIGGER trigger_update_posts_count
AFTER INSERT OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_user_posts_count();

-- 9. AGREGAR COLUMNA posts_count SI NO EXISTE
-- =====================================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS posts_count INT DEFAULT 0;

-- Actualizar conteo existente
UPDATE users u
SET posts_count = (
  SELECT COUNT(*) FROM posts WHERE user_id = u.id
);

-- 10. AGREGAR COLUMNA difficulty_level EN COMMUNITIES
-- =====================================================
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'intermediate';

-- 11. CATEGORÍAS PARA NOTICIAS
-- =====================================================
ALTER TABLE news
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Actualizar categorías existentes basadas en contenido
UPDATE news SET category = 'regulaciones' WHERE LOWER(title) LIKE '%regulaci%' OR LOWER(content) LIKE '%regulaci%';
UPDATE news SET category = 'criptomonedas' WHERE LOWER(title) LIKE '%cripto%' OR LOWER(title) LIKE '%bitcoin%' OR LOWER(title) LIKE '%ethereum%';
UPDATE news SET category = 'tecnología' WHERE LOWER(title) LIKE '%tecnolog%' OR LOWER(title) LIKE '%tech%' OR LOWER(title) LIKE '%ia%';
UPDATE news SET category = 'inversiones' WHERE LOWER(title) LIKE '%inversi%' OR LOWER(title) LIKE '%bolsa%' OR LOWER(title) LIKE '%mercado%';
UPDATE news SET category = 'startups' WHERE LOWER(title) LIKE '%startup%' OR LOWER(title) LIKE '%emprendimiento%';

-- 12. CATEGORÍAS PARA CURSOS
-- =====================================================
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

UPDATE courses SET category = 'inversiones' WHERE LOWER(title) LIKE '%inversi%' OR LOWER(title) LIKE '%bolsa%';
UPDATE courses SET category = 'criptomonedas' WHERE LOWER(title) LIKE '%cripto%' OR LOWER(title) LIKE '%bitcoin%';
UPDATE courses SET category = 'finanzas' WHERE LOWER(title) LIKE '%finanz%' OR LOWER(title) LIKE '%ahorro%';

-- 13. CATEGORÍAS PARA VIDEOS
-- =====================================================
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

UPDATE videos SET category = 'tutoriales' WHERE LOWER(title) LIKE '%tutorial%' OR LOWER(title) LIKE '%cómo%';
UPDATE videos SET category = 'análisis' WHERE LOWER(title) LIKE '%análisis%' OR LOWER(title) LIKE '%review%';
UPDATE videos SET category = 'entrevistas' WHERE LOWER(title) LIKE '%entrevista%' OR LOWER(title) LIKE '%interview%';

-- 14. ÍNDICES ADICIONALES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);

-- 15. VERIFICACIÓN FINAL
-- =====================================================
SELECT 'Índices creados' as status, COUNT(*) as total
FROM pg_indexes
WHERE tablename IN ('users', 'posts', 'communities', 'news', 'courses', 'videos')
UNION ALL
SELECT 'Funciones creadas', COUNT(*)
FROM pg_proc
WHERE proname IN ('get_recommended_communities', 'get_recommended_users', 'update_user_posts_count')
UNION ALL
SELECT 'Triggers activos', COUNT(*)
FROM pg_trigger
WHERE tgname = 'trigger_update_posts_count';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
