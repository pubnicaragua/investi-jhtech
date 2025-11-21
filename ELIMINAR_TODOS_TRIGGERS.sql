-- ============================================
-- 🔥 ELIMINAR TODOS LOS TRIGGERS PROBLEMÁTICOS
-- ============================================

-- El error muestra que hay más triggers mal implementados:
-- ERROR: trigger functions can only be called as triggers
-- CONTEXT: compilation of PL/pgSQL function "update_post_likes" near line 1
-- SQL statement "SELECT public.update_post_likes()"
-- PL/pgSQL function update_post_likes_after_delete() line 3 at PERFORM

-- 1. ELIMINAR TRIGGER DE POST CREATION
DROP TRIGGER IF EXISTS on_post_creation ON posts CASCADE;
DROP FUNCTION IF EXISTS trigger_post_creation() CASCADE;

-- 2. ELIMINAR TRIGGERS DE LIKES (PROBLEMÁTICOS)
DROP TRIGGER IF EXISTS update_post_likes_after_delete ON post_likes CASCADE;
DROP TRIGGER IF EXISTS update_post_likes_after_insert ON post_likes CASCADE;
DROP FUNCTION IF EXISTS update_post_likes() CASCADE;
DROP FUNCTION IF EXISTS update_post_likes_after_delete() CASCADE;
DROP FUNCTION IF EXISTS update_post_likes_after_insert() CASCADE;

-- 3. BUSCAR Y ELIMINAR CUALQUIER OTRO TRIGGER PROBLEMÁTICO
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Buscar todos los triggers en la tabla posts
    FOR r IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'posts'
        AND trigger_name NOT IN ('trg_badge_first_post', 'trigger_update_posts_count')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON posts CASCADE', r.trigger_name);
        RAISE NOTICE 'Eliminado trigger: %', r.trigger_name;
    END LOOP;
    
    -- Buscar triggers en post_likes
    FOR r IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'post_likes'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON post_likes CASCADE', r.trigger_name);
        RAISE NOTICE 'Eliminado trigger en post_likes: %', r.trigger_name;
    END LOOP;
END $$;

-- 4. VERIFICAR TRIGGERS RESTANTES EN POSTS
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'posts'
ORDER BY trigger_name;

-- Debe mostrar solo:
-- trg_badge_first_post (INSERT)
-- trigger_update_posts_count (INSERT)
-- trigger_update_posts_count (DELETE)

-- 5. VERIFICAR TRIGGERS EN POST_LIKES
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'post_likes'
ORDER BY trigger_name;

-- Debe mostrar 0 filas (o solo triggers que funcionen bien)

-- 6. PROBAR ELIMINAR POST
-- Reemplaza con un ID real de un post que quieras eliminar
-- DELETE FROM posts WHERE id = 'TU_POST_ID_AQUI';

-- 7. LIMPIAR FUNCIONES HUÉRFANAS
DROP FUNCTION IF EXISTS grant_xp_to_user(UUID, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS check_and_grant_achievement(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_daily_streak(UUID) CASCADE;
DROP FUNCTION IF EXISTS handle_new_post() CASCADE;

-- 8. VERIFICACIÓN FINAL
SELECT 
    'Triggers en posts' as tipo,
    COUNT(*) as cantidad
FROM information_schema.triggers
WHERE event_object_table = 'posts'
UNION ALL
SELECT 
    'Triggers en post_likes' as tipo,
    COUNT(*) as cantidad
FROM information_schema.triggers
WHERE event_object_table = 'post_likes';

-- Resultado esperado:
-- Triggers en posts: 3 (trg_badge_first_post + trigger_update_posts_count x2)
-- Triggers en post_likes: 0 (o los que funcionen bien)
