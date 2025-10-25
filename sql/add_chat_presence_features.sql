-- Agregar features de presencia en chat
-- Estado en línea, última actividad, escribiendo, mensajes vistos

-- 1. Agregar columnas a tabla users para presencia
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Agregar columnas a tabla messages para estado de lectura
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Crear tabla para estado "escribiendo"
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation ON typing_indicators(conversation_id);

-- 5. Función para actualizar estado en línea
CREATE OR REPLACE FUNCTION update_user_online_status(p_user_id UUID, p_is_online BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    is_online = p_is_online,
    last_seen_at = CASE WHEN p_is_online = FALSE THEN NOW() ELSE last_seen_at END
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para marcar mensaje como leído
CREATE OR REPLACE FUNCTION mark_message_read(p_message_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET read_at = NOW()
  WHERE id = p_message_id AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Función para limpiar indicadores de "escribiendo" antiguos (>5 segundos)
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS VOID AS $$
BEGIN
  DELETE FROM typing_indicators
  WHERE created_at < NOW() - INTERVAL '5 seconds';
END;
$$ LANGUAGE plpgsql;

-- 8. RLS Policies para typing_indicators
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own typing indicators" ON typing_indicators;
CREATE POLICY "Users can insert own typing indicators" ON typing_indicators
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own typing indicators" ON typing_indicators;
CREATE POLICY "Users can delete own typing indicators" ON typing_indicators
  FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view typing in their conversations" ON typing_indicators;
CREATE POLICY "Users can view typing in their conversations" ON typing_indicators
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = typing_indicators.conversation_id
      AND (conversations.participant_one = auth.uid() OR conversations.participant_two = auth.uid())
    )
  );

COMMENT ON TABLE typing_indicators IS 'Indicadores de "usuario está escribiendo" en tiempo real';
COMMENT ON COLUMN users.is_online IS 'Estado en línea del usuario';
COMMENT ON COLUMN users.last_seen_at IS 'Última vez que el usuario estuvo activo';
COMMENT ON COLUMN messages.read_at IS 'Timestamp cuando el mensaje fue leído';
COMMENT ON COLUMN messages.delivered_at IS 'Timestamp cuando el mensaje fue entregado';
