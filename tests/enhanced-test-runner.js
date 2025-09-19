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
    fullName: 'Test User Enhanced'
  }
};

// Cliente de Supabase
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Enhanced Test Runner para todas las funcionalidades
class EnhancedTestRunner {
  constructor() {
    this.results = [];
    this.testUser = null;
    this.testPostId = null;
    this.testCommunityId = null;
    this.testConversationId = null;
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

  // =====================================================
  // PRUEBAS DE CONEXIÓN Y AUTENTICACIÓN
  // =====================================================

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
        full_name: config.testUser.fullName,
        username: config.testUser.username,
        fecha_registro: new Date().toISOString(),
        onboarding_completed: true,
        intereses: ['tecnologia', 'startups', 'inversiones'],
        objetivos_inversion: ['crecimiento', 'diversificacion'],
        nivel_conocimiento: 'intermedio'
      });

    if (error) throw new Error(`Error creando perfil: ${error.message}`);
    return true;
  }

  // =====================================================
  // PRUEBAS DE POSTS Y CONTENIDO
  // =====================================================

  async testCreatePost() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const postContent = `Post de prueba automatizada - ${new Date().toISOString()}`;
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: this.testUser.id,
        contenido: postContent,
        post_type: 'text',
        visibility: 'public',
        tags: ['test', 'automation']
      })
      .select()
      .single();

    if (error) throw new Error(`Error creando post: ${error.message}`);
    if (!data) throw new Error('No se creó el post');
    
    this.testPostId = data.id;
    return true;
  }

  async testCreateEnhancedPost() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: this.testUser.id,
        contenido: 'Post con celebración de prueba',
        post_type: 'celebration',
        celebration_type: 'milestone',
        visibility: 'public',
        tags: ['celebration', 'test']
      })
      .select()
      .single();

    if (error) throw new Error(`Error creando post mejorado: ${error.message}`);
    return true;
  }

  async testCreatePoll() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    // Crear post tipo poll
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: this.testUser.id,
        contenido: '¿Cuál es tu estrategia de inversión favorita?',
        post_type: 'poll',
        visibility: 'public'
      })
      .select()
      .single();

    if (postError) throw new Error(`Error creando post de poll: ${postError.message}`);

    // Crear poll
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        post_id: postData.id,
        question: '¿Cuál es tu estrategia de inversión favorita?',
        options: ['Acciones', 'Bonos', 'Criptomonedas', 'Bienes raíces'],
        duration_hours: 24,
        created_by: this.testUser.id
      })
      .select()
      .single();

    if (pollError) throw new Error(`Error creando poll: ${pollError.message}`);
    return true;
  }

  async testLikePost() {
    if (!this.testUser || !this.testPostId) throw new Error('No hay post de prueba disponible');

    const { data, error } = await supabase
      .from('post_likes')
      .upsert({
        post_id: this.testPostId,
        user_id: this.testUser.id,
        is_like: true
      });

    if (error) throw new Error(`Error dando like: ${error.message}`);
    return true;
  }

  async testCommentPost() {
    if (!this.testUser || !this.testPostId) throw new Error('No hay post de prueba disponible');

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: this.testPostId,
        user_id: this.testUser.id,
        contenido: 'Comentario de prueba automatizada'
      });

    if (error) throw new Error(`Error comentando: ${error.message}`);
    return true;
  }

  async testSavePost() {
    if (!this.testUser || !this.testPostId) throw new Error('No hay post de prueba disponible');

    const { data, error } = await supabase
      .from('post_saves')
      .upsert({
        post_id: this.testPostId,
        user_id: this.testUser.id
      });

    if (error) throw new Error(`Error guardando post: ${error.message}`);
    return true;
  }

  // =====================================================
  // PRUEBAS DE COMUNIDADES
  // =====================================================

  async testCreateCommunity() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const { data, error } = await supabase
      .from('communities')
      .insert({
        nombre: `Comunidad Test ${Date.now()}`,
        description: 'Comunidad de prueba automatizada',
        type: 'public',
        category: 'tecnologia',
        created_by: this.testUser.id
      })
      .select()
      .single();

    if (error) throw new Error(`Error creando comunidad: ${error.message}`);
    
    this.testCommunityId = data.id;
    return true;
  }

  async testJoinCommunity() {
    if (!this.testUser || !this.testCommunityId) throw new Error('No hay comunidad de prueba disponible');

    const { data, error } = await supabase
      .from('user_communities')
      .insert({
        user_id: this.testUser.id,
        community_id: this.testCommunityId,
        role: 'member',
        status: 'active'
      });

    if (error) throw new Error(`Error uniéndose a comunidad: ${error.message}`);
    return true;
  }

  // =====================================================
  // PRUEBAS DE CHAT Y MENSAJERÍA
  // =====================================================

  async testCreateConversation() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        type: 'direct',
        name: 'Conversación de prueba',
        created_by: this.testUser.id
      })
      .select()
      .single();

    if (error) throw new Error(`Error creando conversación: ${error.message}`);
    
    this.testConversationId = data.id;

    // Agregar participante
    await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: data.id,
        user_id: this.testUser.id,
        is_active: true
      });

    return true;
  }

  async testSendMessage() {
    if (!this.testUser || !this.testConversationId) throw new Error('No hay conversación de prueba disponible');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: this.testConversationId,
        user_id: this.testUser.id,
        content: 'Mensaje de prueba automatizada',
        message_type: 'text'
      });

    if (error) throw new Error(`Error enviando mensaje: ${error.message}`);
    return true;
  }

  // =====================================================
  // PRUEBAS DE NOTIFICACIONES
  // =====================================================

  async testCreateNotification() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: this.testUser.id,
        type: 'test',
        title: 'Notificación de prueba',
        message: 'Esta es una notificación de prueba automatizada',
        is_read: false
      });

    if (error) throw new Error(`Error creando notificación: ${error.message}`);
    return true;
  }

  // =====================================================
  // PRUEBAS DE RPC FUNCTIONS
  // =====================================================

  async testPersonalizedFeed() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const { data, error } = await supabase.rpc('get_personalized_feed', {
      p_user_id: this.testUser.id,
      p_limit: 10
    });

    if (error) throw new Error(`Error obteniendo feed personalizado: ${error.message}`);
    if (!Array.isArray(data)) throw new Error('El feed personalizado no es un array');
    return true;
  }

  async testGlobalSearch() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const { data, error } = await supabase.rpc('search_all', {
      search_term: 'test',
      current_user_id: this.testUser.id
    });

    if (error) throw new Error(`Error en búsqueda global: ${error.message}`);
    if (!Array.isArray(data)) throw new Error('Los resultados de búsqueda no son un array');
    return true;
  }

  async testUserStats() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const { data, error } = await supabase.rpc('get_user_quick_stats', {
      p_user_id: this.testUser.id
    });

    if (error) throw new Error(`Error obteniendo estadísticas de usuario: ${error.message}`);
    return true;
  }

  async testSuggestedPeople() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const { data, error } = await supabase.rpc('get_suggested_people', {
      p_user_id: this.testUser.id,
      p_limit: 5
    });

    if (error) throw new Error(`Error obteniendo personas sugeridas: ${error.message}`);
    return true;
  }

  // =====================================================
  // PRUEBAS DE DATOS EXISTENTES
  // =====================================================

  async testGetFeed() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users(id, nombre, username, avatar_url)
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

  async testGetPromotions() {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .limit(10);

    if (error) throw new Error(`Error obteniendo promociones: ${error.message}`);
    return true;
  }

  async testGetNotifications() {
    if (!this.testUser) throw new Error('No hay usuario de prueba disponible');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', this.testUser.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw new Error(`Error obteniendo notificaciones: ${error.message}`);
    return true;
  }

  // =====================================================
  // LIMPIEZA Y UTILIDADES
  // =====================================================

  async cleanup() {
    if (this.testUser) {
      try {
        // Eliminar en orden para evitar violaciones de foreign key
        await supabase.from('messages').delete().eq('user_id', this.testUser.id);
        await supabase.from('conversation_participants').delete().eq('user_id', this.testUser.id);
        await supabase.from('conversations').delete().eq('created_by', this.testUser.id);
        await supabase.from('notifications').delete().eq('user_id', this.testUser.id);
        await supabase.from('post_saves').delete().eq('user_id', this.testUser.id);
        await supabase.from('post_comments').delete().eq('user_id', this.testUser.id);
        await supabase.from('post_likes').delete().eq('user_id', this.testUser.id);
        await supabase.from('user_communities').delete().eq('user_id', this.testUser.id);
        await supabase.from('communities').delete().eq('created_by', this.testUser.id);
        await supabase.from('polls').delete().eq('created_by', this.testUser.id);
        await supabase.from('posts').delete().eq('user_id', this.testUser.id);
        await supabase.from('users').delete().eq('id', this.testUser.id);

        await this.log('Limpieza de datos completada', 'info');
      } catch (error) {
        await this.log(`Error en limpieza: ${error.message}`, 'warning');
      }
    }
  }

  async runAllTests() {
    await this.log('🚀 Iniciando suite de pruebas COMPLETA de Investi App', 'info');
    
    const tests = [
      // Conexión y autenticación
      ['Conexión a Supabase', () => this.testSupabaseConnection()],
      ['Registro de usuario', () => this.testUserRegistration()],
      ['Creación de perfil completo', () => this.testUserProfile()],
      
      // Posts y contenido
      ['Creación de post básico', () => this.testCreatePost()],
      ['Creación de post mejorado', () => this.testCreateEnhancedPost()],
      ['Creación de poll', () => this.testCreatePoll()],
      ['Like en post', () => this.testLikePost()],
      ['Comentario en post', () => this.testCommentPost()],
      ['Guardar post', () => this.testSavePost()],
      
      // Comunidades
      ['Creación de comunidad', () => this.testCreateCommunity()],
      ['Unirse a comunidad', () => this.testJoinCommunity()],
      
      // Chat y mensajería
      ['Crear conversación', () => this.testCreateConversation()],
      ['Enviar mensaje', () => this.testSendMessage()],
      
      // Notificaciones
      ['Crear notificación', () => this.testCreateNotification()],
      
      // RPC Functions
      ['Feed personalizado (RPC)', () => this.testPersonalizedFeed()],
      ['Búsqueda global (RPC)', () => this.testGlobalSearch()],
      ['Estadísticas de usuario (RPC)', () => this.testUserStats()],
      ['Personas sugeridas (RPC)', () => this.testSuggestedPeople()],
      
      // Datos existentes
      ['Obtener feed general', () => this.testGetFeed()],
      ['Obtener comunidades', () => this.testGetCommunities()],
      ['Obtener promociones', () => this.testGetPromotions()],
      ['Obtener notificaciones', () => this.testGetNotifications()],
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

    await this.log('📊 RESUMEN COMPLETO DE PRUEBAS:', 'info');
    await this.log(`✅ Pruebas exitosas: ${passed}`, 'success');
    await this.log(`❌ Pruebas fallidas: ${failed}`, failed > 0 ? 'error' : 'info');
    await this.log(`📈 Porcentaje de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`, 'info');
    
    if (failed === 0) {
      await this.log('🎉 ¡TODAS LAS PRUEBAS PASARON! Backend 100% funcional', 'success');
    } else {
      await this.log('⚠️  Algunas pruebas fallaron. Revisar logs para detalles.', 'warning');
    }

    return { passed, failed, total: passed + failed };
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  const runner = new EnhancedTestRunner();
  runner.runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Error fatal en las pruebas:', error);
      process.exit(1);
    });
}

module.exports = EnhancedTestRunner;
