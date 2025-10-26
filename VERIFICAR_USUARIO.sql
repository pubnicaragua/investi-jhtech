-- Verificar datos completos del usuario c7812eb1-c3b1-429f-aabe-ba8da052201f

-- 1. Datos básicos del usuario
SELECT 
  id,
  email,
  full_name,
  nombre,
  username,
  avatar_url,
  photo_url,
  onboarding_step,
  intereses,
  nivel_finanzas,
  fecha_registro
FROM users
WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- 2. Metas del usuario
SELECT 
  ug.id,
  ug.user_id,
  ug.goal_id,
  ug.priority,
  g.name as goal_name,
  g.description as goal_description
FROM user_goals ug
LEFT JOIN goals g ON ug.goal_id = g.id
WHERE ug.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY ug.priority;

-- 3. Intereses del usuario (si están en tabla separada)
SELECT 
  ui.id,
  ui.user_id,
  ui.interest_id,
  i.name as interest_name,
  i.description as interest_description
FROM user_interests ui
LEFT JOIN interests i ON ui.interest_id = i.id
WHERE ui.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';

-- 4. Resumen de validación
SELECT 
  CASE 
    WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN '✅ Tiene avatar'
    WHEN photo_url IS NOT NULL AND photo_url != '' THEN '✅ Tiene photo'
    ELSE '❌ NO tiene avatar'
  END as avatar_status,
  
  CASE 
    WHEN intereses IS NOT NULL AND array_length(intereses, 1) > 0 THEN '✅ Tiene intereses (' || array_length(intereses, 1) || ')'
    ELSE '❌ NO tiene intereses'
  END as intereses_status,
  
  CASE 
    WHEN nivel_finanzas IS NOT NULL AND nivel_finanzas != 'none' THEN '✅ Tiene nivel: ' || nivel_finanzas
    ELSE '❌ NO tiene nivel'
  END as nivel_status,
  
  CASE 
    WHEN onboarding_step = 'completed' THEN '✅ Onboarding completado'
    ELSE '❌ Onboarding: ' || COALESCE(onboarding_step, 'NULL')
  END as onboarding_status,
  
  (SELECT COUNT(*) FROM user_goals WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f') as goals_count
  
FROM users
WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';
