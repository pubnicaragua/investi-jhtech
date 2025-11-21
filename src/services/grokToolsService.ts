/**
 * Servicio de Groq para las 3 herramientas principales
 * CazaHormigas, Planificador Financiero, Reportes Avanzados
 */

import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROK_API_KEY || '';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Función base para llamar a Groq API
 */
async function callGroqAPI(messages: GroqMessage[]): Promise<string> {
  try {
    console.log('🤖 Llamando a Groq API...');
    const response = await axios.post<GroqResponse>(
      GROQ_API_URL,
      {
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        timeout: 30000,
      }
    );
    console.log('✅ Respuesta de Groq recibida');

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      console.error('❌ Groq no devolvió contenido');
      throw new Error('Irï no pudo generar una respuesta');
    }
    return content;
  } catch (error: any) {
    console.error('❌ Error calling Groq API:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      throw new Error(`Irï: ${error.response.data.error.message}`);
    }
    throw new Error('Irï no está disponible en este momento. Intenta de nuevo.');
  }
}

// ============================================
// CAZAHORMIGAS - Análisis de Gastos Hormiga
// ============================================

export interface AntExpense {
  id: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  yearly_impact: number;
  eliminated: boolean;
}

/**
 * Analiza gastos hormiga y genera recomendaciones con IA
 */
export async function analyzeAntExpenses(expenses: AntExpense[]): Promise<{
  recommendations: string[];
  priorityExpense: AntExpense | null;
  totalSavings: number;
}> {
  const activeExpenses = expenses.filter(e => !e.eliminated);
  const totalYearlySavings = activeExpenses.reduce((sum, e) => sum + e.yearly_impact, 0);

  const expensesText = activeExpenses
    .map(e => `- ${e.description}: $${e.amount} ${e.frequency} (Impacto anual: $${e.yearly_impact.toFixed(2)})`)
    .join('\n');

  const systemPrompt = `Eres un asesor financiero experto en identificar gastos hormiga y dar recomendaciones prácticas. 
Analiza los siguientes gastos y proporciona:
1. 3 recomendaciones específicas y accionables (máximo 100 caracteres cada una)
2. Identifica el gasto con mayor prioridad para eliminar
3. Sugiere alternativas económicas

Responde en formato JSON:
{
  "recommendations": ["rec1", "rec2", "rec3"],
  "priorityExpenseId": "id",
  "alternatives": "texto breve"
}`;

  const userPrompt = `Gastos hormiga del usuario:
${expensesText}

Total de ahorro anual potencial: $${totalYearlySavings.toFixed(2)}`;

  try {
    const response = await callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const parsed = JSON.parse(response);
    const priorityExpense = activeExpenses.find(e => e.id === parsed.priorityExpenseId) || null;

    return {
      recommendations: parsed.recommendations || [],
      priorityExpense,
      totalSavings: totalYearlySavings,
    };
  } catch (error) {
    console.error('Error analyzing ant expenses:', error);
    // Fallback con recomendaciones básicas
    return {
      recommendations: [
        '🎯 Elimina el gasto más grande para maximizar ahorro',
        '💡 Busca alternativas gratuitas o más económicas',
        '📊 Revisa tus suscripciones no utilizadas',
      ],
      priorityExpense: activeExpenses.sort((a, b) => b.yearly_impact - a.yearly_impact)[0] || null,
      totalSavings: totalYearlySavings,
    };
  }
}

/**
 * Detecta posibles gastos hormiga basándose en transacciones
 */
export async function detectAntExpenses(transactions: any[]): Promise<AntExpense[]> {
  const transactionsText = transactions
    .slice(0, 20) // Últimas 20 transacciones
    .map(t => `${t.description}: $${t.amount} (${t.date})`)
    .join('\n');

  const systemPrompt = `Eres un experto en finanzas personales. Analiza las transacciones y detecta posibles "gastos hormiga" 
(pequeños gastos recurrentes que suman mucho al año).

Responde en formato JSON con array de gastos detectados:
{
  "detectedExpenses": [
    {
      "description": "nombre descriptivo",
      "amount": número,
      "frequency": "daily|weekly|monthly",
      "category": "food|entertainment|transport|tech|shopping|subscriptions"
    }
  ]
}`;

  try {
    const response = await callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Transacciones:\n${transactionsText}` },
    ]);

    const parsed = JSON.parse(response);
    return parsed.detectedExpenses || [];
  } catch (error) {
    console.error('Error detecting ant expenses:', error);
    return [];
  }
}

// ============================================
// PLANIFICADOR FINANCIERO - Análisis de Presupuestos
// ============================================

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
}

/**
 * Analiza presupuestos y genera insights con IA
 */
export async function analyzeBudgets(budgets: Budget[]): Promise<{
  insights: string[];
  warnings: string[];
  suggestions: string[];
}> {
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overBudget = budgets.filter(b => b.spent > b.amount);

  const budgetsText = budgets
    .map(b => {
      const percentage = (b.spent / b.amount) * 100;
      return `- ${b.name}: $${b.spent}/$${b.amount} (${percentage.toFixed(0)}%)`;
    })
    .join('\n');

  const systemPrompt = `Eres un asesor financiero experto. Analiza los presupuestos y proporciona:
1. 3 insights clave sobre los hábitos de gasto
2. Advertencias sobre presupuestos excedidos
3. 3 sugerencias prácticas para optimizar

Responde en formato JSON:
{
  "insights": ["insight1", "insight2", "insight3"],
  "warnings": ["warning1", "warning2"],
  "suggestions": ["sug1", "sug2", "sug3"]
}

Cada texto debe ser máximo 120 caracteres y usar emojis relevantes.`;

  const userPrompt = `Presupuestos del usuario:
${budgetsText}

Total presupuestado: $${totalBudget.toFixed(2)}
Total gastado: $${totalSpent.toFixed(2)}
Presupuestos excedidos: ${overBudget.length}`;

  try {
    const response = await callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const parsed = JSON.parse(response);
    return {
      insights: parsed.insights || [],
      warnings: parsed.warnings || [],
      suggestions: parsed.suggestions || [],
    };
  } catch (error) {
    console.error('Error analyzing budgets:', error);
    // Fallback con insights básicos
    const percentage = (totalSpent / totalBudget) * 100;
    return {
      insights: [
        `📊 Has utilizado el ${percentage.toFixed(0)}% de tu presupuesto total`,
        `💰 Presupuesto restante: $${(totalBudget - totalSpent).toFixed(2)}`,
        overBudget.length > 0
          ? `⚠️ Tienes ${overBudget.length} categoría(s) sobre presupuesto`
          : '✅ Todas tus categorías están dentro del presupuesto',
      ],
      warnings: overBudget.map(b => `⚠️ ${b.name}: Excedido por $${(b.spent - b.amount).toFixed(2)}`),
      suggestions: [
        '💡 Revisa tus gastos más grandes y busca alternativas',
        '🎯 Establece alertas cuando llegues al 80% del presupuesto',
        '📱 Usa apps de cashback para recuperar parte de tus gastos',
      ],
    };
  }
}

/**
 * Predice gastos futuros basándose en historial
 */
export async function predictFutureExpenses(
  budgets: Budget[],
  transactions: any[]
): Promise<{
  nextMonthPrediction: number;
  categoryPredictions: Record<string, number>;
  confidence: number;
}> {
  const systemPrompt = `Eres un analista financiero experto en predicción de gastos. 
Analiza el historial y predice los gastos del próximo mes.

Responde en formato JSON:
{
  "nextMonthPrediction": número,
  "categoryPredictions": {"category": número},
  "confidence": número entre 0 y 1
}`;

  const budgetsText = budgets.map(b => `${b.name}: $${b.spent}`).join(', ');
  const avgSpent = budgets.reduce((sum, b) => sum + b.spent, 0) / budgets.length;

  try {
    const response = await callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Presupuestos actuales: ${budgetsText}` },
    ]);

    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Error predicting expenses:', error);
    // Fallback con predicción simple
    const categoryPredictions: Record<string, number> = {};
    budgets.forEach(b => {
      categoryPredictions[b.category] = b.spent * 1.05; // 5% más
    });

    return {
      nextMonthPrediction: avgSpent * budgets.length * 1.05,
      categoryPredictions,
      confidence: 0.7,
    };
  }
}

// ============================================
// REPORTES AVANZADOS - Análisis Financiero Completo
// ============================================

export interface FinancialData {
  ingresos: number;
  gastos: number;
  ahorros: number;
  inversiones: number;
  deudas: number;
  gastosHormiga: number;
  metaAhorro: number;
  meses: number;
}

/**
 * Genera análisis financiero completo con IA
 */
export async function generateFinancialAnalysis(data: FinancialData): Promise<{
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  score: number;
}> {
  const ahorroNeto = data.ingresos - data.gastos;
  const ratioDeuda = (data.deudas / data.ingresos) * 100;
  const porcentajeAhorro = (data.ahorros / data.ingresos) * 100;

  const systemPrompt = `Eres un asesor financiero certificado. Analiza la situación financiera y proporciona:
1. Resumen ejecutivo (máximo 200 caracteres)
2. 3 fortalezas financieras
3. 3 debilidades a mejorar
4. 5 recomendaciones accionables
5. Score financiero del 0-100

Responde en formato JSON:
{
  "summary": "texto",
  "strengths": ["str1", "str2", "str3"],
  "weaknesses": ["weak1", "weak2", "weak3"],
  "recommendations": ["rec1", "rec2", "rec3", "rec4", "rec5"],
  "score": número
}

Usa emojis relevantes y sé específico con los números.`;

  const userPrompt = `Datos financieros del usuario:
- Ingresos mensuales: $${data.ingresos}
- Gastos mensuales: $${data.gastos}
- Ahorros actuales: $${data.ahorros}
- Inversiones: $${data.inversiones}
- Deudas totales: $${data.deudas}
- Gastos hormiga: $${data.gastosHormiga}
- Meta de ahorro: $${data.metaAhorro}

Métricas calculadas:
- Ahorro neto mensual: $${ahorroNeto}
- Ratio de deuda: ${ratioDeuda.toFixed(1)}%
- Porcentaje de ahorro: ${porcentajeAhorro.toFixed(1)}%`;

  try {
    const response = await callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Error generating financial analysis:', error);
    // Fallback con análisis básico
    const score = Math.min(
      100,
      Math.max(
        0,
        50 + // Base
          (porcentajeAhorro > 20 ? 20 : porcentajeAhorro) + // Ahorro
          (ratioDeuda < 30 ? 20 : 0) + // Deuda baja
          (ahorroNeto > 0 ? 10 : -20) // Ahorro positivo
      )
    );

    return {
      summary: `Tu salud financiera está en ${score}/100. ${
        ahorroNeto > 0 ? '✅ Tienes capacidad de ahorro' : '⚠️ Gastas más de lo que ingresas'
      }`,
      strengths: [
        porcentajeAhorro > 20 ? '💪 Excelente tasa de ahorro' : '💰 Tienes ingresos estables',
        data.inversiones > 0 ? '📈 Estás invirtiendo para el futuro' : '🎯 Tienes metas claras',
        ratioDeuda < 30 ? '✅ Deuda bajo control' : '💼 Gestionas tu presupuesto',
      ],
      weaknesses: [
        ratioDeuda > 50 ? '⚠️ Nivel de deuda alto' : '🐜 Gastos hormiga significativos',
        porcentajeAhorro < 10 ? '📉 Tasa de ahorro baja' : '💸 Gastos altos',
        ahorroNeto < 0 ? '🚨 Déficit mensual' : '🎯 Falta de diversificación',
      ],
      recommendations: [
        '🎯 Reduce gastos hormiga para ahorrar $' + data.gastosHormiga.toFixed(0) + ' mensuales',
        '💡 Aumenta tu ahorro al 20% de tus ingresos ($' + (data.ingresos * 0.2).toFixed(0) + ')',
        ratioDeuda > 30 ? '💳 Prioriza pagar deudas de alto interés' : '📊 Diversifica tus inversiones',
        '🏦 Crea un fondo de emergencia de 6 meses de gastos',
        '📱 Automatiza tus ahorros e inversiones',
      ],
      score,
    };
  }
}

/**
 * Interpreta una fórmula financiera con contexto
 */
export async function interpretFormula(
  formulaName: string,
  result: number,
  userData: FinancialData
): Promise<string> {
  const systemPrompt = `Eres un asesor financiero experto. Interpreta el resultado de una fórmula financiera 
y proporciona una explicación clara y accionable en máximo 150 caracteres.`;

  const userPrompt = `Fórmula: ${formulaName}
Resultado: ${result}
Contexto: Ingresos $${userData.ingresos}, Gastos $${userData.gastos}, Ahorros $${userData.ahorros}

Proporciona una interpretación práctica y específica.`;

  try {
    const response = await callGroqAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return response;
  } catch (error) {
    console.error('Error interpreting formula:', error);
    return `El resultado de ${result.toFixed(2)} indica tu situación actual. Consulta con un asesor para más detalles.`;
  }
}

// ============================================
// FUNCIÓN GENERAL - Chat con contexto de herramienta
// ============================================

/**
 * Chat general con contexto de la herramienta actual
 */
export async function chatWithTool(
  toolName: 'cazahormigas' | 'planificador' | 'reportes',
  userMessage: string,
  context: any
): Promise<string> {
  const systemPrompts = {
    cazahormigas: `Eres un experto en identificar y eliminar gastos hormiga. 
Ayuda al usuario a optimizar sus gastos pequeños y recurrentes.`,
    planificador: `Eres un asesor de presupuestos personales. 
Ayuda al usuario a gestionar mejor sus presupuestos y gastos.`,
    reportes: `Eres un analista financiero experto. 
Ayuda al usuario a entender sus métricas financieras y tomar mejores decisiones.`,
  };

  const contextText = JSON.stringify(context, null, 2);

  try {
    const response = await callGroqAPI([
      { role: 'system', content: systemPrompts[toolName] },
      {
        role: 'user',
        content: `Contexto actual:\n${contextText}\n\nPregunta del usuario: ${userMessage}`,
      },
    ]);

    return response;
  } catch (error) {
    console.error('Error in chat with tool:', error);
    return 'Lo siento, no pude procesar tu pregunta. Por favor intenta de nuevo.';
  }
}

export default {
  analyzeAntExpenses,
  detectAntExpenses,
  analyzeBudgets,
  predictFutureExpenses,
  generateFinancialAnalysis,
  interpretFormula,
  chatWithTool,
};
