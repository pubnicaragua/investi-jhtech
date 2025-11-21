-- ================================================
-- CORREGIR NIVEL DE RIESGO EN INTERESES
-- ================================================
-- Problema: Todos muestran "Medio" cuando algunos son "Alto" o "Bajo"

-- Paso 1: Ver estado actual
SELECT id, name, risk_level, category
FROM investment_interests
ORDER BY name;

-- Paso 2: Actualizar según tipo real de riesgo
-- ================================================

-- RIESGO ALTO (Alto riesgo, alta volatilidad)
UPDATE investment_interests
SET risk_level = 'Alto'
WHERE 
  name ILIKE '%startup%' 
  OR name ILIKE '%cripto%'
  OR name ILIKE '%criptomoneda%'
  OR category = 'startups'
  OR category = 'crypto';

-- RIESGO BAJO (Bajo riesgo, estable)
UPDATE investment_interests
SET risk_level = 'Bajo'
WHERE 
  name ILIKE '%depósito%'
  OR name ILIKE '%renta fija%'
  OR name ILIKE '%bonos%'
  OR category = 'deposits';

-- RIESGO MEDIO (Riesgo moderado)
UPDATE investment_interests
SET risk_level = 'Medio'
WHERE 
  (name ILIKE '%acciones%' OR category = 'stocks')
  OR (name ILIKE '%fondos%' OR category = 'mutual_funds')
  OR (name ILIKE '%bienes raíces%' OR category = 'real_estate')
  OR (name ILIKE '%educación%' OR category = 'education');

-- Paso 3: Verificar cambios
SELECT name, risk_level, category
FROM investment_interests
ORDER BY 
  CASE risk_level
    WHEN 'Alto' THEN 1
    WHEN 'Medio' THEN 2
    WHEN 'Bajo' THEN 3
    ELSE 4
  END,
  name;

-- Paso 4: Contar por nivel
SELECT risk_level, COUNT(*) as total
FROM investment_interests
GROUP BY risk_level
ORDER BY 
  CASE risk_level
    WHEN 'Alto' THEN 1
    WHEN 'Medio' THEN 2
    WHEN 'Bajo' THEN 3
    ELSE 4
  END;
