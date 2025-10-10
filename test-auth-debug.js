// ============================================================================
// Script de Debug - Verificar Estado de Autenticación
// ============================================================================
// Ejecutar en la consola del navegador para verificar el estado de auth
// ============================================================================

async function debugAuth() {
  console.log('🔍 ===== DEBUG AUTENTICACIÓN =====')
  
  // 1. Verificar AsyncStorage
  console.log('\n📦 AsyncStorage:')
  const keys = [
    'userToken',
    'userId', 
    'access_token',
    'refresh_token',
    '@auth_token',
    'user_language'
  ]
  
  for (const key of keys) {
    try {
      const value = await AsyncStorage.getItem(key)
      console.log(`  ${key}:`, value ? '✅ EXISTS' : '❌ NULL')
    } catch (error) {
      console.log(`  ${key}:`, '⚠️ ERROR', error.message)
    }
  }
  
  // 2. Verificar Supabase Session
  console.log('\n🔐 Supabase Session:')
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.log('  ❌ Error:', error.message)
    } else if (data?.session) {
      console.log('  ✅ Session exists')
      console.log('  User ID:', data.session.user.id)
      console.log('  Email:', data.session.user.email)
      console.log('  Expires:', new Date(data.session.expires_at * 1000).toLocaleString())
    } else {
      console.log('  ❌ No session')
    }
  } catch (error) {
    console.log('  ⚠️ Error:', error.message)
  }
  
  // 3. Verificar AuthContext
  console.log('\n🎯 AuthContext (desde React DevTools):')
  console.log('  Busca "AuthProvider" en React DevTools y verifica:')
  console.log('  - isAuthenticated')
  console.log('  - user')
  console.log('  - session')
  
  console.log('\n✅ ===== FIN DEBUG =====')
}

// Ejecutar
debugAuth()

// ============================================================================
// SOLUCIÓN RÁPIDA: Si no hay sesión, crear una manualmente
// ============================================================================
async function forceLogin(email, password) {
  console.log('🔧 Forzando login...')
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  })
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log('✅ Login exitoso')
  console.log('User ID:', data.user.id)
  
  // Guardar en AsyncStorage
  await AsyncStorage.setItem('userToken', data.session.access_token)
  await AsyncStorage.setItem('userId', data.user.id)
  await AsyncStorage.setItem('@auth_token', data.session.access_token)
  
  console.log('✅ Tokens guardados en AsyncStorage')
  console.log('🔄 Recarga la página para aplicar cambios')
}

// Ejemplo de uso:
// forceLogin('tu-email@ejemplo.com', 'tu-contraseña')
