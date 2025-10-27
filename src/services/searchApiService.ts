 /**
 * Market Data Service
 * Servicio para obtener datos de mercado en tiempo real
 * Usa Financial Modeling Prep API (https://financialmodelingprep.com/)
 */

import { supabase } from '../supabase';

// Financial Modeling Prep configuration
const FMP_API_KEY = process.env.EXPO_PUBLIC_FMP_API_KEY || 'demo';
const FMP_BASE_URL = process.env.EXPO_PUBLIC_FMP_BASE_URL || 'https://financialmodelingprep.com/api/v3';



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
 * Usa Financial Modeling Prep API directamente
 */
export async function getMarketStocks(symbols: string[] = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD']): Promise<MarketStock[]> {
  try {
    console.log('📊 [getMarketStocks] Intentando usar Financial Modeling Prep API');

    // Intentar obtener datos reales de FMP API
    const url = `${FMP_BASE_URL}/quote/${symbols.join(',')}?apikey=${FMP_API_KEY}`;
    console.log('📡 [FMP] URL:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      console.log('✅ [FMP] Datos obtenidos:', data.length);

      const results: MarketStock[] = data.map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changesPercentage,
        currency: 'USD',
        exchange: stock.exchange,
        logo: `https://logo.clearbit.com/${stock.symbol.toLowerCase()}.com`,
      }));

      return results;
    } else {
      console.warn('⚠️ [FMP] No se obtuvieron datos, intentando con símbolos individuales');
      // Intentar obtener datos uno por uno
      const individualResults = [];
      for (const symbol of symbols) {
        try {
          const singleUrl = `${FMP_BASE_URL}/quote/${symbol}?apikey=${FMP_API_KEY}`;
          const singleResponse = await fetch(singleUrl);
          const singleData = await singleResponse.json();

          if (Array.isArray(singleData) && singleData.length > 0) {
            const stock = singleData[0];
            individualResults.push({
              symbol: stock.symbol,
              name: stock.name,
              price: stock.price,
              change: stock.change,
              changePercent: stock.changesPercentage,
              currency: 'USD',
              exchange: stock.exchange,
              logo: `https://logo.clearbit.com/${stock.symbol.toLowerCase()}.com`,
            });
          }
        } catch (singleError) {
          console.warn(`⚠️ [FMP] Error obteniendo ${symbol}:`, singleError);
        }
      }

      if (individualResults.length > 0) {
        console.log('✅ [FMP] Datos obtenidos individualmente:', individualResults.length);
        return individualResults;
      } else {
        throw new Error('No se pudieron obtener datos de la API');
      }
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
    // Usar API real para obtener datos específicos
    const url = `${FMP_BASE_URL}/quote/${symbol}?apikey=${FMP_API_KEY}`;
    console.log('📡 [fetchStockData] URL:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const stock = data[0];
      return {
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changesPercentage,
        currency: 'USD',
        exchange: stock.exchange,
        logo: `https://logo.clearbit.com/${stock.symbol.toLowerCase()}.com`,
      };
    } else {
      throw new Error('No se encontraron datos para el símbolo');
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
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
 * Buscar acciones por query usando FMP API
 */
export async function searchStocks(query: string): Promise<MarketStock[]> {
  try {
    if (!query.trim()) return [];

    console.log('🔍 [searchStocks] Buscando:', query);

    // Usar FMP API para búsqueda
    const url = `${FMP_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=10&exchange=NASDAQ&apikey=${FMP_API_KEY}`;
    console.log('📡 [FMP Search] URL:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      console.log('✅ [FMP Search] Resultados encontrados:', data.length);

      const results: MarketStock[] = data.map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: 0, // No viene en la búsqueda, se obtendrá después si es necesario
        change: 0,
        changePercent: 0,
        currency: 'USD',
        exchange: stock.exchange || 'NASDAQ',
        logo: `https://logo.clearbit.com/${stock.symbol.toLowerCase()}.com`,
      }));

      return results;
    } else {
      console.warn('⚠️ [FMP Search] No se encontraron resultados');
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
