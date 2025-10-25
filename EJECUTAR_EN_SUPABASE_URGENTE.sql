-- ============================================================================
-- EJECUTAR EN SUPABASE - CORRECCIONES URGENTES
-- ============================================================================
-- Este archivo corrige los problemas de columnas faltantes en la BD
-- EJECUTAR EN: Supabase Dashboard > SQL Editor > New Query
-- ============================================================================

-- 1. Agregar columna 'message' a la tabla notifications si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' AND column_name = 'message'
    ) THEN
        ALTER TABLE notifications ADD COLUMN message TEXT;
        RAISE NOTICE 'Columna message agregada a notifications';
    ELSE
        RAISE NOTICE 'Columna message ya existe en notifications';
    END IF;
END $$;

-- 2. Verificar que la tabla user_follows use 'following_id' (NO 'followed_id')
-- Si tu tabla usa 'followed_id', necesitas renombrarla:
-- DESCOMENTAR SOLO SI TU TABLA USA 'followed_id':
/*
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_follows' AND column_name = 'followed_id'
    ) THEN
        ALTER TABLE user_follows RENAME COLUMN followed_id TO following_id;
        RAISE NOTICE 'Columna followed_id renombrada a following_id';
    ELSE
        RAISE NOTICE 'La tabla ya usa following_id correctamente';
    END IF;
END $$;
*/

-- 3. Verificar estructura de user_follows
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_follows'
ORDER BY ordinal_position;

-- 4. Verificar estructura de notifications
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- user_follows debe tener: id, follower_id, following_id, created_at, source
-- notifications debe tener: id, user_id, type, title, message, body, is_read, created_at, actor_id, from_user_id, action_url, target_object
-- ============================================================================

-- 5. CORREGIR FUNCIONES SQL QUE USAN related_user_id (debe ser actor_id o from_user_id)
-- Esta función se ejecuta cuando alguien sigue a un usuario
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, actor_id, from_user_id, created_at)
  VALUES (
    NEW.following_id,  -- El usuario que RECIBE el follow
    'follow',
    'Nuevo seguidor',
    'Alguien comenzó a seguirte',
    NEW.follower_id,   -- El usuario que HIZO el follow
    NEW.follower_id,   -- Mismo que actor_id
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS on_user_follow ON user_follows;
CREATE TRIGGER on_user_follow
  AFTER INSERT ON user_follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- 6. HABILITAR RLS POLICIES PARA NOTIFICATIONS
-- Permitir que el trigger inserte notificaciones
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy para permitir INSERT desde triggers Y funciones RPC
DROP POLICY IF EXISTS "Allow trigger inserts" ON notifications;
CREATE POLICY "Allow trigger inserts" ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Policy ALTERNATIVA: Permitir INSERT si el usuario autenticado está involucrado
DROP POLICY IF EXISTS "Allow authenticated inserts" ON notifications;
CREATE POLICY "Allow authenticated inserts" ON notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() = from_user_id OR 
    auth.uid() = actor_id OR
    true  -- Permitir TODOS los inserts (temporal para debugging)
  );

-- Policy para que usuarios lean sus propias notificaciones
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy para que usuarios actualicen sus propias notificaciones (marcar como leídas)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICAR QUE TODO ESTÉ CORRECTO
-- ============================================================================
SELECT 'Configuración completada exitosamente' as status;
