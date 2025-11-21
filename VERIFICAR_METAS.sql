-- ============================================
-- 🔍 VERIFICAR METAS Y ONBOARDING
-- ============================================
-- Ejecuta estas queries en Supabase para verificar el estado

-- 1. Ver tu user_id
SELECT id, email, nombre FROM users WHERE email = 'TU_EMAIL_AQUI';

-- 2. Ver metas del onboarding (user_goals)
SELECT * FROM user_goals WHERE user_id = 'TU_USER_ID_AQUI';

-- 3. Ver metas financieras (financial_goals)
SELECT * FROM financial_goals WHERE user_id = 'TU_USER_ID_AQUI';

-- 4. Verificar estructura de user_goals
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_goals';

-- 5. Verificar estructura de financial_goals
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'financial_goals';

-- ============================================
-- 🛠️ SOLUCIONES SEGÚN EL PROBLEMA
-- ============================================

-- PROBLEMA 1: La tabla user_goals no existe
-- SOLUCIÓN: Crear la tabla
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROBLEMA 2: La tabla financial_goals no existe
-- SOLUCIÓN: Crear la tabla
CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  target_amount NUMERIC DEFAULT 0,
  current_amount NUMERIC DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROBLEMA 3: user_goals está vacío (no se guardaron metas en onboarding)
-- SOLUCIÓN: Insertar metas manualmente para testing
INSERT INTO user_goals (user_id, goal) VALUES
  ('TU_USER_ID_AQUI', 'Ahorrar para emergencias'),
  ('TU_USER_ID_AQUI', 'Invertir en acciones'),
  ('TU_USER_ID_AQUI', 'Comprar una casa');

-- PROBLEMA 4: financial_goals está vacío
-- SOLUCIÓN: El dashboard debería crearlas automáticamente desde user_goals
-- Si no funciona, créalas manualmente:
INSERT INTO financial_goals (user_id, goal_type, target_amount, current_amount, deadline) VALUES
  ('TU_USER_ID_AQUI', 'Ahorrar para emergencias', 10000, 0, NOW() + INTERVAL '1 year'),
  ('TU_USER_ID_AQUI', 'Invertir en acciones', 10000, 0, NOW() + INTERVAL '1 year'),
  ('TU_USER_ID_AQUI', 'Comprar una casa', 10000, 0, NOW() + INTERVAL '1 year');

-- ============================================
-- ✅ VERIFICACIÓN FINAL
-- ============================================

-- Contar metas por usuario
SELECT 
  u.email,
  COUNT(DISTINCT ug.id) as metas_onboarding,
  COUNT(DISTINCT fg.id) as metas_financieras
FROM users u
LEFT JOIN user_goals ug ON u.id = ug.user_id
LEFT JOIN financial_goals fg ON u.id = fg.user_id
WHERE u.email = 'TU_EMAIL_AQUI'
GROUP BY u.email;

-- ============================================
-- 📝 INSTRUCCIONES
-- ============================================
/*
1. Reemplaza 'TU_EMAIL_AQUI' con tu email real
2. Ejecuta la query #1 para obtener tu user_id
3. Reemplaza 'TU_USER_ID_AQUI' con tu user_id real
4. Ejecuta las queries #2 y #3 para ver si tienes metas
5. Si no tienes metas, usa las soluciones según el problema
6. Reinicia la app y verifica que aparezcan las metas

NOTA: Los logs en la consola te dirán exactamente qué está pasando:
- 🎯 Buscando metas del onboarding
- 📊 Metas financieras encontradas
- ⚠️ No hay metas
- ✅ Metas creadas exitosamente
*/
