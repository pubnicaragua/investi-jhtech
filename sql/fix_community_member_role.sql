-- ============================================================================
-- FIX COMMUNITY MEMBER ROLE
-- Verifica y corrige el rol de un usuario en una comunidad
-- ============================================================================

-- 1. Ver el estado actual de la comunidad
SELECT 
  c.id,
  c.name,
  c.created_by,
  c.created_at
FROM communities c
WHERE c.id = '0ab8bf8f-02c2-49f2-8906-4d131027ba6e';

-- 2. Ver todos los miembros de esta comunidad
SELECT 
  cm.user_id,
  cm.role,
  cm.joined_at,
  u.name,
  u.username,
  u.email
FROM community_members cm
LEFT JOIN users u ON u.id = cm.user_id
WHERE cm.community_id = '0ab8bf8f-02c2-49f2-8906-4d131027ba6e'
ORDER BY cm.joined_at;

-- 3. Verificar si el creador de la comunidad está en community_members
-- Si no está, agregarlo como 'owner'
INSERT INTO community_members (user_id, community_id, role, joined_at)
SELECT 
  c.created_by,
  c.id,
  'owner',
  c.created_at
FROM communities c
WHERE c.id = '0ab8bf8f-02c2-49f2-8906-4d131027ba6e'
  AND NOT EXISTS (
    SELECT 1 
    FROM community_members cm 
    WHERE cm.community_id = c.id 
      AND cm.user_id = c.created_by
  );

-- 4. Si ya existe pero con rol incorrecto, actualizarlo a 'owner'
UPDATE community_members cm
SET role = 'owner'
FROM communities c
WHERE cm.community_id = c.id
  AND cm.user_id = c.created_by
  AND c.id = '0ab8bf8f-02c2-49f2-8906-4d131027ba6e'
  AND cm.role != 'owner';

-- 5. Verificar el resultado final
SELECT 
  cm.user_id,
  cm.role,
  cm.joined_at,
  u.name,
  u.username,
  u.email,
  CASE 
    WHEN c.created_by = cm.user_id THEN '✅ CREADOR'
    ELSE ''
  END as is_creator
FROM community_members cm
LEFT JOIN users u ON u.id = cm.user_id
LEFT JOIN communities c ON c.id = cm.community_id
WHERE cm.community_id = '0ab8bf8f-02c2-49f2-8906-4d131027ba6e'
ORDER BY 
  CASE cm.role
    WHEN 'owner' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'moderator' THEN 3
    ELSE 4
  END,
  cm.joined_at;
