-- =====================================================
-- VERIFICACIÓN COMPLETA DE TODOS LOS FIXES
-- =====================================================
-- Ejecutar este script después de aplicar todos los fixes
-- para verificar que todo funciona correctamente
-- =====================================================

\echo '=========================================='
\echo 'VERIFICACIÓN COMPLETA DEL SISTEMA'
\echo '=========================================='
\echo ''

-- =====================================================
-- 1. VERIFICAR TRIGGERS
-- =====================================================

\echo '1. VERIFICANDO TRIGGERS...'
\echo ''

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'trigger_update_member_count'
    )
    THEN '✅ Trigger de member_count existe'
    ELSE '❌ ERROR: Trigger de member_count NO existe'
  END as trigger_status;

-- =====================================================
-- 2. VERIFICAR FUNCIONES SQL
-- =====================================================

\echo ''
\echo '2. VERIFICANDO FUNCIONES SQL...'
\echo ''

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_suggested_people')
    THEN '✅ get_suggested_people'
    ELSE '❌ get_suggested_people'
  END as func_1,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_suggested_people_v2')
    THEN '✅ get_suggested_people_v2'
    ELSE '❌ get_suggested_people_v2'
  END as func_2,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_people_by_shared_interests')
    THEN '✅ get_people_by_shared_interests'
    ELSE '❌ get_people_by_shared_interests'
  END as func_3,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_recommended_communities_by_goals')
    THEN '✅ get_recommended_communities_by_goals'
    ELSE '❌ get_recommended_communities_by_goals'
  END as func_4,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_recommended_communities_by_goals_v2')
    THEN '✅ get_recommended_communities_by_goals_v2'
    ELSE '❌ get_recommended_communities_by_goals_v2'
  END as func_5;

-- =====================================================
-- 3. VERIFICAR TABLAS CRÍTICAS
-- =====================================================

\echo ''
\echo '3. VERIFICANDO TABLAS...'
\echo ''

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_communities')
    THEN '✅ user_communities'
    ELSE '❌ user_communities'
  END as table_1,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communities')
    THEN '✅ communities'
    ELSE '❌ communities'
  END as table_2,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')
    THEN '✅ users'
    ELSE '❌ users'
  END as table_3,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_goals')
    THEN '✅ user_goals'
    ELSE '❌ user_goals'
  END as table_4,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'goals')
    THEN '✅ goals'
    ELSE '❌ goals'
  END as table_5;

-- =====================================================
-- 4. VERIFICAR COLUMNAS CRÍTICAS
-- =====================================================

\echo ''
\echo '4. VERIFICANDO COLUMNAS...'
\echo ''

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'communities' AND column_name = 'member_count'
    )
    THEN '✅ communities.member_count'
    ELSE '❌ communities.member_count'
  END as col_1,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_communities' AND column_name = 'role'
    )
    THEN '✅ user_communities.role'
    ELSE '❌ user_communities.role'
  END as col_2,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_communities' AND column_name = 'status'
    )
    THEN '✅ user_communities.status'
    ELSE '❌ user_communities.status'
  END as col_3,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'intereses'
    )
    THEN '✅ users.intereses'
    ELSE '❌ users.intereses'
  END as col_4;

-- =====================================================
-- 5. VERIFICAR ÍNDICES
-- =====================================================

\echo ''
\echo '5. VERIFICANDO ÍNDICES...'
\echo ''

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_user_communities_community_id'
    )
    THEN '✅ idx_user_communities_community_id'
    ELSE '⚠️ idx_user_communities_community_id (opcional)'
  END as idx_1,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_user_communities_user_id'
    )
    THEN '✅ idx_user_communities_user_id'
    ELSE '⚠️ idx_user_communities_user_id (opcional)'
  END as idx_2;

-- =====================================================
-- 6. VERIFICAR INTEGRIDAD DE DATOS
-- =====================================================

\echo ''
\echo '6. VERIFICANDO INTEGRIDAD DE DATOS...'
\echo ''

-- Verificar que los contadores están sincronizados
WITH community_counts AS (
  SELECT 
    c.id,
    c.nombre,
    c.member_count as stored_count,
    COUNT(uc.id) as actual_count
  FROM communities c
  LEFT JOIN user_communities uc ON c.id = uc.community_id AND uc.status = 'active'
  GROUP BY c.id, c.nombre, c.member_count
)
SELECT 
  COUNT(*) as total_communities,
  SUM(CASE WHEN stored_count = actual_count THEN 1 ELSE 0 END) as synchronized,
  SUM(CASE WHEN stored_count != actual_count THEN 1 ELSE 0 END) as desynchronized,
  CASE 
    WHEN SUM(CASE WHEN stored_count != actual_count THEN 1 ELSE 0 END) = 0
    THEN '✅ Todos los contadores sincronizados'
    ELSE '⚠️ Hay ' || SUM(CASE WHEN stored_count != actual_count THEN 1 ELSE 0 END) || ' comunidades desincronizadas'
  END as status
FROM community_counts;

-- Mostrar comunidades desincronizadas (si las hay)
\echo ''
\echo 'Comunidades con contadores desincronizados:'
SELECT 
  c.nombre,
  c.member_count as contador_almacenado,
  COUNT(uc.id) as contador_real,
  COUNT(uc.id) - c.member_count as diferencia
FROM communities c
LEFT JOIN user_communities uc ON c.id = uc.community_id AND uc.status = 'active'
GROUP BY c.id, c.nombre, c.member_count
HAVING c.member_count != COUNT(uc.id)
ORDER BY ABS(COUNT(uc.id) - c.member_count) DESC
LIMIT 10;

-- =====================================================
-- 7. ESTADÍSTICAS GENERALES
-- =====================================================

\echo ''
\echo '7. ESTADÍSTICAS GENERALES...'
\echo ''

SELECT 
  (SELECT COUNT(*) FROM users) as total_usuarios,
  (SELECT COUNT(*) FROM communities) as total_comunidades,
  (SELECT COUNT(*) FROM user_communities WHERE status = 'active') as membresías_activas,
  (SELECT COUNT(*) FROM users WHERE intereses IS NOT NULL AND array_length(intereses, 1) > 0) as usuarios_con_intereses,
  (SELECT COUNT(*) FROM user_goals) as usuarios_con_metas;

-- =====================================================
-- 8. TEST DE FUNCIONES
-- =====================================================

\echo ''
\echo '8. TESTING DE FUNCIONES...'
\echo ''

DO $$
DECLARE
  test_user_id UUID;
  result_count INTEGER;
BEGIN
  -- Obtener un usuario de prueba
  SELECT id INTO test_user_id FROM users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    \echo 'Usuario de prueba: ' || test_user_id::TEXT
    
    -- Test 1: Personas sugeridas
    SELECT COUNT(*) INTO result_count
    FROM get_suggested_people(test_user_id, 5);
    RAISE NOTICE '  ✅ get_suggested_people: % resultados', result_count;
    
    -- Test 2: Personas por intereses
    BEGIN
      SELECT COUNT(*) INTO result_count
      FROM get_people_by_shared_interests(test_user_id, 5);
      RAISE NOTICE '  ✅ get_people_by_shared_interests: % resultados', result_count;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '  ⚠️ get_people_by_shared_interests: No disponible o sin datos';
    END;
    
    -- Test 3: Comunidades recomendadas
    BEGIN
      SELECT COUNT(*) INTO result_count
      FROM get_recommended_communities_by_goals(test_user_id, 5);
      RAISE NOTICE '  ✅ get_recommended_communities_by_goals: % resultados', result_count;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '  ⚠️ get_recommended_communities_by_goals: No disponible o sin datos';
    END;
    
  ELSE
    RAISE NOTICE '  ⚠️ No hay usuarios para probar';
  END IF;
END $$;

-- =====================================================
-- 9. RESUMEN FINAL
-- =====================================================

\echo ''
\echo '=========================================='
\echo 'RESUMEN DE VERIFICACIÓN'
\echo '=========================================='

SELECT 
  CASE 
    WHEN (
      EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_member_count')
      AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_people_by_shared_interests')
      AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_suggested_people')
      AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_recommended_communities_by_goals')
    )
    THEN '✅ SISTEMA COMPLETAMENTE FUNCIONAL'
    ELSE '⚠️ FALTAN ALGUNOS COMPONENTES'
  END as status_final;

\echo ''
\echo '=========================================='
\echo 'PRÓXIMOS PASOS:'
\echo '1. Si hay comunidades desincronizadas, ejecutar:'
\echo '   UPDATE communities c SET member_count = ('
\echo '     SELECT COUNT(*) FROM user_communities uc'
\echo '     WHERE uc.community_id = c.id AND uc.status = ''active'''
\echo '   );'
\echo ''
\echo '2. Probar en la app:'
\echo '   - Unirse a una comunidad'
\echo '   - Verificar que aparece el chat'
\echo '   - Verificar que el contador aumenta'
\echo '=========================================='
