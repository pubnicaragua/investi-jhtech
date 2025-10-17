-- Agregar columna status a community_members si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'community_members'
                 AND column_name = 'status') THEN
    ALTER TABLE public.community_members
    ADD COLUMN status text DEFAULT 'active' CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'banned'::text]));
  END IF;
END $$;

-- Actualizar registros existentes para que tengan status 'active'
UPDATE public.community_members
SET status = 'active'
WHERE status IS NULL;

-- Crear tabla community_post para publicaciones específicas de comunidad
-- Esta tabla separa las publicaciones de comunidad de las publicaciones generales

CREATE TABLE public.community_post (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL,
  user_id uuid NOT NULL,
  contenido text NOT NULL,
  media_url text[] DEFAULT '{}'::text[],
  likes_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_pinned boolean DEFAULT false,
  pinned_by uuid,
  pinned_at timestamp with time zone,
  CONSTRAINT community_post_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE,
  CONSTRAINT community_post_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT community_post_pinned_by_fkey FOREIGN KEY (pinned_by) REFERENCES public.users(id)
);

-- Crear índices para optimización
CREATE INDEX idx_community_post_community_id ON public.community_post(community_id);
CREATE INDEX idx_community_post_user_id ON public.community_post(user_id);
CREATE INDEX idx_community_post_created_at ON public.community_post(created_at DESC);
CREATE INDEX idx_community_post_community_created ON public.community_post(community_id, created_at DESC);

-- Políticas RLS (Row Level Security)
ALTER TABLE public.community_post ENABLE ROW LEVEL SECURITY;

-- Política: Los miembros de la comunidad pueden ver las publicaciones
CREATE POLICY "Community members can view community posts" ON public.community_post
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_post.community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

-- Política: Los miembros pueden crear publicaciones en su comunidad
CREATE POLICY "Community members can create posts" ON public.community_post
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_post.community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

-- Política: Solo el autor puede actualizar su publicación
CREATE POLICY "Authors can update own posts" ON public.community_post
  FOR UPDATE USING (auth.uid() = user_id);

-- Política: Solo el autor puede eliminar su publicación
CREATE POLICY "Authors can delete own posts" ON public.community_post
  FOR DELETE USING (auth.uid() = user_id);

-- Política: Moderadores/admins pueden gestionar publicaciones (pin, etc.)
CREATE POLICY "Moderators can manage posts" ON public.community_post
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = community_post.community_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('moderator', 'admin')
      AND cm.status = 'active'
    )
  );

-- Crear tabla para likes en publicaciones de comunidad
CREATE TABLE public.community_post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  is_like boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_likes_unique UNIQUE (community_post_id, user_id),
  CONSTRAINT community_post_likes_post_id_fkey FOREIGN KEY (community_post_id) REFERENCES public.community_post(id) ON DELETE CASCADE,
  CONSTRAINT community_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Políticas RLS para likes
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view likes on community posts they can see" ON public.community_post_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = (SELECT cp.community_id FROM public.community_post cp WHERE cp.id = community_post_likes.community_post_id)
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can manage their own likes" ON public.community_post_likes
  FOR ALL USING (auth.uid() = user_id);

-- Crear tabla para comentarios en publicaciones de comunidad
CREATE TABLE public.community_post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  parent_id uuid,
  contenido text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_comments_post_id_fkey FOREIGN KEY (community_post_id) REFERENCES public.community_post(id) ON DELETE CASCADE,
  CONSTRAINT community_post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT community_post_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.community_post_comments(id) ON DELETE CASCADE
);

-- Políticas RLS para comentarios
ALTER TABLE public.community_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on community posts they can see" ON public.community_post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = (SELECT cp.community_id FROM public.community_post cp WHERE cp.id = community_post_comments.community_post_id)
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Community members can create comments" ON public.community_post_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = (SELECT cp.community_id FROM public.community_post cp WHERE cp.id = community_post_comments.community_post_id)
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Authors can update own comments" ON public.community_post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete own comments" ON public.community_post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Crear tabla para guardar publicaciones de comunidad
CREATE TABLE public.community_post_saves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_post_saves_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_saves_unique UNIQUE (community_post_id, user_id),
  CONSTRAINT community_post_saves_post_id_fkey FOREIGN KEY (community_post_id) REFERENCES public.community_post(id) ON DELETE CASCADE,
  CONSTRAINT community_post_saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Políticas RLS para saves
ALTER TABLE public.community_post_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saves" ON public.community_post_saves
  FOR ALL USING (auth.uid() = user_id);

-- Crear tabla para compartir publicaciones de comunidad
CREATE TABLE public.community_post_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  shared_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_post_shares_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_shares_post_id_fkey FOREIGN KEY (community_post_id) REFERENCES public.community_post(id) ON DELETE CASCADE,
  CONSTRAINT community_post_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Políticas RLS para shares
ALTER TABLE public.community_post_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares on community posts they can see" ON public.community_post_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = (SELECT cp.community_id FROM public.community_post cp WHERE cp.id = community_post_shares.community_post_id)
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Community members can share posts" ON public.community_post_shares
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.community_members cm
      WHERE cm.community_id = (SELECT cp.community_id FROM public.community_post cp WHERE cp.id = community_post_shares.community_post_id)
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

-- Funciones para actualizar contadores automáticamente

-- Función para actualizar likes_count en community_post
CREATE OR REPLACE FUNCTION update_community_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_post
    SET likes_count = likes_count + 1
    WHERE id = NEW.community_post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_post
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.community_post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para likes
CREATE TRIGGER trg_community_post_likes_count
  AFTER INSERT OR DELETE ON public.community_post_likes
  FOR EACH ROW EXECUTE FUNCTION update_community_post_likes_count();

-- Función para actualizar comment_count en community_post
CREATE OR REPLACE FUNCTION update_community_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_post
    SET comment_count = comment_count + 1
    WHERE id = NEW.community_post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_post
    SET comment_count = GREATEST(comment_count - 1, 0)
    WHERE id = OLD.community_post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para comentarios
CREATE TRIGGER trg_community_post_comments_count
  AFTER INSERT OR DELETE ON public.community_post_comments
  FOR EACH ROW EXECUTE FUNCTION update_community_post_comments_count();

-- Función para actualizar shares_count en community_post
CREATE OR REPLACE FUNCTION update_community_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_post
    SET shares_count = shares_count + 1
    WHERE id = NEW.community_post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_post
    SET shares_count = GREATEST(shares_count - 1, 0)
    WHERE id = OLD.community_post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para shares
CREATE TRIGGER trg_community_post_shares_count
  AFTER INSERT OR DELETE ON public.community_post_shares
  FOR EACH ROW EXECUTE FUNCTION update_community_post_shares_count();

-- Función para actualizar updated_at en community_post
CREATE OR REPLACE FUNCTION update_community_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER trg_community_post_updated_at
  BEFORE UPDATE ON public.community_post
  FOR EACH ROW EXECUTE FUNCTION update_community_post_updated_at();

-- Función para actualizar updated_at en community_post_comments
CREATE OR REPLACE FUNCTION update_community_post_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at en comentarios
CREATE TRIGGER trg_community_post_comment_updated_at
  BEFORE UPDATE ON public.community_post_comments
  FOR EACH ROW EXECUTE FUNCTION update_community_post_comment_updated_at();
