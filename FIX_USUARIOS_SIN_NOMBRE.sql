-- ============================================
-- FIX: USUARIOS SIN NOMBRE REAL
-- ============================================
-- Problema: Usuarios aparecen como "Usuario"
-- Solución: Extraer nombres de emails y actualizar
-- ============================================

-- 1. Actualizar usuarios que no tienen nombre pero tienen email
UPDATE users
SET 
  nombre = CASE 
    WHEN nombre IS NULL OR nombre = '' OR nombre = 'Usuario' THEN
      COALESCE(
        full_name,
        username,
        SPLIT_PART(email, '@', 1)  -- Extraer parte antes del @
      )
    ELSE nombre
  END,
  full_name = CASE
    WHEN full_name IS NULL OR full_name = '' THEN
      COALESCE(
        nombre,
        username,
        SPLIT_PART(email, '@', 1)
      )
    ELSE full_name
  END
WHERE 
  (nombre IS NULL OR nombre = '' OR nombre = 'Usuario')
  AND email IS NOT NULL;

-- 2. Actualizar usuarios sin username
UPDATE usuarios
SET username = CASE
  WHEN username IS NULL OR username = '' THEN
    LOWER(REGEXP_REPLACE(
      COALESCE(nombre, full_name, SPLIT_PART(email, '@', 1), 'user_' || id::text),
      '[^a-zA-Z0-9]',
      '_',
      'g'
    ))
  ELSE username
END
WHERE username IS NULL OR username = '';

-- 3. Asegurar que todos tengan al menos un identificador
UPDATE usuarios
SET 
  nombre = COALESCE(nombre, full_name, username, 'Usuario ' || id::text),
  full_name = COALESCE(full_name, nombre, username, 'Usuario ' || id::text)
WHERE nombre IS NULL OR nombre = '' OR full_name IS NULL OR full_name = '';

-- 4. Verificar resultados
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN nombre IS NOT NULL AND nombre != '' THEN 1 END) as con_nombre,
  COUNT(CASE WHEN nombre IS NULL OR nombre = '' OR nombre = 'Usuario' THEN 1 END) as sin_nombre
FROM usuarios;

-- 5. Mostrar usuarios actualizados
SELECT 
  id,
  email,
  nombre,
  full_name,
  username
FROM usuarios
ORDER BY created_at DESC
LIMIT 20;
