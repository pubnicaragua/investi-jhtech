-- Agregar columna expires_at a community_invitations

ALTER TABLE community_invitations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days');

-- Actualizar invitaciones existentes
UPDATE community_invitations 
SET expires_at = created_at + INTERVAL '7 days'
WHERE expires_at IS NULL;
