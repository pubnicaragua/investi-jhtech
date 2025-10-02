-- =====================================================
-- CREATE POST SCREEN - SUPABASE SQL MIGRATIONS
-- =====================================================
-- Este archivo contiene todas las tablas, funciones RPC,
-- índices y políticas RLS necesarias para el CreatePostScreen
-- =====================================================

-- ===== TABLAS =====

-- Tabla para media de posts (imágenes, videos, documentos)
CREATE TABLE IF NOT EXISTS post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'document')),
  mime_type TEXT,
  file_size BIGINT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_post_media_created_at ON post_media(created_at DESC);

-- Tabla para encuestas (polls)
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  duration_hours INTEGER NOT NULL DEFAULT 24,
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_polls_post_id ON polls(post_id);
CREATE INDEX IF NOT EXISTS idx_polls_ends_at ON polls(ends_at);

-- Tabla para opciones de encuesta
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL CHECK (char_length(option_text) <= 80),
  option_order INTEGER NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_order ON poll_options(poll_id, option_order);

-- Tabla para votos de encuesta
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);

-- Tabla para celebraciones
CREATE TABLE IF NOT EXISTS post_celebrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  celebration_type TEXT NOT NULL CHECK (celebration_type IN ('milestone', 'achievement', 'success', 'investment_win', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_celebrations_post_id ON post_celebrations(post_id);

-- Tabla para partnerships (búsqueda de socios)
CREATE TABLE IF NOT EXISTS post_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL,
  investment_amount TEXT,
  location TEXT,
  partnership_type TEXT DEFAULT 'equity' CHECK (partnership_type IN ('equity', 'loan', 'joint_venture', 'other')),
  requirements TEXT[],
  contact_preferences TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_partnerships_post_id ON post_partnerships(post_id);
CREATE INDEX IF NOT EXISTS idx_post_partnerships_location ON post_partnerships(location);

-- ===== FUNCIONES RPC =====

-- Función para crear post con todos sus hijos (media, poll, celebration, partnership)
CREATE OR REPLACE FUNCTION create_post_with_children(payload JSON)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_id UUID;
  v_poll_id UUID;
  v_media_item JSON;
  v_poll_option TEXT;
  v_result JSON;
  v_option_order INTEGER;
BEGIN
  -- Crear el post principal
  INSERT INTO posts (user_id, contenido, community_id)
  VALUES (
    (payload->>'user_id')::UUID,
    payload->>'content',
    CASE 
      WHEN payload->>'audience_type' = 'community' THEN (payload->>'audience_id')::UUID
      ELSE NULL
    END
  )
  RETURNING id INTO v_post_id;

  -- Agregar media si existe
  IF payload->'media' IS NOT NULL THEN
    FOR v_media_item IN SELECT * FROM json_array_elements(payload->'media')
    LOOP
      INSERT INTO post_media (post_id, media_url, media_type, mime_type, file_size)
      VALUES (
        v_post_id,
        v_media_item->>'url',
        v_media_item->>'type',
        v_media_item->>'mime',
        (v_media_item->>'size')::BIGINT
      );
    END LOOP;
  END IF;

  -- Agregar poll si existe
  IF payload->'poll' IS NOT NULL THEN
    INSERT INTO polls (post_id, duration_hours, ends_at)
    VALUES (
      v_post_id,
      (payload->'poll'->>'duration_days')::INTEGER * 24,
      NOW() + ((payload->'poll'->>'duration_days')::INTEGER || ' days')::INTERVAL
    )
    RETURNING id INTO v_poll_id;

    -- Agregar opciones del poll
    v_option_order := 1;
    FOR v_poll_option IN SELECT * FROM json_array_elements_text(payload->'poll'->'options')
    LOOP
      INSERT INTO poll_options (poll_id, option_text, option_order)
      VALUES (v_poll_id, v_poll_option, v_option_order);
      v_option_order := v_option_order + 1;
    END LOOP;
  END IF;

  -- Agregar celebration si existe
  IF payload->'celebration' IS NOT NULL THEN
    INSERT INTO post_celebrations (post_id, celebration_type)
    VALUES (v_post_id, payload->'celebration'->>'type');
  END IF;

  -- Agregar partnership si existe
  IF payload->'partnership' IS NOT NULL THEN
    INSERT INTO post_partnerships (post_id, business_type, investment_amount, location)
    VALUES (
      v_post_id,
      payload->'partnership'->>'business_type',
      payload->'partnership'->>'investment_amount',
      payload->'partnership'->>'location'
    );
  END IF;

  -- Retornar el ID del post creado
  v_result := json_build_object('id', v_post_id);
  RETURN v_result;
END;
$$;

-- Función para paginar comunidades del usuario con búsqueda
CREATE OR REPLACE FUNCTION get_user_communities_paged(
  p_user_id UUID,
  p_query TEXT DEFAULT '',
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 20
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INTEGER;
  v_result JSON;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  SELECT json_build_object(
    'items', COALESCE(json_agg(community_data), '[]'::json),
    'hasMore', COUNT(*) > p_page_size
  )
  INTO v_result
  FROM (
    SELECT json_build_object(
      'id', c.id,
      'name', c.nombre,
      'image_url', c.icono_url,
      'member_count', (
        SELECT COUNT(*) FROM user_communities uc2 
        WHERE uc2.community_id = c.id
      )
    ) as community_data
    FROM user_communities uc
    INNER JOIN communities c ON c.id = uc.community_id
    WHERE uc.user_id = p_user_id
      AND (p_query = '' OR c.nombre ILIKE '%' || p_query || '%')
    ORDER BY uc.joined_at DESC
    LIMIT p_page_size + 1
    OFFSET v_offset
  ) subquery;

  RETURN v_result;
END;
$$;

-- ===== POLÍTICAS RLS (Row Level Security) =====

-- post_media: lectura pública, escritura solo del autor
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_media_select_public" ON post_media
  FOR SELECT USING (true);

CREATE POLICY "post_media_insert_owner" ON post_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_media.post_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "post_media_delete_owner" ON post_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_media.post_id 
      AND p.user_id = auth.uid()
    )
  );

-- polls: lectura pública, escritura solo del autor
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "polls_select_public" ON polls
  FOR SELECT USING (true);

CREATE POLICY "polls_insert_owner" ON polls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = polls.post_id 
      AND p.user_id = auth.uid()
    )
  );

-- poll_options: lectura pública, escritura solo del autor
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "poll_options_select_public" ON poll_options
  FOR SELECT USING (true);

CREATE POLICY "poll_options_insert_owner" ON poll_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls po
      INNER JOIN posts p ON p.id = po.post_id
      WHERE po.id = poll_options.poll_id 
      AND p.user_id = auth.uid()
    )
  );

-- poll_votes: lectura pública, escritura solo del usuario autenticado
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "poll_votes_select_public" ON poll_votes
  FOR SELECT USING (true);

CREATE POLICY "poll_votes_insert_authenticated" ON poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- post_celebrations: lectura pública, escritura solo del autor
ALTER TABLE post_celebrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_celebrations_select_public" ON post_celebrations
  FOR SELECT USING (true);

CREATE POLICY "post_celebrations_insert_owner" ON post_celebrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_celebrations.post_id 
      AND p.user_id = auth.uid()
    )
  );

-- post_partnerships: lectura pública, escritura solo del autor
ALTER TABLE post_partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_partnerships_select_public" ON post_partnerships
  FOR SELECT USING (true);

CREATE POLICY "post_partnerships_insert_owner" ON post_partnerships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_partnerships.post_id 
      AND p.user_id = auth.uid()
    )
  );

-- ===== TRIGGERS =====

-- Trigger para actualizar updated_at en polls
CREATE OR REPLACE FUNCTION update_polls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW
  EXECUTE FUNCTION update_polls_updated_at();

-- Trigger para actualizar vote_count en poll_options
CREATE OR REPLACE FUNCTION update_poll_option_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE poll_options 
    SET vote_count = vote_count + 1 
    WHERE id = NEW.option_id;
    
    UPDATE polls 
    SET total_votes = total_votes + 1 
    WHERE id = NEW.poll_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE poll_options 
    SET vote_count = vote_count - 1 
    WHERE id = OLD.option_id;
    
    UPDATE polls 
    SET total_votes = total_votes - 1 
    WHERE id = OLD.poll_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_poll_vote_count
  AFTER INSERT OR DELETE ON poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_poll_option_vote_count();

-- ===== STORAGE BUCKET =====
-- Nota: Esto debe ejecutarse en el dashboard de Supabase Storage
-- o mediante la API de administración

-- Crear bucket 'media' si no existe (público)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('media', 'media', true)
-- ON CONFLICT (id) DO NOTHING;

-- Política de lectura pública
-- CREATE POLICY "media_select_public" ON storage.objects
--   FOR SELECT USING (bucket_id = 'media');

-- Política de subida autenticada
-- CREATE POLICY "media_insert_authenticated" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'media' 
--     AND auth.role() = 'authenticated'
--   );

-- Política de eliminación solo del propietario
-- CREATE POLICY "media_delete_owner" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'media' 
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ===== COMENTARIOS Y NOTAS =====
-- 1. Asegúrate de que la tabla 'posts' ya existe con columnas: id, user_id, contenido, community_id, created_at
-- 2. Asegúrate de que la tabla 'users' existe con columna: id
-- 3. Asegúrate de que la tabla 'communities' existe con columnas: id, nombre, icono_url
-- 4. El bucket 'media' debe crearse manualmente en Supabase Storage Dashboard
-- 5. Todas las políticas RLS asumen que auth.uid() devuelve el UUID del usuario autenticado
