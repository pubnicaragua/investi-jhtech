-- ============================================================================
-- DIAGNÓSTICO: Por qué se pierden los datos del onboarding
-- ============================================================================
-- Usuario: c7812eb1-c3b1-429f-aabe-ba8da052201f

-- 1. HISTORIAL DE CAMBIOS (si existe tabla de auditoría)
-- ============================================================================
-- Ver si hay triggers o logs que registren cambios

-- 2. VERIFICAR DATOS ACTUALES DEL USUARIO
-- ============================================================================
SELECT 
  '📊 ESTADO ACTUAL' as section,
  id,
  email,
  full_name,
  onboarding_step,
  avatar_url IS NOT NULL as tiene_avatar,
  photo_url IS NOT NULL as tiene_photo,
  intereses,
  array_length(intereses, 1) as count_intereses,
  nivel_finanzas,
  fecha_registro,
  last_seen_at
FROM users
WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- 3. VERIFICAR METAS DEL USUARIO
-- ============================================================================
SELECT 
  '🎯 METAS GUARDADAS' as section,
  ug.id,
  ug.user_id,
  ug.goal_id,
  g.name as goal_name,
  ug.priority,
  ug.created_at
FROM user_goals ug
LEFT JOIN goals g ON ug.goal_id = g.id
WHERE ug.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY ug.priority;

-- 4. VERIFICAR INTERESES DEL USUARIO (tabla user_interests)
-- ============================================================================
SELECT 
  '🎯 INTERESES EN TABLA user_interests' as section,
  ui.id,
  ui.user_id,
  ui.interest_id,
  i.name as interest_name,
  ui.experience_level,
  ui.created_at
FROM user_interests ui
LEFT JOIN interests i ON ui.interest_id = i.id
WHERE ui.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- 5. VERIFICAR SI HAY TRIGGERS QUE SOBRESCRIBAN DATOS
-- ============================================================================
SELECT 
  '🔍 TRIGGERS EN TABLA users' as section,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
ORDER BY trigger_name;

-- 6. VERIFICAR POLÍTICAS RLS QUE PUEDAN BLOQUEAR UPDATES
-- ============================================================================
SELECT 
  '🔒 POLÍTICAS RLS EN users' as section,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- 7. SIMULAR GUARDADO DE INTERESES
-- ============================================================================
-- Verificar si el UPDATE funciona correctamente
DO $$
DECLARE
  v_user_id UUID := 'c7812eb1-c3b1-429f-aabe-ba8da052201f';
  v_test_intereses UUID[] := ARRAY[
    '9eb2ebdb-321c-4495-816c-6933e18432ac'::UUID,
    '404b12e2-1584-493a-92a7-51252c308d14'::UUID,
    '3309c396-e477-4089-ba81-4007ef621b2e'::UUID
  ];
BEGIN
  RAISE NOTICE '🧪 TEST: Intentando actualizar intereses...';
  
  -- Intentar UPDATE
  UPDATE users
  SET intereses = v_test_intereses,
      nivel_finanzas = 'beginner',
      onboarding_step = 'completed'
  WHERE id = v_user_id;
  
  RAISE NOTICE '✅ UPDATE ejecutado. Affected rows: %', FOUND;
  
  -- Verificar resultado
  PERFORM * FROM users 
  WHERE id = v_user_id 
    AND intereses = v_test_intereses;
  
  IF FOUND THEN
    RAISE NOTICE '✅ Datos guardados correctamente';
  ELSE
    RAISE NOTICE '❌ Datos NO se guardaron';
  END IF;
  
  -- ROLLBACK para no afectar datos reales
  RAISE EXCEPTION 'ROLLBACK - Solo fue una prueba';
END $$;

-- 8. VERIFICAR FUNCIÓN saveUserInterests
-- ============================================================================
-- Ver si la función existe y qué hace
SELECT 
  '🔍 FUNCIONES RELACIONADAS CON INTERESES' as section,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name LIKE '%interest%'
   OR routine_name LIKE '%onboarding%'
ORDER BY routine_name;

-- 9. VERIFICAR SI HAY MÚLTIPLES SESIONES DEL MISMO USUARIO
-- ============================================================================
-- Esto podría causar que se sobrescriban datos
SELECT 
  '👥 SESIONES ACTIVAS' as section,
  COUNT(*) as session_count
FROM auth.sessions
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
  AND expires_at > NOW();

-- 10. RECOMENDACIÓN: ACTUALIZAR DATOS MANUALMENTE
-- ============================================================================
-- Si todo lo anterior está bien, actualizar manualmente:
/*
UPDATE users
SET 
  intereses = ARRAY[
    '9eb2ebdb-321c-4495-816c-6933e18432ac'::UUID,
    '404b12e2-1584-493a-92a7-51252c308d14'::UUID,
    '3309c396-e477-4089-ba81-4007ef621b2e'::UUID
  ],
  nivel_finanzas = 'beginner',
  onboarding_step = 'completed'
WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- Verificar
SELECT 
  onboarding_step,
  intereses,
  nivel_finanzas
FROM users
WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';
*/
