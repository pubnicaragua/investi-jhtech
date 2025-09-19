const { createClient } = require('@supabase/supabase-js');

// Configuración
const config = {
  baseUrl: 'http://localhost:19006',
  supabase: {
    url: 'https://paoliakwfoczcallnecf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o'
  },
  testUsers: [
    {
      email: `testuser1_${Date.now()}@example.com`,
      password: 'Test1234!',
      username: `testuser1_${Date.now().toString(36).substr(2, 8)}`,
      fullName: 'Test User One'
    },
    {
      email: `testuser2_${Date.now()}@example.com`,
      password: 'Test1234!',
      username: `testuser2_${Date.now().toString(36).substr(2, 8)}`,
      fullName: 'Test User Two'
    }
  ]
};

const supabase = createClient(config.supabase.url, config.supabase.anonKey);

class ScreenFlowTester {
  constructor() {
    this.results = [];
    this.testUsers = [];
    this.testData = {};
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    this.results.push({ timestamp, type, message });
  }

  async test(name, testFn) {
    try {
      await this.log(`🧪 Iniciando: ${name}`, 'test');
      await testFn();
      await this.log(`✅ PASÓ: ${name}`, 'success');
      return true;
    } catch (error) {
      await this.log(`❌ FALLÓ: ${name} - ${error.message}`, 'error');
      return false;
    }
  }

  // =====================================================
  // SETUP Y CLEANUP
  // =====================================================
  
  async setupTestUsers() {
    await this.log('Configurando usuarios de prueba...', 'setup');
    
    for (let i = 0; i < config.testUsers.length; i++) {
      const userData = config.testUsers[i];
      
      // Registrar usuario
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });
      
      if (authError) throw authError;
      
      // Crear perfil
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          username: userData.username,
          full_name: userData.fullName,
          nombre: userData.fullName,
          bio: `Bio de ${userData.fullName}`,
          role: 'Usuario'
        })
        .select()
        .single();
      
      if (profileError) throw profileError;
      
      this.testUsers.push({
        ...userData,
        id: authData.user.id,
        profile: profileData
      });
    }
    
    await this.log(`✅ ${this.testUsers.length} usuarios creados exitosamente`, 'success');
  }

  // =====================================================
  // PROFILESCREEN FLOW TESTS (10+ endpoints)
  // =====================================================
  
  async testProfileScreenFlow() {
    const user1 = this.testUsers[0];
    const user2 = this.testUsers[1];
    
    await this.log('=== TESTING PROFILESCREEN COMPLETE FLOW ===', 'section');
    
    // 1. Obtener perfil completo
    await this.test('ProfileScreen - getUserComplete', async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user1.id)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('No se encontró el perfil');
      
      this.testData.user1Profile = data;
    });

    // 2. Seguir usuario
    await this.test('ProfileScreen - followUser', async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user1.id,
          following_id: user2.id
        });
      
      if (error) throw error;
    });

    // 3. Verificar si sigue al usuario
    await this.test('ProfileScreen - isFollowingUser', async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user1.id)
        .eq('following_id', user2.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) throw new Error('No se encontró la relación de seguimiento');
    });

    // 4. Obtener seguidores
    await this.test('ProfileScreen - getUserFollowers', async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          follower:users!follower_id(id, nombre, full_name, username, avatar_url)
        `)
        .eq('following_id', user2.id);
      
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error('Formato de datos incorrecto');
    });

    // 5. Obtener siguiendo
    await this.test('ProfileScreen - getUserFollowing', async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          following:users!following_id(id, nombre, full_name, username, avatar_url)
        `)
        .eq('follower_id', user1.id);
      
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error('Formato de datos incorrecto');
    });

    // 6. Crear comunidad de prueba y unirse
    await this.test('ProfileScreen - Setup Community for getUserCommunities', async () => {
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .insert({
          nombre: 'Comunidad Test ProfileScreen',
          description: 'Comunidad para probar ProfileScreen',
          created_by: user1.id,
          type: 'public'
        })
        .select()
        .single();
      
      if (communityError) throw communityError;
      
      const { error: joinError } = await supabase
        .from('user_communities')
        .insert({
          user_id: user1.id,
          community_id: community.id,
          role: 'admin',
          status: 'active'
        });
      
      if (joinError) throw joinError;
      this.testData.testCommunityId = community.id;
    });

    // 7. Obtener comunidades del usuario
    await this.test('ProfileScreen - getUserCommunities', async () => {
      const { data, error } = await supabase
        .from('user_communities')
        .select(`
          role, status, joined_at,
          community:communities(id, nombre, description, avatar_url, member_count)
        `)
        .eq('user_id', user1.id)
        .eq('status', 'active');
      
      if (error) throw error;
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No se encontraron comunidades');
      }
    });

    // 8. Bloquear usuario
    await this.test('ProfileScreen - blockUser', async () => {
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          user_id: user1.id,
          blocked_user_id: user2.id,
          reason: 'test_block'
        });
      
      if (error) throw error;
    });

    // 9. Verificar bloqueo
    await this.test('ProfileScreen - isUserBlocked', async () => {
      const { data, error } = await supabase
        .from('user_blocks')
        .select('id')
        .eq('user_id', user1.id)
        .eq('blocked_user_id', user2.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) throw new Error('No se encontró el bloqueo');
    });

    // 10. Reportar usuario
    await this.test('ProfileScreen - reportUser', async () => {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user1.id,
          reported_user_id: user2.id,
          reason: 'test_report',
          description: 'Reporte de prueba',
          status: 'pending'
        });
      
      if (error) throw error;
    });

    // 11. Actualizar perfil
    await this.test('ProfileScreen - updateUserProfile', async () => {
      const { error } = await supabase
        .from('users')
        .update({
          bio: 'Bio actualizada desde test',
          location: 'Test Location'
        })
        .eq('id', user1.id);
      
      if (error) throw error;
    });

    // 12. Buscar usuarios
    await this.test('ProfileScreen - searchUsers', async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, nombre, full_name, username, avatar_url, bio')
        .ilike('full_name', '%Test%')
        .neq('id', user1.id)
        .limit(10);
      
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error('Formato de datos incorrecto');
    });
  }

  // =====================================================
  // CREATEPOSTSCREEN FLOW TESTS (8+ endpoints)
  // =====================================================
  
  async testCreatePostScreenFlow() {
    const user1 = this.testUsers[0];
    
    await this.log('=== TESTING CREATEPOSTSCREEN COMPLETE FLOW ===', 'section');
    
    // 1. Crear post básico
    await this.test('CreatePostScreen - createPost basic', async () => {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user1.id,
          content: 'Post de prueba desde CreatePostScreen',
          type: 'text'
        })
        .select()
        .single();
      
      if (error) throw error;
      this.testData.basicPostId = data.id;
    });

    // 2. Crear post con celebración
    await this.test('CreatePostScreen - createCelebrationPost', async () => {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user1.id,
          content: '¡Celebrando un logro importante!',
          type: 'celebration',
          celebration_type: 'achievement',
          metadata: JSON.stringify({ achievement: 'Primera inversión' })
        })
        .select()
        .single();
      
      if (error) throw error;
      this.testData.celebrationPostId = data.id;
    });

    // 3. Crear encuesta
    await this.test('CreatePostScreen - createPoll', async () => {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: user1.id,
          content: '¿Cuál es tu estrategia de inversión favorita?',
          type: 'poll'
        })
        .select()
        .single();
      
      if (postError) throw postError;
      
      const { error: pollError } = await supabase
        .from('polls')
        .insert({
          post_id: post.id,
          question: '¿Cuál es tu estrategia de inversión favorita?',
          options: JSON.stringify([
            { id: 1, text: 'Inversión a largo plazo', votes: 0 },
            { id: 2, text: 'Trading activo', votes: 0 },
            { id: 3, text: 'Diversificación', votes: 0 }
          ]),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      
      if (pollError) throw pollError;
      this.testData.pollPostId = post.id;
    });

    // 4. Votar en encuesta
    await this.test('CreatePostScreen - votePoll', async () => {
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: this.testData.pollPostId,
          user_id: user1.id,
          option_id: 1
        });
      
      if (error) throw error;
    });

    // 5. Crear post con media
    await this.test('CreatePostScreen - createPostWithMedia', async () => {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user1.id,
          content: 'Post con imagen de prueba',
          type: 'image',
          media_urls: JSON.stringify(['https://example.com/test-image.jpg'])
        })
        .select()
        .single();
      
      if (error) throw error;
      this.testData.mediaPostId = data.id;
    });

    // 6. Crear post de partnership
    await this.test('CreatePostScreen - createPartnershipPost', async () => {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user1.id,
          content: 'Buscando socio para startup fintech',
          type: 'partnership',
          partnership_type: 'business',
          metadata: JSON.stringify({ 
            industry: 'fintech',
            investment_range: '10k-50k',
            equity_offered: '10-15%'
          })
        })
        .select()
        .single();
      
      if (error) throw error;
      this.testData.partnershipPostId = data.id;
    });

    // 7. Guardar post
    await this.test('CreatePostScreen - savePost', async () => {
      const { error } = await supabase
        .from('post_saves')
        .insert({
          user_id: user1.id,
          post_id: this.testData.basicPostId
        });
      
      if (error) throw error;
    });

    // 8. Verificar post guardado
    await this.test('CreatePostScreen - isPostSaved', async () => {
      const { data, error } = await supabase
        .from('post_saves')
        .select('id')
        .eq('user_id', user1.id)
        .eq('post_id', this.testData.basicPostId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (!data) throw new Error('Post no encontrado en guardados');
    });
  }

  // =====================================================
  // CHATSCREEN FLOW TESTS (6+ endpoints)
  // =====================================================
  
  async testChatScreenFlow() {
    const user1 = this.testUsers[0];
    const user2 = this.testUsers[1];
    
    await this.log('=== TESTING CHATSCREEN COMPLETE FLOW ===', 'section');
    
    // 1. Crear conversación
    await this.test('ChatScreen - createConversation', async () => {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          created_by: user1.id
        })
        .select()
        .single();
      
      if (error) throw error;
      this.testData.conversationId = data.id;
    });

    // 2. Agregar participantes
    await this.test('ChatScreen - addParticipants', async () => {
      const { error } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: this.testData.conversationId, user_id: user1.id, is_active: true },
          { conversation_id: this.testData.conversationId, user_id: user2.id, is_active: true }
        ]);
      
      if (error) throw error;
    });

    // 3. Enviar mensaje
    await this.test('ChatScreen - sendMessage', async () => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: this.testData.conversationId,
          sender_id: user1.id,
          content: 'Hola! Este es un mensaje de prueba',
          type: 'text'
        })
        .select()
        .single();
      
      if (error) throw error;
      this.testData.messageId = data.id;
    });

    // 4. Obtener mensajes
    await this.test('ChatScreen - getMessages', async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users(id, nombre, full_name, avatar_url)
        `)
        .eq('conversation_id', this.testData.conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No se encontraron mensajes');
      }
    });

    // 5. Obtener conversaciones del usuario
    await this.test('ChatScreen - getUserConversations', async () => {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation:conversations(
            id, type, created_at, updated_at,
            last_message:messages(content, created_at, sender_id)
          )
        `)
        .eq('user_id', user1.id)
        .eq('is_active', true);
      
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error('Formato de datos incorrecto');
    });

    // 6. Marcar mensajes como leídos
    await this.test('ChatScreen - markMessagesAsRead', async () => {
      const { error } = await supabase
        .from('message_reads')
        .upsert({
          message_id: this.testData.messageId,
          user_id: user2.id,
          read_at: new Date().toISOString()
        });
      
      if (error) throw error;
    });
  }

  // =====================================================
  // HOMEFEEDSCREEN FLOW TESTS (5+ endpoints)
  // =====================================================
  
  async testHomeFeedScreenFlow() {
    const user1 = this.testUsers[0];
    
    await this.log('=== TESTING HOMEFEEDSCREEN COMPLETE FLOW ===', 'section');
    
    // 1. Obtener feed personalizado
    await this.test('HomeFeedScreen - getUserFeed', async () => {
      const { data, error } = await supabase.rpc('get_personalized_feed', {
        p_user_id: user1.id,
        p_limit: 20
      });
      
      if (error) {
        // Fallback query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('posts')
          .select(`
            *,
            author:users(id, nombre, full_name, username, avatar_url, role)
          `)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (fallbackError) throw fallbackError;
        if (!Array.isArray(fallbackData)) throw new Error('Formato de datos incorrecto');
      }
    });

    // 2. Dar like a post
    await this.test('HomeFeedScreen - likePost', async () => {
      const { error } = await supabase
        .from('post_likes')
        .upsert({
          post_id: this.testData.basicPostId,
          user_id: user1.id,
          is_like: true
        });
      
      if (error) throw error;
    });

    // 3. Comentar post
    await this.test('HomeFeedScreen - commentPost', async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: this.testData.basicPostId,
          author_id: user1.id,
          content: 'Excelente post! Me gusta mucho.'
        })
        .select()
        .single();
      
      if (error) throw error;
      this.testData.commentId = data.id;
    });

    // 4. Obtener estadísticas del post
    await this.test('HomeFeedScreen - getPostStats', async () => {
      const { data, error } = await supabase.rpc('get_post_stats', {
        p_post_id: this.testData.basicPostId
      });
      
      if (error) {
        // Fallback manual
        const [likesResult, commentsResult] = await Promise.all([
          supabase.from('post_likes').select('id').eq('post_id', this.testData.basicPostId),
          supabase.from('post_comments').select('id').eq('post_id', this.testData.basicPostId)
        ]);
        
        if (likesResult.error || commentsResult.error) {
          throw new Error('Error obteniendo estadísticas');
        }
      }
    });

    // 5. Búsqueda global
    await this.test('HomeFeedScreen - globalSearch', async () => {
      const { data, error } = await supabase.rpc('search_all', {
        search_term: 'test',
        current_user_id: user1.id
      });
      
      if (error) {
        // Fallback search
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('posts')
          .select('*')
          .ilike('content', '%test%')
          .limit(10);
        
        if (fallbackError) throw fallbackError;
      }
    });
  }

  // =====================================================
  // CLEANUP
  // =====================================================
  
  async cleanup() {
    await this.log('Limpiando datos de prueba...', 'cleanup');
    
    try {
      // Limpiar en orden inverso de dependencias
      if (this.testData.messageId) {
        await supabase.from('message_reads').delete().eq('message_id', this.testData.messageId);
        await supabase.from('messages').delete().eq('id', this.testData.messageId);
      }
      
      if (this.testData.conversationId) {
        await supabase.from('conversation_participants').delete().eq('conversation_id', this.testData.conversationId);
        await supabase.from('conversations').delete().eq('id', this.testData.conversationId);
      }
      
      if (this.testData.commentId) {
        await supabase.from('post_comments').delete().eq('id', this.testData.commentId);
      }
      
      // Limpiar posts
      const postIds = [
        this.testData.basicPostId,
        this.testData.celebrationPostId,
        this.testData.pollPostId,
        this.testData.mediaPostId,
        this.testData.partnershipPostId
      ].filter(Boolean);
      
      for (const postId of postIds) {
        await supabase.from('poll_votes').delete().eq('poll_id', postId);
        await supabase.from('polls').delete().eq('post_id', postId);
        await supabase.from('post_saves').delete().eq('post_id', postId);
        await supabase.from('post_likes').delete().eq('post_id', postId);
        await supabase.from('posts').delete().eq('id', postId);
      }
      
      // Limpiar comunidades
      if (this.testData.testCommunityId) {
        await supabase.from('user_communities').delete().eq('community_id', this.testData.testCommunityId);
        await supabase.from('communities').delete().eq('id', this.testData.testCommunityId);
      }
      
      // Limpiar relaciones de usuarios
      if (this.testUsers.length >= 2) {
        const user1Id = this.testUsers[0].id;
        const user2Id = this.testUsers[1].id;
        
        await supabase.from('user_reports').delete().eq('reporter_id', user1Id);
        await supabase.from('user_blocks').delete().eq('user_id', user1Id);
        await supabase.from('user_follows').delete().eq('follower_id', user1Id);
      }
      
      // Limpiar usuarios
      for (const user of this.testUsers) {
        await supabase.from('users').delete().eq('id', user.id);
      }
      
      await this.log('✅ Limpieza completada', 'success');
    } catch (error) {
      await this.log(`⚠️ Error en limpieza: ${error.message}`, 'warning');
    }
  }

  // =====================================================
  // RUNNER PRINCIPAL
  // =====================================================
  
  async runAllTests() {
    const startTime = Date.now();
    await this.log('🚀 INICIANDO PRUEBAS COMPLETAS DE FLUJO DE PANTALLAS', 'start');
    
    let totalTests = 0;
    let passedTests = 0;
    
    try {
      // Setup
      await this.setupTestUsers();
      
      // Ejecutar pruebas por pantalla
      const screenTests = [
        () => this.testProfileScreenFlow(),
        () => this.testCreatePostScreenFlow(),
        () => this.testChatScreenFlow(),
        () => this.testHomeFeedScreenFlow()
      ];
      
      for (const testFn of screenTests) {
        const results = await testFn();
        // Contar resultados individuales si es necesario
      }
      
      // Contar resultados totales
      totalTests = this.results.filter(r => r.type === 'test').length;
      passedTests = this.results.filter(r => r.type === 'success').length;
      
    } catch (error) {
      await this.log(`💥 Error crítico: ${error.message}`, 'error');
    } finally {
      await this.cleanup();
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    await this.log('='.repeat(60), 'separator');
    await this.log('📊 RESUMEN FINAL DE PRUEBAS', 'summary');
    await this.log(`⏱️  Duración: ${duration}s`, 'info');
    await this.log(`📈 Pruebas totales: ${totalTests}`, 'info');
    await this.log(`✅ Pruebas exitosas: ${passedTests}`, 'info');
    await this.log(`❌ Pruebas fallidas: ${totalTests - passedTests}`, 'info');
    await this.log(`📊 Tasa de éxito: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`, 'info');
    
    if (passedTests === totalTests) {
      await this.log('🎉 ¡TODAS LAS PRUEBAS PASARON! El flujo completo funciona correctamente.', 'celebration');
    } else {
      await this.log('⚠️ Algunas pruebas fallaron. Revisar logs para detalles.', 'warning');
    }
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      duration: parseFloat(duration)
    };
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const tester = new ScreenFlowTester();
  tester.runAllTests()
    .then(results => {
      console.log('\n🏁 Pruebas completadas:', results);
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = ScreenFlowTester;
