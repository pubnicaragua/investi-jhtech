-- =====================================================
-- FIXES FINAL ADAPTADO AL ESQUEMA REAL - INVESTI
-- =====================================================
-- Adaptado 100% a la estructura real de tu base de datos

-- 1. CREAR NOTIFICACIONES PARA c7812eb1-c3b1-429f-aabe-ba8da052201f
-- =====================================================
-- Estructura real: user_id, type, payload, read, created_at
INSERT INTO public.notifications (user_id, type, payload, read)
SELECT 
  'c7812eb1-c3b1-429f-aabe-ba8da052201f'::uuid,
  'follow',
  jsonb_build_object(
    'from_user_id', id,
    'from_user_name', COALESCE(full_name, nombre, username),
    'message', COALESCE(full_name, nombre, username) || ' ha comenzado a seguirte'
  ),
  false
FROM public.users
WHERE email LIKE 'sebastian%@gmail.com'
  AND id != 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
LIMIT 10
ON CONFLICT DO NOTHING;

-- 2. UNIR db96e748-9bfa-4d79-bfcc-a5a92f5daf98 A TODAS LAS COMUNIDADES
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

-- 3. CREAR 3 POSTS PROFESIONALES POR COMUNIDAD
-- =====================================================
-- Estructura real de posts: contenido (NOT NULL), content, media_url, etc.

-- Post 1: Introducción
INSERT INTO public.posts (
  user_id, 
  community_id, 
  contenido, 
  content,
  media_url,
  likes_count, 
  comment_count, 
  shares_count
)
SELECT 
  'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'::uuid,
  c.id,
  '👋 ¡Hola comunidad de ' || COALESCE(c.name, c.nombre) || '! Me complace unirme a este espacio. Soy analista financiero con 5 años de experiencia en inversiones. Espero poder aportar valor y aprender de todos ustedes. ¿Cuáles son los temas más relevantes que están discutiendo actualmente?',
  '👋 ¡Hola comunidad de ' || COALESCE(c.name, c.nombre) || '! Me complace unirme a este espacio. Soy analista financiero con 5 años de experiencia en inversiones. Espero poder aportar valor y aprender de todos ustedes. ¿Cuáles son los temas más relevantes que están discutiendo actualmente?',
  '{}',
  FLOOR(RANDOM() * 15 + 5)::int,
  FLOOR(RANDOM() * 8 + 2)::int,
  FLOOR(RANDOM() * 5)::int
FROM communities c;

-- Post 2: Contenido de valor
INSERT INTO public.posts (
  user_id, 
  community_id, 
  contenido, 
  content,
  media_url,
  likes_count, 
  comment_count, 
  shares_count
)
SELECT 
  'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'::uuid,
  c.id,
  '📊 Análisis de mercado: He estado siguiendo las tendencias en ' || COALESCE(c.name, c.nombre) || ' y quiero compartir algunos insights interesantes. Los indicadores muestran una oportunidad de crecimiento del 12-15% en el próximo trimestre. ¿Alguien más ha notado estos patrones? Me gustaría conocer sus opiniones.',
  '📊 Análisis de mercado: He estado siguiendo las tendencias en ' || COALESCE(c.name, c.nombre) || ' y quiero compartir algunos insights interesantes. Los indicadores muestran una oportunidad de crecimiento del 12-15% en el próximo trimestre. ¿Alguien más ha notado estos patrones? Me gustaría conocer sus opiniones.',
  '{}',
  FLOOR(RANDOM() * 20 + 8)::int,
  FLOOR(RANDOM() * 12 + 3)::int,
  FLOOR(RANDOM() * 7 + 1)::int
FROM communities c;

-- Post 3: Pregunta/Engagement
INSERT INTO public.posts (
  user_id, 
  community_id, 
  contenido, 
  content,
  media_url,
  likes_count, 
  comment_count, 
  shares_count
)
SELECT 
  'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'::uuid,
  c.id,
  '💡 Pregunta para la comunidad: ¿Cuál es su estrategia favorita para diversificar inversiones en ' || COALESCE(c.name, c.nombre) || '? Estoy considerando diferentes enfoques y me encantaría escuchar sus experiencias. ¿Qué ha funcionado mejor para ustedes? ¿Qué errores debería evitar?',
  '💡 Pregunta para la comunidad: ¿Cuál es su estrategia favorita para diversificar inversiones en ' || COALESCE(c.name, c.nombre) || '? Estoy considerando diferentes enfoques y me encantaría escuchar sus experiencias. ¿Qué ha funcionado mejor para ustedes? ¿Qué errores debería evitar?',
  '{}',
  FLOOR(RANDOM() * 18 + 6)::int,
  FLOOR(RANDOM() * 15 + 4)::int,
  FLOOR(RANDOM() * 6)::int
FROM communities c;

-- 4. AGREGAR 10 NOTICIAS PROFESIONALES
-- =====================================================
-- Estructura real: title, content, excerpt, image_url, category, published_at
INSERT INTO public.news (
  title,
  content,
  excerpt,
  image_url,
  category,
  published_at
)
VALUES
  (
    'Bitcoin alcanza nuevo máximo histórico superando los $75,000',
    'El mercado de criptomonedas celebra mientras Bitcoin establece un nuevo récord, impulsado por la adopción institucional y el optimismo regulatorio. Los analistas predicen que este rally podría continuar en los próximos meses.',
    'Bitcoin establece nuevo récord histórico',
    'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    'criptomonedas',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'SEC aprueba nuevas regulaciones para exchanges de criptomonedas',
    'La Comisión de Valores implementa marco regulatorio más claro para plataformas de trading de activos digitales. Las nuevas reglas buscan proteger a los inversores mientras fomentan la innovación.',
    'Nuevas regulaciones para crypto exchanges',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
    'regulaciones',
    NOW() - INTERVAL '5 hours'
  ),
  (
    'Inteligencia Artificial revoluciona el análisis financiero',
    'Nuevas herramientas de IA permiten predicciones más precisas en mercados de valores, transformando la industria fintech. Las empresas que adoptan estas tecnologías reportan mejoras del 40% en precisión.',
    'IA transforma el análisis de mercados',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    'tecnologia',
    NOW() - INTERVAL '8 hours'
  ),
  (
    'Startups latinoamericanas recaudan $2.5B en Q4 2024',
    'El ecosistema emprendedor de América Latina muestra crecimiento récord con inversiones en fintech y e-commerce. Brasil, México y Chile lideran la región en captación de capital.',
    'Récord de inversión en startups latinas',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    'startups',
    NOW() - INTERVAL '12 hours'
  ),
  (
    'Fondos de inversión ESG superan rendimientos tradicionales',
    'Inversiones sostenibles demuestran mejor desempeño financiero mientras crecen las preocupaciones ambientales. Los fondos ESG han superado al S&P 500 en un 3.2% este año.',
    'Inversiones ESG lideran el mercado',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
    'inversiones',
    NOW() - INTERVAL '1 day'
  ),
  (
    'Ethereum completa actualización mejorando escalabilidad',
    'La red blockchain implementa mejoras técnicas que reducen costos de transacción en un 70%. La actualización marca un hito importante para la adopción masiva de DeFi.',
    'Ethereum reduce costos de transacción',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    'criptomonedas',
    NOW() - INTERVAL '1 day'
  ),
  (
    'Bancos centrales exploran monedas digitales (CBDC)',
    'Más de 100 países investigan implementación de monedas digitales respaldadas por gobiernos. China lidera con el yuan digital, mientras otros países aceleran sus proyectos piloto.',
    'CBDCs ganan impulso global',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
    'regulaciones',
    NOW() - INTERVAL '2 days'
  ),
  (
    'Quantum computing amenaza seguridad de criptomonedas',
    'Expertos advierten sobre necesidad de actualizar protocolos de encriptación ante avances tecnológicos. La industria crypto trabaja en soluciones resistentes a computación cuántica.',
    'Computación cuántica y crypto',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    'tecnologia',
    NOW() - INTERVAL '2 days'
  ),
  (
    'Unicornios tech de Chile atraen inversión internacional',
    'Empresas tecnológicas chilenas alcanzan valuaciones de $1B+ con apoyo de fondos globales. El ecosistema tech chileno se consolida como líder regional en innovación.',
    'Chile produce nuevos unicornios tech',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800',
    'startups',
    NOW() - INTERVAL '3 days'
  ),
  (
    'Mercado inmobiliario digital crece con tokenización',
    'Plataformas blockchain permiten inversión fraccionada en propiedades de alto valor. La tokenización democratiza el acceso al mercado inmobiliario premium.',
    'Tokenización revoluciona bienes raíces',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    'inversiones',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT DO NOTHING;

-- 5. POBLAR market_data CON DATOS MOCK
-- =====================================================
INSERT INTO public.market_data (symbol, company_name, current_price, price_change, price_change_percent, exchange, logo_url)
VALUES
  ('AAPL', 'Apple Inc.', 178.50, 2.35, 1.33, 'NASDAQ', 'https://logo.clearbit.com/apple.com'),
  ('GOOGL', 'Alphabet Inc.', 142.80, -0.95, -0.66, 'NASDAQ', 'https://logo.clearbit.com/google.com'),
  ('MSFT', 'Microsoft Corporation', 378.90, 5.20, 1.39, 'NASDAQ', 'https://logo.clearbit.com/microsoft.com'),
  ('AMZN', 'Amazon.com Inc.', 145.30, -1.20, -0.82, 'NASDAQ', 'https://logo.clearbit.com/amazon.com'),
  ('TSLA', 'Tesla Inc.', 242.80, 8.50, 3.63, 'NASDAQ', 'https://logo.clearbit.com/tesla.com'),
  ('META', 'Meta Platforms Inc.', 325.60, 4.20, 1.31, 'NASDAQ', 'https://logo.clearbit.com/meta.com'),
  ('NVDA', 'NVIDIA Corporation', 495.20, 12.80, 2.65, 'NASDAQ', 'https://logo.clearbit.com/nvidia.com'),
  ('AMD', 'Advanced Micro Devices', 118.40, -2.10, -1.74, 'NASDAQ', 'https://logo.clearbit.com/amd.com'),
  ('VALE', 'Vale S.A.', 12.45, 0.35, 2.89, 'NYSE', NULL),
  ('PBR', 'Petrobras', 15.80, -0.25, -1.56, 'NYSE', NULL),
  ('SQM', 'Sociedad Química y Minera', 45.30, 1.20, 2.72, 'NYSE', NULL),
  ('COPEC.SN', 'Empresas Copec', 6250.00, 50.00, 0.81, 'Santiago', NULL)
ON CONFLICT (symbol) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  price_change = EXCLUDED.price_change,
  price_change_percent = EXCLUDED.price_change_percent,
  updated_at = NOW();

-- 6. ASEGURAR ONBOARDING COMPLETO
-- =====================================================
UPDATE users 
SET onboarding_step = 'completed' 
WHERE email LIKE 'sebastian%@gmail.com' 
   OR id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
   OR id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98';

-- 7. FUNCIONES DE RECOMENDACIONES SIMPLIFICADAS
-- =====================================================
DROP FUNCTION IF EXISTS get_recommended_communities(uuid, int);

CREATE OR REPLACE FUNCTION get_recommended_communities(user_id_param uuid, limit_param int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  name text,
  descripcion text,
  image_url text,
  member_count int,
  is_member boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    COALESCE(c.name, c.nombre) as name,
    c.descripcion,
    COALESCE(c.image_url, c.icono_url) as image_url,
    c.member_count,
    EXISTS(SELECT 1 FROM community_members WHERE community_id = c.id AND user_id = user_id_param) as is_member
  FROM communities c
  WHERE NOT EXISTS(SELECT 1 FROM community_members WHERE community_id = c.id AND user_id = user_id_param)
  ORDER BY RANDOM()
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

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
  is_following boolean
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
    EXISTS(SELECT 1 FROM user_follows WHERE follower_id = user_id_param AND following_id = u.id) as is_following
  FROM users u
  WHERE u.id != user_id_param
  AND u.onboarding_step = 'completed'
  AND NOT EXISTS(SELECT 1 FROM user_follows WHERE follower_id = user_id_param AND following_id = u.id)
  ORDER BY RANDOM()
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- 8. VERIFICACIÓN FINAL
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
FROM news
UNION ALL
SELECT 
  'Datos de mercado',
  COUNT(*)::text
FROM market_data;
