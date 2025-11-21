-- ============================================
-- 🔧 ARREGLAR TRIGGERS Y COLUMNAS FALTANTES
-- ============================================

-- 1. Verificar si existe la columna last_activity_date en posts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'last_activity_date'
    ) THEN
        -- Si no existe, agregarla
        ALTER TABLE posts ADD COLUMN last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna last_activity_date agregada a posts';
    ELSE
        RAISE NOTICE 'Columna last_activity_date ya existe';
    END IF;
END $$;

-- 2. Verificar triggers problemáticos
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'posts'
AND trigger_name LIKE '%activity%';

-- 3. Si hay triggers que causan problemas, deshabilitarlos temporalmente
-- (Ejecutar solo si ves triggers problemáticos en el resultado anterior)
-- DROP TRIGGER IF EXISTS update_last_activity ON posts;

-- 4. Crear trigger correcto para last_activity_date
CREATE OR REPLACE FUNCTION update_post_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity_date = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_post_activity ON posts;
CREATE TRIGGER set_post_activity
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_activity();

-- 5. Verificar columna poll_duration
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'poll_duration'
    ) THEN
        ALTER TABLE posts ADD COLUMN poll_duration INTEGER DEFAULT 7;
        RAISE NOTICE 'Columna poll_duration agregada a posts';
    ELSE
        RAISE NOTICE 'Columna poll_duration ya existe';
    END IF;
END $$;

-- 6. Verificar columna poll_options
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'poll_options'
    ) THEN
        ALTER TABLE posts ADD COLUMN poll_options TEXT[];
        RAISE NOTICE 'Columna poll_options agregada a posts';
    ELSE
        RAISE NOTICE 'Columna poll_options ya existe';
    END IF;
END $$;

-- 7. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_posts_last_activity ON posts(last_activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_poll ON posts(id) WHERE poll_options IS NOT NULL;

-- ============================================
-- ✅ VERIFICACIÓN FINAL
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name IN ('last_activity_date', 'poll_options', 'poll_duration')
ORDER BY column_name;
