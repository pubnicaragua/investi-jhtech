-- =====================================================
-- FIXES Y VALIDACIÓN PARA INVESTI
-- =====================================================

-- 1. CREAR USUARIOS PROFESIONALES PARA TESTING
-- =====================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'sebastian1@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (gen_random_uuid(), 'sebastian2@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (gen_random_uuid(), 'sebastian3@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (gen_random_uuid(), 'sebastian4@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (gen_random_uuid(), 'sebastian5@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (gen_random_uuid(), 'sebastian6@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (gen_random_uuid(), 'sebastian7@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (gen_random_uuid(), 'sebastian8@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (gen_random_uuid(), 'sebastian9@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (gen_random_uuid(), 'sebastian10@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now())
ON CONFLICT (email) DO NOTHING;

-- Crear perfiles para estos usuarios
INSERT INTO public.users (id, email, username, full_name, nombre, role, onboarding_step, created_at)
SELECT 
  id,
  email,
  'sebastian' || ROW_NUMBER() OVER (ORDER BY email),
  'Sebastian ' || ROW_NUMBER() OVER (ORDER BY email),
  'Sebastian ' || ROW_NUMBER() OVER (ORDER BY email),
  'Analista Financiero',
  'completed',
  now()
FROM auth.users
WHERE email LIKE 'sebastian%@gmail.com'
ON CONFLICT (id) DO UPDATE SET onboarding_step = 'completed';

-- 2. CREAR CONEXIONES PARA EL USUARIO c7812eb1-c3b1-429f-aabe-ba8da052201f
-- =====================================================
INSERT INTO public.user_follows (follower_id, following_id, source, created_at)
SELECT 
  'c7812eb1-c3b1-429f-aabe-ba8da052201f'::uuid,
  id,
  'manual',
  now()
FROM public.users
WHERE email LIKE 'sebastian%@gmail.com'
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- También hacer que ellos sigan al usuario
INSERT INTO public.user_follows (follower_id, following_id, source, created_at)
SELECT 
  id,
  'c7812eb1-c3b1-429f-aabe-ba8da052201f'::uuid,
  'manual',
  now()
FROM public.users
WHERE email LIKE 'sebastian%@gmail.com'
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- 3. CREAR NOTIFICACIONES DE EJEMPLO
-- =====================================================
INSERT INTO public.notifications (user_id, type, title, message, from_user_id, read, created_at)
SELECT 
  'c7812eb1-c3b1-429f-aabe-ba8da052201f'::uuid,
  'follow',
  'Nuevo seguidor',
  full_name || ' ha comenzado a seguirte',
  id,
  false,
  now() - (ROW_NUMBER() OVER (ORDER BY created_at) || ' hours')::interval
FROM public.users
WHERE email LIKE 'sebastian%@gmail.com'
LIMIT 5;

INSERT INTO public.notifications (user_id, type, title, message, post_id, from_user_id, read, created_at)
VALUES
  ('c7812eb1-c3b1-429f-aabe-ba8da052201f', 'like', 'Le gustó tu publicación', 'A Sebastian 1 le gustó tu publicación', (SELECT id FROM posts WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f' LIMIT 1), (SELECT id FROM users WHERE email = 'sebastian1@gmail.com'), false, now() - interval '2 hours'),
  ('c7812eb1-c3b1-429f-aabe-ba8da052201f', 'comment', 'Nuevo comentario', 'Sebastian 2 comentó en tu publicación', (SELECT id FROM posts WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f' LIMIT 1), (SELECT id FROM users WHERE email = 'sebastian2@gmail.com'), false, now() - interval '3 hours'),
  ('c7812eb1-c3b1-429f-aabe-ba8da052201f', 'mention', 'Te mencionaron', 'Sebastian 3 te mencionó en un comentario', (SELECT id FROM posts LIMIT 1), (SELECT id FROM users WHERE email = 'sebastian3@gmail.com'), false, now() - interval '5 hours');

-- 4. VERIFICAR TRIGGERS PROBLEMÁTICOS
-- =====================================================
-- Listar todos los triggers que pueden estar causando problemas
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('post_likes', 'post_saves', 'post_shares', 'post_comments');

-- 5. ASEGURAR QUE LOS CONTADORES FUNCIONEN
-- =====================================================
-- Función para actualizar contadores de posts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_TABLE_NAME = 'post_shares' THEN
      UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'post_likes' THEN
      UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
      UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    ELSIF TG_TABLE_NAME = 'post_shares' THEN
      UPDATE posts SET shares_count = GREATEST(0, shares_count - 1) WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear triggers si no existen
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON post_likes;
CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON post_comments;
CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

DROP TRIGGER IF EXISTS trigger_update_post_shares_count ON post_shares;
CREATE TRIGGER trigger_update_post_shares_count
  AFTER INSERT OR DELETE ON post_shares
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- 6. RECALCULAR CONTADORES EXISTENTES
-- =====================================================
UPDATE posts p
SET 
  likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id),
  comment_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id),
  shares_count = (SELECT COUNT(*) FROM post_shares WHERE post_id = p.id);

-- 7. VALIDAR SAVED POSTS
-- =====================================================
SELECT 
  ps.id,
  ps.user_id,
  ps.post_id,
  ps.created_at,
  p.content,
  u.full_name as post_author
FROM post_saves ps
JOIN posts p ON ps.post_id = p.id
JOIN users u ON p.user_id = u.id
WHERE ps.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY ps.created_at DESC;

-- 8. VALIDAR CONEXIONES (FOLLOWS)
-- =====================================================
SELECT 
  uf.id,
  uf.follower_id,
  uf.following_id,
  u.full_name as following_name,
  u.email as following_email,
  uf.created_at
FROM user_follows uf
JOIN users u ON uf.following_id = u.id
WHERE uf.follower_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY uf.created_at DESC;

-- 9. VALIDAR MIEMBROS DE COMUNIDAD
-- =====================================================
SELECT 
  cm.id,
  cm.community_id,
  c.name as community_name,
  cm.user_id,
  u.full_name as member_name,
  cm.role,
  cm.status,
  cm.joined_at
FROM community_members cm
JOIN communities c ON cm.community_id = c.id
JOIN users u ON cm.user_id = u.id
WHERE cm.community_id IN (
  SELECT community_id FROM community_members WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
)
ORDER BY cm.joined_at DESC;

-- 10. VALIDAR POSTS EN HOMEFEED
-- =====================================================
-- Verificar que el usuario pueda ver posts de sus conexiones
SELECT 
  p.id,
  p.content,
  p.likes_count,
  p.comment_count,
  p.shares_count,
  u.full_name as author,
  p.created_at,
  EXISTS(SELECT 1 FROM user_follows WHERE follower_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f' AND following_id = p.user_id) as is_following
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.user_id IN (
  SELECT following_id FROM user_follows WHERE follower_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
)
OR p.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY p.created_at DESC
LIMIT 20;

-- 11. VALIDAR BÚSQUEDA (PROMOTIONS SCREEN)
-- =====================================================
-- Crear índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING gin(to_tsvector('spanish', content));
CREATE INDEX IF NOT EXISTS idx_users_name_search ON users USING gin(to_tsvector('spanish', full_name || ' ' || COALESCE(nombre, '') || ' ' || COALESCE(username, '')));
CREATE INDEX IF NOT EXISTS idx_communities_name_search ON communities USING gin(to_tsvector('spanish', name || ' ' || COALESCE(descripcion, '')));

-- Función de búsqueda mejorada
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
    LEFT(p.content, 200) as description,
    u.avatar_url as image_url,
    ts_rank(to_tsvector('spanish', p.content), plainto_tsquery('spanish', search_query)) as relevance
  FROM posts p
  JOIN users u ON p.user_id = u.id
  WHERE to_tsvector('spanish', p.content) @@ plainto_tsquery('spanish', search_query)
  
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

-- 12. VALIDAR INVITACIONES A COMUNIDAD
-- =====================================================
-- Verificar que la función de invitar funcione
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.avatar_url,
  EXISTS(SELECT 1 FROM user_follows WHERE follower_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f' AND following_id = u.id) as is_following,
  EXISTS(SELECT 1 FROM community_members cm WHERE cm.user_id = u.id AND cm.community_id = (SELECT id FROM communities LIMIT 1)) as is_member
FROM users u
WHERE EXISTS(SELECT 1 FROM user_follows WHERE follower_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f' AND following_id = u.id)
ORDER BY u.full_name;

-- 13. RESUMEN DE VALIDACIÓN
-- =====================================================
SELECT 
  'Total Posts' as metric,
  COUNT(*)::text as value
FROM posts
UNION ALL
SELECT 
  'Posts con likes',
  COUNT(DISTINCT post_id)::text
FROM post_likes
UNION ALL
SELECT 
  'Posts con comentarios',
  COUNT(DISTINCT post_id)::text
FROM post_comments
UNION ALL
SELECT 
  'Total Usuarios',
  COUNT(*)::text
FROM users
UNION ALL
SELECT 
  'Usuarios con onboarding completo',
  COUNT(*)::text
FROM users
WHERE onboarding_step = 'completed'
UNION ALL
SELECT 
  'Total Comunidades',
  COUNT(*)::text
FROM communities
UNION ALL
SELECT 
  'Conexiones del usuario test',
  COUNT(*)::text
FROM user_follows
WHERE follower_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
UNION ALL
SELECT 
  'Notificaciones no leídas',
  COUNT(*)::text
FROM notifications
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f' AND read = false;
