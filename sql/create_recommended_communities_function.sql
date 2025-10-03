-- Función para obtener comunidades recomendadas basadas en las metas del usuario
-- Esta función se integra con el algoritmo de recomendaciones de Investi

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
    -- Obtener las metas del usuario actual
    SELECT goal_id
    FROM user_goals
    WHERE user_id = p_user_id
  ),
  community_scores AS (
    -- Calcular score de coincidencia para cada comunidad
    SELECT 
      c.id as community_id,
      c.name as community_name,
      c.description as community_description,
      c.avatar_url as community_avatar_url,
      COUNT(DISTINCT cm.user_id) as members_count,
      -- Score basado en coincidencia de metas (0-100)
      (COUNT(DISTINCT ug.goal_id)::numeric / NULLIF((SELECT COUNT(*) FROM user_goal_ids), 0)) * 100 as match_score,
      -- Array de nombres de metas coincidentes
      ARRAY_AGG(DISTINCT g.name) as matching_goals
    FROM communities c
    LEFT JOIN community_members cm ON c.id = cm.community_id
    LEFT JOIN user_goals ug ON ug.user_id = cm.user_id
    LEFT JOIN goals g ON g.id = ug.goal_id
    WHERE ug.goal_id IN (SELECT goal_id FROM user_goal_ids)
      -- Excluir comunidades donde el usuario ya es miembro
      AND c.id NOT IN (
        SELECT community_id 
        FROM community_members 
        WHERE user_id = p_user_id
      )
    GROUP BY c.id, c.name, c.description, c.avatar_url
    HAVING COUNT(DISTINCT ug.goal_id) > 0
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

-- Comentario sobre la función
COMMENT ON FUNCTION get_recommended_communities_by_goals IS 
'Retorna comunidades recomendadas basadas en las metas de inversión del usuario. 
El match_score indica el porcentaje de coincidencia de metas entre el usuario y los miembros de la comunidad.
Ordena por score de coincidencia y cantidad de miembros.';

-- Ejemplo de uso:
-- SELECT * FROM get_recommended_communities_by_goals('user-uuid-here', 5);
