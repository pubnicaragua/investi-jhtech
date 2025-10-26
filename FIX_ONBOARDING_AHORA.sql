-- ============================================================================
-- FIX INMEDIATO: Completar onboarding del usuario
-- ============================================================================
-- Usuario: c7812eb1-c3b1-429f-aabe-ba8da052201f

-- 1. VERIFICAR VALORES VÁLIDOS DEL ENUM finance_level
-- ============================================================================
SELECT 
  '📋 VALORES VÁLIDOS DE finance_level' as info,
  unnest(enum_range(NULL::finance_level))::text as valid_values;

-- 2. ACTUALIZAR USUARIO CON VALORES CORRECTOS
-- ============================================================================
-- Usar el array de intereses desde user_interests
UPDATE users
SET 
  intereses = ARRAY[
    '9eb2ebdb-321c-4495-816c-6933e18432ac'::UUID,
    '404b12e2-1584-493a-92a7-51252c308d14'::UUID,
    '3309c396-e477-4089-ba81-4007ef621b2e'::UUID
  ],
  nivel_finanzas = 'basic'::finance_level,  -- Usar valor del enum
  onboarding_step = 'completed'
WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- 3. VERIFICAR RESULTADO
-- ============================================================================
SELECT 
  '✅ VERIFICACIÓN' as status,
  id,
  full_name,
  onboarding_step,
  nivel_finanzas,
  intereses,
  array_length(intereses, 1) as count_intereses
FROM users
WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- 4. VERIFICAR TRIGGER sync_user_columns
-- ============================================================================
-- Ver qué hace este trigger
SELECT 
  '🔍 FUNCIÓN DEL TRIGGER' as info,
  prosrc
FROM pg_proc
WHERE proname = 'sync_user_columns';

-- 5. SI EL TRIGGER CAUSA PROBLEMAS, DESHABILITARLO TEMPORALMENTE
-- ============================================================================
-- SOLO si el trigger está sobrescribiendo datos:
-- ALTER TABLE users DISABLE TRIGGER sync_user_columns_trigger;

-- Luego volver a habilitar:
-- ALTER TABLE users ENABLE TRIGGER sync_user_columns_trigger;
