const { createClient } = require('@supabase/supabase-js');

// Configuración
const config = {
  baseUrl: 'http://localhost:19006',
  supabase: {
    url: 'https://paoliakwfoczcallnecf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o'
  },
  testUser: {
    email: `testuser_${Date.now()}@example.com`,
    password: 'Test1234!',
    username: `testuser_${Date.now().toString(36).substr(2, 8)}`,
    fullName: 'Test User Automated'
  }
};

// Cliente de Supabase
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Utilidades de prueba
class TestRunner {
  constructor() {
    this.results = [];
    this.testUser = null;
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    this.results.push({ timestamp, type, message });
  }

  async test(name, testFn) {
    try {
      await this.log(`Iniciando prueba: ${name}`, 'test');
      await testFn();
      await this.log(`✅ PASÓ: ${name}`, 'success');
      return true;
    } catch (error) {
      await this.log(`❌ FALLÓ: ${name} - ${error.message}`, 'error');
      return false;
    }
  }

  async testSupabaseConnection() {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw new Error(`Error de conexión a Supabase: ${error.message}`);
    return true;
  }

  async testUserRegistration() {
    const { data, error } = await supabase.auth.signUp({
      email: config.testUser.email,
      password: config.testUser.password,
      options: {
        data: {
          full_name: config.testUser.fullName,
          username: config.testUser.username,
        }
      }
    });

    if (error) throw new Error(`Error en registro: ${error.message}`);
    if (!data.user) throw new Error('No se creó el usuario');
    
    this.testUser = data.user;
    return true;
  }

  async testUserProfile() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: this.testUser.id,
        email: this.testUser.email,
        nombre: config.testUser.fullName,
        username: config.testUser.username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw new Error(`Error creando perfil: ${error.message}`);
    return true;
  }

  async testCreatePost() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const postContent = `Post de prueba automatizada - ${new Date().toISOString()}`;
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: this.testUser.id,
        contenido: postContent,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Error creando post: ${error.message}`);
    if (!data) throw new Error('No se creó el post');
    
    this.testPostId = data.id;
    return true;
  }

  async testGetFeed() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users:user_id (
          id,
          nombre,
          username,
          photo_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw new Error(`Error obteniendo feed: ${error.message}`);
    if (!Array.isArray(data)) throw new Error('El feed no es un array');
    
    return true;
  }

  async testGetCommunities() {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .limit(10);

    if (error) throw new Error(`Error obteniendo comunidades: ${error.message}`);
    return true;
  }

  async testGetNews() {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw new Error(`Error obteniendo noticias: ${error.message}`);
    return true;
  }

  async testGetPromotions() {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .limit(10);

    if (error) throw new Error(`Error obteniendo promociones: ${error.message}`);
    return true;
  }

  async testGetCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons (*)
      `)
      .limit(5);

    if (error) throw new Error(`Error obteniendo cursos: ${error.message}`);
    return true;
  }

  async cleanup() {
    if (this.testUser) {
      try {
        // Eliminar posts de prueba
        await supabase
          .from('posts')
          .delete()
          .eq('user_id', this.testUser.id);

        // Eliminar perfil de usuario
        await supabase
          .from('users')
          .delete()
          .eq('id', this.testUser.id);

        await this.log('Limpieza de datos completada', 'info');
      } catch (error) {
        await this.log(`Error en limpieza: ${error.message}`, 'warning');
      }
    }
  }

  async runAllTests() {
    await this.log('🚀 Iniciando suite de pruebas automatizadas', 'info');
    
    const tests = [
      ['Conexión a Supabase', () => this.testSupabaseConnection()],
      ['Registro de usuario', () => this.testUserRegistration()],
      ['Creación de perfil', () => this.testUserProfile()],
      ['Creación de post', () => this.testCreatePost()],
      ['Obtener feed', () => this.testGetFeed()],
      ['Obtener comunidades', () => this.testGetCommunities()],
      ['Obtener noticias', () => this.testGetNews()],
      ['Obtener promociones', () => this.testGetPromotions()],
      ['Obtener cursos', () => this.testGetCourses()],
    ];

    let passed = 0;
    let failed = 0;

    for (const [name, testFn] of tests) {
      const result = await this.test(name, testFn);
      if (result) {
        passed++;
      } else {
        failed++;
      }
    }

    await this.cleanup();

    await this.log('📊 RESUMEN DE PRUEBAS:', 'info');
    await this.log(`✅ Pruebas exitosas: ${passed}`, 'success');
    await this.log(`❌ Pruebas fallidas: ${failed}`, failed > 0 ? 'error' : 'info');
    await this.log(`📈 Porcentaje de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`, 'info');

    return { passed, failed, total: passed + failed };
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Error fatal en las pruebas:', error);
      process.exit(1);
    });
}

module.exports = TestRunner;
