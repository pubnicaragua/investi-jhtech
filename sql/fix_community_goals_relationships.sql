-- =====================================================
-- FIX: Crear relaciones entre comunidades y metas
-- =====================================================

-- Verificar que la tabla existe
SELECT 'Verificando tabla community_goals...' as status;

-- Obtener IDs de goals y comunidades para crear las relaciones
DO $$
DECLARE
    -- Variables para goals
    goal_casa_id UUID;
    goal_estudios_id UUID;
    goal_libertad_id UUID;
    goal_viajar_id UUID;
    goal_auto_id UUID;
    goal_crecer_id UUID;
    goal_salud_id UUID;
    goal_proyectos_id UUID;
    goal_aprender_id UUID;
    
    -- Variables para comunidades
    comm_inversiones_id UUID;
    comm_crypto_basic_id UUID;
    comm_crypto_trading_id UUID;
    comm_bienes_raices_id UUID;
    comm_bolsa_id UUID;
    comm_dividendos_id UUID;
    comm_startups_id UUID;
    comm_educacion_id UUID;
    comm_fondos_id UUID;
    comm_retiro_id UUID;
    
    relationships_created INTEGER := 0;
BEGIN
    -- Obtener IDs de goals (buscar por palabras clave)
    SELECT id INTO goal_casa_id FROM goals WHERE name ILIKE '%casa%' OR name ILIKE '%departamento%' LIMIT 1;
    SELECT id INTO goal_estudios_id FROM goals WHERE name ILIKE '%estudio%' OR name ILIKE '%educación%' LIMIT 1;
    SELECT id INTO goal_libertad_id FROM goals WHERE name ILIKE '%libertad%' OR name ILIKE '%financiera%' LIMIT 1;
    SELECT id INTO goal_viajar_id FROM goals WHERE name ILIKE '%viaj%' OR name ILIKE '%mundo%' LIMIT 1;
    SELECT id INTO goal_auto_id FROM goals WHERE name ILIKE '%auto%' OR name ILIKE '%vehículo%' LIMIT 1;
    SELECT id INTO goal_crecer_id FROM goals WHERE name ILIKE '%crecer%' OR name ILIKE '%dinero%' LIMIT 1;
    SELECT id INTO goal_salud_id FROM goals WHERE name ILIKE '%salud%' LIMIT 1;
    SELECT id INTO goal_proyectos_id FROM goals WHERE name ILIKE '%proyecto%' LIMIT 1;
    SELECT id INTO goal_aprender_id FROM goals WHERE name ILIKE '%aprender%' OR name ILIKE '%financieramente%' LIMIT 1;
    
    RAISE NOTICE '📊 Goals encontrados:';
    RAISE NOTICE '  Casa: %', COALESCE(goal_casa_id::text, 'NO ENCONTRADO');
    RAISE NOTICE '  Estudios: %', COALESCE(goal_estudios_id::text, 'NO ENCONTRADO');
    RAISE NOTICE '  Libertad: %', COALESCE(goal_libertad_id::text, 'NO ENCONTRADO');
    RAISE NOTICE '  Crecer dinero: %', COALESCE(goal_crecer_id::text, 'NO ENCONTRADO');
    
    -- Obtener IDs de comunidades
    SELECT id INTO comm_inversiones_id FROM communities WHERE nombre ILIKE '%Inversiones para principiantes%' LIMIT 1;
    SELECT id INTO comm_crypto_basic_id FROM communities WHERE nombre ILIKE '%Criptomonedas para principiantes%' LIMIT 1;
    SELECT id INTO comm_crypto_trading_id FROM communities WHERE nombre ILIKE '%Trading de Criptomonedas%' LIMIT 1;
    SELECT id INTO comm_bienes_raices_id FROM communities WHERE nombre ILIKE '%Inversión en Bienes Raíces%' LIMIT 1;
    SELECT id INTO comm_bolsa_id FROM communities WHERE nombre ILIKE '%Bolsa de Valores%' LIMIT 1;
    SELECT id INTO comm_dividendos_id FROM communities WHERE nombre ILIKE '%Dividendos%' LIMIT 1;
    SELECT id INTO comm_startups_id FROM communities WHERE nombre ILIKE '%Inversión en Startups%' LIMIT 1;
    SELECT id INTO comm_educacion_id FROM communities WHERE nombre ILIKE '%Educación Financiera%' LIMIT 1;
    SELECT id INTO comm_fondos_id FROM communities WHERE nombre ILIKE '%Fondos de Inversión%' LIMIT 1;
    SELECT id INTO comm_retiro_id FROM communities WHERE nombre ILIKE '%Planificación para el Retiro%' LIMIT 1;
    
    RAISE NOTICE '🏘️ Comunidades encontradas:';
    RAISE NOTICE '  Inversiones: %', COALESCE(comm_inversiones_id::text, 'NO ENCONTRADO');
    RAISE NOTICE '  Crypto básico: %', COALESCE(comm_crypto_basic_id::text, 'NO ENCONTRADO');
    RAISE NOTICE '  Bolsa: %', COALESCE(comm_bolsa_id::text, 'NO ENCONTRADO');
    
    -- Crear relaciones: Comprar casa -> Bienes Raíces
    IF goal_casa_id IS NOT NULL AND comm_bienes_raices_id IS NOT NULL THEN
        INSERT INTO community_goals (community_id, goal_id, relevance_score) 
        VALUES (comm_bienes_raices_id, goal_casa_id, 1.0) 
        ON CONFLICT (community_id, goal_id) DO NOTHING;
        relationships_created := relationships_created + 1;
    END IF;
    
    -- Crear relaciones: Estudios -> Educación Financiera
    IF goal_estudios_id IS NOT NULL AND comm_educacion_id IS NOT NULL THEN
        INSERT INTO community_goals (community_id, goal_id, relevance_score) 
        VALUES (comm_educacion_id, goal_estudios_id, 1.0) 
        ON CONFLICT (community_id, goal_id) DO NOTHING;
        relationships_created := relationships_created + 1;
    END IF;
    
    -- Crear relaciones: Libertad Financiera -> Dividendos + Inversiones
    IF goal_libertad_id IS NOT NULL THEN
        IF comm_dividendos_id IS NOT NULL THEN
            INSERT INTO community_goals (community_id, goal_id, relevance_score) 
            VALUES (comm_dividendos_id, goal_libertad_id, 1.0) 
            ON CONFLICT (community_id, goal_id) DO NOTHING;
            relationships_created := relationships_created + 1;
        END IF;
        IF comm_inversiones_id IS NOT NULL THEN
            INSERT INTO community_goals (community_id, goal_id, relevance_score) 
            VALUES (comm_inversiones_id, goal_libertad_id, 0.8) 
            ON CONFLICT (community_id, goal_id) DO NOTHING;
            relationships_created := relationships_created + 1;
        END IF;
    END IF;
    
    -- Crear relaciones: Hacer crecer dinero -> Bolsa + Crypto + Fondos + Inversiones
    IF goal_crecer_id IS NOT NULL THEN
        IF comm_bolsa_id IS NOT NULL THEN
            INSERT INTO community_goals (community_id, goal_id, relevance_score) 
            VALUES (comm_bolsa_id, goal_crecer_id, 1.0) 
            ON CONFLICT (community_id, goal_id) DO NOTHING;
            relationships_created := relationships_created + 1;
        END IF;
        IF comm_crypto_basic_id IS NOT NULL THEN
            INSERT INTO community_goals (community_id, goal_id, relevance_score) 
            VALUES (comm_crypto_basic_id, goal_crecer_id, 0.9) 
            ON CONFLICT (community_id, goal_id) DO NOTHING;
            relationships_created := relationships_created + 1;
        END IF;
        IF comm_crypto_trading_id IS NOT NULL THEN
            INSERT INTO community_goals (community_id, goal_id, relevance_score) 
            VALUES (comm_crypto_trading_id, goal_crecer_id, 0.85) 
            ON CONFLICT (community_id, goal_id) DO NOTHING;
            relationships_created := relationships_created + 1;
        END IF;
        IF comm_fondos_id IS NOT NULL THEN
            INSERT INTO community_goals (community_id, goal_id, relevance_score) 
            VALUES (comm_fondos_id, goal_crecer_id, 0.8) 
            ON CONFLICT (community_id, goal_id) DO NOTHING;
            relationships_created := relationships_created + 1;
        END IF;
        IF comm_inversiones_id IS NOT NULL THEN
            INSERT INTO community_goals (community_id, goal_id, relevance_score) 
            VALUES (comm_inversiones_id, goal_crecer_id, 0.9) 
            ON CONFLICT (community_id, goal_id) DO NOTHING;
            relationships_created := relationships_created + 1;
        END IF;
    END IF;
    
    -- Crear relaciones: Proyectos -> Startups
    IF goal_proyectos_id IS NOT NULL AND comm_startups_id IS NOT NULL THEN
        INSERT INTO community_goals (community_id, goal_id, relevance_score) 
        VALUES (comm_startups_id, goal_proyectos_id, 1.0) 
        ON CONFLICT (community_id, goal_id) DO NOTHING;
        relationships_created := relationships_created + 1;
    END IF;
    
    -- Crear relaciones: Aprender -> Educación + Inversiones
    IF goal_aprender_id IS NOT NULL THEN
        IF comm_educacion_id IS NOT NULL THEN
            INSERT INTO community_goals (community_id, goal_id, relevance_score) 
            VALUES (comm_educacion_id, goal_aprender_id, 1.0) 
            ON CONFLICT (community_id, goal_id) DO NOTHING;
            relationships_created := relationships_created + 1;
        END IF;
        IF comm_inversiones_id IS NOT NULL THEN
            INSERT INTO community_goals (community_id, goal_id, relevance_score) 
            VALUES (comm_inversiones_id, goal_aprender_id, 0.9) 
            ON CONFLICT (community_id, goal_id) DO NOTHING;
            relationships_created := relationships_created + 1;
        END IF;
    END IF;
    
    -- Relaciones adicionales para todas las comunidades con "hacer crecer dinero"
    -- (porque es la meta más común)
    IF goal_crecer_id IS NOT NULL THEN
        IF comm_retiro_id IS NOT NULL THEN
            INSERT INTO community_goals (community_id, goal_id, relevance_score) 
            VALUES (comm_retiro_id, goal_crecer_id, 0.7) 
            ON CONFLICT (community_id, goal_id) DO NOTHING;
            relationships_created := relationships_created + 1;
        END IF;
        IF comm_educacion_id IS NOT NULL THEN
            INSERT INTO community_goals (community_id, goal_id, relevance_score) 
            VALUES (comm_educacion_id, goal_crecer_id, 0.75) 
            ON CONFLICT (community_id, goal_id) DO NOTHING;
            relationships_created := relationships_created + 1;
        END IF;
    END IF;
    
    RAISE NOTICE '✅ Relaciones creadas: %', relationships_created;
END $$;

-- Verificar resultados
SELECT 
    '✅ Relaciones comunidad-meta creadas:' as status, 
    COUNT(*) as total 
FROM community_goals;

-- Mostrar algunas relaciones creadas
SELECT 
    c.nombre as comunidad,
    g.name as meta,
    cg.relevance_score as score
FROM community_goals cg
JOIN communities c ON c.id = cg.community_id
JOIN goals g ON g.id = cg.goal_id
ORDER BY cg.relevance_score DESC
LIMIT 10;

-- Verificar que la función v2 existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'get_recommended_communities_by_goals_v2'
        ) THEN '✅ Función v2 existe'
        ELSE '❌ Función v2 NO existe - ejecutar script de creación'
    END as status;

SELECT '✅ Script completado exitosamente' as final_status;
