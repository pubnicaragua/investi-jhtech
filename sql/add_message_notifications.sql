-- ============================================================================
-- NOTIFICACIONES DE MENSAJES
-- ============================================================================
-- Crear trigger para generar notificaciones cuando llega un mensaje nuevo
-- Esto permite que los usuarios reciban notificaciones de mensajes en tiempo real

-- 1. Función para crear notificación de mensaje
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
  conversation_type TEXT;
BEGIN
  -- Obtener nombre del remitente
  SELECT nombre INTO sender_name FROM users WHERE id = NEW.sender_id;
  
  -- Obtener tipo de conversación y destinatario
  SELECT type INTO conversation_type FROM conversations WHERE id = NEW.conversation_id;
  
  -- Para conversaciones directas, encontrar el otro participante
  IF conversation_type = 'direct' THEN
    SELECT 
      CASE 
        WHEN participant_one = NEW.sender_id THEN participant_two
        ELSE participant_one
      END INTO recipient_id
    FROM conversations
    WHERE id = NEW.conversation_id;
    
    -- Crear notificación para el destinatario
    IF recipient_id IS NOT NULL AND recipient_id != NEW.sender_id THEN
      INSERT INTO notifications (
        user_id,
        type,
        title,
        body,
        actor_id,
        from_user_id,
        created_at,
        is_read
      ) VALUES (
        recipient_id,
        'message',
        'Nuevo mensaje',
        sender_name || ' te envió un mensaje',
        NEW.sender_id,
        NEW.sender_id,
        NOW(),
        FALSE
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear trigger en tabla messages
DROP TRIGGER IF EXISTS trigger_message_notification ON messages;
CREATE TRIGGER trigger_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- 3. Función para crear notificación de mensaje de comunidad
CREATE OR REPLACE FUNCTION create_community_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  channel_name TEXT;
  member_record RECORD;
BEGIN
  -- Obtener nombre del remitente
  SELECT nombre INTO sender_name FROM users WHERE id = NEW.user_id;
  
  -- Obtener nombre del canal
  SELECT name INTO channel_name FROM community_channels WHERE id = NEW.channel_id;
  
  -- Notificar a todos los miembros del canal excepto el remitente
  FOR member_record IN 
    SELECT DISTINCT cm.user_id
    FROM community_members cm
    JOIN community_channels cc ON cc.community_id = cm.community_id
    WHERE cc.id = NEW.channel_id
      AND cm.user_id != NEW.user_id
  LOOP
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      actor_id,
      from_user_id,
      created_at,
      is_read
    ) VALUES (
      member_record.user_id,
      'message',
      'Nuevo mensaje en ' || COALESCE(channel_name, 'canal'),
      sender_name || ': ' || LEFT(NEW.content, 50),
      NEW.user_id,
      NEW.user_id,
      NOW(),
      FALSE
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger en tabla community_messages
DROP TRIGGER IF EXISTS trigger_community_message_notification ON community_messages;
CREATE TRIGGER trigger_community_message_notification
  AFTER INSERT ON community_messages
  FOR EACH ROW
  EXECUTE FUNCTION create_community_message_notification();

-- 5. Comentarios
COMMENT ON FUNCTION create_message_notification() IS 'Crea notificación cuando llega mensaje directo';
COMMENT ON FUNCTION create_community_message_notification() IS 'Crea notificación cuando llega mensaje de comunidad';
