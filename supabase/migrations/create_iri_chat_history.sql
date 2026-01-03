-- Crear tabla iri_chat_history para almacenar conversaciones con IRI
CREATE TABLE IF NOT EXISTS public.iri_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_iri_chat_user_created 
ON public.iri_chat_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_iri_chat_deleted 
ON public.iri_chat_history(deleted_at) 
WHERE deleted_at IS NULL;

-- Habilitar Row Level Security
ALTER TABLE public.iri_chat_history ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios mensajes
CREATE POLICY "Users can view their own chat history"
ON public.iri_chat_history
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios mensajes
CREATE POLICY "Users can insert their own messages"
ON public.iri_chat_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios mensajes
CREATE POLICY "Users can update their own messages"
ON public.iri_chat_history
FOR UPDATE
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden hacer soft delete de sus propios mensajes
CREATE POLICY "Users can soft delete their own messages"
ON public.iri_chat_history
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Crear tabla de backup para mensajes borrados
CREATE TABLE IF NOT EXISTS public.iri_chat_history_backup (
  id UUID,
  user_id UUID,
  role TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  backup_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para backup automático antes de borrar
CREATE OR REPLACE FUNCTION backup_iri_chat()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.iri_chat_history_backup (
    id, user_id, role, content, created_at, updated_at, deleted_at
  )
  VALUES (
    OLD.id, OLD.user_id, OLD.role, OLD.content, 
    OLD.created_at, OLD.updated_at, OLD.deleted_at
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para backup automático
DROP TRIGGER IF EXISTS backup_before_delete ON public.iri_chat_history;
CREATE TRIGGER backup_before_delete
BEFORE DELETE ON public.iri_chat_history
FOR EACH ROW EXECUTE FUNCTION backup_iri_chat();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_iri_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_iri_chat_timestamp ON public.iri_chat_history;
CREATE TRIGGER update_iri_chat_timestamp
BEFORE UPDATE ON public.iri_chat_history
FOR EACH ROW EXECUTE FUNCTION update_iri_chat_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.iri_chat_history IS 'Historial de conversaciones con IRI (asistente de IA)';
COMMENT ON COLUMN public.iri_chat_history.role IS 'Rol del mensaje: user (usuario), assistant (IRI), system (sistema)';
COMMENT ON COLUMN public.iri_chat_history.deleted_at IS 'Soft delete: NULL = activo, timestamp = borrado';
COMMENT ON TABLE public.iri_chat_history_backup IS 'Backup automático de mensajes borrados';
