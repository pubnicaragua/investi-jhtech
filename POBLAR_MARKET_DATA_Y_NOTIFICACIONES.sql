-- =====================================================
-- POBLAR MARKET_DATA Y GENERAR NOTIFICACIONES REALES
-- =====================================================

-- 1. POBLAR market_data (para que searchApiService lo encuentre)
-- =====================================================
-- Esto es necesario porque SearchAPI falla por CORS
-- El servicio busca primero en Supabase, luego intenta API, luego mock

INSERT INTO public.market_data (symbol, company_name, current_price, price_change, price_change_percent, exchange, logo_url, updated_at)
VALUES
  ('AAPL', 'Apple Inc.', 178.50, 2.35, 1.33, 'NASDAQ', 'https://logo.clearbit.com/apple.com', NOW()),
  ('GOOGL', 'Alphabet Inc.', 142.80, -0.95, -0.66, 'NASDAQ', 'https://logo.clearbit.com/google.com', NOW()),
  ('MSFT', 'Microsoft Corporation', 378.90, 5.20, 1.39, 'NASDAQ', 'https://logo.clearbit.com/microsoft.com', NOW()),
  ('AMZN', 'Amazon.com Inc.', 145.30, -1.20, -0.82, 'NASDAQ', 'https://logo.clearbit.com/amazon.com', NOW()),
  ('TSLA', 'Tesla Inc.', 242.80, 8.50, 3.63, 'NASDAQ', 'https://logo.clearbit.com/tesla.com', NOW()),
  ('META', 'Meta Platforms Inc.', 325.60, 4.20, 1.31, 'NASDAQ', 'https://logo.clearbit.com/meta.com', NOW()),
  ('NVDA', 'NVIDIA Corporation', 495.20, 12.80, 2.65, 'NASDAQ', 'https://logo.clearbit.com/nvidia.com', NOW()),
  ('AMD', 'Advanced Micro Devices', 118.40, -2.10, -1.74, 'NASDAQ', 'https://logo.clearbit.com/amd.com', NOW()),
  ('VALE', 'Vale S.A.', 12.45, 0.35, 2.89, 'NYSE', NULL, NOW()),
  ('PBR', 'Petrobras', 15.80, -0.25, -1.56, 'NYSE', NULL, NOW()),
  ('SQM', 'Sociedad Química y Minera', 45.30, 1.20, 2.72, 'NYSE', NULL, NOW()),
  ('COPEC.SN', 'Empresas Copec', 6250.00, 50.00, 0.81, 'Santiago', NULL, NOW()),
  ('BBAR', 'Banco BBVA Argentina', 8.45, 0.15, 1.81, 'NYSE', NULL, NOW()),
  ('GGAL', 'Grupo Financiero Galicia', 32.10, -0.50, -1.53, 'NASDAQ', NULL, NOW())
ON CONFLICT (symbol) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  price_change = EXCLUDED.price_change,
  price_change_percent = EXCLUDED.price_change_percent,
  updated_at = NOW();

-- 2. GENERAR NOTIFICACIONES REALES DE LOS ÚLTIMOS 5 POSTS
-- =====================================================
-- Para c7812eb1-c3b1-429f-aabe-ba8da052201f
-- Notificaciones de likes en sus posts

WITH user_posts AS (
  SELECT id, contenido, created_at
  FROM posts
  WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
  ORDER BY created_at DESC
  LIMIT 5
),
sebastian_users AS (
  SELECT id, COALESCE(full_name, nombre, username) as name
  FROM users
  WHERE email LIKE 'sebastian%@gmail.com'
  LIMIT 2
)
INSERT INTO public.notifications (user_id, type, payload, read, created_at)
SELECT 
  'c7812eb1-c3b1-429f-aabe-ba8da052201f'::uuid,
  'like',
  jsonb_build_object(
    'from_user_id', su.id,
    'from_user_name', su.name,
    'post_id', up.id,
    'message', su.name || ' le gustó tu publicación'
  ),
  false,
  up.created_at + INTERVAL '5 minutes'
FROM user_posts up
CROSS JOIN sebastian_users su
ON CONFLICT DO NOTHING;

-- Notificaciones de comentarios en sus posts
WITH user_posts AS (
  SELECT id, contenido, created_at
  FROM posts
  WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
  ORDER BY created_at DESC
  LIMIT 5
),
sebastian_users AS (
  SELECT id, COALESCE(full_name, nombre, username) as name
  FROM users
  WHERE email LIKE 'sebastian%@gmail.com'
  LIMIT 2
)
INSERT INTO public.notifications (user_id, type, payload, read, created_at)
SELECT 
  'c7812eb1-c3b1-429f-aabe-ba8da052201f'::uuid,
  'comment',
  jsonb_build_object(
    'from_user_id', su.id,
    'from_user_name', su.name,
    'post_id', up.id,
    'message', su.name || ' comentó tu publicación'
  ),
  false,
  up.created_at + INTERVAL '10 minutes'
FROM user_posts up
CROSS JOIN sebastian_users su
ON CONFLICT DO NOTHING;

-- 3. VERIFICACIÓN
-- =====================================================
SELECT 
  'Datos de mercado' as metric,
  COUNT(*)::text as value
FROM market_data
UNION ALL
SELECT 
  'Notificaciones totales',
  COUNT(*)::text
FROM notifications
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
UNION ALL
SELECT 
  'Notificaciones de likes',
  COUNT(*)::text
FROM notifications
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
AND type = 'like'
UNION ALL
SELECT 
  'Notificaciones de comentarios',
  COUNT(*)::text
FROM notifications
WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
AND type = 'comment';
