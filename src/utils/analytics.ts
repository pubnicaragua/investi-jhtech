/**
 * Analytics Wrapper para Investi App
 * Integración con Firebase Analytics (Google Analytics 4)
 * 
 * Uso:
 * import { Analytics } from '../utils/analytics'
 * await Analytics.logScreenView('HomeScreen')
 */

// TODO: Instalar dependencias
// npm install @react-native-firebase/app @react-native-firebase/analytics

// Importar cuando esté instalado:
// import analytics from '@react-native-firebase/analytics';

// Por ahora, usar mock para desarrollo
const isDevelopment = __DEV__;

class AnalyticsService {
  private enabled: boolean = true;

  /**
   * Habilitar/deshabilitar analytics
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Log genérico de eventos
   */
  private async log(eventName: string, params?: Record<string, any>) {
    if (!this.enabled) return;

    if (isDevelopment) {
      console.log(`📊 [Analytics] ${eventName}`, params || {});
    }

    // TODO: Descomentar cuando Firebase esté configurado
    // await analytics().logEvent(eventName, params);
  }

  // ============================================================================
  // NAVEGACIÓN
  // ============================================================================

  async logScreenView(screenName: string, screenClass?: string) {
    await this.log('screen_view', {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }

  // ============================================================================
  // AUTENTICACIÓN
  // ============================================================================

  async logLogin(method: 'email' | 'google' | 'facebook' | 'apple') {
    await this.log('login', { method });
  }

  async logSignUp(method: 'email' | 'google' | 'facebook' | 'apple') {
    await this.log('sign_up', { method });
  }

  async logLogout() {
    await this.log('logout', {});
  }

  // ============================================================================
  // ONBOARDING
  // ============================================================================

  async logOnboardingStart() {
    await this.log('onboarding_start', {});
  }

  async logOnboardingComplete() {
    await this.log('onboarding_complete', {});
  }

  async logOnboardingSkip(step: number) {
    await this.log('onboarding_skip', { step });
  }

  // ============================================================================
  // COMUNIDADES
  // ============================================================================

  async logCommunityView(communityId: string, communityName: string) {
    await this.log('community_view', {
      community_id: communityId,
      community_name: communityName,
    });
  }

  async logCommunityJoin(communityId: string, communityName: string) {
    await this.log('join_group', {
      group_id: communityId,
      group_name: communityName,
    });
  }

  async logCommunityLeave(communityId: string, communityName: string) {
    await this.log('leave_group', {
      group_id: communityId,
      group_name: communityName,
    });
  }

  async logCommunityCreate(communityName: string, privacy: string) {
    await this.log('community_create', {
      community_name: communityName,
      privacy: privacy,
    });
  }

  // ============================================================================
  // POSTS Y CONTENIDO
  // ============================================================================

  async logPostView(postId: string, postType: string) {
    await this.log('select_content', {
      content_type: 'post',
      item_id: postId,
      post_type: postType,
    });
  }

  async logPostCreate(postType: string, hasMedia: boolean, communityId?: string) {
    await this.log('post_create', {
      post_type: postType,
      has_media: hasMedia,
      community_id: communityId,
    });
  }

  async logPostLike(postId: string, isLiked: boolean) {
    await this.log('post_like', {
      post_id: postId,
      action: isLiked ? 'like' : 'unlike',
    });
  }

  async logPostComment(postId: string) {
    await this.log('post_comment', { post_id: postId });
  }

  async logPostShare(postId: string, method: string) {
    await this.log('share', {
      content_type: 'post',
      item_id: postId,
      method: method,
    });
  }

  async logPostSave(postId: string, isSaved: boolean) {
    await this.log('post_save', {
      post_id: postId,
      action: isSaved ? 'save' : 'unsave',
    });
  }

  // ============================================================================
  // USUARIOS Y CONEXIONES
  // ============================================================================

  async logProfileView(userId: string, username: string) {
    await this.log('profile_view', {
      user_id: userId,
      username: username,
    });
  }

  async logUserFollow(userId: string, isFollowing: boolean) {
    await this.log('user_follow', {
      user_id: userId,
      action: isFollowing ? 'follow' : 'unfollow',
    });
  }

  async logConnectionRequest(userId: string) {
    await this.log('connection_request', { user_id: userId });
  }

  // ============================================================================
  // EDUCACIÓN - LECCIONES
  // ============================================================================

  async logLessonView(lessonId: string, lessonTitle: string) {
    await this.log('lesson_view', {
      lesson_id: lessonId,
      lesson_title: lessonTitle,
    });
  }

  async logLessonStart(lessonId: string, lessonTitle: string) {
    await this.log('lesson_start', {
      lesson_id: lessonId,
      lesson_title: lessonTitle,
    });
  }

  async logLessonComplete(lessonId: string, durationSeconds: number) {
    await this.log('lesson_complete', {
      lesson_id: lessonId,
      duration_seconds: durationSeconds,
    });
  }

  async logLessonAIGenerate(lessonTitle: string, success: boolean) {
    await this.log('lesson_ai_generate', {
      lesson_title: lessonTitle,
      success: success,
    });
  }

  // ============================================================================
  // EDUCACIÓN - VIDEOS
  // ============================================================================

  async logVideoView(videoId: string, videoTitle: string) {
    await this.log('video_view', {
      video_id: videoId,
      video_title: videoTitle,
    });
  }

  async logVideoStart(videoId: string, videoTitle: string) {
    await this.log('video_start', {
      video_id: videoId,
      video_title: videoTitle,
    });
  }

  async logVideoProgress(videoId: string, progressPercent: number) {
    // Solo log en hitos: 25%, 50%, 75%, 100%
    if ([25, 50, 75, 100].includes(progressPercent)) {
      await this.log('video_progress', {
        video_id: videoId,
        progress_percent: progressPercent,
      });
    }
  }

  async logVideoComplete(videoId: string, watchTimeSeconds: number) {
    await this.log('video_complete', {
      video_id: videoId,
      watch_time_seconds: watchTimeSeconds,
    });
  }

  async logVideoLike(videoId: string, isLiked: boolean) {
    await this.log('video_like', {
      video_id: videoId,
      action: isLiked ? 'like' : 'unlike',
    });
  }

  // ============================================================================
  // HERRAMIENTAS FINANCIERAS
  // ============================================================================

  async logCalculatorUse(
    calculatorType: 'dividendos' | 'intereses' | 'ratios' | 'comparador',
    inputValues: Record<string, number>
  ) {
    await this.log('calculator_use', {
      calculator_type: calculatorType,
      ...inputValues,
    });
  }

  async logSimulatorUse(
    simulatorType: 'jubilacion' | 'portafolio',
    inputValues: Record<string, number>
  ) {
    await this.log('simulator_use', {
      simulator_type: simulatorType,
      ...inputValues,
    });
  }

  // ============================================================================
  // BÚSQUEDA
  // ============================================================================

  async logSearch(searchTerm: string, resultCount: number) {
    await this.log('search', {
      search_term: searchTerm,
      result_count: resultCount,
    });
  }

  // ============================================================================
  // CHAT Y MENSAJES
  // ============================================================================

  async logMessageSend(conversationId: string, messageType: string) {
    await this.log('message_send', {
      conversation_id: conversationId,
      message_type: messageType,
    });
  }

  async logChatOpen(conversationId: string, participantId: string) {
    await this.log('chat_open', {
      conversation_id: conversationId,
      participant_id: participantId,
    });
  }

  // ============================================================================
  // NOTIFICACIONES
  // ============================================================================

  async logNotificationReceive(notificationType: string) {
    await this.log('notification_receive', {
      notification_type: notificationType,
    });
  }

  async logNotificationOpen(notificationType: string, notificationId: string) {
    await this.log('notification_open', {
      notification_type: notificationType,
      notification_id: notificationId,
    });
  }

  // ============================================================================
  // ERRORES
  // ============================================================================

  async logError(errorMessage: string, errorCode?: string, screen?: string) {
    await this.log('app_error', {
      error_message: errorMessage,
      error_code: errorCode,
      screen: screen,
    });
  }

  // ============================================================================
  // PROPIEDADES DE USUARIO
  // ============================================================================

  async setUserId(userId: string) {
    if (!this.enabled) return;

    if (isDevelopment) {
      console.log(`📊 [Analytics] Set User ID: ${userId}`);
    }

    // TODO: Descomentar cuando Firebase esté configurado
    // await analytics().setUserId(userId);
  }

  async setUserProperties(properties: {
    age_range?: string;
    gender?: string;
    country?: string;
    investment_experience?: string;
    interests?: string[];
  }) {
    if (!this.enabled) return;

    if (isDevelopment) {
      console.log('📊 [Analytics] Set User Properties:', properties);
    }

    // TODO: Descomentar cuando Firebase esté configurado
    // await analytics().setUserProperties(properties);
  }

  // ============================================================================
  // SESIÓN
  // ============================================================================

  async logAppOpen() {
    await this.log('app_open', {});
  }

  async logSessionStart() {
    await this.log('session_start', {});
  }

  async logSessionEnd(durationSeconds: number) {
    await this.log('session_end', {
      duration_seconds: durationSeconds,
    });
  }
}

// Exportar instancia única
export const Analytics = new AnalyticsService();

// Exportar también la clase por si se necesita crear instancias personalizadas
export default AnalyticsService;
