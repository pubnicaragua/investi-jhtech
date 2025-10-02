-- ========================================
-- FIX: FUNCIONES FALTANTES PARA PROMOTIONS SCREEN
-- ========================================
-- Este script SOLO crea las funciones que faltan
-- NO elimina funciones existentes

-- ========================================
-- 1. VERIFICAR FUNCIONES EXISTENTES
-- ========================================

SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_suggested_people', 'get_recommended_communities', 'get_recent_posts', 'get_promotions')
ORDER BY routine_name;

-- ========================================
-- 2. CREAR SOLO LAS FUNCIONES QUE FALTAN
-- ========================================

-- FUNCIÓN: get_suggested_communities (alias de get_recommended_communities)
-- Esta función es necesaria porque el frontend llama a get_suggested_communities
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
    c.tipo::TEXT as type,  -- CAST a TEXT para evitar error de tipo
    COALESCE(c.member_count, 0)::INTEGER as members_count
  FROM communities c
  ORDER BY c.member_count DESC NULLS LAST, c.created_at DESC
  LIMIT limit_param;
END;
$$;

-- FUNCIÓN: get_recent_posts
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
      ELSE true
    END
  ORDER BY p.created_at DESC
  LIMIT limit_param;
END;
$$;

-- FUNCIÓN: get_promotions
-- Obtiene promociones activas
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
    AND (p_search = '' OR pr.title ILIKE '%' || p_search || '%')
  ORDER BY pr.created_at DESC;
END;
$$;

-- ========================================
-- 3. OTORGAR PERMISOS
-- ========================================

GRANT EXECUTE ON FUNCTION public.get_suggested_communities(UUID, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_posts(UUID, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_promotions(UUID, TEXT) TO anon, authenticated;

-- ========================================
-- 4. PROBAR LAS FUNCIONES
-- ========================================

DO $$
DECLARE
  test_user_id UUID;
  test_result RECORD;
BEGIN
  -- Obtener un usuario de prueba
  SELECT id INTO test_user_id FROM users LIMIT 1;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PROBANDO FUNCIONES';
  RAISE NOTICE '========================================';
  
  -- Probar get_suggested_communities
  RAISE NOTICE 'Testing get_suggested_communities...';
  FOR test_result IN 
    SELECT * FROM get_suggested_communities(test_user_id, 3)
  LOOP
    RAISE NOTICE 'Community: % (% members)', test_result.name, test_result.members_count;
  END LOOP;
  
  -- Probar get_recent_posts
  RAISE NOTICE 'Testing get_recent_posts...';
  FOR test_result IN 
    SELECT * FROM get_recent_posts(test_user_id, 'De mis contactos', 3)
  LOOP
    RAISE NOTICE 'Post: % by %', test_result.content, test_result.author->>'name';
  END LOOP;
  
  -- Probar get_promotions
  RAISE NOTICE 'Testing get_promotions...';
  FOR test_result IN 
    SELECT * FROM get_promotions(test_user_id, '')
  LOOP
    RAISE NOTICE 'Promotion: % - %', test_result.title, test_result.discount;
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ All functions tested successfully!';
  RAISE NOTICE '========================================';
END $$;

-- ========================================
-- 5. VERIFICACIÓN FINAL
-- ========================================

SELECT 
  '✅ FUNCIONES CREADAS' as status,
  routine_name as function_name,
  routine_type as type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_suggested_communities', 'get_recent_posts', 'get_promotions')
ORDER BY routine_name;
