-- =====================================================
-- VERIFICAR METAS DEL USUARIO
-- =====================================================

-- Reemplaza este UUID con el ID del usuario actual
\set user_id 'c7812eb1-c3b1-429f-aabe-ba8da052201f'

-- 1. Verificar que el usuario existe
SELECT 
    '1. Usuario existe:' as check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM users WHERE id = :'user_id'::uuid)
        THEN '✅ Sí'
        ELSE '❌ No'
    END as status;

-- 2. Verificar metas del usuario
SELECT 
    '2. Metas del usuario:' as check,
    COUNT(*) as total
FROM user_goals
WHERE user_id = :'user_id'::uuid;

-- 3. Ver las metas específicas del usuario
SELECT 
    g.name as meta,
    ug.priority as prioridad,
    ug.created_at as fecha_creacion
FROM user_goals ug
JOIN goals g ON g.id = ug.goal_id
WHERE ug.user_id = :'user_id'::uuid
ORDER BY ug.priority;

-- 4. Verificar comunidades relacionadas con las metas del usuario
SELECT 
    '4. Comunidades disponibles para las metas del usuario:' as check,
    COUNT(DISTINCT cg.community_id) as total
FROM user_goals ug
JOIN community_goals cg ON cg.goal_id = ug.goal_id
WHERE ug.user_id = :'user_id'::uuid;

-- 5. Ver comunidades específicas recomendadas
SELECT 
    c.nombre as comunidad,
    g.name as meta,
    cg.relevance_score as score,
    c.member_count as miembros
FROM user_goals ug
JOIN community_goals cg ON cg.goal_id = ug.goal_id
JOIN communities c ON c.id = cg.community_id
JOIN goals g ON g.id = ug.goal_id
WHERE ug.user_id = :'user_id'::uuid
ORDER BY cg.relevance_score DESC, c.member_count DESC
LIMIT 10;

-- 6. Verificar si el usuario ya es miembro de alguna comunidad
SELECT 
    '6. Comunidades donde ya es miembro:' as check,
    COUNT(*) as total
FROM user_communities
WHERE user_id = :'user_id'::uuid;

-- 7. Probar función v2
SELECT '7. Resultado de función v2:' as check;
SELECT * FROM get_recommended_communities_by_goals_v2(:'user_id'::uuid, 10);

-- 8. Si v2 no retorna nada, probar v1
SELECT '8. Resultado de función v1:' as check;
SELECT * FROM get_recommended_communities_by_goals(:'user_id'::uuid, 10);
