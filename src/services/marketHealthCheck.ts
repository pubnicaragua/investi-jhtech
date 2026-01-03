/**
 * ============================================================================
 * MARKET INFO HEALTH CHECK SERVICE
 * ============================================================================
 * 
 * Servicio para verificar el estado de las APIs de mercado
 * - Verifica conectividad con Alpha Vantage
 * - Valida API keys
 * - Prueba obtención de datos
 * - Genera reportes de salud
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'down'
  timestamp: string
  apiKey: {
    configured: boolean
    valid: boolean
  }
  connectivity: {
    reachable: boolean
    responseTime: number
  }
  dataQuality: {
    stocksAvailable: number
    cacheValid: boolean
    lastUpdate: string | null
  }
  errors: string[]
  recommendations: string[]
}

/**
 * Verifica la salud completa del sistema MarketInfo
 */
export async function checkMarketInfoHealth(): Promise<HealthCheckResult> {
  console.log('🏥 [HealthCheck] Iniciando verificación de MarketInfo...')
  
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    apiKey: {
      configured: false,
      valid: false
    },
    connectivity: {
      reachable: false,
      responseTime: 0
    },
    dataQuality: {
      stocksAvailable: 0,
      cacheValid: false,
      lastUpdate: null
    },
    errors: [],
    recommendations: []
  }

  // 1. Verificar API Key
  const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY
  result.apiKey.configured = !!apiKey
  
  if (!apiKey) {
    result.status = 'down'
    result.errors.push('API Key de Alpha Vantage no configurada')
    result.recommendations.push('Configura EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY en tu archivo .env')
    return result
  }

  // 2. Verificar conectividad con Alpha Vantage
  try {
    const startTime = Date.now()
    const testSymbol = 'AAPL'
    const testUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${testSymbol}&apikey=${apiKey}`
    
    console.log('🔍 [HealthCheck] Probando conectividad con Alpha Vantage...')
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    const responseTime = Date.now() - startTime
    result.connectivity.responseTime = responseTime
    
    if (!response.ok) {
      result.status = 'down'
      result.errors.push(`Error HTTP ${response.status} al conectar con Alpha Vantage`)
      result.recommendations.push('Verifica tu conexión a internet')
      return result
    }

    const data = await response.json()
    
    // Verificar si la respuesta es válida
    if (data['Error Message']) {
      result.apiKey.valid = false
      result.status = 'down'
      result.errors.push('API Key inválida o símbolo no encontrado')
      result.recommendations.push('Verifica que tu API Key de Alpha Vantage sea correcta')
      return result
    }

    if (data['Note']) {
      result.status = 'degraded'
      result.errors.push('Límite de rate limit alcanzado')
      result.recommendations.push('Espera 1 minuto antes de hacer más solicitudes (límite: 5 req/min)')
      return result
    }

    if (data['Global Quote']) {
      result.apiKey.valid = true
      result.connectivity.reachable = true
      console.log(`✅ [HealthCheck] Conectividad OK (${responseTime}ms)`)
    } else {
      result.status = 'degraded'
      result.errors.push('Respuesta inesperada de la API')
    }

  } catch (error: any) {
    result.status = 'down'
    result.connectivity.reachable = false
    result.errors.push(`Error de conectividad: ${error.message}`)
    result.recommendations.push('Verifica tu conexión a internet')
    return result
  }

  // 3. Verificar calidad de datos en caché
  try {
    const cachedData = await AsyncStorage.getItem('market_stocks_cache')
    
    if (cachedData) {
      const parsed = JSON.parse(cachedData)
      result.dataQuality.stocksAvailable = parsed.stocks?.length || 0
      result.dataQuality.lastUpdate = new Date(parsed.timestamp).toISOString()
      
      // Verificar si el caché es reciente (menos de 24 horas)
      const cacheAge = Date.now() - parsed.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24 horas
      result.dataQuality.cacheValid = cacheAge < maxAge
      
      if (!result.dataQuality.cacheValid) {
        result.recommendations.push('El caché de datos tiene más de 24 horas. Considera refrescar los datos.')
      }
      
      if (result.dataQuality.stocksAvailable < 50) {
        result.status = 'degraded'
        result.recommendations.push(`Solo ${result.dataQuality.stocksAvailable} acciones disponibles. Se esperan 200+.`)
      }
      
      console.log(`📊 [HealthCheck] Caché: ${result.dataQuality.stocksAvailable} acciones`)
    } else {
      result.recommendations.push('No hay datos en caché. Realiza una carga inicial.')
    }
  } catch (error: any) {
    result.errors.push(`Error verificando caché: ${error.message}`)
  }

  // Determinar estado final
  if (result.errors.length === 0 && result.dataQuality.stocksAvailable >= 100) {
    result.status = 'healthy'
  } else if (result.errors.length > 0 && result.connectivity.reachable) {
    result.status = 'degraded'
  }

  console.log(`🏥 [HealthCheck] Estado final: ${result.status}`)
  return result
}

/**
 * Genera un reporte legible del estado de salud
 */
export function generateHealthReport(health: HealthCheckResult): string {
  const statusEmoji = {
    healthy: '✅',
    degraded: '⚠️',
    down: '❌'
  }

  let report = `${statusEmoji[health.status]} Estado de MarketInfo: ${health.status.toUpperCase()}\n\n`
  
  report += `📅 Verificado: ${new Date(health.timestamp).toLocaleString()}\n\n`
  
  report += `🔑 API Key:\n`
  report += `   - Configurada: ${health.apiKey.configured ? '✅' : '❌'}\n`
  report += `   - Válida: ${health.apiKey.valid ? '✅' : '❌'}\n\n`
  
  report += `🌐 Conectividad:\n`
  report += `   - Alcanzable: ${health.connectivity.reachable ? '✅' : '❌'}\n`
  report += `   - Tiempo de respuesta: ${health.connectivity.responseTime}ms\n\n`
  
  report += `📊 Calidad de Datos:\n`
  report += `   - Acciones disponibles: ${health.dataQuality.stocksAvailable}\n`
  report += `   - Caché válido: ${health.dataQuality.cacheValid ? '✅' : '❌'}\n`
  if (health.dataQuality.lastUpdate) {
    report += `   - Última actualización: ${new Date(health.dataQuality.lastUpdate).toLocaleString()}\n`
  }
  report += `\n`
  
  if (health.errors.length > 0) {
    report += `❌ Errores:\n`
    health.errors.forEach(error => {
      report += `   - ${error}\n`
    })
    report += `\n`
  }
  
  if (health.recommendations.length > 0) {
    report += `💡 Recomendaciones:\n`
    health.recommendations.forEach(rec => {
      report += `   - ${rec}\n`
    })
  }
  
  return report
}

/**
 * Verifica si MarketInfo está listo para usar
 */
export async function isMarketInfoReady(): Promise<boolean> {
  const health = await checkMarketInfoHealth()
  return health.status === 'healthy' || health.status === 'degraded'
}
