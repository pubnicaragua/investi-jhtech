/**
 * Market Data Service
 * Servicio para obtener datos de mercado en tiempo real
 * Usa SearchAPI (https://www.searchapi.io/)
 */

import { supabase } from '../supabase';

// SearchAPI configuration
const SEARCHAPI_KEY = 'igaze6ph1NawrHgRDjsWwuFq';
const SEARCHAPI_BASE_URL = 'https://www.searchapi.io/api/v1/search';

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
    console.log('📊 [getMarketStocks] Usando mock data (SearchAPI tiene error)');
    
    // TEMPORAL: SearchAPI devuelve error, usar mock data
    return symbols.map((symbol, index) => {
      const mockStock = MOCK_STOCKS[index % MOCK_STOCKS.length];
      const randomVariation = (Math.random() - 0.5) * 10;
      return {
        ...mockStock,
        symbol: symbol,
        price: mockStock.price + randomVariation,
        change: mockStock.change + (Math.random() - 0.5) * 2,
        changePercent: mockStock.changePercent + (Math.random() - 0.5),
        logo: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
      };
    });
    
    /* CÓDIGO SEARCHAPI COMENTADO HASTA ARREGLAR API
    // SearchAPI usa Google Finance, hacer query para cada símbolo
    const results: MarketStock[] = [];
    
    for (const symbol of symbols.slice(0, 3)) { // Limitar a 3 para no exceder límite gratuito
      try {
        const url = `${SEARCHAPI_BASE_URL}?engine=google_finance&q=${symbol}&api_key=${SEARCHAPI_KEY}`;
        console.log('📡 [SearchAPI] URL:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        console.log('📡 [SearchAPI] Full Response:', JSON.stringify(data));
        
        // SearchAPI devuelve markets en lugar de summary
        if (data.markets && data.markets.length > 0) {
          const market = data.markets[0];
          results.push({
            symbol: symbol,
            name: market.name || symbol,
            price: parseFloat(market.price?.toString().replace(/[^0-9.]/g, '') || '0'),
            change: parseFloat(market.price_change?.toString().replace(/[^0-9.-]/g, '') || '0'),
            changePercent: parseFloat(market.price_change_percentage?.toString().replace(/[^0-9.-]/g, '') || '0'),
            currency: 'USD',
            exchange: market.exchange || 'NASDAQ',
            logo: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
          });
          console.log('✅ [SearchAPI] Stock agregado:', symbol, market.price);
        } else if (data.summary) {
          // Fallback a estructura summary
          const summary = data.summary;
          results.push({
            symbol: symbol,
            name: summary.title || symbol,
            price: parseFloat(summary.price?.replace(/[^0-9.]/g, '') || '0'),
            change: parseFloat(summary.price_movement?.movement || '0'),
            changePercent: parseFloat(summary.price_movement?.percentage?.replace('%', '') || '0'),
            currency: 'USD',
            exchange: summary.stock_exchange || 'NASDAQ',
            logo: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
          });
          console.log('✅ [SearchAPI] Stock agregado (summary):', symbol);
        } else {
          console.warn('⚠️ [SearchAPI] No data para:', symbol, 'Keys:', Object.keys(data));
        }
      } catch (err) {
        console.error(`❌ [SearchAPI] Error ${symbol}:`, err);
      }
    }
    
    // Si obtuvimos datos, completar con mock para el resto
    if (results.length > 0) {
      const remaining = symbols.slice(results.length);
      remaining.forEach((symbol, index) => {
        const mockStock = MOCK_STOCKS[index % MOCK_STOCKS.length];
        results.push({
          ...mockStock,
          symbol: symbol,
          logo: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
        });
      });
      
      console.log('✅ [getMarketStocks] Datos reales:', results.length);
      return results;
    }
    
    // Fallback a mock data
    console.warn('⚠️ [getMarketStocks] Usando mock data');
    return symbols.map((symbol, index) => {
      const mockStock = MOCK_STOCKS[index % MOCK_STOCKS.length];
      return {
        ...mockStock,
        symbol: symbol,
        logo: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
      };
    });
    */
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
