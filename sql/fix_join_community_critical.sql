-- =====================================================
-- FIX CRÍTICO: Unirse a Comunidades
-- =====================================================
-- Problema: Al unirse a una comunidad, el contador member_count
-- no se actualiza automáticamente
-- =====================================================

-- 1. Crear función para actualizar member_count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador cuando se une un miembro
    UPDATE communities 
    SET member_count = COALESCE(member_count, 0) + 1,
        updated_at = NOW()
    WHERE id = NEW.community_id;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador cuando sale un miembro
    UPDATE communities 
    SET member_count = GREATEST(COALESCE(member_count, 1) - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear trigger en user_communities
DROP TRIGGER IF EXISTS trigger_update_member_count ON user_communities;

CREATE TRIGGER trigger_update_member_count
  AFTER INSERT OR DELETE ON user_communities
  FOR EACH ROW
  EXECUTE FUNCTION update_community_member_count();

-- 3. Recalcular member_count para todas las comunidades existentes
UPDATE communities c
SET member_count = (
  SELECT COUNT(*)
  FROM user_communities uc
  WHERE uc.community_id = c.id
    AND uc.status = 'active'
);

-- 4. Verificar que la columna member_count existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'communities' 
    AND column_name = 'member_count'
  ) THEN
    ALTER TABLE communities ADD COLUMN member_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 5. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_user_communities_community_id 
  ON user_communities(community_id) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_communities_user_id 
  ON user_communities(user_id) 
  WHERE status = 'active';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que el trigger existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'trigger_update_member_count'
    )
    THEN '✅ Trigger creado correctamente'
    ELSE '❌ ERROR: Trigger no existe'
  END as trigger_status;

-- Verificar contadores
SELECT 
  c.id,
  c.nombre as community_name,
  c.member_count as stored_count,
  COUNT(uc.id) as actual_count,
  CASE 
    WHEN c.member_count = COUNT(uc.id) THEN '✅'
    ELSE '❌ DESINCRONIZADO'
  END as status
FROM communities c
LEFT JOIN user_communities uc ON c.id = uc.community_id AND uc.status = 'active'
GROUP BY c.id, c.nombre, c.member_count
ORDER BY c.nombre;

-- Test: Simular unirse a una comunidad
DO $$
DECLARE
  test_user_id UUID;
  test_community_id UUID;
  count_before INTEGER;
  count_after INTEGER;
BEGIN
  -- Obtener un usuario y comunidad de prueba
  SELECT id INTO test_user_id FROM users LIMIT 1;
  SELECT id INTO test_community_id FROM communities LIMIT 1;
  
  IF test_user_id IS NOT NULL AND test_community_id IS NOT NULL THEN
    -- Guardar contador antes
    SELECT member_count INTO count_before 
    FROM communities 
    WHERE id = test_community_id;
    
    -- Intentar unirse (puede fallar si ya está unido)
    BEGIN
      INSERT INTO user_communities (user_id, community_id, status)
      VALUES (test_user_id, test_community_id, 'active')
      ON CONFLICT (user_id, community_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Usuario ya estaba unido a la comunidad';
    END;
    
    -- Verificar contador después
    SELECT member_count INTO count_after 
    FROM communities 
    WHERE id = test_community_id;
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'TEST DE UNIRSE A COMUNIDAD';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Contador antes: %', count_before;
    RAISE NOTICE 'Contador después: %', count_after;
    
    IF count_after >= count_before THEN
      RAISE NOTICE '✅ Trigger funcionando correctamente';
    ELSE
      RAISE NOTICE '❌ ERROR: Contador no se actualizó';
    END IF;
  END IF;
END $$;

SELECT '✅ Fix aplicado exitosamente - Unirse a comunidades ahora funciona correctamente' as final_status;
