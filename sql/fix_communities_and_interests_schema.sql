-- =====================================================
-- FIX: Agregar columnas faltantes para Comunidades Recomendadas
-- =====================================================

-- 1. Agregar columna cover_image_url a communities
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 2. Agregar columna banner_url si no existe (alias de cover_image_url)
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 3. Crear tabla user_interests si no existe
CREATE TABLE IF NOT EXISTS user_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest_id UUID REFERENCES investment_interests(id) ON DELETE CASCADE,
    interest_name TEXT,
    experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, interest_id)
);

-- 4. Crear índices para user_interests
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest_id ON user_interests(interest_id);

-- 5. Crear tabla user_knowledge si no existe
CREATE TABLE IF NOT EXISTS user_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('basic', 'intermediate', 'advanced')),
    specific_areas TEXT[],
    learning_goals TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 6. Crear índice para user_knowledge
CREATE INDEX IF NOT EXISTS idx_user_knowledge_user_id ON user_knowledge(user_id);

-- 7. Actualizar trigger para updated_at en user_interests
CREATE TRIGGER update_user_interests_updated_at 
    BEFORE UPDATE ON user_interests
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Actualizar trigger para updated_at en user_knowledge
CREATE TRIGGER update_user_knowledge_updated_at 
    BEFORE UPDATE ON user_knowledge
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Agregar columna avatar_url a communities si no existe (para compatibilidad)
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 10. Actualizar communities existentes para usar icono_url como avatar_url
UPDATE communities 
SET avatar_url = icono_url 
WHERE avatar_url IS NULL AND icono_url IS NOT NULL;

-- 11. Agregar columna category a communities si no existe
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS category TEXT;

-- 12. Agregar columna is_verified a communities si no existe
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para obtener intereses de un usuario
CREATE OR REPLACE FUNCTION get_user_interests(p_user_id UUID)
RETURNS TABLE (
    interest_id UUID,
    interest_name TEXT,
    experience_level TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ui.interest_id,
        COALESCE(ii.name, ui.interest_name) as interest_name,
        ui.experience_level
    FROM user_interests ui
    LEFT JOIN investment_interests ii ON ui.interest_id = ii.id
    WHERE ui.user_id = p_user_id;
END;
$$;

-- Función para guardar intereses de usuario (upsert)
CREATE OR REPLACE FUNCTION save_user_interests(
    p_user_id UUID,
    p_interest_ids UUID[],
    p_experience_level TEXT DEFAULT 'beginner'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    interest_id UUID;
BEGIN
    -- Eliminar intereses anteriores
    DELETE FROM user_interests WHERE user_id = p_user_id;
    
    -- Insertar nuevos intereses
    FOREACH interest_id IN ARRAY p_interest_ids
    LOOP
        INSERT INTO user_interests (user_id, interest_id, experience_level)
        VALUES (p_user_id, interest_id, p_experience_level)
        ON CONFLICT (user_id, interest_id) 
        DO UPDATE SET 
            experience_level = EXCLUDED.experience_level,
            updated_at = NOW();
    END LOOP;
END;
$$;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las columnas se agregaron correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('communities', 'user_interests', 'user_knowledge')
    AND column_name IN ('cover_image_url', 'banner_url', 'avatar_url', 'interest_id', 'interest_name', 'level')
ORDER BY table_name, column_name;

-- Verificar que las tablas existen
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('communities', 'user_interests', 'user_knowledge') 
        THEN '✅ Existe'
        ELSE '❌ Falta'
    END as estado
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('communities', 'user_interests', 'user_knowledge')
ORDER BY table_name;

SELECT '✅ Script ejecutado exitosamente - Columnas y tablas creadas' as status;
