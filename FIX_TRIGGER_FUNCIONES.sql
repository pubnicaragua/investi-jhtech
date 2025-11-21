-- ============================================
-- 🔧 ARREGLO DEFINITIVO - El trigger llama funciones que no existen
-- ============================================

-- El trigger trigger_post_creation() llama a:
-- 1. grant_xp_to_user() - puede no existir
-- 2. check_and_grant_achievement() - puede no existir
-- 3. update_daily_streak() - puede no existir

-- OPCIÓN 1: Eliminar el trigger y la función (RECOMENDADO)
DROP TRIGGER IF EXISTS on_post_creation ON posts;
DROP FUNCTION IF EXISTS trigger_post_creation() CASCADE;

-- OPCIÓN 2: Crear funciones dummy si quieres mantener el trigger
-- (Solo descomenta si quieres mantener el sistema de XP/achievements)

/*
CREATE OR REPLACE FUNCTION grant_xp_to_user(
  p_user_id UUID,
  p_xp INTEGER,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  -- Implementación dummy - no hace nada
  RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_and_grant_achievement(
  p_user_id UUID,
  p_achievement_code TEXT
) RETURNS VOID AS $$
BEGIN
  -- Implementación dummy - no hace nada
  RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_daily_streak(
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Implementación dummy - no hace nada
  RETURN;
END;
$$ LANGUAGE plpgsql;
*/

-- Verificar que se eliminó
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'posts'
AND trigger_name = 'on_post_creation';

-- Debe retornar 0 filas
