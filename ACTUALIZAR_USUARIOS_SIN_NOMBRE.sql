-- =====================================================
-- ACTUALIZAR USUARIOS SIN NOMBRE
-- =====================================================

-- Actualizar usuarios que tienen full_name NULL
UPDATE users
SET full_name = COALESCE(nombre, username, 'Usuario ' || SUBSTRING(id::text, 1, 8))
WHERE full_name IS NULL OR full_name = '';

-- Actualizar usuarios que tienen nombre NULL
UPDATE users
SET nombre = COALESCE(full_name, username, 'Usuario ' || SUBSTRING(id::text, 1, 8))
WHERE nombre IS NULL OR nombre = '';

-- Verificar que todos tengan nombre
SELECT 
  id,
  COALESCE(full_name, nombre, username, 'Usuario') as display_name,
  full_name,
  nombre,
  username
FROM users
WHERE full_name IS NULL OR nombre IS NULL
ORDER BY created_at DESC;
