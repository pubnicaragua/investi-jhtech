// =====================================================
// SCRIPT DE TESTING COMPLETO - INVESTI APP ENDPOINTS
// Ejecutar con: node TEST_ENDPOINTS_COMPLETO.js
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://paoliakwfoczcallnecf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o';

const supabase = createClient(supabaseUrl, supabaseKey);

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Función para logging con colores
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para testing de endpoints
async function testEndpoint(name, testFunction) {
  try {
    log(`\n🧪 Testing: ${name}`, 'blue');
    const result = await testFunction();
    if (result.success) {
      log(`✅ ${name}: PASSED`, 'green');
      if (result.data) {
        log(`   📊 Data: ${JSON.stringify(result.data).substring(0, 100)}...`, 'reset');
      }
    } else {
      log(`❌ ${name}: FAILED - ${result.error}`, 'red');
    }
    return result.success;
  } catch (error) {
    log(`💥 ${name}: ERROR - ${error.message}`, 'red');
    return false;
  }
}

// =====================================================
// TESTS DE ESTRUCTURA DE BASE DE DATOS
// =====================================================

async function testDatabaseStructure() {
  log('\n🏗️  TESTING DATABASE STRUCTURE', 'bold');
  
  // Test 1: Verificar tablas principales
  const tables = await testEndpoint('Database Tables', async () => {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'posts', 'communities', 'messages', 'notifications']);
    
    if (error) return { success: false, error: error.message };
    return { success: data.length >= 5, data: data.map(t => t.table_name) };
  });

  // Test 2: Verificar columnas críticas en messages
  const messageColumns = await testEndpoint('Messages Table Structure', async () => {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'messages')
      .in('column_name', ['conversation_id', 'content', 'sender_id']);
    
    if (error) return { success: false, error: error.message };
    return { success: data.length >= 3, data: data.map(c => c.column_name) };
  });

  // Test 3: Verificar tabla message_reads
  const messageReads = await testEndpoint('Message Reads Table', async () => {
    const { data, error } = await supabase
      .from('message_reads')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      return { success: false, error: 'Table message_reads does not exist' };
    }
    return { success: true, data: 'Table exists' };
  });

  return { tables, messageColumns, messageReads };
}

// =====================================================
// TESTS DE AUTENTICACIÓN
// =====================================================

async function testAuthentication() {
  log('\n🔐 TESTING AUTHENTICATION', 'bold');
  
  // Test 1: Verificar usuarios existentes
  const users = await testEndpoint('Users Table', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, nombre, email')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: data.length > 0, data: `${data.length} users found` };
  });

  // Test 2: Verificar estructura de auth
  const authUsers = await testEndpoint('Auth Users', async () => {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) return { success: false, error: error.message };
    return { success: users.length > 0, data: `${users.length} auth users` };
  });

  return { users, authUsers };
}

// =====================================================
// TESTS DE POSTS Y FEED
// =====================================================

async function testPostsAndFeed() {
  log('\n📝 TESTING POSTS AND FEED', 'bold');
  
  // Test 1: Obtener posts
  const posts = await testEndpoint('Posts Query', async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, contenido, user_id, created_at')
      .limit(10);
    
    if (error) return { success: false, error: error.message };
    return { success: data.length >= 0, data: `${data.length} posts found` };
  });

  // Test 2: Posts con usuarios
  const postsWithUsers = await testEndpoint('Posts with Users', async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, contenido, users(nombre, avatar_url)')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: data.length >= 0, data: `${data.length} posts with users` };
  });

  // Test 3: Función RPC get_personalized_feed
  const personalizedFeed = await testEndpoint('Personalized Feed RPC', async () => {
    const { data, error } = await supabase
      .rpc('get_personalized_feed', {
        p_user_id: '00000000-0000-0000-0000-000000000000', // UUID de prueba
        p_limit: 10
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: `RPC executed successfully` };
  });

  return { posts, postsWithUsers, personalizedFeed };
}

// =====================================================
// TESTS DE COMUNIDADES
// =====================================================

async function testCommunities() {
  log('\n👥 TESTING COMMUNITIES', 'bold');
  
  // Test 1: Obtener comunidades
  const communities = await testEndpoint('Communities Query', async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('id, nombre, descripcion')
      .limit(10);
    
    if (error) return { success: false, error: error.message };
    return { success: data.length >= 0, data: `${data.length} communities found` };
  });

  // Test 2: User communities con parámetros correctos
  const userCommunities = await testEndpoint('User Communities', async () => {
    const { data, error } = await supabase
      .from('user_communities')
      .select('role, status, joined_at, community:communities(id, nombre)')
      .eq('status', 'active')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: `${data.length} user communities` };
  });

  // Test 3: Función RPC get_community_stats
  const communityStats = await testEndpoint('Community Stats RPC', async () => {
    const { data, error } = await supabase
      .rpc('get_community_stats', {
        p_community_id: '00000000-0000-0000-0000-000000000000'
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: 'RPC executed' };
  });

  return { communities, userCommunities, communityStats };
}

// =====================================================
// TESTS DE MENSAJERÍA
// =====================================================

async function testMessaging() {
  log('\n💬 TESTING MESSAGING', 'bold');
  
  // Test 1: Tabla de conversaciones
  const conversations = await testEndpoint('Conversations Table', async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, type, last_message')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: `${data.length} conversations` };
  });

  // Test 2: Mensajes con estructura corregida
  const messages = await testEndpoint('Messages with Conversation ID', async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, content, conversation_id, sender_id')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: `${data.length} messages` };
  });

  // Test 3: RPC get_user_conversations
  const userConversations = await testEndpoint('User Conversations RPC', async () => {
    const { data, error } = await supabase
      .rpc('get_user_conversations', {
        p_user_id: '00000000-0000-0000-0000-000000000000'
      });
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: 'RPC executed' };
  });

  return { conversations, messages, userConversations };
}

// =====================================================
// TESTS DE EDUCACIÓN
// =====================================================

async function testEducation() {
  log('\n📚 TESTING EDUCATION', 'bold');
  
  // Test 1: Cursos con columnas corregidas
  const courses = await testEndpoint('Courses with Category', async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('id, titulo, descripcion, category, duracion_total')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: `${data.length} courses` };
  });

  // Test 2: Lecciones con duración
  const lessons = await testEndpoint('Lessons with Duration', async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select('id, titulo, descripcion, duration, tipo')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: `${data.length} lessons` };
  });

  // Test 3: Progreso de usuario
  const progress = await testEndpoint('User Course Progress', async () => {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: `${data.length} progress records` };
  });

  return { courses, lessons, progress };
}

// =====================================================
// TESTS DE FINANZAS
// =====================================================

async function testFinances() {
  log('\n💰 TESTING FINANCES', 'bold');
  
  // Test 1: Datos de mercado
  const marketData = await testEndpoint('Market Data', async () => {
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: data.length >= 0, data: `${data.length} market records` };
  });

  // Test 2: Presupuestos de usuario
  const budgets = await testEndpoint('User Budgets', async () => {
    const { data, error } = await supabase
      .from('user_budgets')
      .select('*')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: `${data.length} budgets` };
  });

  // Test 3: Transacciones de usuario
  const transactions = await testEndpoint('User Transactions', async () => {
    const { data, error } = await supabase
      .from('user_transactions')
      .select('*')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: `${data.length} transactions` };
  });

  return { marketData, budgets, transactions };
}

// =====================================================
// TESTS DE PROMOCIONES
// =====================================================

async function testPromotions() {
  log('\n🎁 TESTING PROMOTIONS', 'bold');
  
  // Test 1: Promociones activas
  const promotions = await testEndpoint('Active Promotions', async () => {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: data.length >= 0, data: `${data.length} active promotions` };
  });

  // Test 2: Vistas de promociones
  const promotionViews = await testEndpoint('Promotion Views', async () => {
    const { data, error } = await supabase
      .from('promotion_views')
      .select('*')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: `${data.length} promotion views` };
  });

  // Test 3: Reclamos de promociones
  const promotionClaims = await testEndpoint('Promotion Claims', async () => {
    const { data, error } = await supabase
      .from('promotion_claims')
      .select('*')
      .limit(5);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: `${data.length} promotion claims` };
  });

  return { promotions, promotionViews, promotionClaims };
}

// =====================================================
// TESTS DE FUNCIONES RPC
// =====================================================

async function testRPCFunctions() {
  log('\n⚙️  TESTING RPC FUNCTIONS', 'bold');
  
  const rpcTests = [
    'get_user_quick_stats',
    'get_suggested_people',
    'get_recommended_communities',
    'search_all',
    'mark_messages_as_read'
  ];

  const results = {};
  
  for (const rpcName of rpcTests) {
    results[rpcName] = await testEndpoint(`RPC: ${rpcName}`, async () => {
      const { data, error } = await supabase
        .rpc(rpcName, {
          p_user_id: '00000000-0000-0000-0000-000000000000'
        });
      
      if (error) return { success: false, error: error.message };
      return { success: true, data: 'RPC function exists and executes' };
    });
  }

  return results;
}

// =====================================================
// FUNCIÓN PRINCIPAL DE TESTING
// =====================================================

async function runAllTests() {
  log('🚀 INICIANDO TESTS COMPLETOS DE ENDPOINTS - INVESTI APP', 'bold');
  log('=' .repeat(60), 'blue');
  
  const startTime = Date.now();
  const results = {};
  
  try {
    // Ejecutar todos los tests
    results.database = await testDatabaseStructure();
    results.auth = await testAuthentication();
    results.posts = await testPostsAndFeed();
    results.communities = await testCommunities();
    results.messaging = await testMessaging();
    results.education = await testEducation();
    results.finances = await testFinances();
    results.promotions = await testPromotions();
    results.rpc = await testRPCFunctions();
    
    // Calcular estadísticas
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    log('\n' + '=' .repeat(60), 'blue');
    log('📊 RESUMEN DE RESULTADOS', 'bold');
    log('=' .repeat(60), 'blue');
    
    let totalTests = 0;
    let passedTests = 0;
    
    Object.entries(results).forEach(([category, categoryResults]) => {
      log(`\n📂 ${category.toUpperCase()}:`, 'yellow');
      Object.entries(categoryResults).forEach(([test, passed]) => {
        totalTests++;
        if (passed) passedTests++;
        log(`  ${passed ? '✅' : '❌'} ${test}`, passed ? 'green' : 'red');
      });
    });
    
    log(`\n🎯 ESTADÍSTICAS FINALES:`, 'bold');
    log(`   ✅ Tests Pasados: ${passedTests}/${totalTests}`, 'green');
    log(`   ❌ Tests Fallidos: ${totalTests - passedTests}/${totalTests}`, 'red');
    log(`   📊 Porcentaje de Éxito: ${Math.round((passedTests/totalTests) * 100)}%`, 'blue');
    log(`   ⏱️  Tiempo Total: ${duration.toFixed(2)}s`, 'blue');
    
    if (passedTests === totalTests) {
      log('\n🎉 ¡TODOS LOS TESTS PASARON! El backend está funcionando correctamente.', 'green');
    } else if (passedTests / totalTests >= 0.8) {
      log('\n⚠️  La mayoría de tests pasaron. Revisar los fallos menores.', 'yellow');
    } else {
      log('\n🚨 MÚLTIPLES FALLOS DETECTADOS. Revisar la configuración del backend.', 'red');
    }
    
  } catch (error) {
    log(`\n💥 ERROR CRÍTICO EN LOS TESTS: ${error.message}`, 'red');
  }
  
  log('\n🏁 Tests completados.', 'blue');
}

// Ejecutar tests si se llama directamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testDatabaseStructure,
  testAuthentication,
  testPostsAndFeed,
  testCommunities,
  testMessaging,
  testEducation,
  testFinances,
  testPromotions,
  testRPCFunctions
};
