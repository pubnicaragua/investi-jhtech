-- =====================================================
-- AGREGAR 3 HERRAMIENTAS NUEVAS
-- =====================================================

INSERT INTO educational_tools (id, title, description, icon, route, is_premium, order_index) VALUES
('10000000-0000-0000-0001-000000000004', 'Calculadora ROI', 'Calcula el retorno de inversión de tus proyectos', '💰', 'CalculadoraROI', false, 4),
('10000000-0000-0000-0001-000000000005', 'Presupuesto Mensual', 'Planifica y controla tu presupuesto mensual', '📅', 'PresupuestoMensual', false, 5),
('10000000-0000-0000-0001-000000000006', 'Análisis de Gastos', 'Analiza tus patrones de gasto y ahorro', '📉', 'AnalisisGastos', false, 6)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  route = EXCLUDED.route,
  is_premium = EXCLUDED.is_premium,
  order_index = EXCLUDED.order_index;
