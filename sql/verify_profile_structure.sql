-- =====================================================
-- VERIFICACIÓN DE ESTRUCTURA PARA PERFIL Y SIDEBAR
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor para verificar
-- que todas las columnas y funciones necesarias existen

-- 1. Verificar columnas de la tabla users
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Verificar que NO existe created_at en users (debería estar vacío)
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'created_at';

-- 3. Verificar que existe fecha_registro en users
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'fecha_registro';

-- 4. Verificar función get_user_stats
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name = 'get_user_stats';

-- 5. Probar la función get_user_stats con un usuario de prueba
-- REEMPLAZA 'YOUR_USER_ID' con un UUID real de tu tabla users
-- SELECT * FROM get_user_stats('YOUR_USER_ID');

-- 6. Verificar estructura de user_communities
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_communities'
ORDER BY ordinal_position;

-- 7. Verificar estructura de communities
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'communities'
ORDER BY ordinal_position;

-- 8. Verificar estructura de posts
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'posts'
ORDER BY ordinal_position;

-- 9. Test query completo para getUserComplete
-- REEMPLAZA 'YOUR_USER_ID' con un UUID real
/*
-- Test 1: Obtener datos del usuario
SELECT 
    id,
    nombre,
    bio,
    location,
    avatar_url,
    banner_url,
    is_verified,
    fecha_registro,
    full_name,
    username,
    photo_url,
    pais,
    role
FROM users 
WHERE id = 'YOUR_USER_ID';

-- Test 2: Obtener estadísticas
SELECT * FROM get_user_stats('YOUR_USER_ID');

-- Test 3: Obtener posts del usuario
SELECT 
    p.id,
    p.contenido,
    p.created_at,
    p.likes_count,
    p.comment_count,
    u.id as user_id,
    u.nombre,
    u.avatar_url
FROM posts p
LEFT JOIN users u ON p.user_id = u.id
WHERE p.user_id = 'YOUR_USER_ID'
ORDER BY p.created_at DESC
LIMIT 10;

-- Test 4: Obtener comunidades del usuario
SELECT 
    uc.role,
    uc.status,
    uc.joined_at,
    c.id,
    c.nombre,
    c.name,
    c.descripcion,
    c.avatar_url,
    c.icono_url,
    c.image_url,
    c.member_count,
    c.type,
    c.category,
    c.is_verified
FROM user_communities uc
LEFT JOIN communities c ON uc.community_id = c.id
WHERE uc.user_id = 'YOUR_USER_ID'
    AND uc.status = 'active'
ORDER BY uc.joined_at DESC
LIMIT 20;
*/

-- 10. Verificar permisos RLS en users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'users';

-- 11. Listar todos los usuarios (primeros 5) para obtener IDs de prueba
SELECT 
    id,
    nombre,
    username,
    email,
    fecha_registro
FROM users
ORDER BY fecha_registro DESC
LIMIT 5;
