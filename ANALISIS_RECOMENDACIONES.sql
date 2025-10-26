-- ============================================================================
-- ANÁLISIS COMPLETO DE RECOMENDACIONES DE PERSONAS
-- ============================================================================

-- 1. ESTADÍSTICAS GENERALES
-- ============================================================================
SELECT 
  '📊 TOTAL DE USUARIOS' as metric,
  COUNT(*) as count
FROM users;

SELECT 
  '📊 USUARIOS CON AVATAR' as metric,
  COUNT(*) as count
FROM users
WHERE avatar_url IS NOT NULL OR photo_url IS NOT NULL;

SELECT 
  '📊 USUARIOS CON INTERESES' as metric,
  COUNT(*) as count
FROM users
WHERE intereses IS NOT NULL AND array_length(intereses, 1) > 0;

SELECT 
  '📊 USUARIOS CON NIVEL FINANCIERO' as metric,
  COUNT(*) as count
FROM users
WHERE nivel_finanzas IS NOT NULL AND nivel_finanzas != 'none';

SELECT 
  '📊 USUARIOS CON METAS' as metric,
  COUNT(DISTINCT user_id) as count
FROM user_goals;

SELECT 
  '📊 USUARIOS ONBOARDING COMPLETO' as metric,
  COUNT(*) as count
FROM users
WHERE onboarding_step = 'completed';


-- 2. ANÁLISIS POR PAÍS
-- ============================================================================
SELECT 
  '🌍 USUARIOS POR PAÍS' as category,
  COALESCE(pais, 'Sin país') as pais,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN avatar_url IS NOT NULL OR photo_url IS NOT NULL THEN 1 END) as con_avatar,
  COUNT(CASE WHEN intereses IS NOT NULL AND array_length(intereses, 1) > 0 THEN 1 END) as con_intereses,
  COUNT(CASE WHEN nivel_finanzas IS NOT NULL AND nivel_finanzas != 'none' THEN 1 END) as con_nivel
FROM users
GROUP BY pais
ORDER BY total_usuarios DESC;


-- 3. ANÁLISIS DE INTERESES
-- ============================================================================
-- Intereses más comunes
SELECT 
  '🎯 INTERESES MÁS COMUNES' as category,
  i.name as interest_name,
  COUNT(DISTINCT ui.user_id) as usuarios_count
FROM user_interests ui
LEFT JOIN interests i ON ui.interest_id = i.id
GROUP BY i.id, i.name
ORDER BY usuarios_count DESC
LIMIT 10;


-- 4. ANÁLISIS DE METAS
-- ============================================================================
-- Metas más comunes
SELECT 
  '🎯 METAS MÁS COMUNES' as category,
  g.name as goal_name,
  COUNT(DISTINCT ug.user_id) as usuarios_count
FROM user_goals ug
LEFT JOIN goals g ON ug.goal_id = g.id
GROUP BY g.id, g.name
ORDER BY usuarios_count DESC
LIMIT 10;


-- 5. ANÁLISIS DE NIVEL FINANCIERO
-- ============================================================================
SELECT 
  '📈 DISTRIBUCIÓN NIVEL FINANCIERO' as category,
  COALESCE(nivel_finanzas, 'none') as nivel,
  COUNT(*) as usuarios_count
FROM users
GROUP BY nivel_finanzas
ORDER BY usuarios_count DESC;


-- 6. SIMULACIÓN DE RECOMENDACIONES PARA USUARIO ESPECÍFICO
-- ============================================================================
-- Usuario de prueba: c7812eb1-c3b1-429f-aabe-ba8da052201f

-- 6.1 Datos del usuario
SELECT 
  '👤 DATOS DEL USUARIO' as section,
  id,
  full_name,
  pais,
  nivel_finanzas,
  intereses,
  (SELECT COUNT(*) FROM user_goals WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f') as metas_count
FROM users
WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- 6.2 Usuarios con MISMO PAÍS
SELECT 
  '🌍 USUARIOS EN MISMO PAÍS' as criterio,
  u.id,
  u.full_name,
  u.pais,
  u.nivel_finanzas,
  u.intereses
FROM users u
WHERE u.pais = (SELECT pais FROM users WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f')
  AND u.id != 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
  AND (u.avatar_url IS NOT NULL OR u.photo_url IS NOT NULL)
LIMIT 10;

-- 6.3 Usuarios con INTERESES SIMILARES
WITH user_interests_array AS (
  SELECT intereses FROM users WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
)
SELECT 
  '🎯 USUARIOS CON INTERESES SIMILARES' as criterio,
  u.id,
  u.full_name,
  u.intereses,
  -- Calcular intereses en común
  (SELECT COUNT(*) 
   FROM unnest(u.intereses) AS interest 
   WHERE interest = ANY((SELECT intereses FROM user_interests_array))
  ) as intereses_comunes
FROM users u, user_interests_array uia
WHERE u.id != 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
  AND u.intereses IS NOT NULL
  AND array_length(u.intereses, 1) > 0
  AND EXISTS (
    SELECT 1 FROM unnest(u.intereses) AS interest 
    WHERE interest = ANY(uia.intereses)
  )
ORDER BY intereses_comunes DESC
LIMIT 10;

-- 6.4 Usuarios con METAS SIMILARES
WITH user_goals_list AS (
  SELECT array_agg(goal_id) as goals 
  FROM user_goals 
  WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
)
SELECT 
  '🎯 USUARIOS CON METAS SIMILARES' as criterio,
  u.id,
  u.full_name,
  array_agg(ug.goal_id) as user_goals,
  COUNT(*) as metas_comunes
FROM users u
JOIN user_goals ug ON ug.user_id = u.id
CROSS JOIN user_goals_list ugl
WHERE u.id != 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
  AND ug.goal_id = ANY(ugl.goals)
GROUP BY u.id, u.full_name
ORDER BY metas_comunes DESC
LIMIT 10;

-- 6.5 Usuarios con MISMO NIVEL FINANCIERO
SELECT 
  '📈 USUARIOS CON MISMO NIVEL' as criterio,
  u.id,
  u.full_name,
  u.nivel_finanzas,
  u.pais
FROM users u
WHERE u.nivel_finanzas = (SELECT nivel_finanzas FROM users WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f')
  AND u.id != 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
  AND (u.avatar_url IS NOT NULL OR u.photo_url IS NOT NULL)
LIMIT 10;


-- 7. VERIFICAR CONEXIONES EXISTENTES
-- ============================================================================
SELECT 
  '🔗 CONEXIONES DEL USUARIO' as section,
  c.*
FROM connections c
WHERE c.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
   OR c.connected_user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';


-- 8. USUARIOS QUE DEBERÍAN SER RECOMENDADOS (SCORE COMPLETO)
-- ============================================================================
WITH user_data AS (
  SELECT 
    id,
    pais,
    nivel_finanzas,
    intereses,
    (SELECT array_agg(goal_id) FROM user_goals WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f') as goals
  FROM users 
  WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
)
SELECT 
  '🏆 RANKING DE RECOMENDACIONES' as section,
  u.id,
  u.full_name,
  u.pais,
  u.nivel_finanzas,
  -- Score por país
  CASE WHEN u.pais = ud.pais THEN 10 ELSE 0 END as score_pais,
  -- Score por nivel
  CASE WHEN u.nivel_finanzas = ud.nivel_finanzas THEN 5 ELSE 0 END as score_nivel,
  -- Score por intereses comunes
  COALESCE((
    SELECT COUNT(*) * 3
    FROM unnest(u.intereses) AS interest 
    WHERE interest = ANY(ud.intereses)
  ), 0) as score_intereses,
  -- Score por metas comunes
  COALESCE((
    SELECT COUNT(*) * 3
    FROM user_goals ug
    WHERE ug.user_id = u.id AND ug.goal_id = ANY(ud.goals)
  ), 0) as score_metas,
  -- Score total
  CASE WHEN u.pais = ud.pais THEN 10 ELSE 0 END +
  CASE WHEN u.nivel_finanzas = ud.nivel_finanzas THEN 5 ELSE 0 END +
  COALESCE((SELECT COUNT(*) * 3 FROM unnest(u.intereses) AS interest WHERE interest = ANY(ud.intereses)), 0) +
  COALESCE((SELECT COUNT(*) * 3 FROM user_goals ug WHERE ug.user_id = u.id AND ug.goal_id = ANY(ud.goals)), 0) as score_total
FROM users u
CROSS JOIN user_data ud
WHERE u.id != 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
  AND (u.avatar_url IS NOT NULL OR u.photo_url IS NOT NULL)
  AND u.onboarding_step = 'completed'
  -- Excluir ya conectados
  AND NOT EXISTS (
    SELECT 1 FROM connections c 
    WHERE (c.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f' AND c.connected_user_id = u.id)
       OR (c.connected_user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f' AND c.user_id = u.id)
  )
ORDER BY score_total DESC
LIMIT 20;
