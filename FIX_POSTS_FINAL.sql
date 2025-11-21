-- ============================================
-- 🔧 ARREGLO FINAL DE POSTS
-- ============================================

-- 1. ELIMINAR TODOS LOS TRIGGERS PROBLEMÁTICOS
DROP TRIGGER IF EXISTS set_post_activity ON posts;
DROP TRIGGER IF EXISTS update_last_activity ON posts;
DROP TRIGGER IF EXISTS handle_post_activity ON posts;

-- 2. ELIMINAR FUNCIONES PROBLEMÁTICAS
DROP FUNCTION IF EXISTS update_post_activity() CASCADE;
DROP FUNCTION IF EXISTS handle_post_activity() CASCADE;

-- 3. VERIFICAR Y AGREGAR COLUMNA SI NO EXISTE
DO $$
BEGIN
    -- Verificar si existe last_activity_date
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts'
        AND column_name = 'last_activity_date'
    ) THEN
        ALTER TABLE posts ADD COLUMN last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Columna last_activity_date agregada';
    ELSE
        RAISE NOTICE '✅ Columna last_activity_date ya existe';
    END IF;

    -- Verificar si existe poll_options
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts'
        AND column_name = 'poll_options'
    ) THEN
        ALTER TABLE posts ADD COLUMN poll_options TEXT[] DEFAULT NULL;
        RAISE NOTICE '✅ Columna poll_options agregada';
    ELSE
        RAISE NOTICE '✅ Columna poll_options ya existe';
    END IF;

    -- Verificar si existe poll_duration
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'posts'
        AND column_name = 'poll_duration'
    ) THEN
        ALTER TABLE posts ADD COLUMN poll_duration INTEGER DEFAULT 7;
        RAISE NOTICE '✅ Columna poll_duration agregada';
    ELSE
        RAISE NOTICE '✅ Columna poll_duration ya existe';
    END IF;
END $$;

-- 4. ACTUALIZAR POSTS EXISTENTES QUE NO TENGAN last_activity_date
UPDATE posts
SET last_activity_date = created_at
WHERE last_activity_date IS NULL;

-- 5. VERIFICACIÓN FINAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name IN ('last_activity_date', 'poll_options', 'poll_duration')
ORDER BY column_name;

-- 6. VERIFICAR QUE NO HAYA TRIGGERS
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'posts';
