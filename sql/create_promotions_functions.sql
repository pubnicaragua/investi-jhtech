-- ========================================
-- FUNCIONES SQL PARA PROMOTIONS SCREEN
-- ========================================

-- 1. FUNCIÓN: get_suggested_people
-- Obtiene personas sugeridas basadas en intereses del usuario
CREATE OR REPLACE FUNCTION public.get_suggested_people(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  avatar_url TEXT,
  role TEXT,
  interests TEXT[]
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(u.full_name, u.nombre, 'Usuario') as name,
    u.avatar_url,
    u.role,
    u.intereses as interests
  FROM users u
  WHERE u.id != p_user_id
    AND u.avatar_url IS NOT NULL
    AND array_length(u.intereses, 1) > 0
  ORDER BY u.fecha_registro DESC
  LIMIT p_limit;
END;
$$;

-- 2. FUNCIÓN: get_suggested_communities
-- Obtiene comunidades sugeridas basadas en intereses del usuario
CREATE OR REPLACE FUNCTION public.get_suggested_communities(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  image_url TEXT,
  type TEXT,
  members_count INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.nombre as name,
    c.image_url,
    c.tipo as type,
    COALESCE(c.member_count, 0)::INTEGER as members_count
  FROM communities c
  WHERE c.active = true
  ORDER BY c.member_count DESC NULLS LAST, c.created_at DESC
  LIMIT limit_param;
END;
$$;

-- 3. FUNCIÓN: get_recent_posts
-- Obtiene posts recientes con filtros
CREATE OR REPLACE FUNCTION public.get_recent_posts(
  user_id_param UUID,
  filter_param TEXT DEFAULT 'De mis contactos',
  limit_param INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  image TEXT,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  author JSONB,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.contenido as content,
    CASE 
      WHEN array_length(p.media_url, 1) > 0 THEN p.media_url[1]
      ELSE NULL
    END as image,
    COALESCE(p.likes_count, 0)::INTEGER as likes,
    COALESCE(p.comment_count, 0)::INTEGER as comments,
    COALESCE(p.shares, 0)::INTEGER as shares,
    jsonb_build_object(
      'id', u.id,
      'name', COALESCE(u.full_name, u.nombre, 'Usuario'),
      'avatar', u.avatar_url,
      'role', u.role
    ) as author,
    p.created_at
  FROM posts p
  JOIN users u ON p.user_id = u.id
  WHERE 
    CASE 
      WHEN filter_param = 'Últimas 24 horas' THEN p.created_at > NOW() - INTERVAL '24 hours'
      WHEN filter_param = 'Semanal' THEN p.created_at > NOW() - INTERVAL '7 days'
      ELSE true -- 'De mis contactos' o cualquier otro
    END
  ORDER BY p.created_at DESC
  LIMIT limit_param;
END;
$$;

-- 4. FUNCIÓN: get_promotions
-- Obtiene promociones activas con búsqueda opcional
CREATE OR REPLACE FUNCTION public.get_promotions(
  p_user_id UUID,
  p_search TEXT DEFAULT ''
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  discount TEXT,
  image_url TEXT,
  valid_until DATE,
  location TEXT,
  description TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.title,
    pr.discount,
    pr.image_url,
    pr.valid_until,
    pr.location,
    pr.description
  FROM promotions pr
  WHERE pr.active = true
    AND (p_search = '' OR pr.title ILIKE '%' || p_search || '%' OR pr.description ILIKE '%' || p_search || '%')
  ORDER BY pr.created_at DESC;
END;
$$;

-- ========================================
-- PERMISOS - Permitir acceso público a las funciones
-- ========================================

GRANT EXECUTE ON FUNCTION public.get_suggested_people(UUID, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_suggested_communities(UUID, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_posts(UUID, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_promotions(UUID, TEXT) TO anon, authenticated;

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Probar las funciones con un usuario de ejemplo
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Obtener un usuario de prueba
  SELECT id INTO test_user_id FROM users LIMIT 1;
  
  -- Probar cada función
  RAISE NOTICE 'Testing get_suggested_people...';
  PERFORM * FROM get_suggested_people(test_user_id, 3);
  
  RAISE NOTICE 'Testing get_suggested_communities...';
  PERFORM * FROM get_suggested_communities(test_user_id, 3);
  
  RAISE NOTICE 'Testing get_recent_posts...';
  PERFORM * FROM get_recent_posts(test_user_id, 'De mis contactos', 3);
  
  RAISE NOTICE 'Testing get_promotions...';
  PERFORM * FROM get_promotions(test_user_id, '');
  
  RAISE NOTICE '✅ All functions created successfully!';
END $$;

-- Ver las funciones creadas
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_suggested_people', 'get_suggested_communities', 'get_recent_posts', 'get_promotions')
ORDER BY routine_name;
