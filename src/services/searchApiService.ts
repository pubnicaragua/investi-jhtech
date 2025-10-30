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
export async function getMarketStocks(symbols: string[] = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD']): Promise<MarketStock[]> {
  try {
    console.log('📊 [getMarketStocks] Obteniendo datos con Finnhub API');

    const results: MarketStock[] = [];
    
    // Finnhub requiere peticiones individuales por símbolo
    for (const symbol of symbols) {
      try {
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

        // Pequeño delay para no exceder rate limits (60 req/min = 1 req/segundo)
        await new Promise(resolve => setTimeout(resolve, 1100));
      } catch (singleError) {
        console.warn(`⚠️ [Finnhub] Error obteniendo ${symbol}:`, singleError);
      }
    }

    if (results.length > 0) {
      console.log(`✅ [getMarketStocks] ${results.length} acciones obtenidas`);
      return results;
    } else {
      throw new Error('No se pudieron obtener datos de la API');
    }
  } catch (error) {
    console.error('❌ [getMarketStocks] Error:', error);
    throw new Error('Error al obtener datos del mercado. Verifica tu API key.');
  }
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
