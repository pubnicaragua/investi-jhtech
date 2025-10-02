-- ========================================
-- VALIDACIÓN DE DATA PARA HOMEFEED SCREEN
-- ========================================

-- 📡 ENDPOINTS USADOS:
-- 1. getUserFeed(userId) - Posts del feed principal
-- 2. getUserProfile(userId) - Perfil del usuario actual
-- 3. getNotifications(userId) - Notificaciones
-- 4. getConversations(userId) - Conversaciones/mensajes
-- 5. getQuickActions() - Acciones rápidas
-- 6. likePost/unlikePost - Likes en posts
-- 7. savePost/unsavePost - Guardar posts
-- 8. followUser/unfollowUser - Seguir usuarios
-- 9. sharePost - Compartir posts

-- ========================================
-- 1. FEED DE POSTS (getUserFeed)
-- ========================================

SELECT 
  '1. FEED DE POSTS' as seccion,
  COUNT(*) as total_posts,
  COUNT(CASE WHEN array_length(media_url, 1) > 0 THEN 1 END) as con_imagen,
  COUNT(CASE WHEN likes_count > 0 THEN 1 END) as con_likes,
  COUNT(CASE WHEN comment_count > 0 THEN 1 END) as con_comentarios
FROM posts;

-- Ver primeros 5 posts del feed con toda la info
SELECT 
  p.id,
  p.contenido as content,
  p.media_url as image,
  p.likes_count as likes,
  p.comment_count as comments,
  p.shares as shares,
  json_build_object(
    'id', u.id,
    'name', COALESCE(u.full_name, u.nombre),
    'avatar', u.avatar_url,
    'role', u.role
  ) as author,
  p.created_at,
  CASE WHEN p.created_at > NOW() - INTERVAL '1 hour' THEN 'Hace 1h'
       WHEN p.created_at > NOW() - INTERVAL '1 day' THEN 'Hace ' || EXTRACT(HOUR FROM NOW() - p.created_at) || 'h'
       ELSE 'Hace ' || EXTRACT(DAY FROM NOW() - p.created_at) || 'd'
  END as time_ago
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 5;

-- ========================================
-- 2. PERFIL DE USUARIO (getUserProfile)
-- ========================================

SELECT 
  '2. PERFIL DE USUARIO' as seccion,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as con_avatar,
  COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as con_nombre_completo,
  COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as con_role
FROM users;

-- Ver perfil de un usuario ejemplo
SELECT 
  id,
  COALESCE(full_name, nombre) as name,
  avatar_url,
  role,
  email,
  array_length(intereses, 1) as total_intereses,
  fecha_registro
FROM users
WHERE avatar_url IS NOT NULL
LIMIT 3;

-- ========================================
-- 3. NOTIFICACIONES (getNotifications)
-- ========================================

-- Verificar si existe la tabla notifications
SELECT 
  '3. NOTIFICACIONES' as seccion,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications')
    THEN (SELECT COUNT(*)::text FROM notifications)
    ELSE '⚠️ Tabla no existe'
  END as total_notificaciones;

-- Si existe, ver estructura
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- ========================================
-- 4. CONVERSACIONES (getConversations)
-- ========================================

-- Verificar si existe la tabla conversations o messages
SELECT 
  '4. CONVERSACIONES' as seccion,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations')
    THEN (SELECT COUNT(*)::text FROM conversations)
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages')
    THEN (SELECT COUNT(DISTINCT sender_id)::text || ' conversaciones únicas' FROM messages)
    ELSE '⚠️ Tabla no existe'
  END as total_conversaciones;

-- ========================================
-- 5. QUICK ACTIONS (getQuickActions)
-- ========================================

-- Verificar si existe la tabla quick_actions
SELECT 
  '5. QUICK ACTIONS' as seccion,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quick_actions')
    THEN (SELECT COUNT(*)::text FROM quick_actions)
    ELSE '⚠️ Tabla no existe (usa defaults en frontend)'
  END as total_acciones;

-- ========================================
-- 6. LIKES EN POSTS (post_likes)
-- ========================================

-- Verificar tabla de likes
SELECT 
  '6. LIKES' as seccion,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_likes')
    THEN (SELECT COUNT(*)::text FROM post_likes)
    ELSE '⚠️ Tabla no existe'
  END as total_likes;

-- Ver distribución de likes
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'post_likes'
ORDER BY ordinal_position;

-- ========================================
-- 7. POSTS GUARDADOS (saved_posts)
-- ========================================

-- Verificar tabla de posts guardados
SELECT 
  '7. POSTS GUARDADOS' as seccion,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_posts')
    THEN (SELECT COUNT(*)::text FROM saved_posts)
    ELSE '⚠️ Tabla no existe'
  END as total_guardados;

-- ========================================
-- 8. SEGUIMIENTOS (follows o user_follows)
-- ========================================

-- Verificar tabla de seguimientos
SELECT 
  '8. SEGUIMIENTOS' as seccion,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows')
    THEN (SELECT COUNT(*)::text FROM follows)
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_follows')
    THEN (SELECT COUNT(*)::text FROM user_follows)
    ELSE '⚠️ Tabla no existe'
  END as total_seguimientos;

-- ========================================
-- RESUMEN GENERAL HOMEFEED
-- ========================================

SELECT 
  'RESUMEN HOMEFEED' as titulo,
  (SELECT COUNT(*) FROM posts) as posts_totales,
  (SELECT COUNT(*) FROM posts WHERE array_length(media_url, 1) > 0) as posts_con_imagen,
  (SELECT COUNT(*) FROM users WHERE avatar_url IS NOT NULL) as usuarios_con_avatar,
  (SELECT COUNT(*) FROM posts WHERE likes_count > 0) as posts_con_likes;

-- ========================================
-- VALIDACIÓN DE TABLAS NECESARIAS
-- ========================================

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('posts', 'users', 'notifications', 'conversations', 
                        'messages', 'post_likes', 'saved_posts', 'follows',
                        'user_follows', 'quick_actions')
    THEN '✅ Existe'
    ELSE '❌ Falta'
  END as estado
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('posts', 'users', 'notifications', 'conversations',
                     'messages', 'post_likes', 'saved_posts', 'follows',
                     'user_follows', 'quick_actions')
ORDER BY 
  CASE table_name
    WHEN 'posts' THEN 1
    WHEN 'users' THEN 2
    WHEN 'post_likes' THEN 3
    WHEN 'saved_posts' THEN 4
    WHEN 'follows' THEN 5
    WHEN 'notifications' THEN 6
    WHEN 'conversations' THEN 7
    WHEN 'messages' THEN 8
    WHEN 'quick_actions' THEN 9
    ELSE 10
  END;
