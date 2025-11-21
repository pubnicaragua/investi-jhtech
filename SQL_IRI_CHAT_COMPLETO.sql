-- ============================================================================
-- SQL COMPLETO PARA CHAT DE IRI EN SUPABASE
-- ============================================================================
-- 
-- INSTRUCCIONES:
-- 1. Abrir Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- 2. Copiar y pegar TODO este archivo
-- 3. Ejecutar (Run)
-- 4. Verificar que se crearon las tablas y políticas
--
-- TIEMPO ESTIMADO: 2 minutos
-- ============================================================================

-- ============================================================================
-- TABLA 1: iri_chat_messages (Historial de Chat)
-- ============================================================================

-- Crear tabla principal de mensajes
CREATE TABLE IF NOT EXISTS iri_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para documentación
COMMENT ON TABLE iri_chat_messages IS 'Historial de conversaciones con IRI (chat de IA)';
COMMENT ON COLUMN iri_chat_messages.id IS 'ID único del mensaje';
COMMENT ON COLUMN iri_chat_messages.user_id IS 'ID del usuario que envió/recibió el mensaje';
COMMENT ON COLUMN iri_chat_messages.role IS 'Rol del mensaje: user (usuario) o assistant (IRI)';
COMMENT ON COLUMN iri_chat_messages.content IS 'Contenido del mensaje';
COMMENT ON COLUMN iri_chat_messages.created_at IS 'Fecha y hora de creación';
COMMENT ON COLUMN iri_chat_messages.updated_at IS 'Fecha y hora de última actualización';

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice por user_id (para cargar historial de un usuario)
CREATE INDEX IF NOT EXISTS idx_iri_chat_messages_user_id 
ON iri_chat_messages(user_id);

-- Índice por created_at (para ordenar mensajes cronológicamente)
CREATE INDEX IF NOT EXISTS idx_iri_chat_messages_created_at 
ON iri_chat_messages(created_at DESC);

-- Índice compuesto para queries comunes (user_id + created_at)
CREATE INDEX IF NOT EXISTS idx_iri_chat_messages_user_created 
ON iri_chat_messages(user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en la tabla
ALTER TABLE iri_chat_messages ENABLE ROW LEVEL SECURITY;

-- Política 1: Los usuarios pueden ver solo sus propios mensajes
CREATE POLICY "Users can view own messages" 
ON iri_chat_messages
FOR SELECT 
USING (auth.uid() = user_id);

-- Política 2: Los usuarios pueden crear mensajes
CREATE POLICY "Users can create messages" 
ON iri_chat_messages
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política 3: Los usuarios pueden actualizar solo sus propios mensajes
CREATE POLICY "Users can update own messages" 
ON iri_chat_messages
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política 4: Los usuarios pueden eliminar solo sus propios mensajes
CREATE POLICY "Users can delete own messages" 
ON iri_chat_messages
FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ============================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que ejecuta la función antes de cada UPDATE
CREATE TRIGGER update_iri_chat_messages_updated_at
BEFORE UPDATE ON iri_chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA 2: iri_conversations (OPCIONAL - Para estadísticas)
-- ============================================================================

-- Crear tabla de conversaciones (para análisis y estadísticas)
CREATE TABLE IF NOT EXISTS iri_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  voice_preference VARCHAR(50),
  sentiment VARCHAR(20),
  tokens_used INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios
COMMENT ON TABLE iri_conversations IS 'Registro de conversaciones completas con IRI (para análisis)';
COMMENT ON COLUMN iri_conversations.message IS 'Mensaje del usuario';
COMMENT ON COLUMN iri_conversations.response IS 'Respuesta de IRI';
COMMENT ON COLUMN iri_conversations.voice_preference IS 'Preferencia de voz (MALE/FEMALE)';
COMMENT ON COLUMN iri_conversations.sentiment IS 'Sentimiento del mensaje (positive/neutral/negative)';
COMMENT ON COLUMN iri_conversations.tokens_used IS 'Tokens consumidos en la API';
COMMENT ON COLUMN iri_conversations.response_time_ms IS 'Tiempo de respuesta en milisegundos';

-- Índices
CREATE INDEX IF NOT EXISTS idx_iri_conversations_user_id 
ON iri_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_iri_conversations_created_at 
ON iri_conversations(created_at DESC);

-- RLS
ALTER TABLE iri_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" 
ON iri_conversations
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" 
ON iri_conversations
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCIONES ÚTILES PARA ESTADÍSTICAS
-- ============================================================================

-- Función: Obtener total de mensajes de un usuario
CREATE OR REPLACE FUNCTION get_user_message_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM iri_chat_messages
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Obtener mensajes recientes de un usuario
CREATE OR REPLACE FUNCTION get_recent_messages(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  role VARCHAR(20),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.role,
    m.content,
    m.created_at
  FROM iri_chat_messages m
  WHERE m.user_id = p_user_id
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Limpiar mensajes antiguos (más de 90 días)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM iri_chat_messages
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VISTA PARA ESTADÍSTICAS (OPCIONAL)
-- ============================================================================

-- Vista: Estadísticas por usuario
CREATE OR REPLACE VIEW iri_user_stats AS
SELECT 
  user_id,
  COUNT(*) as total_messages,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as user_messages,
  COUNT(CASE WHEN role = 'assistant' THEN 1 END) as assistant_messages,
  MIN(created_at) as first_message_at,
  MAX(created_at) as last_message_at,
  DATE_PART('day', MAX(created_at) - MIN(created_at)) as days_active
FROM iri_chat_messages
GROUP BY user_id;

COMMENT ON VIEW iri_user_stats IS 'Estadísticas de uso del chat IRI por usuario';

-- ============================================================================
-- DATOS DE PRUEBA (OPCIONAL - Solo para testing)
-- ============================================================================

-- NOTA: Descomentar solo si quieres insertar datos de prueba
-- Reemplazar 'YOUR_USER_ID' con un UUID real de auth.users

/*
INSERT INTO iri_chat_messages (user_id, role, content) VALUES
  ('YOUR_USER_ID', 'assistant', '¡Hola! Soy Irï, tu asistente de educación financiera. ¿En qué puedo ayudarte hoy?'),
  ('YOUR_USER_ID', 'user', '¿Qué es una inversión?'),
  ('YOUR_USER_ID', 'assistant', 'Una inversión es cuando destinas dinero a un activo o proyecto con la expectativa de obtener ganancias en el futuro. Por ejemplo: acciones, bonos, bienes raíces, o tu propia educación. ¿Te gustaría saber sobre algún tipo específico de inversión?'),
  ('YOUR_USER_ID', 'user', '¿Cómo puedo empezar a ahorrar?'),
  ('YOUR_USER_ID', 'assistant', 'Excelente pregunta. Te recomiendo empezar con estos pasos: 1) Define una meta de ahorro clara, 2) Crea un presupuesto mensual, 3) Ahorra al menos el 10% de tus ingresos, 4) Usa la herramienta Caza Hormigas de Investí para encontrar gastos innecesarios. ¿Quieres que te explique más sobre alguno de estos pasos?');
*/

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
  -- Verificar tabla iri_chat_messages
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'iri_chat_messages') THEN
    RAISE NOTICE '✅ Tabla iri_chat_messages creada correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error: Tabla iri_chat_messages no se creó';
  END IF;

  -- Verificar tabla iri_conversations
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'iri_conversations') THEN
    RAISE NOTICE '✅ Tabla iri_conversations creada correctamente';
  ELSE
    RAISE NOTICE '⚠️ Advertencia: Tabla iri_conversations no se creó (opcional)';
  END IF;

  -- Verificar RLS habilitado
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE tablename = 'iri_chat_messages' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS habilitado en iri_chat_messages';
  ELSE
    RAISE EXCEPTION '❌ Error: RLS no habilitado en iri_chat_messages';
  END IF;

  -- Verificar políticas creadas
  IF EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'iri_chat_messages'
  ) THEN
    RAISE NOTICE '✅ Políticas RLS creadas correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error: No se crearon políticas RLS';
  END IF;

  RAISE NOTICE '🎉 ¡Instalación completada exitosamente!';
END $$;

-- ============================================================================
-- QUERIES ÚTILES PARA TESTING
-- ============================================================================

-- Ver todas las tablas relacionadas con IRI
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'iri%';

-- Ver todas las políticas RLS
-- SELECT * FROM pg_policies WHERE tablename = 'iri_chat_messages';

-- Ver índices creados
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'iri_chat_messages';

-- Contar mensajes totales
-- SELECT COUNT(*) FROM iri_chat_messages;

-- Ver estadísticas por usuario
-- SELECT * FROM iri_user_stats;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- NOTA: Si todo salió bien, deberías ver estos mensajes en la consola:
-- ✅ Tabla iri_chat_messages creada correctamente
-- ✅ Tabla iri_conversations creada correctamente
-- ✅ RLS habilitado en iri_chat_messages
-- ✅ Políticas RLS creadas correctamente
-- 🎉 ¡Instalación completada exitosamente!
