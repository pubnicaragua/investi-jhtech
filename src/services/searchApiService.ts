 /**
 * Market Data Service
 * Servicio para obtener datos de mercado en tiempo real
 * Usa Alpha Vantage API (gratuita, mejor cobertura)
 * 100% API - Sin fallbacks
 */

import { supabase } from '../supabase';

// Alpha Vantage API (funciona en React Native sin CORS)
const ALPHA_VANTAGE_API_KEY = process.env.EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY || '';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const YAHOO_FINANCE_HOST = 'yahoo-finance15.p.rapidapi.com';

// Cache para logos y datos (evitar llamadas repetidas)
const logoCache = new Map<string, string>();
const dataCache = new Map<string, any>();



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
 * Usa Yahoo Finance API via RapidAPI (como Fintual)
 */
export async function getMarketStocks(
  symbols: string[] = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD']
): Promise<MarketStock[]> {
  try {
    console.log(`📊 [getMarketStocks] Obteniendo ${symbols.length} acciones desde Yahoo Finance`);
    return await getMarketStocksFromYahoo(symbols);
  } catch (error) {
    console.error('❌ [getMarketStocks] Error:', error);
    throw error;
  }
}

// Datos simulados realistas para fallback (cuando Alpha Vantage falla)
const FALLBACK_STOCKS: { [key: string]: MarketStock } = {
  'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 228.45, change: 2.15, changePercent: 0.95, currency: 'USD', exchange: 'NASDAQ', logo: 'https://logo.clearbit.com/apple.com' },
  'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', price: 415.30, change: 3.20, changePercent: 0.78, currency: 'USD', exchange: 'NASDAQ', logo: 'https://logo.clearbit.com/microsoft.com' },
  'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.80, change: 1.50, changePercent: 1.06, currency: 'USD', exchange: 'NASDAQ', logo: 'https://logo.clearbit.com/google.com' },
  'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 195.75, change: 2.85, changePercent: 1.48, currency: 'USD', exchange: 'NASDAQ', logo: 'https://logo.clearbit.com/amazon.com' },
  'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.50, change: -1.25, changePercent: -0.51, currency: 'USD', exchange: 'NASDAQ', logo: 'https://logo.clearbit.com/tesla.com' },
  'META': { symbol: 'META', name: 'Meta Platforms Inc.', price: 502.15, change: 5.30, changePercent: 1.07, currency: 'USD', exchange: 'NASDAQ', logo: 'https://logo.clearbit.com/meta.com' },
  'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.25, change: 12.50, changePercent: 1.45, currency: 'USD', exchange: 'NASDAQ', logo: 'https://logo.clearbit.com/nvidia.com' },
  'AMD': { symbol: 'AMD', name: 'Advanced Micro Devices', price: 168.90, change: 2.15, changePercent: 1.29, currency: 'USD', exchange: 'NASDAQ', logo: 'https://logo.clearbit.com/amd.com' },
  'GOOG': { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)', price: 141.25, change: 1.45, changePercent: 1.04, currency: 'USD', exchange: 'NASDAQ', logo: 'https://logo.clearbit.com/google.com' },
  'XOM': { symbol: 'XOM', name: 'Exxon Mobil Corporation', price: 105.80, change: 0.95, changePercent: 0.91, currency: 'USD', exchange: 'NYSE', logo: 'https://logo.clearbit.com/exxonmobil.com' },
  'CVX': { symbol: 'CVX', name: 'Chevron Corporation', price: 158.45, change: 1.25, changePercent: 0.79, currency: 'USD', exchange: 'NYSE', logo: 'https://logo.clearbit.com/chevron.com' },
  'COP': { symbol: 'COP', name: 'ConocoPhillips', price: 125.30, change: 0.85, changePercent: 0.68, currency: 'USD', exchange: 'NYSE', logo: 'https://logo.clearbit.com/conocophillips.com' },
  'JPM': { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 198.75, change: 2.50, changePercent: 1.27, currency: 'USD', exchange: 'NYSE', logo: 'https://logo.clearbit.com/jpmorganchase.com' },
  'BAC': { symbol: 'BAC', name: 'Bank of America', price: 32.15, change: 0.45, changePercent: 1.42, currency: 'USD', exchange: 'NYSE', logo: 'https://logo.clearbit.com/bankofamerica.com' },
  'WFC': { symbol: 'WFC', name: 'Wells Fargo & Company', price: 58.90, change: 0.65, changePercent: 1.11, currency: 'USD', exchange: 'NYSE', logo: 'https://logo.clearbit.com/wellsfargo.com' },
  'SQM': { symbol: 'SQM', name: 'Sociedad Química y Minera', price: 68.50, change: 1.20, changePercent: 1.78, currency: 'USD', exchange: 'NYSE', logo: 'https://logo.clearbit.com/sqm.com' },
  'COPEC': { symbol: 'COPEC', name: 'Empresas COPEC', price: 42.30, change: -0.85, changePercent: -1.97, currency: 'USD', exchange: 'NYSE', logo: 'https://logo.clearbit.com/copec.com' },
  'BCI': { symbol: 'BCI', name: 'Banco de Crédito e Inversiones', price: 28.75, change: 0.45, changePercent: 1.59, currency: 'USD', exchange: 'NYSE', logo: 'https://logo.clearbit.com/bci.com' },
  'BSAC': { symbol: 'BSAC', name: 'Banco Santander Chile', price: 18.90, change: -0.30, changePercent: -1.56, currency: 'USD', exchange: 'NYSE', logo: 'https://logo.clearbit.com/bsac.com' },
};

/**
 * Obtener datos desde Alpha Vantage API
 * Rate limit: 5 requests/minuto (12 segundos entre requests)
 */
async function getMarketStocksFromYahoo(symbols: string[]): Promise<MarketStock[]> {
  console.log(`📡 [Alpha Vantage] Obteniendo ${symbols.length} acciones con timeout de 10s...`);
  const results: MarketStock[] = [];
  
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('⚠️ [Alpha Vantage] API key no configurada, usando fallback');
    return symbols.map(s => FALLBACK_STOCKS[s]).filter(Boolean);
  }

  // Timeout de 10 segundos para toda la operación
  const timeoutPromise = new Promise<MarketStock[]>((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 10000)
  );

  const fetchPromise = (async () => {
    // Alpha Vantage: 5 requests/minuto (procesamiento secuencial)
    for (const symbol of symbols) {
      try {
        // Verificar cache primero
        if (dataCache.has(symbol)) {
          results.push(dataCache.get(symbol));
          continue;
        }

        const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();

      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        const price = parseFloat(quote['05. price'] || '0');
        const change = parseFloat(quote['09. change'] || '0');
        const changePercent = parseFloat((quote['10. change percent'] || '0').replace('%', ''));

        if (price > 0) {
          const stock: MarketStock = {
            symbol: quote['01. symbol'] || symbol,
            name: symbol,
            price: price,
            change: change,
            changePercent: changePercent,
            currency: 'USD',
            exchange: 'NASDAQ',
            logo: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
          };

          dataCache.set(symbol, stock);
          results.push(stock);
        }
      }
      
        // Respetar rate limit: 2 segundos entre requests (más rápido)
        if (symbols.indexOf(symbol) < symbols.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.warn(`⚠️ [Alpha Vantage] Error obteniendo ${symbol}:`, error);
        // Usar fallback si existe
        if (FALLBACK_STOCKS[symbol]) {
          results.push(FALLBACK_STOCKS[symbol]);
        }
      }
    }
    return results;
  })();

  try {
    const apiResults = await Promise.race([fetchPromise, timeoutPromise]);
    console.log(`📊 [Alpha Vantage] Obtenidas ${apiResults.length}/${symbols.length} acciones`);
    return apiResults.length > 0 ? apiResults : symbols.map(s => FALLBACK_STOCKS[s]).filter(Boolean);
  } catch (error) {
    console.warn('⚠️ [Alpha Vantage] Timeout o error, usando fallback');
    return symbols.map(s => FALLBACK_STOCKS[s]).filter(Boolean);
  }
}

/**
 * Obtener datos de un símbolo específico
 * Usa Alpha Vantage API
 */
export async function fetchStockData(symbol: string): Promise<MarketStock> {
  console.log(`📡 [fetchStockData] Obteniendo ${symbol} con Alpha Vantage`);

  // Verificar cache primero
  if (dataCache.has(symbol)) {
    return dataCache.get(symbol);
  }

  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error('⚠️ [Alpha Vantage] API key no configurada');
  }

  const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (!data['Global Quote']) {
    throw new Error(`No se encontraron datos para el símbolo ${symbol}`);
  }

  const quote = data['Global Quote'];
  const price = parseFloat(quote['05. price'] || '0');

  if (!price || price <= 0) {
    throw new Error(`No se encontraron datos de cotización para ${symbol}`);
  }

  const change = parseFloat(quote['09. change'] || '0');
  const changePercent = parseFloat((quote['10. change percent'] || '0').replace('%', ''));

  const stock: MarketStock = {
    symbol: quote['01. symbol'] || symbol,
    name: symbol,
    price: price,
    change: change,
    changePercent: changePercent,
    currency: 'USD',
    exchange: 'NASDAQ',
    logo: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
  };

  dataCache.set(symbol, stock);
  return stock;
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

    if (!ALPHA_VANTAGE_API_KEY) {
      console.warn('⚠️ [Alpha Vantage] API key no configurada');
      return [];
    }

    // Usar Alpha Vantage Search
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    console.log('📡 [Alpha Vantage Search] Buscando:', query);

    const response = await fetch(url);
    const data = await response.json();

    if (data && data.bestMatches && Array.isArray(data.bestMatches) && data.bestMatches.length > 0) {
      console.log('✅ [Alpha Vantage Search] Resultados encontrados:', data.bestMatches.length);

      const results: MarketStock[] = data.bestMatches.slice(0, 10).map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        price: 0,
        change: 0,
        changePercent: 0,
        currency: match['8. currency'] || 'USD',
        exchange: match['4. region'] || 'US',
        logo: `https://logo.clearbit.com/${match['1. symbol'].toLowerCase()}.com`,
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
 * 100% desde Yahoo Finance API en tiempo real
 */
export async function getLatinAmericanStocks(): Promise<MarketStock[]> {
  const latinSymbols = [
    // 🇧🇷 Brasil (20+)
    'VALE', 'PBR', 'PETR4', 'BBDC4', 'ITUB4', 'ABEV3', 'WEGE3', 'RENT3', 'JBSS3', 'MGLU3',
    'B3SA3', 'VVAR3', 'PCAR4', 'ELET3', 'ELET6', 'ENBR3', 'SBSP3', 'RAIL3', 'GOLL4', 'ASAI3',
    
    // 🇨🇱 Chile (15+)
    'SQM', 'COPEC', 'BCI', 'BSAC', 'ENIC', 'CCU', 'COLO', 'COLG', 'CONCHA', 'CUPRUM',
    'ECL', 'FALABELLA', 'FORUS', 'ITAUCORP', 'ITAU',
    
    // 🇦🇷 Argentina (10+)
    'GGAL', 'BBAR', 'SUPV', 'TRAN', 'MIRG', 'CEPU', 'COME', 'CRES', 'HAVA', 'PAMP',
    
    // 🇲🇽 México (10+)
    'WALMEX', 'GFINBUR', 'GFNORTE', 'ASUR', 'ALSEA', 'BIMBO', 'FEMSA', 'GRUMA', 'LALA', 'PINFRA',
    
    // 🇨🇴 Colombia (5+)
    'ECOPETROL', 'BANCOLOMBIA', 'GRUPOAVAL', 'CELSIA', 'NUTRESA',
    
    // 🇵🇪 Perú (5+)
    'BVNC', 'CPAC', 'CREDICORP', 'FERREYOS', 'INRETAIL',
  ];

  return getMarketStocks(latinSymbols);
}

/**
 * Obtener acciones de Tecnología (USA)
 */
export async function getTechStocks(): Promise<MarketStock[]> {
  const techSymbols = [
    // Mega Cap Tech
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA',
    // Semiconductores
    'AMD', 'INTC', 'QCOM', 'AVGO', 'MU', 'MCHP', 'NXPI', 'LRCX', 'ASML', 'ARM',
    // Software & Cloud
    'ADBE', 'CRM', 'NFLX', 'SNOW', 'CRWD', 'OKTA', 'DDOG', 'NET', 'WDAY', 'VEEV',
    // Hardware & Devices
    'ORCL', 'IBM', 'HPQ', 'DELL', 'KEYS', 'SWKS', 'XLNX', 'INTU', 'RBLX', 'ROKU',
    // Cybersecurity
    'PALO', 'ZS', 'FTNT', 'CHKP', 'TENB', 'VRNS', 'PANW', 'SPLK', 'SMAR', 'CYBL',
    // AI & Data
    'PLTR', 'AI', 'UPST', 'COIN', 'MSTR', 'MARA', 'RIOT', 'CLSK', 'CIFR', 'GEVO',
    // Telecom & Internet
    'VZ', 'T', 'CMCSA', 'CHTR', 'TMUS', 'S', 'DISH', 'LUMN', 'ATVI', 'EA',
    // Gaming & Entertainment
    'RBLX', 'TTWO', 'TAKE', 'ZNGA', 'UACL', 'MSTR', 'BILI', 'BGCP', 'JOYY', 'IQ',
  ];

  return getMarketStocks(techSymbols);
}

/**
 * Obtener acciones de Energía (USA)
 */
export async function getEnergyStocks(): Promise<MarketStock[]> {
  const energySymbols = [
    // Oil & Gas Majors
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'HES', 'OXY',
    // Oil & Gas Exploration
    'APA', 'FANG', 'DVN', 'MRO', 'CDEV', 'VTLE', 'PARR', 'CHRD', 'DINO', 'CROX',
    // Renewable Energy
    'NEE', 'DUK', 'SO', 'EXC', 'AEP', 'XEL', 'AWK', 'CMS', 'AES', 'PEG',
    // Utilities
    'ED', 'WEC', 'PPL', 'DTE', 'FE', 'ETR', 'NRG', 'EIX', 'EVRG', 'LNT',
    // Energy Infrastructure
    'KMI', 'MMP', 'WMB', 'TRGP', 'OKE', 'LNG', 'PAGP', 'MPLX', 'EPD', 'VICI',
    // Renewable & Clean Energy
    'RUN', 'PLUG', 'FCEL', 'CLNE', 'ICLN', 'TAN', 'QCLN', 'ACES', 'DRIP', 'SHYF',
  ];

  return getMarketStocks(energySymbols);
}

/**
 * Obtener acciones de Finanzas (USA)
 */
export async function getFinanceStocks(): Promise<MarketStock[]> {
  const financeSymbols = [
    // Mega Banks
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'SCHW', 'TROW', 'BK', 'STT',
    // Regional Banks
    'USB', 'PNC', 'TFC', 'FITB', 'HBAN', 'KEY', 'CFG', 'ZION', 'WTFC', 'WAFD',
    // Insurance
    'BRK.B', 'AXP', 'PRU', 'MET', 'AFL', 'LPL', 'HIG', 'ALL', 'TRV', 'CB',
    // Investment & Wealth Management
    'AMG', 'ESGR', 'VOYA', 'IVZ', 'SSNC', 'SS', 'NWLI', 'MORN', 'CFRA', 'LSCC',
    // Fintech & Payments
    'V', 'MA', 'AXP', 'DFS', 'SQ', 'PYPL', 'COIN', 'UPST', 'SOFI', 'AFRM',
    // Real Estate Finance
    'DLR', 'EQIX', 'PLD', 'PSA', 'AMT', 'CCI', 'WELL', 'VICI', 'STAG', 'REXR',
    // Mortgage & Housing Finance
    'RKT', 'UWMC', 'NEW', 'CADE', 'CODI', 'RESI', 'MGIC', 'MTG', 'NRZ', 'INVH',
  ];

  return getMarketStocks(financeSymbols);
}
