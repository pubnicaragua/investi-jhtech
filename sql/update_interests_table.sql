-- Script SQL para actualizar la tabla interests con datos completos

-- 1. Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'interests' AND table_schema = 'public';

-- 2. Insertar todos los intereses con sus iconos exactos
INSERT INTO public.interests (name, icon, category) VALUES
('Acciones Locales', '🇳🇮', 'stocks'),
('Criptomonedas', '₿', 'crypto'),
('Acciones Extranjeras', '🌍', 'international_stocks'),
('Depósitos a plazo', '🏦', 'deposits'),
('Inversión Inmobiliaria', '🏠', 'real_estate'),
('Educación Financiera', '📚', 'education'),
('Fondos Mutuos', '📊', 'mutual_funds'),
('Startups', '🚀', 'startups'),
('Bonos Gubernamentales', '🏛️', 'bonds'),
('Commodities', '🥇', 'commodities'),
('ETFs', '📈', 'etfs'),
('Forex', '💱', 'forex')
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar que se insertaron correctamente
SELECT id, name, icon, category, created_at 
FROM public.interests 
ORDER BY created_at;
