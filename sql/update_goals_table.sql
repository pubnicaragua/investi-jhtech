-- 1. Agregar columna icon a la tabla goals
ALTER TABLE public.goals ADD COLUMN icon text;

-- 2. Insertar todas las metas con sus iconos exactos
INSERT INTO public.goals (name, description, icon) VALUES
('Comprar una casa o departamento', 'Adquirir vivienda propia', '🏠'),
('Pagar estudios', 'Financiar educación superior', '🎓'),
('Lograr libertad financiera', 'Independencia económica total', '💰'),
('Viajar por el mundo', 'Conocer nuevos lugares y culturas', '✈️'),
('Comprar un auto', 'Adquirir vehículo propio', '🚗'),
('Hacer crecer mi dinero a largo plazo', 'Inversiones para el futuro', '📈'),
('Prepararme para mi salud', 'Fondo para emergencias médicas', '🏥'),
('Proyectos personales', 'Emprendimientos y negocios propios', '🚀'),
('Aprender financieramente', 'Educación en finanzas e inversiones', '📚'),
('Bienestar de mi mascota', 'Cuidado y salud de animales', '🐕')
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar que se insertaron correctamente
SELECT id, name, icon, created_at FROM public.goals ORDER BY created_at;
