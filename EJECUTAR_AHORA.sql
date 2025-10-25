-- =====================================================
-- EJECUTAR AHORA - CORRECCIONES URGENTES
-- =====================================================

-- 1. Actualizar usuario sebastianramirez sin nombre
UPDATE users
SET 
  full_name = COALESCE(full_name, nombre, INITCAP(username)),
  nombre = COALESCE(nombre, full_name, INITCAP(username))
WHERE username = 'sebastianramirez';

-- 2. Actualizar TODOS los usuarios sin nombre
UPDATE users
SET full_name = COALESCE(nombre, INITCAP(username), 'Usuario ' || SUBSTRING(id::text, 1, 8))
WHERE full_name IS NULL OR TRIM(full_name) = '';

UPDATE users
SET nombre = COALESCE(full_name, INITCAP(username), 'Usuario ' || SUBSTRING(id::text, 1, 8))
WHERE nombre IS NULL OR TRIM(nombre) = '';

-- 3. Verificar que todos tengan nombre
SELECT 
  id,
  full_name,
  nombre,
  username,
  COALESCE(full_name, nombre, username, 'Usuario') as display_name
FROM users
WHERE full_name IS NULL OR nombre IS NULL OR TRIM(full_name) = '' OR TRIM(nombre) = ''
ORDER BY id DESC
LIMIT 20;

-- 4. Actualizar API key en .env (YA HECHO)
-- EXPO_PUBLIC_FMP_API_KEY=82xqcoiLim6uBtlqlPnHiwcACynWkn7Y

-- 5. Reiniciar Expo
-- expo start -c
