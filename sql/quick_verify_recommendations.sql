-- =====================================================
-- VERIFICACIÓN RÁPIDA - Recomendaciones de Comunidades
-- =====================================================
-- Reemplaza el UUID con tu usuario actual
-- =====================================================

-- 1. Verificar metas del usuario
SELECT 
    '1️⃣ Metas del usuario' as paso,
    COUNT(*) as total,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Usuario tiene metas'
        ELSE '❌ Usuario NO tiene metas - debe completar onboarding'
    END as status
FROM user_goals
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- 2. Ver las metas específicas
SELECT 
    '2️⃣ Detalle de metas' as paso,
    g.name as meta,
    ug.priority as prioridad
FROM user_goals ug
JOIN goals g ON g.id = ug.goal_id
WHERE ug.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY ug.priority;

-- 3. Verificar relaciones comunidad-meta
SELECT 
    '3️⃣ Relaciones comunidad-meta' as paso,
    COUNT(*) as total,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Hay relaciones'
        ELSE '❌ NO hay relaciones - ejecutar fix_community_goals_relationships.sql'
    END as status
FROM community_goals;

-- 4. Comunidades disponibles para las metas del usuario
SELECT 
    '4️⃣ Comunidades disponibles' as paso,
    COUNT(DISTINCT cg.community_id) as total_comunidades,
    CASE 
        WHEN COUNT(DISTINCT cg.community_id) > 0 THEN '✅ Hay comunidades disponibles'
        ELSE '❌ NO hay comunidades para las metas del usuario'
    END as status
FROM user_goals ug
JOIN community_goals cg ON cg.goal_id = ug.goal_id
WHERE ug.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- 5. Ver comunidades recomendadas (manual)
SELECT 
    '5️⃣ Comunidades recomendadas (vista manual)' as paso,
    c.nombre as comunidad,
    g.name as meta_relacionada,
    cg.relevance_score as score,
    c.member_count as miembros
FROM user_goals ug
JOIN community_goals cg ON cg.goal_id = ug.goal_id
JOIN communities c ON c.id = cg.community_id
JOIN goals g ON g.id = ug.goal_id
WHERE ug.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
  AND c.id NOT IN (
    SELECT community_id 
    FROM user_communities 
    WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
  )
ORDER BY cg.relevance_score DESC, c.member_count DESC
LIMIT 10;

-- 6. Probar función v2
SELECT '6️⃣ Resultado función v2' as paso;
SELECT 
    community_name as comunidad,
    match_score as score,
    members_count as miembros,
    matching_goals as metas_coincidentes
FROM get_recommended_communities_by_goals_v2('c7812eb1-c3b1-429f-aabe-ba8da052201f', 10);

-- 7. Si v2 falla, probar v1
SELECT '7️⃣ Resultado función v1 (fallback)' as paso;
SELECT 
    community_name as comunidad,
    match_score as score,
    members_count as miembros,
    matching_goals as metas_coincidentes
FROM get_recommended_communities_by_goals('c7812eb1-c3b1-429f-aabe-ba8da052201f', 10);

-- =====================================================
-- DIAGNÓSTICO FINAL
-- =====================================================

SELECT 
    '🔍 DIAGNÓSTICO FINAL' as titulo,
    (SELECT COUNT(*) FROM user_goals WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f') as metas_usuario,
    (SELECT COUNT(*) FROM community_goals) as relaciones_totales,
    (SELECT COUNT(DISTINCT cg.community_id) 
     FROM user_goals ug 
     JOIN community_goals cg ON cg.goal_id = ug.goal_id 
     WHERE ug.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f') as comunidades_disponibles,
    CASE 
        WHEN (SELECT COUNT(*) FROM user_goals WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f') = 0 
        THEN '❌ Usuario no tiene metas'
        WHEN (SELECT COUNT(*) FROM community_goals) = 0 
        THEN '❌ No hay relaciones comunidad-meta'
        WHEN (SELECT COUNT(DISTINCT cg.community_id) 
              FROM user_goals ug 
              JOIN community_goals cg ON cg.goal_id = ug.goal_id 
              WHERE ug.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f') = 0 
        THEN '❌ No hay comunidades para las metas del usuario'
        ELSE '✅ Todo correcto - debería funcionar'
    END as diagnostico;
