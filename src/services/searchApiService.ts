/**
 * Market Data Service
 * Servicio para obtener datos de mercado en tiempo real
 * Usa datos mock (Yahoo Finance no funciona en React Native)
 */

import { supabase } from '../supabase';

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
    console.log('📊 [getMarketStocks] Usando datos mock (Yahoo Finance no compatible con RN)');
    
    // Devolver mock data con variación aleatoria para simular mercado real
    return symbols.map((symbol, index) => {
      const mockStock = MOCK_STOCKS[index % MOCK_STOCKS.length];
      const randomVariation = (Math.random() - 0.5) * 10; // ±5
      
      return {
        ...mockStock,
        symbol: symbol,
        price: mockStock.price + randomVariation,
        change: mockStock.change + (Math.random() - 0.5) * 2,
        changePercent: mockStock.changePercent + (Math.random() - 0.5),
      };
    });
  } catch (error) {
    console.error('❌ [getMarketStocks] Error:', error);
    return MOCK_STOCKS.slice(0, symbols.length);
  }
}

/**
 * Obtener datos de un símbolo específico
 */
export async function fetchStockData(symbol: string): Promise<MarketStock> {
  try {
    // Usar mock data
    const mockStock = MOCK_STOCKS.find(s => s.symbol === symbol) || MOCK_STOCKS[0];
    const randomVariation = (Math.random() - 0.5) * 10;
    
    return {
      ...mockStock,
      symbol: symbol,
      price: mockStock.price + randomVariation,
      change: mockStock.change + (Math.random() - 0.5) * 2,
      changePercent: mockStock.changePercent + (Math.random() - 0.5),
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
    // Filtrar mock data por query
    const filtered = MOCK_STOCKS.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.slice(0, 10);
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
