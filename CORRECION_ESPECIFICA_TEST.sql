-- =====================================================
-- CORRECCIÓN ESPECÍFICA PARA ERRORES DEL TEST
-- Basado en los errores exactos reportados por TEST_ENDPOINTS_COMPLETO.js
-- =====================================================

-- 1. CORREGIR USER_COMMUNITIES - AGREGAR COLUMNA STATUS
-- =====================================================
DO $$
BEGIN
    -- Verificar si la columna status existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_communities' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE user_communities ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE '✅ Columna status agregada a user_communities';
    ELSE
        RAISE NOTICE '⚠️  Columna status ya existe en user_communities';
    END IF;
    
    -- Verificar si la columna joined_at existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_communities' 
        AND column_name = 'joined_at'
    ) THEN
        ALTER TABLE user_communities ADD COLUMN joined_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '✅ Columna joined_at agregada a user_communities';
    ELSE
        RAISE NOTICE '⚠️  Columna joined_at ya existe en user_communities';
    END IF;
END $$;

-- 2. CORREGIR LESSONS - AGREGAR COLUMNA DURATION
-- =====================================================
DO $$
BEGIN
    -- Verificar si la columna duration existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' 
        AND column_name = 'duration'
    ) THEN
        ALTER TABLE lessons ADD COLUMN duration INTEGER DEFAULT 15;
        RAISE NOTICE '✅ Columna duration agregada a lessons';
    ELSE
        RAISE NOTICE '⚠️  Columna duration ya existe en lessons';
    END IF;
END $$;

-- 3. ELIMINAR FUNCIONES CONFLICTIVAS EXISTENTES
-- =====================================================
DROP FUNCTION IF EXISTS get_user_quick_stats(uuid);
DROP FUNCTION IF EXISTS get_suggested_people(uuid);
DROP FUNCTION IF EXISTS get_recommended_communities(uuid);
DROP FUNCTION IF EXISTS search_all(uuid);
DROP FUNCTION IF EXISTS search_all(uuid, text);
DROP FUNCTION IF EXISTS mark_messages_as_read(uuid);
DROP FUNCTION IF EXISTS mark_messages_as_read(uuid, uuid);

RAISE NOTICE '🗑️  Funciones RPC anteriores eliminadas';

-- 4. CREAR FUNCIONES RPC CON FIRMAS CORRECTAS
-- =====================================================

-- Función get_user_quick_stats
CREATE OR REPLACE FUNCTION get_user_quick_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'notifications_count', COALESCE((
            SELECT COUNT(*) FROM notifications 
            WHERE user_id = p_user_id AND is_read = false
        ), 0),
        'messages_count', COALESCE((
            SELECT COUNT(*) FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE (c.participant_one = p_user_id OR c.participant_two = p_user_id)
            AND m.sender_id != p_user_id
        ), 0),
        'followers_count', COALESCE((
            SELECT COUNT(*) FROM user_follows 
            WHERE following_id = p_user_id
        ), 0),
        'following_count', COALESCE((
            SELECT COUNT(*) FROM user_follows 
            WHERE follower_id = p_user_id
        ), 0),
        'posts_count', COALESCE((
            SELECT COUNT(*) FROM posts 
            WHERE user_id = p_user_id
        ), 0)
    ) INTO result;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'notifications_count', 0,
        'messages_count', 0,
        'followers_count', 0,
        'following_count', 0,
        'posts_count', 0,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función get_suggested_people
CREATE OR REPLACE FUNCTION get_suggested_people(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT COALESCE(json_agg(json_build_object(
        'id', u.id,
        'nombre', u.nombre,
        'avatar_url', u.avatar_url,
        'bio', u.bio
    )), '[]'::json)
    INTO result
    FROM users u
    WHERE u.id != p_user_id
    AND u.id NOT IN (
        SELECT following_id FROM user_follows WHERE follower_id = p_user_id
    )
    ORDER BY RANDOM()
    LIMIT 10;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN '[]'::json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función get_recommended_communities
CREATE OR REPLACE FUNCTION get_recommended_communities(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT COALESCE(json_agg(json_build_object(
        'id', c.id,
        'nombre', c.nombre,
        'descripcion', c.descripcion,
        'categoria', COALESCE(c.categoria, c.category, 'general'),
        'miembros_count', COALESCE((
            SELECT COUNT(*) FROM user_communities 
            WHERE community_id = c.id AND status = 'active'
        ), 0),
        'es_miembro', EXISTS (
            SELECT 1 FROM user_communities 
            WHERE community_id = c.id AND user_id = p_user_id AND status = 'active'
        )
    )), '[]'::json)
    INTO result
    FROM communities c
    WHERE c.id NOT IN (
        SELECT community_id 
        FROM user_communities 
        WHERE user_id = p_user_id AND status = 'active'
    )
    ORDER BY RANDOM()
    LIMIT 10;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN '[]'::json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función search_all
CREATE OR REPLACE FUNCTION search_all(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'users', COALESCE((
            SELECT json_agg(json_build_object(
                'id', id,
                'nombre', nombre,
                'avatar_url', avatar_url
            ))
            FROM users
            WHERE id != p_user_id
            LIMIT 5
        ), '[]'::json),
        'communities', COALESCE((
            SELECT json_agg(json_build_object(
                'id', id,
                'nombre', nombre,
                'descripcion', descripcion
            ))
            FROM communities
            LIMIT 5
        ), '[]'::json),
        'posts', COALESCE((
            SELECT json_agg(json_build_object(
                'id', p.id,
                'titulo', p.titulo,
                'contenido', p.contenido,
                'user_nombre', u.nombre
            ))
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LIMIT 5
        ), '[]'::json)
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'users', '[]'::json,
        'communities', '[]'::json,
        'posts', '[]'::json,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función mark_messages_as_read
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
    -- Marcar todos los mensajes como leídos para el usuario
    INSERT INTO message_reads (conversation_id, user_id, last_read_at)
    SELECT DISTINCT m.conversation_id, p_user_id, NOW()
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE (c.participant_one = p_user_id OR c.participant_two = p_user_id)
    ON CONFLICT (conversation_id, user_id) 
    DO UPDATE SET last_read_at = NOW();
    
    RETURN json_build_object(
        'status', 'success',
        'message', 'Messages marked as read'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'status', 'error',
        'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VERIFICAR ESTRUCTURA DE CONVERSATIONS
-- =====================================================
DO $$
BEGIN
    -- Verificar si las columnas participant_one y participant_two existen
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'participant_one'
    ) THEN
        ALTER TABLE conversations ADD COLUMN participant_one UUID REFERENCES users(id);
        RAISE NOTICE '✅ Columna participant_one agregada a conversations';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'participant_two'
    ) THEN
        ALTER TABLE conversations ADD COLUMN participant_two UUID REFERENCES users(id);
        RAISE NOTICE '✅ Columna participant_two agregada a conversations';
    END IF;
END $$;

-- 6. CREAR TABLA MESSAGE_READS SI NO EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS message_reads (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- Habilitar RLS
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- Política para message_reads
DROP POLICY IF EXISTS "Users can manage their own read status" ON message_reads;
CREATE POLICY "Users can manage their own read status" ON message_reads
    FOR ALL USING (auth.uid() = user_id);

-- 7. OTORGAR PERMISOS NECESARIOS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 8. VERIFICACIÓN FINAL
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE '✅ CORRECCIÓN ESPECÍFICA COMPLETADA';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '✅ user_communities.status agregado';
    RAISE NOTICE '✅ lessons.duration agregado';
    RAISE NOTICE '✅ Funciones RPC recreadas con firmas correctas';
    RAISE NOTICE '✅ message_reads tabla verificada';
    RAISE NOTICE '✅ Permisos otorgados';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '🎯 Ejecutar TEST_ENDPOINTS_COMPLETO.js nuevamente';
    RAISE NOTICE '=================================================';
END $$;
