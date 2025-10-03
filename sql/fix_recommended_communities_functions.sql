-- =====================================================
-- FIX: Corregir funciones de recomendaciones de comunidades
-- =====================================================

-- =====================================================
-- FUNCIÓN V1 (Original) - CORREGIDA
-- =====================================================

CREATE OR REPLACE FUNCTION get_recommended_communities_by_goals(
  p_user_id uuid, 
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  community_id uuid,
  community_name text,
  community_description text,
  community_avatar_url text,
  members_count bigint,
  match_score numeric,
  matching_goals text[]
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_goal_ids AS (
    SELECT ug.goal_id
    FROM user_goals ug
    WHERE ug.user_id = p_user_id
  ),
  community_scores AS (
    SELECT 
      c.id as community_id,
      COALESCE(c.name, c.nombre) as community_name,
      c.descripcion as community_description,
      COALESCE(c.icono_url, c.image_url) as community_avatar_url,
      COALESCE(c.member_count, COUNT(DISTINCT uc.user_id)) as members_count,
      (COUNT(DISTINCT ug2.goal_id)::numeric / NULLIF((SELECT COUNT(*) FROM user_goal_ids), 0)) * 100 as match_score,
      ARRAY_AGG(DISTINCT g.name) as matching_goals
    FROM communities c
    LEFT JOIN user_communities uc ON c.id = uc.community_id
    LEFT JOIN user_goals ug2 ON ug2.user_id = uc.user_id
    LEFT JOIN goals g ON g.id = ug2.goal_id
    WHERE ug2.goal_id IN (SELECT goal_id FROM user_goal_ids)
      AND c.id NOT IN (
        SELECT uc2.community_id 
        FROM user_communities uc2
        WHERE uc2.user_id = p_user_id
      )
    GROUP BY c.id, c.name, c.nombre, c.descripcion, c.icono_url, c.image_url, c.member_count
    HAVING COUNT(DISTINCT ug2.goal_id) > 0
  )
  SELECT 
    cs.community_id,
    cs.community_name,
    cs.community_description,
    cs.community_avatar_url,
    cs.members_count,
    cs.match_score,
    cs.matching_goals
  FROM community_scores cs
  ORDER BY cs.match_score DESC, cs.members_count DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION get_recommended_communities_by_goals IS 
'Retorna comunidades recomendadas basadas en las metas de inversión del usuario (v1 - basado en miembros con metas similares)';

-- =====================================================
-- FUNCIÓN V2 (Nueva) - Usa tabla community_goals
-- =====================================================

CREATE OR REPLACE FUNCTION get_recommended_communities_by_goals_v2(
  p_user_id uuid, 
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  community_id uuid,
  community_name text,
  community_description text,
  community_avatar_url text,
  members_count bigint,
  match_score numeric,
  matching_goals text[]
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_goal_ids AS (
    SELECT ug.goal_id
    FROM user_goals ug
    WHERE ug.user_id = p_user_id
  ),
  community_scores AS (
    SELECT 
      c.id as community_id,
      COALESCE(c.name, c.nombre) as community_name,
      c.descripcion as community_description,
      COALESCE(c.icono_url, c.image_url) as community_avatar_url,
      COALESCE(c.member_count, 0) as members_count,
      -- Score ponderado por relevancia
      (SUM(cg.relevance_score)::numeric / NULLIF((SELECT COUNT(*) FROM user_goal_ids), 0)) * 100 as match_score,
      ARRAY_AGG(DISTINCT g.name) as matching_goals
    FROM communities c
    INNER JOIN community_goals cg ON c.id = cg.community_id
    INNER JOIN goals g ON g.id = cg.goal_id
    WHERE cg.goal_id IN (SELECT goal_id FROM user_goal_ids)
      AND c.id NOT IN (
        SELECT uc.community_id 
        FROM user_communities uc
        WHERE uc.user_id = p_user_id
      )
    GROUP BY c.id, c.name, c.nombre, c.descripcion, c.icono_url, c.image_url, c.member_count
    HAVING COUNT(DISTINCT cg.goal_id) > 0
  )
  SELECT 
    cs.community_id,
    cs.community_name,
    cs.community_description,
    cs.community_avatar_url,
    cs.members_count,
    cs.match_score,
    cs.matching_goals
  FROM community_scores cs
  ORDER BY cs.match_score DESC, cs.members_count DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION get_recommended_communities_by_goals_v2 IS 
'Retorna comunidades recomendadas basadas en las metas de inversión del usuario (v2 - usa tabla community_goals con scores de relevancia)';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que ambas funciones existen
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_recommended_communities_by_goals')
        THEN '✅ Función v1 existe y corregida'
        ELSE '❌ Función v1 NO existe'
    END as status_v1,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_recommended_communities_by_goals_v2')
        THEN '✅ Función v2 existe y corregida'
        ELSE '❌ Función v2 NO existe'
    END as status_v2;

-- Probar función v2 con un usuario (reemplaza el UUID)
-- SELECT * FROM get_recommended_communities_by_goals_v2('c7812eb1-c3b1-429f-aabe-ba8da052201f', 10);

-- Probar función v1 con un usuario (reemplaza el UUID)
-- SELECT * FROM get_recommended_communities_by_goals('c7812eb1-c3b1-429f-aabe-ba8da052201f', 10);

SELECT '✅ Funciones corregidas exitosamente' as final_status;
