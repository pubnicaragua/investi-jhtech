-- =====================================================
-- SCRIPT DE CORRECCIÓN CRÍTICA - INVESTI APP
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. CORREGIR ESTRUCTURA DE MENSAJES
-- =====================================================

-- Verificar si la columna conversation_id existe en messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'conversation_id'
    ) THEN
        ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id);
        CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
    END IF;
END $$;

-- Verificar si la columna content existe en messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'content'
    ) THEN
        ALTER TABLE messages ADD COLUMN content TEXT;
    END IF;
END $$;

-- Crear tabla message_reads si no existe
CREATE TABLE IF NOT EXISTS message_reads (
    conversation_id UUID REFERENCES conversations(id),
    user_id UUID REFERENCES users(id),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- Habilitar RLS en message_reads
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- Política para message_reads
DROP POLICY IF EXISTS "Users can manage their own read status" ON message_reads;
CREATE POLICY "Users can manage their own read status" ON message_reads
    FOR ALL USING (auth.uid() = user_id);

-- 2. CORREGIR ESTRUCTURA DE EDUCACIÓN
-- =====================================================

-- Agregar columnas faltantes en courses
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE courses 
        ADD COLUMN category TEXT,
        ADD COLUMN duracion_total INTEGER,
        ADD COLUMN total_lecciones INTEGER;
    END IF;
END $$;

-- Agregar columnas faltantes en lessons
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'lessons' 
        AND column_name = 'duration'
    ) THEN
        ALTER TABLE lessons 
        ADD COLUMN duration INTEGER,
        ADD COLUMN tipo TEXT DEFAULT 'video',
        ADD COLUMN orden INTEGER;
    END IF;
END $$;

-- 3. CORREGIR ESTRUCTURA DE COMUNIDADES
-- =====================================================

-- Verificar columnas en user_communities
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_communities' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE user_communities 
        ADD COLUMN status TEXT DEFAULT 'active',
        ADD COLUMN joined_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 4. CREAR TABLAS FALTANTES PARA FINANZAS
-- =====================================================

-- Tabla de presupuestos
CREATE TABLE IF NOT EXISTS user_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    spent DECIMAL(12,2) DEFAULT 0,
    period TEXT DEFAULT 'monthly', -- monthly, weekly, yearly
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS user_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES user_budgets(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency TEXT, -- daily, weekly, monthly, yearly
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREAR TABLAS PARA NOTIFICACIONES MEJORADAS
-- =====================================================

-- Mejorar tabla de notificaciones si es necesario
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'action_url'
    ) THEN
        ALTER TABLE notifications 
        ADD COLUMN action_url TEXT,
        ADD COLUMN actor_id UUID REFERENCES users(id),
        ADD COLUMN target_object JSONB;
    END IF;
END $$;

-- 6. CREAR FUNCIONES RPC FALTANTES
-- =====================================================

-- Función para obtener estadísticas rápidas del usuario
CREATE OR REPLACE FUNCTION get_user_quick_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'notifications_count', (
            SELECT COUNT(*) FROM notifications 
            WHERE user_id = p_user_id AND is_read = false
        ),
        'messages_count', (
            SELECT COUNT(*) FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE (c.participant_one = p_user_id OR c.participant_two = p_user_id)
            AND m.sender_id != p_user_id
            AND m.created_at > COALESCE((
                SELECT last_read_at FROM message_reads 
                WHERE user_id = p_user_id AND conversation_id = c.id
            ), '1970-01-01'::timestamptz)
        ),
        'followers_count', (
            SELECT COUNT(*) FROM user_follows 
            WHERE following_id = p_user_id
        ),
        'following_count', (
            SELECT COUNT(*) FROM user_follows 
            WHERE follower_id = p_user_id
        ),
        'posts_count', (
            SELECT COUNT(*) FROM posts 
            WHERE user_id = p_user_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para marcar mensajes como leídos
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_conversation_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO message_reads (conversation_id, user_id, last_read_at)
    VALUES (p_conversation_id, p_user_id, NOW())
    ON CONFLICT (conversation_id, user_id) 
    DO UPDATE SET last_read_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener conversaciones del usuario
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    type TEXT,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    unread_count BIGINT,
    other_participant JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.type,
        c.last_message,
        c.last_message_at,
        COALESCE((
            SELECT COUNT(*) FROM messages m
            WHERE m.conversation_id = c.id
            AND m.sender_id != p_user_id
            AND m.created_at > COALESCE((
                SELECT last_read_at FROM message_reads 
                WHERE user_id = p_user_id AND conversation_id = c.id
            ), '1970-01-01'::timestamptz)
        ), 0) as unread_count,
        CASE 
            WHEN c.participant_one = p_user_id THEN
                (SELECT json_build_object(
                    'id', u.id,
                    'nombre', u.nombre,
                    'avatar_url', u.avatar_url,
                    'is_online', u.is_online
                ) FROM users u WHERE u.id = c.participant_two)
            ELSE
                (SELECT json_build_object(
                    'id', u.id,
                    'nombre', u.nombre,
                    'avatar_url', u.avatar_url,
                    'is_online', u.is_online
                ) FROM users u WHERE u.id = c.participant_one)
        END as other_participant
    FROM conversations c
    WHERE c.participant_one = p_user_id OR c.participant_two = p_user_id
    ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CREAR TRIGGERS PARA AUTOMATIZACIÓN
-- =====================================================

-- Trigger para actualizar last_message en conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET 
        last_message = NEW.content,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_conversation_trigger'
    ) THEN
        CREATE TRIGGER update_conversation_trigger
        AFTER INSERT ON messages
        FOR EACH ROW
        EXECUTE FUNCTION update_conversation_last_message();
    END IF;
END $$;

-- 8. INSERTAR DATOS DE EJEMPLO PARA TESTING
-- =====================================================

-- Insertar categorías de cursos si no existen
INSERT INTO courses (titulo, descripcion, category, duracion_total, total_lecciones)
VALUES 
    ('Finanzas Básicas', 'Introducción a las finanzas personales', 'finanzas_basicas', 120, 8),
    ('Inversiones 101', 'Conceptos básicos de inversión', 'inversiones', 180, 12),
    ('Criptomonedas', 'Guía completa de criptomonedas', 'crypto', 90, 6)
ON CONFLICT DO NOTHING;

-- Insertar lecciones de ejemplo
INSERT INTO lessons (course_id, titulo, descripcion, duration, tipo, orden)
SELECT 
    c.id,
    'Lección ' || generate_series(1, 3),
    'Descripción de la lección ' || generate_series(1, 3),
    15 + (generate_series(1, 3) * 5),
    'video',
    generate_series(1, 3)
FROM courses c
WHERE c.category IN ('finanzas_basicas', 'inversiones', 'crypto')
ON CONFLICT DO NOTHING;

-- 9. VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Política para user_budgets
ALTER TABLE user_budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own budgets" ON user_budgets;
CREATE POLICY "Users can manage their own budgets" ON user_budgets
    FOR ALL USING (auth.uid() = user_id);

-- Política para user_transactions
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own transactions" ON user_transactions;
CREATE POLICY "Users can manage their own transactions" ON user_transactions
    FOR ALL USING (auth.uid() = user_id);

-- 10. CREAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para mensajes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Índices para finanzas
CREATE INDEX IF NOT EXISTS idx_user_budgets_user_active ON user_budgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_date ON user_transactions(user_id, date);

-- =====================================================
-- FIN DEL SCRIPT DE CORRECCIÓN
-- =====================================================

-- Verificar que todo se ejecutó correctamente
SELECT 'Script de corrección ejecutado correctamente' as status;
