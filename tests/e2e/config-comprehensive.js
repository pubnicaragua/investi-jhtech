module.exports = {
  // Configuración del navegador
  headless: false, // Mostrar navegador para debugging visual
  slowMo: 300, // Ralentizar acciones para mejor observación
  
  // Configuración de viewport
  viewport: {
    width: 1280,
    height: 720
  },
  
  // URLs base
  baseUrl: 'http://localhost:19006', // Expo web dev server
  
  // Rutas de la aplicación
  routes: {
    home: '/',
    languageSelection: '/language-selection',
    welcome: '/welcome',
    signin: '/signin',
    signup: '/signup',
    pickGoals: '/pick-goals',
    pickInterests: '/pick-interests',
    pickKnowledge: '/pick-knowledge',
    homeFeed: '/home',
    communities: '/communities',
    profile: '/profile',
    settings: '/settings',
    marketInfo: '/market-info',
    educacion: '/educacion',
    promotions: '/promotions',
    inversiones: '/inversiones'
  },
  
  // Configuración de timeouts
  timeouts: {
    navigation: 10000,
    element: 5000,
    api: 8000,
    image: 3000
  },
  
  // Errores que NO deben aparecer (lista de errores prohibidos)
  forbiddenErrors: [
    'Module not found: Can\'t resolve \'crypto\'',
    'useNativeDriver is not supported',
    'The action \'RESET\' with payload',
    'The action \'NAVIGATE\' with payload.*undefined',
    'ProfileScreen',
    'via.placeholder.com',
    'user_communities.*400',
    'Cannot read property.*of undefined',
    'TypeError: Cannot read properties of undefined',
    'ReferenceError:.*is not defined',
    'SyntaxError:',
    'Uncaught Error:',
    'Failed to fetch'
  ],
  
  // APIs críticas que deben funcionar
  criticalAPIs: [
    '/rest/v1/users',
    '/rest/v1/posts',
    '/rest/v1/communities',
    '/rest/v1/user_communities',
    '/auth/v1/token'
  ],
  
  // Pantallas que deben tener botón back
  screensWithBackButton: [
    '/signin',
    '/signup',
    '/pick-goals',
    '/pick-interests',
    '/pick-knowledge',
    '/settings',
    '/profile',
    '/educacion',
    '/promotions',
    '/market-info'
  ],
  
  // Elementos de UI que deben estar presentes
  requiredUIElements: {
    '/language-selection': ['Choose your language', 'Español', 'English'],
    '/welcome': ['Investí Community', 'Get Started'],
    '/signin': ['Sign In', 'Email', 'Password'],
    '/signup': ['Sign Up', 'Create Account'],
    '/home': ['For You', 'Following'],
    '/communities': ['Communities', 'Explore'],
    '/settings': ['Settings', 'Account'],
    '/profile': ['Profile', 'Posts']
  },
  
  // Configuración de usuario de prueba
  testUser: {
    email: 'test.comprehensive@investi.com',
    password: 'TestPassword123!',
    fullName: 'Test Comprehensive User',
    username: 'testcomprehensive'
  },
  
  // Configuración de reportes
  reporting: {
    generateHTML: true,
    generateJSON: true,
    saveScreenshots: true,
    saveVideos: false,
    detailedLogs: true
  },
  
  // Configuración de Supabase (si es necesario)
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
  }
};
