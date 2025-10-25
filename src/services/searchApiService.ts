/**
 * Market Data Service
 * Servicio para obtener datos de mercado en tiempo real
 * Usa Financial Modeling Prep API (más confiable que SearchAPI)
 */

import { supabase } from '../supabase';

// Financial Modeling Prep API (gratis, sin CORS)
const FMP_API_KEY = process.env.EXPO_PUBLIC_FMP_API_KEY || '82xqcoiLim6uBtlqlPnHiwcACynWkn7Y';
const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

// Mock data como último fallback
const MOCK_STOCKS: MarketStock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 178.50,
    change: 2.35,
    changePercent: 1.33,
    currency: 'USD',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.80,
    change: -0.95,
    changePercent: -0.66,
    currency: 'USD',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.90,
    change: 5.20,
    changePercent: 1.39,
    currency: 'USD',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 145.30,
    change: -1.20,
    changePercent: -0.82,
    currency: 'USD',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 242.80,
    change: 8.50,
    changePercent: 3.63,
    currency: 'USD',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 325.60,
    change: 4.20,
    changePercent: 1.31,
    currency: 'USD',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 495.20,
    change: 12.80,
    changePercent: 2.65,
    currency: 'USD',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    price: 118.40,
    change: -2.10,
    changePercent: -1.74,
    currency: 'USD',
    exchange: 'NASDAQ',
  },
];

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
    console.log('📊 [getMarketStocks] Iniciando llamada a API...');
    console.log('📊 [getMarketStocks] API Key:', FMP_API_KEY ? `${FMP_API_KEY.substring(0, 8)}...` : 'NO CONFIGURADA');
    
    // Obtener datos de Supabase (más confiable que API externa)
    console.log('📊 [getMarketStocks] Obteniendo desde Supabase...');
    
    const { data: supabaseData, error } = await supabase
      .from('market_data')
      .select('*')
      .in('symbol', symbols)
      .order('symbol');
    
    if (!error && supabaseData && supabaseData.length > 0) {
      console.log('✅ [getMarketStocks] Datos desde Supabase:', supabaseData.length);
      return supabaseData.map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.company_name,
        price: stock.current_price,
        change: stock.price_change,
        changePercent: stock.price_change_percent,
        currency: 'USD',
        exchange: stock.exchange || 'NASDAQ',
        logo: stock.logo_url,
      }));
    }
    
    console.warn('⚠️ [getMarketStocks] No hay datos en Supabase');
    
    // NO usar mock data, devolver array vacío
    console.warn('⚠️ [getMarketStocks] API no devolvió datos');
    return [];
  } catch (error) {
    console.error('❌ [getMarketStocks] Error:', error);
    console.warn('⚠️ [getMarketStocks] API falló, devolviendo array vacío');
    return [];
  }
}

/**
 * Obtener datos de un símbolo específico
 */
export async function fetchStockData(symbol: string): Promise<MarketStock> {
  try {
    const url = `${FMP_BASE_URL}/quote/${symbol}?apikey=${FMP_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // FMP API devuelve un array con un elemento
    const stockData = Array.isArray(data) ? data[0] : data;
    
    if (!stockData) {
      throw new Error('No data received');
    }

    return {
      symbol: stockData.symbol,
      name: stockData.name,
      price: stockData.price,
      change: stockData.change,
      changePercent: stockData.changesPercentage,
      currency: 'USD',
      exchange: stockData.exchange || 'NASDAQ',
      logo: `https://financialmodelingprep.com/image-stock/${stockData.symbol}.png`,
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    // Retornar datos mock en caso de error
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
 * Buscar acciones por query
 */
export async function searchStocks(query: string): Promise<MarketStock[]> {
  try {
    const url = `${FMP_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=10&apikey=${FMP_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    // FMP devuelve array de resultados
    if (!Array.isArray(data)) {
      return [];
    }

    return data.slice(0, 10).map((result: any) => ({
      symbol: result.symbol,
      name: result.name,
      price: 0, // Search no incluye precio
      change: 0,
      changePercent: 0,
      currency: result.currency || 'USD',
      exchange: result.exchangeShortName || 'NASDAQ',
      logo: `https://financialmodelingprep.com/image-stock/${result.symbol}.png`,
    }));
  } catch (error) {
    console.error('Error searching stocks:', error);
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
