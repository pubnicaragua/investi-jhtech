-- ========================================
-- FIX: get_suggested_people con parámetro p_limit
-- ========================================

-- Crear versión con 2 parámetros (la que el frontend necesita)
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
  ORDER BY u.fecha_registro DESC  -- Usar fecha_registro en lugar de created_at
  LIMIT p_limit;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION public.get_suggested_people(UUID, INTEGER) TO anon, authenticated;

-- Probar la función
DO $$
DECLARE
  test_user_id UUID;
  test_result RECORD;
BEGIN
  SELECT id INTO test_user_id FROM users LIMIT 1;
  
  RAISE NOTICE 'Testing get_suggested_people with 2 parameters...';
  FOR test_result IN 
    SELECT * FROM get_suggested_people(test_user_id, 5)
  LOOP
    RAISE NOTICE 'Person: % (role: %)', test_result.name, test_result.role;
  END LOOP;
  
  RAISE NOTICE '✅ Function get_suggested_people(UUID, INTEGER) working!';
END $$;
