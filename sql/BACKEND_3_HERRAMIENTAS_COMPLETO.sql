-- ============================================
-- BACKEND COMPLETO PARA 3 HERRAMIENTAS
-- CazaHormigas, Planificador Financiero, Reportes Avanzados
-- ============================================

-- ============================================
-- 1. TABLA: ant_expenses (Gastos Hormiga)
-- ============================================
CREATE TABLE IF NOT EXISTS ant_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  category TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  yearly_impact DECIMAL(10,2) NOT NULL,
  eliminated BOOLEAN DEFAULT FALSE,
  notes TEXT,
  goal DECIMAL(10,2),
  current_month_spent DECIMAL(10,2) DEFAULT 0,
  detected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para ant_expenses
CREATE INDEX idx_ant_expenses_user_id ON ant_expenses(user_id);
CREATE INDEX idx_ant_expenses_category ON ant_expenses(category);
CREATE INDEX idx_ant_expenses_eliminated ON ant_expenses(eliminated);

-- RLS para ant_expenses
ALTER TABLE ant_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ant expenses"
  ON ant_expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ant expenses"
  ON ant_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ant expenses"
  ON ant_expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ant expenses"
  ON ant_expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. TABLA: expense_categories (Categorías)
-- ============================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar categorías predeterminadas
INSERT INTO expense_categories (id, name, icon, color) VALUES
  ('food', 'Alimentación', 'coffee', '#FF6B6B'),
  ('entertainment', 'Entretenimiento', 'tv', '#9C27B0'),
  ('transport', 'Transporte', 'car', '#2196F3'),
  ('tech', 'Tecnología', 'smartphone', '#4CAF50'),
  ('shopping', 'Compras', 'shopping-bag', '#FF9800'),
  ('subscriptions', 'Suscripciones', 'credit-card', '#795548')
ON CONFLICT (id) DO NOTHING;

-- RLS para expense_categories (público para lectura)
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view expense categories"
  ON expense_categories FOR SELECT
  USING (true);

-- ============================================
-- 3. TABLA: budgets (Presupuestos)
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  spent DECIMAL(10,2) DEFAULT 0,
  category TEXT NOT NULL,
  color TEXT DEFAULT '#2673f3',
  period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para budgets
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category);

-- RLS para budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. TABLA: transactions (Transacciones)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_budget_id ON transactions(budget_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- RLS para transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. TABLA: financial_reports (Reportes Financieros)
-- ============================================
CREATE TABLE IF NOT EXISTS financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingresos DECIMAL(10,2) DEFAULT 0,
  gastos DECIMAL(10,2) DEFAULT 0,
  ahorros DECIMAL(10,2) DEFAULT 0,
  inversiones DECIMAL(10,2) DEFAULT 0,
  deudas DECIMAL(10,2) DEFAULT 0,
  gastos_hormiga DECIMAL(10,2) DEFAULT 0,
  meta_ahorro DECIMAL(10,2) DEFAULT 0,
  periodo_meses INTEGER DEFAULT 12,
  user_level TEXT DEFAULT 'beginner' CHECK (user_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para financial_reports
CREATE INDEX idx_financial_reports_user_id ON financial_reports(user_id);

-- RLS para financial_reports
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own financial reports"
  ON financial_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial reports"
  ON financial_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial reports"
  ON financial_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial reports"
  ON financial_reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. TABLA: ai_recommendations (Recomendaciones IA)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL CHECK (tool_name IN ('cazahormigas', 'planificador', 'reportes')),
  recommendation_text TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT,
  potential_savings DECIMAL(10,2),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para ai_recommendations
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_tool_name ON ai_recommendations(tool_name);
CREATE INDEX idx_ai_recommendations_is_read ON ai_recommendations(is_read);

-- RLS para ai_recommendations
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI recommendations"
  ON ai_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI recommendations"
  ON ai_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI recommendations"
  ON ai_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI recommendations"
  ON ai_recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. FUNCIÓN: Calcular impacto anual
-- ============================================
CREATE OR REPLACE FUNCTION calculate_yearly_impact(
  p_amount DECIMAL,
  p_frequency TEXT
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN CASE p_frequency
    WHEN 'daily' THEN p_amount * 365
    WHEN 'weekly' THEN p_amount * 52
    WHEN 'monthly' THEN p_amount * 12
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 8. FUNCIÓN: Obtener estadísticas de gastos hormiga
-- ============================================
CREATE OR REPLACE FUNCTION get_ant_expenses_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_expenses', COUNT(*),
    'detected_expenses', COUNT(*) FILTER (WHERE detected = true),
    'eliminated_expenses', COUNT(*) FILTER (WHERE eliminated = true),
    'total_yearly_waste', COALESCE(SUM(yearly_impact), 0),
    'potential_savings', COALESCE(SUM(yearly_impact) FILTER (WHERE eliminated = false), 0),
    'by_category', (
      SELECT json_object_agg(category, category_data)
      FROM (
        SELECT 
          category,
          json_build_object(
            'count', COUNT(*),
            'total_amount', SUM(amount),
            'yearly_impact', SUM(yearly_impact)
          ) as category_data
        FROM ant_expenses
        WHERE user_id = p_user_id AND eliminated = false
        GROUP BY category
      ) cat_stats
    )
  ) INTO v_result
  FROM ant_expenses
  WHERE user_id = p_user_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. FUNCIÓN: Obtener estadísticas de presupuestos
-- ============================================
CREATE OR REPLACE FUNCTION get_budget_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_budget', COALESCE(SUM(amount), 0),
    'total_spent', COALESCE(SUM(spent), 0),
    'remaining', COALESCE(SUM(amount - spent), 0),
    'percentage_used', CASE 
      WHEN SUM(amount) > 0 THEN (SUM(spent) / SUM(amount) * 100)
      ELSE 0 
    END,
    'over_budget_count', COUNT(*) FILTER (WHERE spent > amount),
    'by_category', (
      SELECT json_object_agg(category, category_data)
      FROM (
        SELECT 
          category,
          json_build_object(
            'budget', SUM(amount),
            'spent', SUM(spent),
            'remaining', SUM(amount - spent),
            'percentage', CASE 
              WHEN SUM(amount) > 0 THEN (SUM(spent) / SUM(amount) * 100)
              ELSE 0 
            END
          ) as category_data
        FROM budgets
        WHERE user_id = p_user_id
        GROUP BY category
      ) cat_stats
    )
  ) INTO v_result
  FROM budgets
  WHERE user_id = p_user_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. FUNCIÓN: Actualizar gasto de presupuesto
-- ============================================
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.budget_id IS NOT NULL AND NEW.type = 'expense' THEN
    UPDATE budgets
    SET 
      spent = spent + NEW.amount,
      updated_at = NOW()
    WHERE id = NEW.budget_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar presupuesto automáticamente
DROP TRIGGER IF EXISTS trigger_update_budget_spent ON transactions;
CREATE TRIGGER trigger_update_budget_spent
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_spent();

-- ============================================
-- 11. FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS trigger_ant_expenses_updated_at ON ant_expenses;
CREATE TRIGGER trigger_ant_expenses_updated_at
  BEFORE UPDATE ON ant_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_budgets_updated_at ON budgets;
CREATE TRIGGER trigger_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_financial_reports_updated_at ON financial_reports;
CREATE TRIGGER trigger_financial_reports_updated_at
  BEFORE UPDATE ON financial_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. FUNCIÓN: Obtener o crear reporte financiero del usuario
-- ============================================
CREATE OR REPLACE FUNCTION get_or_create_financial_report(p_user_id UUID)
RETURNS financial_reports AS $$
DECLARE
  v_report financial_reports;
BEGIN
  SELECT * INTO v_report
  FROM financial_reports
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    INSERT INTO financial_reports (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_report;
  END IF;
  
  RETURN v_report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Verificación de tablas creadas
DO $$
BEGIN
  RAISE NOTICE '✅ Tablas creadas:';
  RAISE NOTICE '  - ant_expenses (Gastos Hormiga)';
  RAISE NOTICE '  - expense_categories (Categorías)';
  RAISE NOTICE '  - budgets (Presupuestos)';
  RAISE NOTICE '  - transactions (Transacciones)';
  RAISE NOTICE '  - financial_reports (Reportes Financieros)';
  RAISE NOTICE '  - ai_recommendations (Recomendaciones IA)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Funciones creadas:';
  RAISE NOTICE '  - calculate_yearly_impact()';
  RAISE NOTICE '  - get_ant_expenses_stats()';
  RAISE NOTICE '  - get_budget_stats()';
  RAISE NOTICE '  - update_budget_spent()';
  RAISE NOTICE '  - get_or_create_financial_report()';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Backend completo instalado correctamente!';
END $$;
