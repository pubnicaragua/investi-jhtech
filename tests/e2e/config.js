// Configuración para las pruebas E2E
module.exports = {
  baseUrl: process.env.APP_URL || 'http://localhost:19006',
  testUser: {
    email: `testuser_${Date.now()}@example.com`,
    password: 'Test1234!',
    username: `testuser_${Date.now().toString(36).substr(2, 8)}`,
    fullName: 'Test User',
  },
  headless: process.env.HEADLESS !== 'false',
  slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
  timeout: 30000, // 30 segundos
  viewport: {
    width: 1280,
    height: 800,
  },
  // Configuración de Supabase
  supabase: {
    url: 'https://paoliakwfoczcallnecf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o',
  },
  // Rutas de la aplicación
  routes: {
    home: '/',
    login: '/signin',
    register: '/signup',
    profile: '/profile',
    settings: '/settings',
    communities: '/communities',
    createPost: '/create-post',
    marketInfo: '/market-info',
    education: '/educacion',
    investments: '/inversiones',
    investor: '/inversionista',
    chat: '/chats',
    news: '/news',
  },
};
