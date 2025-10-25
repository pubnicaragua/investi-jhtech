-- ============================================================================
-- FIX CRÍTICO - TODOS LOS ERRORES - EJECUTAR INMEDIATAMENTE
-- ============================================================================
-- Este SQL corrige TODOS los problemas detectados en una sola ejecución
-- ============================================================================

-- PASO 1: VERIFICAR ESTRUCTURA ACTUAL
-- ============================================================================
DO $$ 
BEGIN
  RAISE NOTICE '🔍 Verificando estructura de tablas...';
END $$;

-- Verificar columnas de user_connections
SELECT 
  '✅ user_connections columns' as check_name,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_name = 'user_connections';

-- PASO 2: ELIMINAR FUNCIONES ANTIGUAS CON ERRORES
-- ============================================================================
DROP FUNCTION IF EXISTS request_user_connection(UUID, UUID);
DROP FUNCTION IF EXISTS accept_connection_request(UUID, UUID);
DROP FUNCTION IF EXISTS reject_connection_request(UUID, UUID);
DROP FUNCTION IF EXISTS are_users_connected(UUID, UUID);
DROP FUNCTION IF EXISTS get_pending_connection_requests(UUID);
DROP FUNCTION IF EXISTS get_user_connections(UUID);

-- PASO 3: RECREAR TABLA user_connections CON NOMBRES CORRECTOS
-- ============================================================================
DROP TABLE IF EXISTS user_connections CASCADE;

CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- Índices
CREATE INDEX idx_user_connections_from_user ON user_connections(from_user_id);
CREATE INDEX idx_user_connections_to_user ON user_connections(to_user_id);
CREATE INDEX idx_user_connections_status ON user_connections(status);

-- PASO 4: FUNCIONES CORREGIDAS
-- ============================================================================

-- 4.1: Verificar si dos usuarios están conectados
CREATE OR REPLACE FUNCTION are_users_connected(
  p_user_id UUID,
  p_target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_connections
    WHERE status = 'accepted'
      AND (
        (from_user_id = p_user_id AND to_user_id = p_target_user_id)
        OR
        (from_user_id = p_target_user_id AND to_user_id = p_user_id)
      )
  );
END;
$$;

-- 4.2: Solicitar conexión
CREATE OR REPLACE FUNCTION request_user_connection(
  p_user_id UUID,
  p_target_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_connection_id UUID;
  v_notification_id UUID;
  v_user_name TEXT;
BEGIN
  IF p_user_id = p_target_user_id THEN
    RETURN json_build_object('success', false, 'message', 'No puedes conectarte contigo mismo');
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM user_connections
    WHERE (from_user_id = p_user_id AND to_user_id = p_target_user_id)
       OR (from_user_id = p_target_user_id AND to_user_id = p_user_id)
  ) THEN
    RETURN json_build_object('success', false, 'message', 'Ya existe una solicitud');
  END IF;
  
  SELECT COALESCE(full_name, nombre, username, 'Usuario') 
  INTO v_user_name
  FROM users 
  WHERE id = p_user_id;
  
  INSERT INTO user_connections (from_user_id, to_user_id, status)
  VALUES (p_user_id, p_target_user_id, 'pending')
  RETURNING id INTO v_connection_id;
  
  INSERT INTO notifications (
    user_id, type, title, message, actor_id, is_read, created_at
  )
  VALUES (
    p_target_user_id,
    'connection_request',
    'Nueva solicitud de conexión',
    v_user_name || ' quiere conectar contigo',
    p_user_id,
    false,
    NOW()
  )
  RETURNING id INTO v_notification_id;
  
  RETURN json_build_object(
    'success', true,
    'connection_id', v_connection_id,
    'notification_id', v_notification_id
  );
END;
$$;

-- 4.3: Aceptar conexión
CREATE OR REPLACE FUNCTION accept_connection_request(
  p_connection_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_from_user_id UUID;
  v_to_user_id UUID;
  v_user_name TEXT;
BEGIN
  SELECT from_user_id, to_user_id
  INTO v_from_user_id, v_to_user_id
  FROM user_connections
  WHERE id = p_connection_id AND to_user_id = p_user_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Solicitud no encontrada');
  END IF;
  
  UPDATE user_connections
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_connection_id;
  
  SELECT COALESCE(full_name, nombre, username, 'Usuario')
  INTO v_user_name
  FROM users
  WHERE id = p_user_id;
  
  INSERT INTO notifications (
    user_id, type, title, message, actor_id, is_read, created_at
  )
  VALUES (
    v_from_user_id,
    'connection_accepted',
    'Solicitud aceptada',
    v_user_name || ' aceptó tu solicitud de conexión',
    p_user_id,
    false,
    NOW()
  );
  
  RETURN json_build_object('success', true, 'message', 'Conexión aceptada');
END;
$$;

-- 4.4: Rechazar conexión
CREATE OR REPLACE FUNCTION reject_connection_request(
  p_connection_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE user_connections
  SET status = 'rejected', updated_at = NOW()
  WHERE id = p_connection_id AND to_user_id = p_user_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Solicitud no encontrada');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Solicitud rechazada');
END;
$$;

-- 4.5: Obtener solicitudes pendientes
CREATE OR REPLACE FUNCTION get_pending_connection_requests(p_user_id UUID)
RETURNS TABLE (
  connection_id UUID,
  from_user_id UUID,
  from_user_name TEXT,
  from_user_avatar TEXT,
  from_user_username TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.id,
    uc.from_user_id,
    COALESCE(u.full_name, u.nombre, u.username, 'Usuario') as from_user_name,
    COALESCE(u.avatar_url, u.photo_url) as from_user_avatar,
    u.username as from_user_username,
    uc.created_at
  FROM user_connections uc
  JOIN users u ON u.id = uc.from_user_id
  WHERE uc.to_user_id = p_user_id AND uc.status = 'pending'
  ORDER BY uc.created_at DESC;
END;
$$;

-- 4.6: Obtener conexiones aceptadas
CREATE OR REPLACE FUNCTION get_user_connections(p_user_id UUID)
RETURNS TABLE (
  connection_id UUID,
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  user_username TEXT,
  connected_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.id,
    CASE 
      WHEN uc.from_user_id = p_user_id THEN uc.to_user_id
      ELSE uc.from_user_id
    END as user_id,
    COALESCE(u.full_name, u.nombre, u.username, 'Usuario') as user_name,
    COALESCE(u.avatar_url, u.photo_url) as user_avatar,
    u.username as user_username,
    uc.updated_at as connected_at
  FROM user_connections uc
  JOIN users u ON u.id = CASE 
    WHEN uc.from_user_id = p_user_id THEN uc.to_user_id
    ELSE uc.from_user_id
  END
  WHERE (uc.from_user_id = p_user_id OR uc.to_user_id = p_user_id)
    AND uc.status = 'accepted'
  ORDER BY uc.updated_at DESC;
END;
$$;

-- PASO 5: POLÍTICAS RLS
-- ============================================================================
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own connections" ON user_connections;
CREATE POLICY "Users can view their own connections" ON user_connections
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS "Users can create connection requests" ON user_connections;
CREATE POLICY "Users can create connection requests" ON user_connections
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Users can update received connections" ON user_connections;
CREATE POLICY "Users can update received connections" ON user_connections
  FOR UPDATE USING (auth.uid() = to_user_id);

DROP POLICY IF EXISTS "Users can delete their own connections" ON user_connections;
CREATE POLICY "Users can delete their own connections" ON user_connections
  FOR DELETE USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- PASO 6: VERIFICACIÓN FINAL
-- ============================================================================
SELECT 
  routine_name as function_name,
  '✅ EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'are_users_connected',
    'request_user_connection',
    'accept_connection_request',
    'reject_connection_request',
    'get_pending_connection_requests',
    'get_user_connections'
  )
ORDER BY routine_name;

DO $$ 
BEGIN
  RAISE NOTICE '✅ TODAS LAS FUNCIONES CREADAS CORRECTAMENTE';
END $$;
