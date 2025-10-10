-- =====================================================
-- EDUCATION SCREEN - COMPLETE BACKEND SETUP
-- IMPORTANTE: Ejecuta primero create_video_tables.sql
-- =====================================================

-- Asegurar que las tablas de courses tengan las columnas correctas
-- Primero verificar qué columnas tiene la tabla courses
-- Si la tabla courses ya existe con columnas diferentes, necesitamos agregar las nuevas

-- Agregar columnas a courses si no existen
ALTER TABLE courses 
  ADD COLUMN IF NOT EXISTS topic TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#4A90E2';

-- Tabla de tópicos/categorías de cursos
CREATE TABLE IF NOT EXISTS course_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#4A90E2',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de temáticas de videos
CREATE TABLE IF NOT EXISTS video_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#4A90E2',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de herramientas
CREATE TABLE IF NOT EXISTS educational_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    route TEXT,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar theme_id a videos si la tabla existe
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'videos') THEN
        ALTER TABLE videos ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES video_themes(id);
    END IF;
END $$;

-- Tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE course_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Course topics are readable by everyone" ON course_topics;
CREATE POLICY "Course topics are readable by everyone" ON course_topics
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Video themes are readable by everyone" ON video_themes;
CREATE POLICY "Video themes are readable by everyone" ON video_themes
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Educational tools are readable by everyone" ON educational_tools;
CREATE POLICY "Educational tools are readable by everyone" ON educational_tools
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can manage their own lesson progress" ON lesson_progress;
CREATE POLICY "Users can manage their own lesson progress" ON lesson_progress
    FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- Solo crear el índice si la tabla videos existe
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'videos') THEN
        CREATE INDEX IF NOT EXISTS idx_videos_theme_id ON videos(theme_id);
    END IF;
END $$;

-- =====================================================
-- SEED DATA - TEMÁTICAS DE VIDEOS
-- =====================================================

INSERT INTO video_themes (id, name, description, color, order_index) VALUES
('00000000-0000-0000-0000-000000000001', 'Educación Financiera: Lo básico que debes saber', 'Conceptos fundamentales de finanzas personales', '#4A90E2', 1),
('00000000-0000-0000-0000-000000000002', 'Creación y Planificación de Metas Financieras', 'Aprende a definir y alcanzar tus objetivos financieros', '#50E3C2', 2),
('00000000-0000-0000-0000-000000000003', 'Educación Financiera para Emprendedores', 'Finanzas para tu negocio', '#9013FE', 3),
('00000000-0000-0000-0000-000000000004', 'Educación Financiera para Niños', 'Enseña finanzas a los más pequeños', '#F5A623', 4),
('00000000-0000-0000-0000-000000000005', 'Educación Financiera Avanzada', 'Conceptos avanzados de inversión y finanzas', '#E94B3C', 5),
('00000000-0000-0000-0000-000000000006', 'Inversiones para Principiantes', 'Comienza tu camino en el mundo de las inversiones', '#4A90E2', 6)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    order_index = EXCLUDED.order_index;

-- =====================================================
-- SEED DATA - VIDEOS (Solo si la tabla videos existe)
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'videos') THEN
        -- Temática 1: Educación Financiera Básica
        INSERT INTO videos (id, title, description, video_url, thumbnail_url, duration, theme_id, is_published, is_free, category, tags) VALUES
        ('10000000-0000-0000-0000-000000000001', 'Educación Financiera para Principiantes - Esto es lo PRIMERO que debes saber', 'Los conceptos básicos que todo adulto debe conocer sobre dinero', 'https://www.youtube.com/watch?v=9sCVcWD1Svs', 'https://img.youtube.com/vi/9sCVcWD1Svs/maxresdefault.jpg', 942, '00000000-0000-0000-0000-000000000001', true, true, 'educacion-basica', ARRAY['educacion-financiera', 'principiantes', 'basico']),
        ('10000000-0000-0000-0000-000000000002', '¿Qué es la Educación Financiera? (Explicación Fácil)', 'Explicación sencilla de qué es y por qué es importante la educación financiera', 'https://www.youtube.com/watch?v=HMC0Dz9mnbI', 'https://img.youtube.com/vi/HMC0Dz9mnbI/maxresdefault.jpg', 305, '00000000-0000-0000-0000-000000000001', true, true, 'educacion-basica', ARRAY['educacion-financiera', 'conceptos']),
        ('10000000-0000-0000-0000-000000000003', '¿Por qué el dinero no te rinde?', 'Descubre las razones por las que tu dinero no alcanza', 'https://www.youtube.com/watch?v=7LHBkKQ0Z4U', 'https://img.youtube.com/vi/7LHBkKQ0Z4U/maxresdefault.jpg', 480, '00000000-0000-0000-0000-000000000001', true, true, 'educacion-basica', ARRAY['finanzas-personales', 'presupuesto']),
        ('10000000-0000-0000-0000-000000000004', '¿Qué es la inflación? | Economía en Simple', 'Entiende qué es la inflación y cómo afecta tu dinero', 'https://www.youtube.com/watch?v=uPkMv7QwF5c', 'https://img.youtube.com/vi/uPkMv7QwF5c/maxresdefault.jpg', 420, '00000000-0000-0000-0000-000000000001', true, true, 'educacion-basica', ARRAY['inflacion', 'economia']),
        ('10000000-0000-0000-0000-000000000005', '¿Cuál es la diferencia entre AHORRAR e INVERTIR?', 'Aprende las diferencias clave entre ahorrar e invertir', 'https://www.youtube.com/watch?v=cQP5X1Uo4xw', 'https://img.youtube.com/vi/cQP5X1Uo4xw/maxresdefault.jpg', 540, '00000000-0000-0000-0000-000000000001', true, true, 'educacion-basica', ARRAY['ahorro', 'inversion'])
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            video_url = EXCLUDED.video_url,
            thumbnail_url = EXCLUDED.thumbnail_url,
            duration = EXCLUDED.duration,
            theme_id = EXCLUDED.theme_id;

        -- Temática 2: Metas Financieras
        INSERT INTO videos (id, title, description, video_url, thumbnail_url, duration, theme_id, is_published, is_free, category, tags) VALUES
        ('20000000-0000-0000-0000-000000000001', '7 TIPS para establecer METAS FINANCIERAS', 'Consejos prácticos para definir tus metas financieras', 'https://www.youtube.com/watch?v=tX_wLHaQPTI', 'https://img.youtube.com/vi/tX_wLHaQPTI/maxresdefault.jpg', 720, '00000000-0000-0000-0000-000000000002', true, true, 'metas-financieras', ARRAY['metas', 'planificacion', 'objetivos']),
        ('20000000-0000-0000-0000-000000000002', 'Cómo Definir Metas Financieras y Cómo Cumplirlas Todas', 'Estrategias para alcanzar tus objetivos financieros', 'https://www.youtube.com/watch?v=zigspTsOPWw', 'https://img.youtube.com/vi/zigspTsOPWw/maxresdefault.jpg', 840, '00000000-0000-0000-0000-000000000002', true, true, 'metas-financieras', ARRAY['metas', 'cumplir-objetivos']),
        ('20000000-0000-0000-0000-000000000003', 'Como establecer METAS y OBJETIVOS (Metodo SMART 2022)', 'Aprende el método SMART para tus metas', 'https://www.youtube.com/watch?v=aZhZJaCQnJ4', 'https://img.youtube.com/vi/aZhZJaCQnJ4/maxresdefault.jpg', 660, '00000000-0000-0000-0000-000000000002', true, true, 'metas-financieras', ARRAY['metodo-smart', 'objetivos']),
        ('20000000-0000-0000-0000-000000000004', 'Como Crear Una PLANIFICACIÓN FINANCIERA PERSONAL', 'Guía completa para planificar tus finanzas', 'https://www.youtube.com/watch?v=OsAPwUkoiRw', 'https://img.youtube.com/vi/OsAPwUkoiRw/maxresdefault.jpg', 900, '00000000-0000-0000-0000-000000000002', true, true, 'metas-financieras', ARRAY['planificacion', 'finanzas-personales'])
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            video_url = EXCLUDED.video_url,
            thumbnail_url = EXCLUDED.thumbnail_url,
            duration = EXCLUDED.duration,
            theme_id = EXCLUDED.theme_id;

        -- Temática 3: Emprendedores
        INSERT INTO videos (id, title, description, video_url, thumbnail_url, duration, theme_id, is_published, is_free, category, tags) VALUES
        ('30000000-0000-0000-0000-000000000001', 'Educación Financiera para Emprendedores: Las 5 reglas que todo Emprendedor debe saber', 'Reglas fundamentales de finanzas para emprendedores', 'https://www.youtube.com/watch?v=29iU2NA0rDQ', 'https://img.youtube.com/vi/29iU2NA0rDQ/maxresdefault.jpg', 1080, '00000000-0000-0000-0000-000000000003', true, true, 'emprendedores', ARRAY['emprendimiento', 'negocios', 'finanzas']),
        ('30000000-0000-0000-0000-000000000002', 'Educación Financiera para Emprendedores (Esto es lo PRIMERO que debes saber)', 'Lo esencial que debes conocer como emprendedor', 'https://www.youtube.com/watch?v=sY7AUM4KE90', 'https://img.youtube.com/vi/sY7AUM4KE90/maxresdefault.jpg', 960, '00000000-0000-0000-0000-000000000003', true, true, 'emprendedores', ARRAY['emprendimiento', 'finanzas-empresariales'])
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            video_url = EXCLUDED.video_url,
            thumbnail_url = EXCLUDED.thumbnail_url,
            duration = EXCLUDED.duration,
            theme_id = EXCLUDED.theme_id;

        -- Temática 4: Niños
        INSERT INTO videos (id, title, description, video_url, thumbnail_url, duration, theme_id, is_published, is_free, category, tags) VALUES
        ('40000000-0000-0000-0000-000000000001', 'Educación Financiera para Principiantes - Cómo funcionan las Finanzas', 'Finanzas explicadas de forma simple para niños', 'https://www.youtube.com/watch?v=X38MGyuc0ds', 'https://img.youtube.com/vi/X38MGyuc0ds/maxresdefault.jpg', 480, '00000000-0000-0000-0000-000000000004', true, true, 'ninos', ARRAY['educacion-ninos', 'finanzas-basicas']),
        ('40000000-0000-0000-0000-000000000002', 'El desafío de los ingresos y gastos - Educación Financiera para niños y niñas', 'Aprende sobre ingresos y gastos de forma divertida', 'https://www.youtube.com/watch?v=8PEcigPsswE', 'https://img.youtube.com/vi/8PEcigPsswE/maxresdefault.jpg', 360, '00000000-0000-0000-0000-000000000004', true, true, 'ninos', ARRAY['educacion-ninos', 'ingresos-gastos']),
        ('40000000-0000-0000-0000-000000000003', '¿Qué es el AHORRO? Explicación del ahorro para niños', 'El concepto de ahorro explicado para niños', 'https://www.youtube.com/watch?v=187yOH-TtDQ', 'https://img.youtube.com/vi/187yOH-TtDQ/maxresdefault.jpg', 300, '00000000-0000-0000-0000-000000000004', true, true, 'ninos', ARRAY['ahorro', 'educacion-ninos']),
        ('40000000-0000-0000-0000-000000000004', '¿Qué es un PRESUPUESTO? Aprende a organizar tu dinero', 'Presupuesto explicado para niños', 'https://www.youtube.com/watch?v=TEKaSi2aijE', 'https://img.youtube.com/vi/TEKaSi2aijE/maxresdefault.jpg', 330, '00000000-0000-0000-0000-000000000004', true, true, 'ninos', ARRAY['presupuesto', 'educacion-ninos'])
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            video_url = EXCLUDED.video_url,
            thumbnail_url = EXCLUDED.thumbnail_url,
            duration = EXCLUDED.duration,
            theme_id = EXCLUDED.theme_id;

        -- Temática 5: Avanzada
        INSERT INTO videos (id, title, description, video_url, thumbnail_url, duration, theme_id, is_published, is_free, category, tags) VALUES
        ('50000000-0000-0000-0000-000000000001', 'Educación Financiera Avanzada Partiendo de Cero', 'Conceptos avanzados de finanzas desde cero', 'https://www.youtube.com/watch?v=9vXx7djaYrE', 'https://img.youtube.com/vi/9vXx7djaYrE/maxresdefault.jpg', 1200, '00000000-0000-0000-0000-000000000005', true, true, 'avanzada', ARRAY['finanzas-avanzadas', 'inversion-avanzada'])
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            video_url = EXCLUDED.video_url,
            thumbnail_url = EXCLUDED.thumbnail_url,
            duration = EXCLUDED.duration,
            theme_id = EXCLUDED.theme_id;

        -- Temática 6: Inversiones para Principiantes
        INSERT INTO videos (id, title, description, video_url, thumbnail_url, duration, theme_id, is_published, is_free, category, tags) VALUES
        ('60000000-0000-0000-0000-000000000001', '¿Qué es la Bolsa? Como funciona la Bolsa de valores | La Bolsa para Principiantes', 'Introducción a la bolsa de valores', 'https://www.youtube.com/watch?v=VFfdt2xHDxU', 'https://img.youtube.com/vi/VFfdt2xHDxU/maxresdefault.jpg', 780, '00000000-0000-0000-0000-000000000006', true, true, 'inversiones-principiantes', ARRAY['bolsa', 'inversiones', 'principiantes'])
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            video_url = EXCLUDED.video_url,
            thumbnail_url = EXCLUDED.thumbnail_url,
            duration = EXCLUDED.duration,
            theme_id = EXCLUDED.theme_id;
    END IF;
END $$;

-- =====================================================
-- SEED DATA - TÓPICOS DE CURSOS
-- =====================================================

INSERT INTO course_topics (id, name, description, icon, color, order_index) VALUES
('a0000000-0000-0000-0000-000000000001', 'Fundamentos Financieros', 'Presupuesto, ahorro, deudas e interés compuesto', '💰', '#4A90E2', 1),
('a0000000-0000-0000-0000-000000000002', 'Planificación y Metas Financieras', 'Invertir para metas, gestión de riesgos', '🎯', '#50E3C2', 2),
('a0000000-0000-0000-0000-000000000003', 'Inversiones Tradicionales', 'Acciones, ETFs, bonos, fondos mutuos', '📈', '#9013FE', 3),
('a0000000-0000-0000-0000-000000000004', 'Educación Financiera para Emprendedores', 'Finanzas para tu negocio', '🚀', '#F5A623', 4)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    order_index = EXCLUDED.order_index;

-- =====================================================
-- SEED DATA - CURSOS
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
        -- Tópico 1: Fundamentos Financieros
        INSERT INTO courses (id, title, description, category, level, duration, price, currency, is_published, is_free, topic, icon, color) VALUES
        ('c1000000-0000-0000-0000-000000000001', 'Presupuesto: Lo básico que necesitas saber', 'Aprende a organizar tus ingresos y gastos de forma efectiva', 'fundamentos', 'beginner', 180, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000001', '📊', '#4A90E2'),
        ('c1000000-0000-0000-0000-000000000002', 'Ahorro vs Inversión', 'Diferencias y cuándo aplicar cada estrategia', 'fundamentos', 'beginner', 120, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000001', '💵', '#4A90E2'),
        ('c1000000-0000-0000-0000-000000000003', 'Gestión de Deudas', 'Estrategias para salir de deudas y manejarlas correctamente', 'fundamentos', 'beginner', 150, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000001', '💳', '#4A90E2'),
        ('c1000000-0000-0000-0000-000000000004', 'Interés Compuesto: Tu mejor aliado', 'Entiende el poder del interés compuesto', 'fundamentos', 'intermediate', 90, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000001', '📈', '#50E3C2'),
        ('c1000000-0000-0000-0000-000000000005', 'Inflación y Poder Adquisitivo', 'Cómo proteger tu dinero de la inflación', 'fundamentos', 'intermediate', 100, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000001', '💹', '#50E3C2')
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            level = EXCLUDED.level,
            duration = EXCLUDED.duration,
            topic = EXCLUDED.topic,
            icon = EXCLUDED.icon,
            color = EXCLUDED.color;

        -- Tópico 2: Planificación y Metas
        INSERT INTO courses (id, title, description, category, level, duration, price, currency, is_published, is_free, topic, icon, color) VALUES
        ('c2000000-0000-0000-0000-000000000001', '¿Por qué es importante la planificación en tus finanzas?', 'Importancia de tener un plan financiero personal', 'planificacion', 'beginner', 60, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000002', '🎯', '#50E3C2'),
        ('c2000000-0000-0000-0000-000000000002', 'Planificar distintos tipos de metas financieras', 'Metas a corto, mediano y largo plazo', 'planificacion', 'beginner', 90, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000002', '📋', '#50E3C2'),
        ('c2000000-0000-0000-0000-000000000003', 'Priorización de metas financieras', 'Cómo balancear varias metas al mismo tiempo', 'planificacion', 'intermediate', 75, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000002', '⚖️', '#50E3C2'),
        ('c2000000-0000-0000-0000-000000000004', 'Plan de acción paso a paso', 'Traducir metas en un plan de ahorro mensual', 'planificacion', 'intermediate', 120, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000002', '📝', '#50E3C2')
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            level = EXCLUDED.level,
            duration = EXCLUDED.duration,
            topic = EXCLUDED.topic,
            icon = EXCLUDED.icon,
            color = EXCLUDED.color;

        -- Tópico 3: Inversiones Tradicionales
        INSERT INTO courses (id, title, description, category, level, duration, price, currency, is_published, is_free, topic, icon, color) VALUES
        ('c3000000-0000-0000-0000-000000000001', 'Introducción a las Inversiones', 'Conceptos básicos: riesgo, rentabilidad y liquidez', 'inversiones', 'beginner', 90, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000003', '💼', '#9013FE'),
        ('c3000000-0000-0000-0000-000000000002', 'Inversiones Conservadoras (DAP)', 'Todo sobre Depósitos a Plazo', 'inversiones', 'beginner', 60, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000003', '🏦', '#9013FE'),
        ('c3000000-0000-0000-0000-000000000003', 'Fondos Mutuos según Perfil de Riesgo', 'Cómo elegir un fondo mutuo', 'inversiones', 'intermediate', 120, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000003', '📊', '#9013FE'),
        ('c3000000-0000-0000-0000-000000000004', 'El Mundo de las Acciones', 'Qué son las acciones y cómo funcionan', 'inversiones', 'intermediate', 150, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000003', '📈', '#9013FE'),
        ('c3000000-0000-0000-0000-000000000005', 'Los ETFs o Fondos Cotizados en Bolsa', 'Tipos de ETFs según tus intereses', 'inversiones', 'advanced', 180, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000003', '🎯', '#F5A623'),
        ('c3000000-0000-0000-0000-000000000006', 'Criptomonedas', 'Qué son, cómo funcionan y qué riesgos implican', 'inversiones', 'advanced', 200, 0, 'USD', true, true, 'a0000000-0000-0000-0000-000000000003', '₿', '#F5A623')
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            level = EXCLUDED.level,
            duration = EXCLUDED.duration,
            topic = EXCLUDED.topic,
            icon = EXCLUDED.icon,
            color = EXCLUDED.color;
    END IF;
END $$;

-- =====================================================
-- SEED DATA - HERRAMIENTAS
-- =====================================================

INSERT INTO educational_tools (id, title, description, icon, route, is_premium, order_index) VALUES
('10000000-0000-0000-0001-000000000001', 'Planificador Financiero', 'Organiza ingresos, gastos y metas', '📊', 'PlanificadorFinanciero', false, 1),
('10000000-0000-0000-0001-000000000002', 'CazaHormigas', 'Detecta gastos pequeños que drenan tu dinero', '🐜', 'CazaHormigas', false, 2),
('10000000-0000-0000-0001-000000000003', 'Reportes Avanzados', 'Análisis financiero profesional', '📈', 'ReportesAvanzados', false, 3)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    route = EXCLUDED.route,
    is_premium = EXCLUDED.is_premium,
    order_index = EXCLUDED.order_index;

SELECT 'Education Screen Backend Setup Complete! 🎓' as status;
