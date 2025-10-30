/**
 * SerpAPI Google Finance Service (OPCIONAL)
 * Alternativa premium con datos más completos de Google Finance
 * Límite: 100 búsquedas/mes gratis
 * Registro: https://serpapi.com/users/sign_up
 */

export interface SerpApiStock {
  stock: string;
  name: string;
  price: number;
  currency?: string;
  price_movement?: {
    percentage: number;
    value: number;
    movement: 'Up' | 'Down';
  };
  link?: string;
}

export interface SerpApiMarketTrend {
  title: string;
  subtitle?: string;
  results: SerpApiStock[];
}

const SERPAPI_KEY = process.env.EXPO_PUBLIC_SERPAPI_KEY || '';
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

/**
 * Obtener índices de mercado usando SerpAPI
 */
export async function getSerpApiMarketIndexes(): Promise<SerpApiStock[]> {
  if (!SERPAPI_KEY || SERPAPI_KEY === 'demo') {
    console.warn('⚠️ [SerpAPI] API key no configurada');
    return [];
  }

  try {
    console.log('📊 [SerpAPI] Obteniendo índices de mercado');

    const url = `${SERPAPI_BASE_URL}?engine=google_finance_markets&trend=indexes&api_key=${SERPAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('❌ [SerpAPI] Error:', data.error);
      return [];
    }

    if (data.markets) {
      const allStocks: SerpApiStock[] = [];

      // Combinar mercados US, Europe y Asia
      ['us', 'europe', 'asia'].forEach(region => {
        if (data.markets[region]) {
          allStocks.push(...data.markets[region]);
        }
      });

      console.log(`✅ [SerpAPI] ${allStocks.length} índices obtenidos`);
      return allStocks;
    }

    return [];
  } catch (error) {
    console.error('❌ [SerpAPI] Error:', error);
    return [];
  }
}

/**
 * Obtener acciones más activas
 */
export async function getSerpApiMostActive(): Promise<SerpApiStock[]> {
  if (!SERPAPI_KEY || SERPAPI_KEY === 'demo') {
    return [];
  }

  try {
    const url = `${SERPAPI_BASE_URL}?engine=google_finance_markets&trend=most-active&api_key=${SERPAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.market_trends && data.market_trends.length > 0) {
      return data.market_trends[0].results || [];
    }

    return [];
  } catch (error) {
    console.error('❌ [SerpAPI] Error obteniendo most-active:', error);
    return [];
  }
}

/**
 * Obtener ganadores del día
 */
export async function getSerpApiGainers(): Promise<SerpApiStock[]> {
  if (!SERPAPI_KEY || SERPAPI_KEY === 'demo') {
    return [];
  }

  try {
    const url = `${SERPAPI_BASE_URL}?engine=google_finance_markets&trend=gainers&api_key=${SERPAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.market_trends && data.market_trends.length > 0) {
      return data.market_trends[0].results || [];
    }

    return [];
  } catch (error) {
    console.error('❌ [SerpAPI] Error obteniendo gainers:', error);
    return [];
  }
}

/**
 * Obtener perdedores del día
 */
export async function getSerpApiLosers(): Promise<SerpApiStock[]> {
  if (!SERPAPI_KEY || SERPAPI_KEY === 'demo') {
    return [];
  }

  try {
    const url = `${SERPAPI_BASE_URL}?engine=google_finance_markets&trend=losers&api_key=${SERPAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.market_trends && data.market_trends.length > 0) {
      return data.market_trends[0].results || [];
    }

    return [];
  } catch (error) {
    console.error('❌ [SerpAPI] Error obteniendo losers:', error);
    return [];
  }
}

/**
 * Obtener criptomonedas
 */
export async function getSerpApiCryptocurrencies(): Promise<SerpApiStock[]> {
  if (!SERPAPI_KEY || SERPAPI_KEY === 'demo') {
    return [];
  }

  try {
    const url = `${SERPAPI_BASE_URL}?engine=google_finance_markets&trend=cryptocurrencies&api_key=${SERPAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.market_trends && data.market_trends.length > 0) {
      return data.market_trends[0].results || [];
    }

    return [];
  } catch (error) {
    console.error('❌ [SerpAPI] Error obteniendo cryptocurrencies:', error);
    return [];
  }
}

/**
 * Convertir datos de SerpAPI al formato MarketStock
 */
export function convertSerpApiToMarketStock(serpStock: SerpApiStock) {
  return {
    symbol: serpStock.stock,
    name: serpStock.name,
    price: serpStock.price || 0,
    change: serpStock.price_movement?.value || 0,
    changePercent: serpStock.price_movement?.percentage || 0,
    currency: serpStock.currency || 'USD',
    exchange: 'Google Finance',
    logo: `https://logo.clearbit.com/${serpStock.stock.split(':')[0].toLowerCase()}.com`,
  };
}
