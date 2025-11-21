-- ============================================
-- 🔧 ARREGLO DEFINITIVO - ELIMINAR TRIGGERS PROBLEMÁTICOS
-- ============================================

-- 1. Ver qué hace cada trigger
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_statement,
    t.action_timing
FROM information_schema.triggers t
WHERE t.event_object_table = 'posts'
ORDER BY t.trigger_name;

-- 2. ELIMINAR TRIGGER QUE CAUSA PROBLEMA AL ELIMINAR
-- Este trigger está llamando una función incorrectamente
DROP TRIGGER IF EXISTS on_post_creation ON posts;

-- 3. ELIMINAR FUNCIÓN PROBLEMÁTICA
DROP FUNCTION IF EXISTS handle_new_post() CASCADE;
DROP FUNCTION IF EXISTS on_post_creation() CASCADE;

-- 4. VERIFICAR COLUMNAS
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name IN ('last_activity_date', 'created_at', 'updated_at');

-- 5. SI last_activity_date NO EXISTE, CREARLA
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'last_activity_date'
    ) THEN
        ALTER TABLE posts ADD COLUMN last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 6. VERIFICAR TRIGGERS RESTANTES
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'posts';
