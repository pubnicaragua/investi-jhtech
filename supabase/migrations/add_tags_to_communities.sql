-- ============================================================================
-- Script para agregar TAGS a comunidades existentes
-- ============================================================================
-- Los tags ayudan en búsqueda y promoción de comunidades
-- ============================================================================

-- Actualizar tags basados en el nombre y descripción de cada comunidad

-- Inversiones generales
UPDATE communities
SET tags = ARRAY['Inversiones', 'Finanzas Personales']
WHERE nombre ILIKE '%inversiones para principiantes%'
  OR nombre ILIKE '%inversiones principiantes%';

UPDATE communities
SET tags = ARRAY['Inversiones', 'Startups', 'Emprendimiento']
WHERE nombre ILIKE '%startups%' OR nombre ILIKE '%angel investing%';

UPDATE communities
SET tags = ARRAY['Inversiones', 'Fondos de Inversión']
WHERE nombre ILIKE '%fondos%' OR nombre ILIKE '%ETF%';

-- Criptomonedas
UPDATE communities
SET tags = ARRAY['Criptomonedas', 'Bitcoin', 'Trading']
WHERE nombre ILIKE '%cripto%' OR nombre ILIKE '%bitcoin%' OR nombre ILIKE '%ethereum%';

UPDATE communities
SET tags = ARRAY['Criptomonedas', 'Trading', 'Análisis Técnico']
WHERE nombre ILIKE '%trading de cripto%';

-- Bolsa de valores
UPDATE communities
SET tags = ARRAY['Bolsa de Valores', 'Acciones', 'Inversiones']
WHERE nombre ILIKE '%bolsa%' OR nombre ILIKE '%acciones%';

UPDATE communities
SET tags = ARRAY['Bolsa de Valores', 'Trading', 'Análisis Técnico']
WHERE nombre ILIKE '%trading%' AND nombre NOT ILIKE '%cripto%';

-- Bienes raíces
UPDATE communities
SET tags = ARRAY['Bienes Raíces', 'Inversiones', 'Propiedades']
WHERE nombre ILIKE '%bienes raices%' 
  OR nombre ILIKE '%inmobiliaria%'
  OR nombre ILIKE '%propiedades%';

UPDATE communities
SET tags = ARRAY['Bienes Raíces', 'Créditos', 'Hipotecarios']
WHERE nombre ILIKE '%hipotec%';

-- Finanzas personales
UPDATE communities
SET tags = ARRAY['Finanzas Personales', 'Ahorro', 'Presupuesto']
WHERE nombre ILIKE '%finanzas personales%';

UPDATE communities
SET tags = ARRAY['Educación Financiera', 'Finanzas Personales']
WHERE nombre ILIKE '%educación financiera%' OR nombre ILIKE '%educacion financiera%';

-- Dividendos y renta pasiva
UPDATE communities
SET tags = ARRAY['Dividendos', 'Renta Pasiva', 'Inversiones']
WHERE nombre ILIKE '%dividendos%' OR nombre ILIKE '%renta pasiva%' OR nombre ILIKE '%ingresos pasivos%';

-- Retiro y pensiones
UPDATE communities
SET tags = ARRAY['Retiro', 'Pensiones', 'Planificación']
WHERE nombre ILIKE '%retiro%' OR nombre ILIKE '%jubilación%' OR nombre ILIKE '%pensiones%' OR nombre ILIKE '%AFP%';

-- Emprendimiento
UPDATE communities
SET tags = ARRAY['Emprendimiento', 'Startups', 'PYMES']
WHERE nombre ILIKE '%emprendimiento%' OR nombre ILIKE '%PYME%';

-- Créditos y financiamiento
UPDATE communities
SET tags = ARRAY['Créditos', 'Financiamiento', 'Automotriz']
WHERE nombre ILIKE '%automotriz%' OR nombre ILIKE '%leasing%';

UPDATE communities
SET tags = ARRAY['Educación', 'Becas', 'Financiamiento']
WHERE nombre ILIKE '%becas%' OR nombre ILIKE '%CAE%' OR nombre ILIKE '%educación%';

-- Libertad financiera
UPDATE communities
SET tags = ARRAY['Libertad Financiera', 'Inversiones', 'Estrategias']
WHERE nombre ILIKE '%libertad financiera%';

-- Nómadas digitales
UPDATE communities
SET tags = ARRAY['Nómadas Digitales', 'Lifestyle', 'Finanzas']
WHERE nombre ILIKE '%nómadas%' OR nombre ILIKE '%nomadas%';

-- Sectores específicos
UPDATE communities
SET tags = ARRAY['Minería', 'Inversiones', 'Commodities']
WHERE nombre ILIKE '%minería%' OR nombre ILIKE '%mineria%';

UPDATE communities
SET tags = ARRAY['Autos', 'Inversiones', 'Ingresos']
WHERE nombre ILIKE '%autos como inversión%';

-- Seguros y emergencias
UPDATE communities
SET tags = ARRAY['Seguros', 'Salud', 'Emergencias']
WHERE nombre ILIKE '%emergencias médicas%' OR nombre ILIKE '%Fonasa%' OR nombre ILIKE '%Isapre%';

-- Por ubicación geográfica
UPDATE communities
SET tags = array_append(tags, 'Chile')
WHERE nombre ILIKE '%chile%' AND NOT ('Chile' = ANY(tags));

UPDATE communities
SET tags = array_append(tags, 'Nicaragua')
WHERE nombre ILIKE '%nicaragua%' AND NOT ('Nicaragua' = ANY(tags));

UPDATE communities
SET tags = array_append(tags, 'Valparaíso')
WHERE nombre ILIKE '%valparaíso%' AND NOT ('Valparaíso' = ANY(tags));

UPDATE communities
SET tags = array_append(tags, 'Santiago')
WHERE nombre ILIKE '%santiago%' AND NOT ('Santiago' = ANY(tags));

-- Verificar comunidades sin tags
SELECT id, nombre, tags, descripcion
FROM communities
WHERE tags = ARRAY[]::text[] OR tags IS NULL
ORDER BY created_at DESC;

-- Contar comunidades por tag
SELECT unnest(tags) as tag, COUNT(*) as count
FROM communities
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
GROUP BY tag
ORDER BY count DESC;
