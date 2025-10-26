-- ============================================================================
-- VERIFICAR ESTADO DEL USUARIO: Danny
-- ============================================================================

-- Usuario: 17e255b9-5f66-4740-9b74-26b5693b3dee

SELECT 
  '📊 DATOS COMPLETOS' as seccion,
  id,
  email,
  full_name,
  username,
  onboarding_step,
  avatar_url IS NOT NULL as tiene_avatar,
  photo_url IS NOT NULL as tiene_photo,
  intereses,
  array_length(intereses, 1) as count_intereses,
  nivel_finanzas,
  created_at
FROM users
WHERE id = '17e255b9-5f66-4740-9b74-26b5693b3dee';

-- Verificar metas
SELECT 
  '🎯 METAS' as seccion,
  ug.id,
  ug.goal_id,
  g.name as goal_name,
  ug.priority,
  ug.created_at
FROM user_goals ug
LEFT JOIN goals g ON g.id = ug.goal_id
WHERE ug.user_id = '17e255b9-5f66-4740-9b74-26b5693b3dee'
ORDER BY ug.priority;

-- Verificar intereses en user_interests
SELECT 
  '💡 INTERESES (user_interests)' as seccion,
  ui.id,
  ui.interest_id,
  i.name as interest_name,
  ui.experience_level,
  ui.created_at
FROM user_interests ui
LEFT JOIN interests i ON i.id = ui.interest_id
WHERE ui.user_id = '17e255b9-5f66-4740-9b74-26b5693b3dee';

-- Validación completa
SELECT 
  '✅ VALIDACIÓN' as seccion,
  onboarding_step = 'completed' as step_completed,
  (avatar_url IS NOT NULL OR photo_url IS NOT NULL) as has_avatar,
  (intereses IS NOT NULL AND array_length(intereses, 1) > 0) as has_intereses_array,
  (nivel_finanzas IS NOT NULL AND nivel_finanzas != 'none') as has_nivel,
  EXISTS(SELECT 1 FROM user_goals WHERE user_id = users.id) as has_goals,
  
  -- Resultado final
  CASE 
    WHEN onboarding_step = 'completed'
      AND (avatar_url IS NOT NULL OR photo_url IS NOT NULL)
      AND (intereses IS NOT NULL AND array_length(intereses, 1) > 0)
      AND (nivel_finanzas IS NOT NULL AND nivel_finanzas != 'none')
      AND EXISTS(SELECT 1 FROM user_goals WHERE user_id = users.id)
    THEN '✅ ONBOARDING COMPLETO'
    ELSE '❌ FALTA ALGO'
  END as resultado
FROM users
WHERE id = '17e255b9-5f66-4740-9b74-26b5693b3dee';
