 /**
 * Market Data Service
 * Servicio para obtener datos de mercado en tiempo real
 * Usa Alpha Vantage API (gratuita) como principal
 * Finnhub API como backup
 */

import { supabase } from '../supabase';

// Alpha Vantage configuration (API gratuita - 25 requests/día)
// Obtener API key gratis en: https://www.alphavantage.co/support/#api-key
const ALPHA_VANTAGE_API_KEY = process.env.EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Finnhub configuration (API gratuita - 60 requests/minuto)
// Obtener API key gratis en: https://finnhub.io/register
const FINNHUB_API_KEY = process.env.EXPO_PUBLIC_FINNHUB_API_KEY || 'demo';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';



export interface MarketStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  exchange: string;
  logo?: string;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

/**
 * Obtener datos de mercado de acciones populares
 * Usa Finnhub API (gratuita, más confiable)
 */
export async function getMarketStocks(
  symbols: string[] = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD'],
  provider: 'auto' | 'alpha' | 'finnhub' = 'auto'
): Promise<MarketStock[]> {
  try {
    console.log('📊 [getMarketStocks] provider=', provider)

    // If provider is alpha, try Alpha Vantage only
    if (provider === 'alpha') {
      return await getMarketStocksFromAlpha(symbols)
    }

    // If provider is finnhub, try Finnhub only
    if (provider === 'finnhub') {
      return await getMarketStocksFromFinnhub(symbols)
    }

    // provider === 'auto' (default): try Alpha Vantage first, then Finnhub
    try {
      const alpha = await getMarketStocksFromAlpha(symbols)
      if (alpha && alpha.length > 0) return alpha
      // else fallthrough to finnhub
    } catch (e) {
      console.warn('[getMarketStocks] Alpha Vantage failed:', e)
    }

    return await getMarketStocksFromFinnhub(symbols)
  } catch (error) {
    console.error('❌ [getMarketStocks] Error:', error);
    throw new Error('Error al obtener datos del mercado. Verifica tu API key.');
  }
}

async function getMarketStocksFromAlpha(symbols: string[]): Promise<MarketStock[]> {
  const maxAlphaSymbols = 5
  const alphaSymbols = symbols.slice(0, maxAlphaSymbols)
  const alphaResults: MarketStock[] = []

  if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'demo') {
    console.log('⚠️ [AlphaVantage] API key no configurada o usando demo; saltando Alpha Vantage')
    return []
  }

  console.log('📡 [AlphaVantage] Usando Alpha Vantage para obtener cotizaciones (limitado a', maxAlphaSymbols, 'símbolos)')
  for (const symbol of alphaSymbols) {
    try {
      const quote = await fetchAlphaQuote(symbol)
      if (quote) {
        alphaResults.push(quote)
        console.log(`✅ [AlphaVantage] ${symbol}: $${quote.price}`)
      }
    } catch (e) {
      console.warn('[AlphaVantage] Error fetching', symbol, e)
    }
  }

  return alphaResults
}

async function getMarketStocksFromFinnhub(symbols: string[]): Promise<MarketStock[]> {
  console.log('📡 [Finnhub] Intentando usar Finnhub como fallback')
  const results: MarketStock[] = [];
  for (const symbol of symbols) {
    try {
      const quoteUrl = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const quoteResponse = await fetch(quoteUrl);
      const quoteData = await quoteResponse.json();

      const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
      const profileResponse = await fetch(profileUrl);
      const profileData = await profileResponse.json();

      if (quoteData && quoteData.c) {
        const currentPrice = quoteData.c;
        const previousClose = quoteData.pc || currentPrice;
        const change = currentPrice - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

        results.push({
          symbol: symbol,
          name: profileData.name || symbol,
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          currency: profileData.currency || 'USD',
          exchange: profileData.exchange || 'NASDAQ',
          logo: profileData.logo || `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
        });

        console.log(`✅ [Finnhub] ${symbol}: $${currentPrice}`);
      }

      // delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1100));
    } catch (singleError) {
      console.warn(`⚠️ [Finnhub] Error obteniendo ${symbol}:`, singleError);
    }
  }

  return results
}

/**
 * Obtener datos de un símbolo específico
 */
export async function fetchStockData(symbol: string): Promise<MarketStock> {
  try {
    console.log(`📡 [fetchStockData] Obteniendo ${symbol} con Finnhub`);

    // Obtener cotización actual
    const quoteUrl = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();

    // Obtener información de la compañía
    const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const profileResponse = await fetch(profileUrl);
    const profileData = await profileResponse.json();

    if (quoteData && quoteData.c) {
      const currentPrice = quoteData.c;
      const previousClose = quoteData.pc || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      return {
        symbol: symbol,
        name: profileData.name || symbol,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        currency: profileData.currency || 'USD',
        exchange: profileData.exchange || 'NASDAQ',
        logo: profileData.logo || `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
      };
    } else {
      throw new Error('No se encontraron datos para el símbolo');
    }
  } catch (error) {
    console.error(`❌ Error fetching data for ${symbol}:`, error);
    // Retornar datos básicos en caso de error
    return {
      symbol: symbol,
      name: symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      currency: 'USD',
      exchange: 'NASDAQ',
    };
  }
}

/**
 * Helper: obtener cotización desde Alpha Vantage (GLOBAL_QUOTE)
 * Dev note: Alpha Vantage free tier tiene límites; limitamos su uso en `getMarketStocks`.
 */
async function fetchAlphaQuote(symbol: string): Promise<MarketStock | null> {
  if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'demo') {
    return null
  }
  try {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_API_KEY}`
    console.log('[AlphaVantage] fetch URL:', url)
    const res = await fetch(url)
    const json = await res.json()
    const g = json['Global Quote'] || json['Global Quote'] || null
    if (!g || Object.keys(g).length === 0) return null

    const price = parseFloat(g['05. price'] || '0') || 0
    const change = parseFloat(g['09. change'] || '0') || 0
    let changePercent = 0
    try {
      const raw = (g['10. change percent'] || '').replace('%', '')
      changePercent = parseFloat(raw) || 0
    } catch (e) {
      changePercent = 0
    }

    return {
      symbol: g['01. symbol'] || symbol,
      name: g['01. symbol'] || symbol,
      price,
      change,
      changePercent,
      currency: 'USD',
      exchange: 'UNKNOWN',
      logo: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
    }
  } catch (e) {
    console.error('[AlphaVantage] fetchAlphaQuote error:', e)
    return null
  }
}

/**
 * Obtener índices de mercado principales
 */
export async function getMarketIndices(): Promise<MarketIndex[]> {
  const indices = [
    { symbol: '.DJI', name: 'Dow Jones' },
    { symbol: '.INX', name: 'S&P 500' },
    { symbol: '.IXIC', name: 'NASDAQ' },
  ];

  try {
    const promises = indices.map(async (index) => {
      const data = await fetchStockData(index.symbol);
      return {
        name: index.name,
        value: data.price,
        change: data.change,
        changePercent: data.changePercent,
      };
    });

    const results = await Promise.allSettled(promises);
    return results
      .filter((result): result is PromiseFulfilledResult<MarketIndex> => result.status === 'fulfilled')
      .map(result => result.value);
  } catch (error) {
    console.error('Error fetching market indices:', error);
    return [];
  }
}

/**
 * Buscar acciones por query usando Alpha Vantage API
 */
export async function searchStocks(query: string): Promise<MarketStock[]> {
  try {
    if (!query.trim()) return [];

    console.log('🔍 [searchStocks] Buscando:', query);

    // Usar Alpha Vantage API para búsqueda
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    console.log('📡 [Alpha Vantage Search] URL:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (data.bestMatches && Array.isArray(data.bestMatches) && data.bestMatches.length > 0) {
      console.log('✅ [Alpha Vantage Search] Resultados encontrados:', data.bestMatches.length);

      const results: MarketStock[] = data.bestMatches.slice(0, 10).map((stock: any) => ({
        symbol: stock['1. symbol'],
        name: stock['2. name'],
        price: 0, // No viene en la búsqueda, se obtendrá después si es necesario
        change: 0,
        changePercent: 0,
        currency: stock['8. currency'] || 'USD',
        exchange: stock['4. region'] || 'NASDAQ',
        logo: `https://logo.clearbit.com/${stock['1. symbol'].toLowerCase()}.com`,
      }));

      return results;
    } else {
      console.warn('⚠️ [Alpha Vantage Search] No se encontraron resultados');
      return [];
    }
  } catch (error) {
    console.error('❌ [searchStocks] Error:', error);
    return [];
  }
}

/**
 * Obtener datos de acciones latinoamericanas
 */
export async function getLatinAmericanStocks(): Promise<MarketStock[]> {
  const latinSymbols = [
    'VALE', // Vale (Brasil)
    'PBR', // Petrobras (Brasil)
    'GGAL', // Grupo Financiero Galicia (Argentina)
    'BBAR', // BBVA Banco Frances (Argentina)
    'SQM', // Sociedad Química y Minera (Chile)
    'COPEC.SN', // Copec (Chile)
  ];

  return getMarketStocks(latinSymbols);
}
