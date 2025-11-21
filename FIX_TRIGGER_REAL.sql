-- ============================================
-- 🔧 ARREGLO REAL DEL TRIGGER
-- ============================================

-- El problema es que on_post_creation llama a trigger_post_creation()
-- que NO EXISTE o está mal implementada

-- 1. Ver qué hace la función
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'trigger_post_creation';

-- 2. ELIMINAR EL TRIGGER PROBLEMÁTICO
DROP TRIGGER IF EXISTS on_post_creation ON posts;

-- 3. ELIMINAR LA FUNCIÓN PROBLEMÁTICA
DROP FUNCTION IF EXISTS trigger_post_creation() CASCADE;

-- 4. VERIFICAR QUE SE ELIMINÓ
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'posts';

-- 5. SI AÚN APARECE, FORZAR ELIMINACIÓN
DO $$
BEGIN
    -- Eliminar todos los triggers que puedan causar problemas
    EXECUTE 'DROP TRIGGER IF EXISTS on_post_creation ON posts CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS trigger_post_creation() CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS handle_new_post() CASCADE';
    RAISE NOTICE '✅ Triggers problemáticos eliminados';
END $$;
