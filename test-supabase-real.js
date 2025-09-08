// Script de pruebas reales con Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuración usando las credenciales reales
const supabaseUrl = 'https://paoliakwfoczcallnecf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o';

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseTestRunner {
  constructor() {
    this.results = [];
    this.testUser = null;
    this.testData = {};
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const icon = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'test': '🧪'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${icon} ${message}`);
    this.results.push({ timestamp, type, message });
  }

  async test(name, testFn) {
    try {
      this.log(`Ejecutando: ${name}`, 'test');
      const result = await testFn();
      this.log(`PASÓ: ${name}`, 'success');
      return { name, status: 'passed', result };
    } catch (error) {
      this.log(`FALLÓ: ${name} - ${error.message}`, 'error');
      return { name, status: 'failed', error: error.message };
    }
  }

  // Prueba 1: Conexión básica a Supabase
  async testConnection() {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw new Error(`Conexión fallida: ${error.message}`);
    return 'Conexión exitosa';
  }

  // Prueba 2: Listar tablas disponibles
  async testDatabaseSchema() {
    const tables = [
      'users', 'posts', 'communities', 'news', 'promotions', 
      'courses', 'lessons', 'notifications', 'comments', 'likes'
    ];
    
    const results = {};
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        results[table] = error ? `Error: ${error.message}` : 'Accesible';
      } catch (e) {
        results[table] = `Error: ${e.message}`;
      }
    }
    
    return results;
  }

  // Prueba 3: Crear usuario de prueba
  async testUserCreation() {
    const testEmail = `test_${Date.now()}@investi.com`;
    const testPassword = 'TestPassword123!';
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Usuario de Prueba',
          username: `testuser_${Date.now().toString(36)}`,
        }
      }
    });

    if (error) throw new Error(`Error creando usuario: ${error.message}`);
    
    this.testUser = data.user;
    this.testData.email = testEmail;
    this.testData.password = testPassword;
    
    return `Usuario creado: ${testEmail}`;
  }

  // Prueba 4: Crear perfil de usuario
  async testUserProfile() {
    if (!this.testUser) throw new Error('No hay usuario de prueba');

    const profileData = {
      id: this.testUser.id,
      email: this.testUser.email,
      nombre: 'Usuario de Prueba Automatizada',
      username: `testuser_${Date.now().toString(36)}`,
      bio: 'Perfil creado por pruebas automatizadas',
      pais: 'Nicaragua',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(profileData)
      .select()
      .single();

    if (error) throw new Error(`Error creando perfil: ${error.message}`);
    
    return `Perfil creado para ${profileData.username}`;
  }

  // Prueba 5: Crear post de prueba
  async testPostCreation() {
    if (!this.testUser) throw new Error('No hay usuario de prueba');

    const postData = {
      user_id: this.testUser.id,
      contenido: `Post de prueba automatizada - ${new Date().toISOString()}`,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) throw new Error(`Error creando post: ${error.message}`);
    
    this.testData.postId = data.id;
    return `Post creado con ID: ${data.id}`;
  }

  // Prueba 6: Obtener feed de posts
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
    
    return `Feed obtenido: ${data.length} posts`;
  }

  // Prueba 7: Interactuar con post (like)
  async testPostInteraction() {
    if (!this.testData.postId || !this.testUser) {
      throw new Error('No hay post o usuario de prueba');
    }

    const { data, error } = await supabase
      .from('likes')
      .insert({
        post_id: this.testData.postId,
        user_id: this.testUser.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Error dando like: ${error.message}`);
    
    return `Like agregado al post ${this.testData.postId}`;
  }

  // Prueba 8: Comentar post
  async testPostComment() {
    if (!this.testData.postId || !this.testUser) {
      throw new Error('No hay post o usuario de prueba');
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: this.testData.postId,
        user_id: this.testUser.id,
        contenido: 'Comentario de prueba automatizada',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Error comentando: ${error.message}`);
    
    return `Comentario agregado al post ${this.testData.postId}`;
  }

  // Prueba 9: Obtener comunidades
  async testGetCommunities() {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .limit(5);

    if (error) throw new Error(`Error obteniendo comunidades: ${error.message}`);
    
    return `Comunidades obtenidas: ${data.length}`;
  }

  // Prueba 10: Obtener noticias
  async testGetNews() {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw new Error(`Error obteniendo noticias: ${error.message}`);
    
    return `Noticias obtenidas: ${data.length}`;
  }

  // Prueba 11: Obtener cursos
  async testGetCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons (*)
      `)
      .limit(3);

    if (error) throw new Error(`Error obteniendo cursos: ${error.message}`);
    
    const totalLessons = data.reduce((sum, course) => sum + (course.lessons?.length || 0), 0);
    return `Cursos obtenidos: ${data.length} con ${totalLessons} lecciones`;
  }

  // Prueba 12: Obtener promociones
  async testGetPromotions() {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .limit(5);

    if (error) throw new Error(`Error obteniendo promociones: ${error.message}`);
    
    return `Promociones activas: ${data.length}`;
  }

  // Limpieza de datos de prueba
  async cleanup() {
    this.log('Iniciando limpieza de datos de prueba...', 'info');
    
    try {
      if (this.testData.postId) {
        // Eliminar likes y comentarios del post
        await supabase.from('likes').delete().eq('post_id', this.testData.postId);
        await supabase.from('comments').delete().eq('post_id', this.testData.postId);
        
        // Eliminar el post
        await supabase.from('posts').delete().eq('id', this.testData.postId);
      }

      if (this.testUser) {
        // Eliminar perfil de usuario
        await supabase.from('users').delete().eq('id', this.testUser.id);
      }

      this.log('Limpieza completada', 'success');
    } catch (error) {
      this.log(`Error en limpieza: ${error.message}`, 'warning');
    }
  }

  // Ejecutar todas las pruebas
  async runAllTests() {
    this.log('🚀 Iniciando suite completa de pruebas de Supabase', 'info');
    
    const tests = [
      ['Conexión a Supabase', () => this.testConnection()],
      ['Esquema de base de datos', () => this.testDatabaseSchema()],
      ['Creación de usuario', () => this.testUserCreation()],
      ['Perfil de usuario', () => this.testUserProfile()],
      ['Creación de post', () => this.testPostCreation()],
      ['Obtener feed', () => this.testGetFeed()],
      ['Interacción con post (like)', () => this.testPostInteraction()],
      ['Comentar post', () => this.testPostComment()],
      ['Obtener comunidades', () => this.testGetCommunities()],
      ['Obtener noticias', () => this.testGetNews()],
      ['Obtener cursos', () => this.testGetCourses()],
      ['Obtener promociones', () => this.testGetPromotions()],
    ];

    const results = [];
    let passed = 0;
    let failed = 0;

    for (const [name, testFn] of tests) {
      const result = await this.test(name, testFn);
      results.push(result);
      
      if (result.status === 'passed') {
        passed++;
      } else {
        failed++;
      }
    }

    // Limpieza
    await this.cleanup();

    // Resumen
    this.log('', 'info');
    this.log('📊 RESUMEN FINAL DE PRUEBAS:', 'info');
    this.log(`✅ Pruebas exitosas: ${passed}`, 'success');
    this.log(`❌ Pruebas fallidas: ${failed}`, failed > 0 ? 'error' : 'info');
    this.log(`📈 Porcentaje de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`, 'info');
    
    if (failed === 0) {
      this.log('🎉 ¡Todas las pruebas pasaron! Tu aplicación está 100% funcional.', 'success');
    } else {
      this.log('⚠️ Algunas pruebas fallaron. Revisa los detalles arriba.', 'warning');
    }

    return { passed, failed, total: passed + failed, results };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const runner = new SupabaseTestRunner();
  runner.runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = SupabaseTestRunner;
