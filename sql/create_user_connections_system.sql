-- ============================================================================
-- SISTEMA DE CONEXIONES DE USUARIOS
-- ============================================================================
-- Este archivo crea el sistema completo de conexiones entre usuarios
-- con validación de aceptación mutua y notificaciones
-- ============================================================================

-- 1. CREAR TABLA user_connections (si no existe)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_user_id)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_target_user_id ON user_connections(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);

-- 2. FUNCIÓN: Verificar si dos usuarios están conectados
-- ============================================================================
CREATE OR REPLACE FUNCTION are_users_connected(
  p_user_id UUID,
  p_target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_connected BOOLEAN;
BEGIN
  -- Verificar si existe una conexión aceptada en ambas direcciones
  SELECT EXISTS (
    SELECT 1 FROM user_connections
    WHERE (
      (user_id = p_user_id AND target_user_id = p_target_user_id AND status = 'accepted')
      OR
      (user_id = p_target_user_id AND target_user_id = p_user_id AND status = 'accepted')
    )
  ) INTO v_connected;
  
  RETURN v_connected;
END;
$$;

-- 3. FUNCIÓN: Solicitar conexión con usuario
-- ============================================================================
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
  -- Validar que no sea el mismo usuario
  IF p_user_id = p_target_user_id THEN
    RAISE EXCEPTION 'No puedes conectarte contigo mismo';
  END IF;
  
  -- Verificar si ya existe una solicitud pendiente o conexión aceptada
  IF EXISTS (
    SELECT 1 FROM user_connections
    WHERE (user_id = p_user_id AND target_user_id = p_target_user_id)
       OR (user_id = p_target_user_id AND target_user_id = p_user_id)
  ) THEN
    RAISE EXCEPTION 'Ya existe una solicitud de conexión entre estos usuarios';
  END IF;
  
  -- Obtener nombre del usuario que solicita
  SELECT COALESCE(full_name, nombre, username, 'Usuario') 
  INTO v_user_name
  FROM users 
  WHERE id = p_user_id;
  
  -- Crear la solicitud de conexión
  INSERT INTO user_connections (user_id, target_user_id, status)
  VALUES (p_user_id, p_target_user_id, 'pending')
  RETURNING id INTO v_connection_id;
  
  -- Crear notificación para el usuario objetivo
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    actor_id,
    is_read,
    created_at
  )
  VALUES (
    p_target_user_id,
    'connection_request',
    'Nueva solicitud de conexión',
    v_user_name || ' quiere conectarse contigo',
    p_user_id,
    false,
    NOW()
  )
  RETURNING id INTO v_notification_id;
  
  -- Retornar resultado
  RETURN json_build_object(
    'success', true,
    'connection_id', v_connection_id,
    'notification_id', v_notification_id,
    'message', 'Solicitud de conexión enviada'
  );
END;
$$;

-- 4. FUNCIÓN: Aceptar solicitud de conexión
-- ============================================================================
CREATE OR REPLACE FUNCTION accept_connection_request(
  p_connection_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_requester_id UUID;
  v_target_name TEXT;
BEGIN
  -- Verificar que la conexión existe y está pendiente
  SELECT user_id INTO v_requester_id
  FROM user_connections
  WHERE id = p_connection_id 
    AND target_user_id = p_user_id 
    AND status = 'pending';
  
  IF v_requester_id IS NULL THEN
    RAISE EXCEPTION 'Solicitud de conexión no encontrada o ya procesada';
  END IF;
  
  -- Actualizar estado a aceptado
  UPDATE user_connections
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_connection_id;
  
  -- Obtener nombre del usuario que acepta
  SELECT COALESCE(full_name, nombre, username, 'Usuario')
  INTO v_target_name
  FROM users
  WHERE id = p_user_id;
  
  -- Crear notificación para el usuario que solicitó
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    actor_id,
    is_read,
    created_at
  )
  VALUES (
    v_requester_id,
    'connection_accepted',
    'Conexión aceptada',
    v_target_name || ' aceptó tu solicitud de conexión',
    p_user_id,
    false,
    NOW()
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Solicitud de conexión aceptada'
  );
END;
$$;

-- 5. FUNCIÓN: Rechazar solicitud de conexión
-- ============================================================================
CREATE OR REPLACE FUNCTION reject_connection_request(
  p_connection_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar que la conexión existe y está pendiente
  IF NOT EXISTS (
    SELECT 1 FROM user_connections
    WHERE id = p_connection_id 
      AND target_user_id = p_user_id 
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Solicitud de conexión no encontrada o ya procesada';
  END IF;
  
  -- Actualizar estado a rechazado
  UPDATE user_connections
  SET status = 'rejected', updated_at = NOW()
  WHERE id = p_connection_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Solicitud de conexión rechazada'
  );
END;
$$;

-- 6. FUNCIÓN: Obtener solicitudes de conexión pendientes
-- ============================================================================
CREATE OR REPLACE FUNCTION get_pending_connection_requests(
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  user_username TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.id,
    uc.user_id,
    COALESCE(u.full_name, u.nombre, u.username) as user_name,
    COALESCE(u.avatar_url, u.photo_url) as user_avatar,
    u.username as user_username,
    uc.created_at
  FROM user_connections uc
  INNER JOIN users u ON u.id = uc.user_id
  WHERE uc.target_user_id = p_user_id
    AND uc.status = 'pending'
  ORDER BY uc.created_at DESC;
END;
$$;

-- 7. FUNCIÓN: Obtener conexiones del usuario
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_connections(
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  connected_user_id UUID,
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
      WHEN uc.user_id = p_user_id THEN uc.target_user_id
      ELSE uc.user_id
    END as connected_user_id,
    COALESCE(u.full_name, u.nombre, u.username) as user_name,
    COALESCE(u.avatar_url, u.photo_url) as user_avatar,
    u.username as user_username,
    uc.updated_at as connected_at
  FROM user_connections uc
  INNER JOIN users u ON u.id = CASE 
    WHEN uc.user_id = p_user_id THEN uc.target_user_id
    ELSE uc.user_id
  END
  WHERE (uc.user_id = p_user_id OR uc.target_user_id = p_user_id)
    AND uc.status = 'accepted'
  ORDER BY uc.updated_at DESC;
END;
$$;

-- 8. POLÍTICAS RLS (Row Level Security)
-- ============================================================================
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propias conexiones
CREATE POLICY "Users can view their own connections"
  ON user_connections FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = target_user_id);

-- Los usuarios pueden crear solicitudes de conexión
CREATE POLICY "Users can create connection requests"
  ON user_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar conexiones donde son el objetivo
CREATE POLICY "Users can update their received connections"
  ON user_connections FOR UPDATE
  USING (auth.uid() = target_user_id);

-- Los usuarios pueden eliminar sus propias conexiones
CREATE POLICY "Users can delete their own connections"
  ON user_connections FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = target_user_id);

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================
COMMENT ON TABLE user_connections IS 'Tabla de conexiones entre usuarios con sistema de solicitud/aceptación';
COMMENT ON FUNCTION are_users_connected IS 'Verifica si dos usuarios tienen una conexión aceptada';
COMMENT ON FUNCTION request_user_connection IS 'Crea una solicitud de conexión y notifica al usuario objetivo';
COMMENT ON FUNCTION accept_connection_request IS 'Acepta una solicitud de conexión y notifica al solicitante';
COMMENT ON FUNCTION reject_connection_request IS 'Rechaza una solicitud de conexión';
COMMENT ON FUNCTION get_pending_connection_requests IS 'Obtiene las solicitudes de conexión pendientes del usuario';
COMMENT ON FUNCTION get_user_connections IS 'Obtiene todas las conexiones aceptadas del usuario';
