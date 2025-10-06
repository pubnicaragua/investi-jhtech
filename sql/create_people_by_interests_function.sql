-- =====================================================
-- NUEVO ENDPOINT: Personas según Intereses Compartidos
-- =====================================================
-- Retorna personas que comparten intereses con el usuario
-- =====================================================

CREATE OR REPLACE FUNCTION get_people_by_shared_interests(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  avatar_url TEXT,
  role TEXT,
  interests TEXT[],
  shared_interests TEXT[],
  match_score NUMERIC
) 
LANGUAGE plpgsql
AS $$
DECLARE
  user_interests TEXT[];
BEGIN
  -- Obtener intereses del usuario actual
  SELECT intereses INTO user_interests
  FROM users
  WHERE id = p_user_id;
  
  -- Si el usuario no tiene intereses, retornar vacío
  IF user_interests IS NULL OR array_length(user_interests, 1) IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(u.full_name, u.nombre, 'Usuario') as name,
    u.avatar_url,
    u.role,
    u.intereses as interests,
    -- Intereses compartidos
    ARRAY(
      SELECT unnest(u.intereses)
      INTERSECT
      SELECT unnest(user_interests)
    ) as shared_interests,
    -- Score basado en % de intereses compartidos
    (
      CAST(
        array_length(
          ARRAY(
            SELECT unnest(u.intereses)
            INTERSECT
            SELECT unnest(user_interests)
          ), 
          1
        ) AS NUMERIC
      ) / NULLIF(array_length(user_interests, 1), 0)
    ) * 100 as match_score
  FROM users u
  WHERE u.id != p_user_id
    AND u.intereses IS NOT NULL
    AND array_length(u.intereses, 1) > 0
    -- Solo usuarios que tienen al menos 1 interés compartido
    AND EXISTS (
      SELECT 1
      FROM unnest(u.intereses) AS user_interest
      WHERE user_interest = ANY(user_interests)
    )
  ORDER BY match_score DESC, u.fecha_registro DESC
  LIMIT p_limit;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION get_people_by_shared_interests(UUID, INTEGER) TO anon, authenticated;

COMMENT ON FUNCTION get_people_by_shared_interests IS 
'Retorna personas que comparten intereses con el usuario, ordenadas por % de coincidencia';

-- =====================================================
-- VERIFICACIÓN Y TESTING
-- =====================================================

-- Verificar que la función existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'get_people_by_shared_interests'
    )
    THEN '✅ Función creada correctamente'
    ELSE '❌ ERROR: Función no existe'
  END as function_status;

-- Test con un usuario real
DO $$
DECLARE
  test_user_id UUID;
  result_count INTEGER;
BEGIN
  -- Obtener un usuario que tenga intereses
  SELECT id INTO test_user_id 
  FROM users 
  WHERE intereses IS NOT NULL 
    AND array_length(intereses, 1) > 0
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'TEST: Personas por Intereses Compartidos';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Usuario de prueba: %', test_user_id;
    
    -- Contar resultados
    SELECT COUNT(*) INTO result_count
    FROM get_people_by_shared_interests(test_user_id, 10);
    
    RAISE NOTICE 'Personas encontradas: %', result_count;
    
    -- Mostrar primeros 3 resultados
    FOR result IN 
      SELECT * FROM get_people_by_shared_interests(test_user_id, 3)
    LOOP
      RAISE NOTICE '  - % (Match: %%, Intereses compartidos: %)', 
        result.name, 
        ROUND(result.match_score, 2),
        array_length(result.shared_interests, 1);
    END LOOP;
    
    RAISE NOTICE '✅ Función funcionando correctamente';
  ELSE
    RAISE NOTICE '⚠️ No hay usuarios con intereses para probar';
  END IF;
END $$;

SELECT '✅ Endpoint de personas por intereses creado exitosamente' as final_status;
