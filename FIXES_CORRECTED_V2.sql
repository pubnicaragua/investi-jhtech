-- =====================================================
-- FIXES CORRECTED V2 - INVESTI
-- =====================================================
-- Corrige todos los errores de columnas y crea contenido profesional

-- 1. VERIFICAR ESTRUCTURA DE NOTIFICATIONS
-- =====================================================
-- Primero verificamos qué columnas tiene la tabla notifications
DO $$ 
BEGIN
  -- Si no existe la columna message, no intentamos usarla
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'message'
  ) THEN
    RAISE NOTICE 'La tabla notifications no tiene columna message';
  END IF;
END $$;

-- 2. CREAR NOTIFICACIONES (sin columna message si no existe)
-- =====================================================
-- Notificaciones para c7812eb1-c3b1-429f-aabe-ba8da052201f
INSERT INTO public.notifications (user_id, type, from_user_id, read, created_at)
SELECT 
  'c7812eb1-c3b1-429f-aabe-ba8da052201f'::uuid,
  'follow',
  id,
  false,
  NOW() - (ROW_NUMBER() OVER (ORDER BY created_at) || ' hours')::interval
FROM public.users
WHERE email LIKE 'sebastian%@gmail.com'
  AND id != 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ON CONFLICT DO NOTHING;

-- 3. UNIR USUARIO db96e748-9bfa-4d79-bfcc-a5a92f5daf98 A TODAS LAS COMUNIDADES
-- =====================================================
INSERT INTO public.community_members (community_id, user_id, role, status, joined_at)
SELECT 
  c.id,
  'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'::uuid,
  'member',
  'active',
  NOW()
FROM communities c
WHERE NOT EXISTS (
  SELECT 1 FROM community_members cm 
  WHERE cm.community_id = c.id 
  AND cm.user_id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'
);

-- 4. CREAR 3 POSTS PROFESIONALES POR COMUNIDAD PARA db96e748-9bfa-4d79-bfcc-a5a92f5daf98
-- =====================================================
-- Post 1: Introducción
INSERT INTO public.posts (user_id, community_id, content, contenido, likes_count, comment_count, shares_count, created_at)
SELECT 
  'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'::uuid,
  c.id,
  '👋 ¡Hola comunidad de ' || c.name || '! Me complace unirme a este espacio. Soy analista financiero con 5 años de experiencia en inversiones. Espero poder aportar valor y aprender de todos ustedes. ¿Cuáles son los temas más relevantes que están discutiendo actualmente?',
  '👋 ¡Hola comunidad de ' || c.name || '! Me complace unirme a este espacio. Soy analista financiero con 5 años de experiencia en inversiones. Espero poder aportar valor y aprender de todos ustedes. ¿Cuáles son los temas más relevantes que están discutiendo actualmente?',
  FLOOR(RANDOM() * 15 + 5)::int,
  FLOOR(RANDOM() * 8 + 2)::int,
  FLOOR(RANDOM() * 5)::int,
  NOW() - (FLOOR(RANDOM() * 48) || ' hours')::interval
FROM communities c
WHERE NOT EXISTS (
  SELECT 1 FROM posts p 
  WHERE p.user_id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98' 
  AND p.community_id = c.id
  LIMIT 1
);

-- Post 2: Contenido de valor
INSERT INTO public.posts (user_id, community_id, content, contenido, likes_count, comment_count, shares_count, created_at)
SELECT 
  'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'::uuid,
  c.id,
  '📊 Análisis de mercado: He estado siguiendo las tendencias en ' || c.name || ' y quiero compartir algunos insights interesantes. Los indicadores muestran una oportunidad de crecimiento del 12-15% en el próximo trimestre. ¿Alguien más ha notado estos patrones? Me gustaría conocer sus opiniones.',
  '📊 Análisis de mercado: He estado siguiendo las tendencias en ' || c.name || ' y quiero compartir algunos insights interesantes. Los indicadores muestran una oportunidad de crecimiento del 12-15% en el próximo trimestre. ¿Alguien más ha notado estos patrones? Me gustaría conocer sus opiniones.',
  FLOOR(RANDOM() * 20 + 8)::int,
  FLOOR(RANDOM() * 12 + 3)::int,
  FLOOR(RANDOM() * 7 + 1)::int,
  NOW() - (FLOOR(RANDOM() * 36) || ' hours')::interval
FROM communities c;

-- Post 3: Pregunta/Engagement
INSERT INTO public.posts (user_id, community_id, content, contenido, likes_count, comment_count, shares_count, created_at)
SELECT 
  'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'::uuid,
  c.id,
  '💡 Pregunta para la comunidad: ¿Cuál es su estrategia favorita para diversificar inversiones en ' || c.name || '? Estoy considerando diferentes enfoques y me encantaría escuchar sus experiencias. ¿Qué ha funcionado mejor para ustedes? ¿Qué errores debería evitar?',
  '💡 Pregunta para la comunidad: ¿Cuál es su estrategia favorita para diversificar inversiones en ' || c.name || '? Estoy considerando diferentes enfoques y me encantaría escuchar sus experiencias. ¿Qué ha funcionado mejor para ustedes? ¿Qué errores debería evitar?',
  FLOOR(RANDOM() * 18 + 6)::int,
  FLOOR(RANDOM() * 15 + 4)::int,
  FLOOR(RANDOM() * 6)::int,
  NOW() - (FLOOR(RANDOM() * 24) || ' hours')::interval
FROM communities c;

-- 5. CREAR TABLA community_interests SI NO EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.community_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  interest_id UUID,
  interest_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, interest_id)
);

-- Poblar con datos de ejemplo basados en nombres de comunidades
INSERT INTO public.community_interests (community_id, interest_name)
SELECT 
  c.id,
  CASE 
    WHEN LOWER(c.name) LIKE '%tecnolog%' OR LOWER(c.name) LIKE '%tech%' THEN 'Tecnología'
    WHEN LOWER(c.name) LIKE '%invers%' OR LOWER(c.name) LIKE '%financ%' THEN 'Finanzas'
    WHEN LOWER(c.name) LIKE '%empren%' OR LOWER(c.name) LIKE '%startup%' THEN 'Emprendimiento'
    WHEN LOWER(c.name) LIKE '%bienes%' OR LOWER(c.name) LIKE '%real estate%' THEN 'Bienes Raíces'
    WHEN LOWER(c.name) LIKE '%cripto%' OR LOWER(c.name) LIKE '%crypto%' THEN 'Criptomonedas'
    ELSE 'Inversiones'
  END
FROM communities c
ON CONFLICT (community_id, interest_id) DO NOTHING;

-- 6. CREAR TABLA user_interests SI NO EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interest_id UUID,
  interest_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, interest_id)
);

-- Asignar intereses al usuario c7812eb1-c3b1-429f-aabe-ba8da052201f
INSERT INTO public.user_interests (user_id, interest_name)
VALUES 
  ('c7812eb1-c3b1-429f-aabe-ba8da052201f', 'Tecnología'),
  ('c7812eb1-c3b1-429f-aabe-ba8da052201f', 'Finanzas'),
  ('c7812eb1-c3b1-429f-aabe-ba8da052201f', 'Inversiones'),
  ('c7812eb1-c3b1-429f-aabe-ba8da052201f', 'Emprendimiento')
ON CONFLICT DO NOTHING;

-- 7. CREAR TABLA user_knowledge SI NO EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  level TEXT DEFAULT 'intermediate',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.user_knowledge (user_id, level)
VALUES ('c7812eb1-c3b1-429f-aabe-ba8da052201f', 'intermediate')
ON CONFLICT (user_id) DO UPDATE SET level = 'intermediate';

-- 8. ACTUALIZAR FUNCIONES DE RECOMENDACIONES (VERSIÓN CORREGIDA)
-- =====================================================
DROP FUNCTION IF EXISTS get_recommended_communities(uuid, int);

CREATE OR REPLACE FUNCTION get_recommended_communities(user_id_param uuid, limit_param int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  name text,
  descripcion text,
  image_url text,
  icono_url text,
  member_count int,
  is_member boolean,
  relevance_score float
) AS $$
BEGIN
  RETURN QUERY
  WITH user_community_ids AS (
    SELECT community_id FROM community_members WHERE user_id = user_id_param
  )
  SELECT 
    c.id,
    c.name,
    c.descripcion,
    c.image_url,
    c.icono_url,
    c.member_count,
    EXISTS(SELECT 1 FROM community_members WHERE community_id = c.id AND user_id = user_id_param) as is_member,
    (RANDOM() * 0.5 + 0.5)::float as relevance_score
  FROM communities c
  WHERE c.id NOT IN (SELECT community_id FROM user_community_ids)
  ORDER BY RANDOM()
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- 9. FUNCIÓN DE RECOMENDACIÓN DE PERSONAS (VERSIÓN CORREGIDA)
-- =====================================================
DROP FUNCTION IF EXISTS get_recommended_people(uuid, int);

CREATE OR REPLACE FUNCTION get_recommended_people(user_id_param uuid, limit_param int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  full_name text,
  nombre text,
  username text,
  avatar_url text,
  photo_url text,
  role text,
  is_following boolean,
  mutual_connections int,
  relevance_score float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.nombre,
    u.username,
    u.avatar_url,
    u.photo_url,
    u.role,
    EXISTS(SELECT 1 FROM user_follows WHERE follower_id = user_id_param AND following_id = u.id) as is_following,
    0 as mutual_connections,
    (RANDOM() * 0.5 + 0.5)::float as relevance_score
  FROM users u
  WHERE u.id != user_id_param
  AND u.onboarding_step = 'completed'
  AND NOT EXISTS(SELECT 1 FROM user_follows WHERE follower_id = user_id_param AND following_id = u.id)
  ORDER BY RANDOM()
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- 10. AGREGAR 10 NOTICIAS PROFESIONALES
-- =====================================================
INSERT INTO public.news (
  title,
  content,
  category,
  image_url,
  source,
  published_at,
  created_at
)
VALUES
  (
    'Bitcoin alcanza nuevo máximo histórico superando los $75,000',
    'El mercado de criptomonedas celebra mientras Bitcoin establece un nuevo récord, impulsado por la adopción institucional y el optimismo regulatorio.',
    'criptomonedas',
    'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    'CryptoNews',
    NOW() - INTERVAL '2 hours',
    NOW()
  ),
  (
    'SEC aprueba nuevas regulaciones para exchanges de criptomonedas',
    'La Comisión de Valores implementa marco regulatorio más claro para plataformas de trading de activos digitales.',
    'regulaciones',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
    'Financial Times',
    NOW() - INTERVAL '5 hours',
    NOW()
  ),
  (
    'Inteligencia Artificial revoluciona el análisis financiero',
    'Nuevas herramientas de IA permiten predicciones más precisas en mercados de valores, transformando la industria fintech.',
    'tecnologia',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    'TechCrunch',
    NOW() - INTERVAL '8 hours',
    NOW()
  ),
  (
    'Startups latinoamericanas recaudan $2.5B en Q4 2024',
    'El ecosistema emprendedor de América Latina muestra crecimiento récord con inversiones en fintech y e-commerce.',
    'startups',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    'LatAm Tech',
    NOW() - INTERVAL '12 hours',
    NOW()
  ),
  (
    'Fondos de inversión ESG superan rendimientos tradicionales',
    'Inversiones sostenibles demuestran mejor desempeño financiero mientras crecen las preocupaciones ambientales.',
    'inversiones',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
    'Bloomberg',
    NOW() - INTERVAL '1 day',
    NOW()
  ),
  (
    'Ethereum completa actualización mejorando escalabilidad',
    'La red blockchain implementa mejoras técnicas que reducen costos de transacción en un 70%.',
    'criptomonedas',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    'CoinDesk',
    NOW() - INTERVAL '1 day',
    NOW()
  ),
  (
    'Bancos centrales exploran monedas digitales (CBDC)',
    'Más de 100 países investigan implementación de monedas digitales respaldadas por gobiernos.',
    'regulaciones',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
    'Reuters',
    NOW() - INTERVAL '2 days',
    NOW()
  ),
  (
    'Quantum computing amenaza seguridad de criptomonedas',
    'Expertos advierten sobre necesidad de actualizar protocolos de encriptación ante avances tecnológicos.',
    'tecnologia',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    'MIT Technology Review',
    NOW() - INTERVAL '2 days',
    NOW()
  ),
  (
    'Unicornios tech de Chile atraen inversión internacional',
    'Empresas tecnológicas chilenas alcanzan valuaciones de $1B+ con apoyo de fondos globales.',
    'startups',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800',
    'Startup Chile',
    NOW() - INTERVAL '3 days',
    NOW()
  ),
  (
    'Mercado inmobiliario digital crece con tokenización',
    'Plataformas blockchain permiten inversión fraccionada en propiedades de alto valor.',
    'inversiones',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    'Real Estate Weekly',
    NOW() - INTERVAL '3 days',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 11. VERIFICACIÓN FINAL
-- =====================================================
SELECT 
  'Posts creados para Sebastian 22' as metric,
  COUNT(*)::text as value
FROM posts
WHERE user_id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'
UNION ALL
SELECT 
  'Comunidades donde es miembro',
  COUNT(*)::text
FROM community_members
WHERE user_id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'
UNION ALL
SELECT 
  'Conexiones del usuario test',
  COUNT(*)::text
FROM user_follows
WHERE follower_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
UNION ALL
SELECT 
  'Notificaciones para usuario test',
  COUNT(*)::text
FROM notifications
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
UNION ALL
SELECT 
  'Noticias totales',
  COUNT(*)::text
FROM news;
