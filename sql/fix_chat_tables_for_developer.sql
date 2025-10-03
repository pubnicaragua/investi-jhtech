-- =====================================================
-- CORRECCIONES PARA SISTEMA DE CHAT
-- Fecha: 2025-10-02
-- Desarrollador: +53 5 4374371
-- =====================================================
-- 
-- RESUMEN DE CAMBIOS:
-- 1. Agregar campo unread_count a la tabla chats
-- 2. Modificar tabla messages:
--    - Agregar receiver_id (destinatario del mensaje)
--    - Agregar media_url (para archivos multimedia)
--    - Agregar message_type (tipo de mensaje: text, image, file, etc.)
--    - Eliminar campo duplicado (contenido/content)
--    - Eliminar conversation_id (ya existe chat_id)
-- 
-- =====================================================

-- =====================================================
-- PASO 1: AGREGAR unread_count A LA TABLA chats
-- =====================================================

-- Agregar columna unread_count con valor por defecto 0
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0;

-- Comentario para documentar el campo
COMMENT ON COLUMN public.chats.unread_count IS 'Contador de mensajes no leídos en el chat';

-- =====================================================
-- PASO 2: MODIFICAR TABLA messages
-- =====================================================

-- 2.1 Agregar receiver_id (destinatario del mensaje)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES public.users(id);

COMMENT ON COLUMN public.messages.receiver_id IS 'ID del usuario que recibe el mensaje';

-- 2.2 Agregar media_url (para archivos multimedia)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS media_url TEXT;

COMMENT ON COLUMN public.messages.media_url IS 'URL del archivo multimedia adjunto (imagen, video, documento, etc.)';

-- 2.3 Agregar message_type (tipo de mensaje)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' 
CHECK (message_type IN ('text', 'image', 'video', 'file', 'audio', 'voice'));

COMMENT ON COLUMN public.messages.message_type IS 'Tipo de mensaje: text, image, video, file, audio, voice';

-- 2.4 Eliminar campos duplicados si existen
-- Primero verificamos si existe 'content' (duplicado de 'contenido')
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'messages' 
        AND column_name = 'content'
    ) THEN
        -- Si existe 'content', copiamos datos a 'contenido' si es necesario
        UPDATE public.messages 
        SET contenido = COALESCE(contenido, content)
        WHERE contenido IS NULL OR contenido = '';
        
        -- Eliminamos la columna 'content'
        ALTER TABLE public.messages DROP COLUMN IF EXISTS content;
    END IF;
END $$;

-- 2.5 Eliminar conversation_id si existe (ya tenemos chat_id)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'messages' 
        AND column_name = 'conversation_id'
    ) THEN
        -- Si existe 'conversation_id', copiamos datos a 'chat_id' si es necesario
        UPDATE public.messages 
        SET chat_id = COALESCE(chat_id, conversation_id)
        WHERE chat_id IS NULL;
        
        -- Eliminamos la columna 'conversation_id'
        ALTER TABLE public.messages DROP COLUMN IF EXISTS conversation_id;
    END IF;
END $$;

-- =====================================================
-- PASO 3: CREAR ÍNDICES PARA MEJORAR PERFORMANCE
-- =====================================================

-- Índice para receiver_id (búsquedas de mensajes recibidos)
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id 
ON public.messages(receiver_id);

-- Índice para message_type (filtrar por tipo de mensaje)
CREATE INDEX IF NOT EXISTS idx_messages_message_type 
ON public.messages(message_type);

-- Índice compuesto para chat_id y created_at (ordenar mensajes por chat)
CREATE INDEX IF NOT EXISTS idx_messages_chat_created 
ON public.messages(chat_id, created_at DESC);

-- =====================================================
-- PASO 4: ACTUALIZAR POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Users can read their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- Política para leer mensajes: solo si eres sender o receiver
CREATE POLICY "Users can read their messages" 
ON public.messages
FOR SELECT
USING (
    auth.uid() = sender_id 
    OR auth.uid() = receiver_id
    OR EXISTS (
        SELECT 1 FROM public.chat_participants 
        WHERE chat_id = messages.chat_id 
        AND user_id = auth.uid()
    )
);

-- Política para enviar mensajes: solo si eres participante del chat
CREATE POLICY "Users can send messages" 
ON public.messages
FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.chat_participants 
        WHERE chat_id = messages.chat_id 
        AND user_id = auth.uid()
    )
);

-- Política para actualizar mensajes: solo tus propios mensajes
CREATE POLICY "Users can update own messages" 
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id);

-- Política para eliminar mensajes: solo tus propios mensajes
CREATE POLICY "Users can delete own messages" 
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id);

-- =====================================================
-- PASO 5: CREAR FUNCIÓN PARA ACTUALIZAR unread_count
-- =====================================================

-- Función que se ejecuta cuando se inserta un nuevo mensaje
CREATE OR REPLACE FUNCTION update_chat_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Incrementar el contador de mensajes no leídos
    UPDATE public.chats
    SET unread_count = unread_count + 1
    WHERE id = NEW.chat_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que ejecuta la función al insertar un mensaje
DROP TRIGGER IF EXISTS trigger_update_unread_count ON public.messages;
CREATE TRIGGER trigger_update_unread_count
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_unread_count();

-- =====================================================
-- PASO 6: CREAR FUNCIÓN PARA MARCAR MENSAJES COMO LEÍDOS
-- =====================================================

-- Función para resetear el contador cuando se leen los mensajes
CREATE OR REPLACE FUNCTION mark_chat_as_read(chat_id_param UUID, user_id_param UUID)
RETURNS void AS $$
BEGIN
    -- Resetear el contador de mensajes no leídos
    UPDATE public.chats
    SET unread_count = 0
    WHERE id = chat_id_param;
    
    -- Opcional: Actualizar read_at en chat_messages si existe esa tabla
    UPDATE public.chat_messages
    SET read_at = NOW()
    WHERE chat_id = chat_id_param
    AND sender_id != user_id_param
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 7: VALIDACIÓN DE CAMBIOS
-- =====================================================

-- Verificar estructura de la tabla messages
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'messages'
ORDER BY ordinal_position;

-- Verificar estructura de la tabla chats
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'chats'
ORDER BY ordinal_position;

-- =====================================================
-- NOTAS IMPORTANTES PARA EL DESARROLLADOR
-- =====================================================

/*
ESTRUCTURA FINAL DE LA TABLA messages:
- id: UUID (PK)
- chat_id: UUID (FK a chats)
- sender_id: UUID (FK a users) - quien envía
- receiver_id: UUID (FK a users) - quien recibe
- contenido: TEXT - contenido del mensaje
- media_url: TEXT - URL del archivo multimedia (opcional)
- message_type: TEXT - tipo: 'text', 'image', 'video', 'file', 'audio', 'voice'
- created_at: TIMESTAMP

ESTRUCTURA FINAL DE LA TABLA chats:
- id: UUID (PK)
- user1_id: UUID (FK a users)
- user2_id: UUID (FK a users)
- community_id: UUID (FK a communities) - opcional
- unread_count: INTEGER - contador de mensajes no leídos
- created_at: TIMESTAMP

FUNCIONES DISPONIBLES:
1. update_chat_unread_count() - Se ejecuta automáticamente al insertar mensaje
2. mark_chat_as_read(chat_id, user_id) - Llamar cuando el usuario lee los mensajes

EJEMPLO DE USO:
-- Enviar mensaje de texto
INSERT INTO messages (chat_id, sender_id, receiver_id, contenido, message_type)
VALUES ('chat-uuid', 'sender-uuid', 'receiver-uuid', 'Hola!', 'text');

-- Enviar mensaje con imagen
INSERT INTO messages (chat_id, sender_id, receiver_id, contenido, media_url, message_type)
VALUES ('chat-uuid', 'sender-uuid', 'receiver-uuid', 'Mira esta foto', 'https://...', 'image');

-- Marcar chat como leído
SELECT mark_chat_as_read('chat-uuid', 'user-uuid');

SEGURIDAD:
- RLS está habilitado
- Solo puedes leer mensajes donde eres sender o receiver
- Solo puedes enviar mensajes en chats donde eres participante
- Solo puedes editar/eliminar tus propios mensajes
*/

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

SELECT '✅ Script ejecutado exitosamente. Tablas actualizadas.' as status;
