/**
 * Script de prueba para validar las APIs de mercado
 * Ejecutar: node scripts/test-market-apis.js
 */

// Cargar variables de entorno
require('dotenv').config();

const FINNHUB_API_KEY = process.env.EXPO_PUBLIC_FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY;

console.log('🧪 Iniciando pruebas de APIs de mercado...\n');

// Test 1: Finnhub - Cotización de Apple
async function testFinnhubQuote() {
  console.log('📊 Test 1: Finnhub - Cotización de AAPL');
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.c) {
      console.log('✅ Finnhub Quote funciona!');
      console.log(`   Precio actual: $${data.c}`);
      console.log(`   Cambio: ${data.d} (${data.dp}%)\n`);
      return true;
    } else if (data.error) {
      console.log('❌ Error en Finnhub:', data.error);
      console.log('   Verifica tu API key en .env\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message, '\n');
    return false;
  }
}

// Test 2: Finnhub - Perfil de compañía
async function testFinnhubProfile() {
  console.log('📊 Test 2: Finnhub - Perfil de AAPL');
  try {
    const url = `https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.name) {
      console.log('✅ Finnhub Profile funciona!');
      console.log(`   Nombre: ${data.name}`);
      console.log(`   Industria: ${data.finnhubIndustry}`);
      console.log(`   Logo: ${data.logo}\n`);
      return true;
    } else {
      console.log('❌ No se pudo obtener el perfil\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message, '\n');
    return false;
  }
}

// Test 3: Alpha Vantage - Búsqueda
async function testAlphaVantageSearch() {
  console.log('📊 Test 3: Alpha Vantage - Búsqueda de "Apple"');
  try {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=Apple&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.bestMatches && data.bestMatches.length > 0) {
      console.log('✅ Alpha Vantage Search funciona!');
      console.log(`   Resultados encontrados: ${data.bestMatches.length}`);
      console.log(`   Primer resultado: ${data.bestMatches[0]['1. symbol']} - ${data.bestMatches[0]['2. name']}\n`);
      return true;
    } else if (data.Note) {
      console.log('⚠️  Límite de API alcanzado:', data.Note);
      console.log('   Alpha Vantage: 25 requests/día\n');
      return false;
    } else {
      console.log('❌ No se encontraron resultados\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message, '\n');
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Verificar que las API keys estén configuradas
  if (!FINNHUB_API_KEY || FINNHUB_API_KEY === 'demo') {
    console.log('⚠️  ADVERTENCIA: FINNHUB_API_KEY no está configurada');
    console.log('   Obtén una gratis en: https://finnhub.io/register\n');
  }
  
  if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'demo') {
    console.log('⚠️  ADVERTENCIA: ALPHA_VANTAGE_API_KEY no está configurada');
    console.log('   Obtén una gratis en: https://www.alphavantage.co/support/#api-key\n');
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
  
  const results = {
    finnhubQuote: await testFinnhubQuote(),
    finnhubProfile: await testFinnhubProfile(),
    alphaVantageSearch: await testAlphaVantageSearch(),
  };
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE PRUEBAS:');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Finnhub Quote:          ${results.finnhubQuote ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Finnhub Profile:        ${results.finnhubProfile ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Alpha Vantage Search:   ${results.alphaVantageSearch ? '✅ PASS' : '❌ FAIL'}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('🎉 ¡Todas las APIs funcionan correctamente!');
    console.log('   Ya puedes usar la app sin problemas.\n');
  } else {
    console.log('⚠️  Algunas APIs no funcionan correctamente.');
    console.log('   Revisa las instrucciones en MARKET_API_SETUP.md\n');
  }
}

// Ejecutar
runAllTests().catch(console.error);
