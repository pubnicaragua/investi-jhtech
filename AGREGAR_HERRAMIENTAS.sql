-- =====================================================
-- AGREGAR 3 HERRAMIENTAS FINANCIERAS FALTANTES
-- =====================================================

-- 1. Verificar herramientas existentes
SELECT id, name, description, icon, route, is_premium, order_index
FROM educational_tools
ORDER BY order_index;

-- 2. Actualizar nombres correctos de las 3 herramientas existentes
UPDATE educational_tools
SET name = 'Planificador Financiero'
WHERE route = 'PlanificadorFinanciero';

UPDATE educational_tools
SET name = 'El Caza Hormigas'
WHERE route = 'CazaHormigas';

UPDATE educational_tools
SET name = 'Generador de Reporte'
WHERE route = 'GeneradorReportes';

-- 3. Agregar 3 nuevas herramientas
INSERT INTO educational_tools (name, description, icon, route, is_premium, order_index)
VALUES 
(
  'Calculadora de Inversiones',
  'Simula diferentes escenarios de inversión y calcula rendimientos',
  'calculator',
  'InvestmentSimulator',
  true,
  4
),
(
  'Presupuesto Inteligente',
  'Crea y gestiona tu presupuesto mensual de forma automática',
  'wallet',
  'SmartBudget',
  false,
  5
),
(
  'Metas de Ahorro',
  'Define y alcanza tus objetivos financieros paso a paso',
  'target',
  'SavingsGoals',
  false,
  6
)
ON CONFLICT (route) DO NOTHING;

-- 4. Verificar que se agregaron correctamente
SELECT id, name, description, icon, route, is_premium, order_index
FROM educational_tools
ORDER BY order_index;

-- =====================================================
-- RESULTADO ESPERADO: 6 herramientas en total
-- =====================================================
