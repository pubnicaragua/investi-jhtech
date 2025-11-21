-- ============================================
-- 🧹 LIMPIAR TODO Y ARREGLAR TRIGGERS
-- ============================================

-- 1. ELIMINAR TRIGGER PROBLEMÁTICO
DROP TRIGGER IF EXISTS on_post_creation ON posts CASCADE;
DROP FUNCTION IF EXISTS trigger_post_creation() CASCADE;

-- 2. ELIMINAR ENCUESTAS ROTAS (opcional - solo si quieres limpiar)
-- Descomenta si quieres eliminar encuestas que no se muestran
/*
DELETE FROM posts 
WHERE poll_options IS NOT NULL 
AND created_at > NOW() - INTERVAL '4 hours';
*/

-- 3. VERIFICAR TRIGGERS RESTANTES
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'posts'
ORDER BY trigger_name;

-- Debe mostrar solo:
-- trg_badge_first_post
-- trigger_update_posts_count (INSERT)
-- trigger_update_posts_count (DELETE)

-- 4. VERIFICAR COLUMNAS
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name IN ('poll_options', 'poll_duration', 'last_activity_date')
ORDER BY column_name;

-- Debe mostrar las 3 columnas

-- 5. PROBAR ELIMINAR POST (reemplaza el ID con uno real)
-- DELETE FROM posts WHERE id = 'TU_POST_ID_AQUI';
