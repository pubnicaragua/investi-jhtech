/**
 * API Functions para las 3 herramientas
 * CazaHormigas, Planificador Financiero, Reportes Avanzados
 */

import { supabase } from '../supabase';

// ============================================
// TIPOS
// ============================================

export interface AntExpense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  icon?: string;
  color?: string;
  yearly_impact: number;
  eliminated: boolean;
  notes?: string;
  goal?: number;
  current_month_spent?: number;
  detected: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  color: string;
  period: 'weekly' | 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  budget_id?: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
}

export interface FinancialReport {
  id: string;
  user_id: string;
  ingresos: number;
  gastos: number;
  ahorros: number;
  inversiones: number;
  deudas: number;
  gastos_hormiga: number;
  meta_ahorro: number;
  periodo_meses: number;
  user_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  tool_name: 'cazahormigas' | 'planificador' | 'reportes';
  recommendation_text: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  potential_savings?: number;
  is_read: boolean;
  created_at: string;
}

// ============================================
// CAZAHORMIGAS API
// ============================================

/**
 * Obtener todos los gastos hormiga del usuario
 */
export async function getAntExpenses(userId: string): Promise<AntExpense[]> {
  try {
    const { data, error } = await supabase
      .from('ant_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching ant expenses:', error);
    throw error;
  }
}

/**
 * Crear un nuevo gasto hormiga
 */
export async function createAntExpense(
  userId: string,
  expense: Omit<AntExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<AntExpense> {
  try {
    const { data, error } = await supabase
      .from('ant_expenses')
      .insert({
        user_id: userId,
        ...expense,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating ant expense:', error);
    throw error;
  }
}

/**
 * Actualizar un gasto hormiga
 */
export async function updateAntExpense(
  expenseId: string,
  updates: Partial<AntExpense>
): Promise<AntExpense> {
  try {
    const { data, error } = await supabase
      .from('ant_expenses')
      .update(updates)
      .eq('id', expenseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating ant expense:', error);
    throw error;
  }
}

/**
 * Eliminar un gasto hormiga
 */
export async function deleteAntExpense(expenseId: string): Promise<void> {
  try {
    const { error } = await supabase.from('ant_expenses').delete().eq('id', expenseId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting ant expense:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de gastos hormiga
 */
export async function getAntExpensesStats(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase.rpc('get_ant_expenses_stats', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching ant expenses stats:', error);
    throw error;
  }
}

/**
 * Obtener categorías de gastos
 */
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    throw error;
  }
}

// ============================================
// PLANIFICADOR FINANCIERO API
// ============================================

/**
 * Obtener todos los presupuestos del usuario
 */
export async function getBudgets(userId: string): Promise<Budget[]> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
}

/**
 * Crear un nuevo presupuesto
 */
export async function createBudget(
  userId: string,
  budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Budget> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        ...budget,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
}

/**
 * Actualizar un presupuesto
 */
export async function updateBudget(
  budgetId: string,
  updates: Partial<Budget>
): Promise<Budget> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', budgetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
}

/**
 * Eliminar un presupuesto
 */
export async function deleteBudget(budgetId: string): Promise<void> {
  try {
    const { error } = await supabase.from('budgets').delete().eq('id', budgetId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de presupuestos
 */
export async function getBudgetStats(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase.rpc('get_budget_stats', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching budget stats:', error);
    throw error;
  }
}

/**
 * Obtener transacciones del usuario
 */
export async function getTransactions(
  userId: string,
  limit: number = 50
): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

/**
 * Crear una nueva transacción
 */
export async function createTransaction(
  userId: string,
  transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>
): Promise<Transaction> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        ...transaction,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// ============================================
// REPORTES AVANZADOS API
// ============================================

/**
 * Obtener o crear reporte financiero del usuario
 */
export async function getOrCreateFinancialReport(userId: string): Promise<FinancialReport> {
  try {
    const { data, error } = await supabase.rpc('get_or_create_financial_report', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching financial report:', error);
    throw error;
  }
}

/**
 * Actualizar reporte financiero
 */
export async function updateFinancialReport(
  reportId: string,
  updates: Partial<FinancialReport>
): Promise<FinancialReport> {
  try {
    const { data, error } = await supabase
      .from('financial_reports')
      .update(updates)
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating financial report:', error);
    throw error;
  }
}

// ============================================
// RECOMENDACIONES IA API
// ============================================

/**
 * Obtener recomendaciones IA para una herramienta
 */
export async function getAIRecommendations(
  userId: string,
  toolName: 'cazahormigas' | 'planificador' | 'reportes'
): Promise<AIRecommendation[]> {
  try {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_name', toolName)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    throw error;
  }
}

/**
 * Crear una nueva recomendación IA
 */
export async function createAIRecommendation(
  userId: string,
  recommendation: Omit<AIRecommendation, 'id' | 'user_id' | 'created_at'>
): Promise<AIRecommendation> {
  try {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .insert({
        user_id: userId,
        ...recommendation,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating AI recommendation:', error);
    throw error;
  }
}

/**
 * Marcar recomendación como leída
 */
export async function markRecommendationAsRead(recommendationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('ai_recommendations')
      .update({ is_read: true })
      .eq('id', recommendationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking recommendation as read:', error);
    throw error;
  }
}

/**
 * Eliminar recomendaciones antiguas (más de 30 días)
 */
export async function cleanupOldRecommendations(userId: string): Promise<void> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
      .from('ai_recommendations')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (error) throw error;
  } catch (error) {
    console.error('Error cleaning up old recommendations:', error);
    throw error;
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Calcular impacto anual de un gasto
 */
export function calculateYearlyImpact(
  amount: number,
  frequency: 'daily' | 'weekly' | 'monthly'
): number {
  switch (frequency) {
    case 'daily':
      return amount * 365;
    case 'weekly':
      return amount * 52;
    case 'monthly':
      return amount * 12;
    default:
      return 0;
  }
}

/**
 * Formatear moneda
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default {
  // CazaHormigas
  getAntExpenses,
  createAntExpense,
  updateAntExpense,
  deleteAntExpense,
  getAntExpensesStats,
  getExpenseCategories,
  
  // Planificador
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStats,
  getTransactions,
  createTransaction,
  
  // Reportes
  getOrCreateFinancialReport,
  updateFinancialReport,
  
  // Recomendaciones IA
  getAIRecommendations,
  createAIRecommendation,
  markRecommendationAsRead,
  cleanupOldRecommendations,
  
  // Utilidades
  calculateYearlyImpact,
  formatCurrency,
};
