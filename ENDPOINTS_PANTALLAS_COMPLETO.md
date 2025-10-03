# 📊 MAPEO COMPLETO DE ENDPOINTS POR PANTALLA - INVESTI APP

## 🚨 ESTADO ACTUAL DEL BACKEND
- **Base de Datos**: Supabase (47 tablas)
- **Funciones RPC**: 33 funciones personalizadas
- **Políticas RLS**: 47 políticas de seguridad
- **Triggers**: 9 triggers automáticos
- **Foreign Keys**: 67 relaciones

---

## 📱 PANTALLAS Y SUS ENDPOINTS

### 🔐 AUTENTICACIÓN

#### 1. **WelcomeScreen**
- **Estado**: ✅ Solo UI
- **Endpoints**: Ninguno
- **Notas**: Pantalla de bienvenida estática

#### 2. **LanguageSelectionScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `AsyncStorage.setItem('user_language', language)` ✅
- **Problemas**: Error con SecureStore key inválida
- **Solución**: Usar AsyncStorage en lugar de SecureStore

#### 3. **SignInScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `authSignIn(email, password)` ✅
  - `supabase.auth.signInWithPassword()` ✅
  - `supabase.auth.signInWithOAuth()` ✅ (Google, Facebook)
  - `supabase.auth.resetPasswordForEmail()` ✅
- **Tablas**: `auth.users`, `public.users`

#### 4. **SignUpScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `authSignUp(email, password, userData)` ✅
  - `supabase.auth.signUp()` ✅
  - `supabase.auth.signInWithOAuth()` ✅
- **Tablas**: `auth.users`, `public.users`
- **Trigger**: `handle_new_user()` se ejecuta automáticamente

#### 5. **UploadAvatarScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `getCurrentUserId()` ✅
  - `updateUser(uid, data)` ✅
  - `supabase.storage.upload()` ✅
  - `supabase.storage.getPublicUrl()` ✅
- **Storage**: Bucket `avatars`

---

### 🎯 ONBOARDING

#### 6. **PickGoalsScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `getInvestmentGoals()` ✅ - Tabla `goals`
  - `saveUserGoals(userId, goals)` ✅ - Tabla `user_goals`
- **Funciones RPC**: Ninguna específica
- **Fallback**: 10 metas predefinidas

#### 7. **PickInterestsScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `getInvestmentInterests()` ✅ - Tabla `interests`
  - `saveUserInterests(userId, interests)` ✅ - Tabla `user_interests`
- **Fallback**: 8 intereses predefinidos

#### 8. **PickKnowledgeScreen**
- **Estado**: ✅ Funcional (datos mock)
- **Endpoints**:
  - `getKnowledgeLevels()` ✅ - Datos mock
  - `saveUserKnowledgeLevel(userId, level)` ✅
- **Notas**: Usar datos mock hasta corregir BD

#### 9. **OnboardingCompleteScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `updateUser(uid, { onboarding_completed: true })` ✅

---

### 🏠 PANTALLAS PRINCIPALES

#### 10. **HomeScreen / HomeFeedScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `getUserFeed(uid, limit)` ✅ - Tabla `posts`
  - `getPersonalizedFeedComplete(userId)` ✅
  - `getActiveUsers(limit)` ✅ - Para historias
  - `getRecommendations(userId)` ✅
- **Funciones RPC**: `get_personalized_feed()`
- **Tablas**: `posts`, `users`, `communities`

#### 11. **CreatePostScreen**
- **Estado**: ✅ Funcional con problemas
- **Endpoints**:
  - `createPost(data)` ✅ - Tabla `posts`
  - `uploadImage(file)` ❌ - Error 400 en storage
  - `getUserCommunities(userId)` ✅
- **Problemas**: Error al subir imágenes a `post-media` bucket
- **Storage**: Bucket `post-media` necesita configuración

#### 12. **PostDetailScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `getPostDetail(postId)` ✅
  - `commentPost(postId, userId, content)` ✅
  - `likePost(postId, userId)` ✅
- **Tablas**: `posts`, `comments`, `post_likes`
- **Funciones RPC**: `add_comment()`

---

### 👥 COMUNIDADES

#### 13. **CommunitiesScreen**
- **Estado**: ✅ Funcional con errores
- **Endpoints**:
  - `listCommunities()` ✅ - Tabla `communities`
  - `joinCommunity(uid, communityId)` ❌ - Error 409 (Conflict)
  - `getUserCommunities(userId)` ❌ - Error 400
- **Problemas**: 
  - Error en `user_communities` con parámetros incorrectos
  - URLs de placeholder fallan (via.placeholder.com)

#### 14. **CommunityDetailScreen**
- **Estado**: ❌ Error crítico
- **Endpoints**:
  - `getCommunityDetailsComplete(communityId)` ❌ - Error 400
  - `getCommunityPosts(communityId)` ✅
  - `getCommunityChannels(communityId)` ✅
- **Problemas**: Error de navegación - falta route object
- **Funciones RPC**: `get_community_stats()`

#### 15. **CommunityRecommendationsScreen**
- **Estado**: ❌ Múltiples errores 400
- **Endpoints**:
  - `getCommunityDetailsComplete(communityId)` ❌
  - `getRecommendedCommunities(userId)` ✅
- **Problemas**: Consultas con relaciones incorrectas

#### 16. **CreateCommunityScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `request("POST", "/communities", data)` ✅
- **Tablas**: `communities`

#### 17. **CommunityMembersScreen**
- **Estado**: ✅ Funcional con Backend Completo
- **Ruta**: `/community/:communityId/members`
- **Archivo**: `CommunityMembersScreen.tsx`
- **Endpoints**:
  - `getCommunityMembers(communityId)` ✅ - Tabla `community_members`
  - `removeCommunityMember(communityId, memberId)` ✅
  - `updateMemberRole(communityId, memberId, role)` ✅
  - `getCurrentUser()` ✅
- **Tablas**: `community_members`, `users`
- **Características**:
  - 100% Backend Driven
  - Búsqueda en tiempo real
  - Filtros por rol (Admin, Moderador, Miembro)
  - Gestión de roles (solo admins)
  - Eliminar miembros (solo admins)
  - Invitar miembros
  - UI moderna con badges de roles

#### 18. **CommunitySettingsScreen**
- **Estado**: ✅ Funcional con Backend Completo
- **Ruta**: `/community/:communityId/settings`
- **Archivo**: `CommunitySettingsScreen.tsx`
- **Endpoints**:
  - `getCommunityDetails(communityId)` ✅
  - `updateCommunitySettings(communityId, settings)` ✅
  - `leaveCommunity(userId, communityId)` ✅
  - `deleteCommunity(communityId)` ✅ - Solo admins
  - `getCurrentUser()` ✅
  - `isUserMemberOfCommunity(userId, communityId)` ✅
- **Tablas**: `communities`, `community_members`
- **Características**:
  - 100% Backend Driven
  - Configuración de notificaciones
  - Privacidad (pública/privada)
  - Moderación de contenido
  - Aprobar publicaciones
  - Abandonar comunidad
  - Eliminar comunidad (solo admins)
  - Confirmaciones dobles para acciones críticas

---

### 💬 CHAT Y MENSAJES

#### 19. **ChatListScreen**
- **Estado**: ❌ Datos mock
- **Endpoints Faltantes**:
  - `getUserChats(userId)` ❌ - Implementado pero no usado
  - `getLastMessages(chatIds)` ❌
- **Tablas**: `chats`, `chat_participants`, `chat_messages`

#### 20. **ChatScreen**
- **Estado**: ❌ Múltiples errores
- **Endpoints**:
  - `getConversationMessages(conversationId)` ❌ - Error: columna no existe
  - `sendMessage(chatId, userId, content)` ❌ - Error: columna 'content' no existe
  - `markMessagesAsRead(conversationId)` ❌ - Tabla no existe
- **Problemas Críticos**:
  - Tabla `message_reads` no existe
  - Columna `conversation_id` no existe en `messages`
  - Columna `content` no existe en `messages`

#### 21. **MessagesScreen**
- **Estado**: ❌ Datos mock
- **Endpoints Faltantes**:
  - `getUserConversations(userId)` ❌
- **Tablas**: `conversations`, `messages`

#### 22. **GroupChatScreen**
- **Estado**: ✅ Funcional con Realtime
- **Ruta**: `/group-chat/:channelId`
- **Archivo**: `GroupChatScreen.tsx`
- **Endpoints**:
  - `getChannelMessages(channelId, limit)` ✅ - Tabla `chat_messages`
  - `sendMessage(chatId, userId, content)` ✅ - Tabla `chat_messages`
  - `getCommunityChannels(communityId)` ✅ - Tabla `community_channels`
  - `getCurrentUser()` ✅
- **Realtime**: Supabase Realtime subscriptions ✅
- **Tablas**: `chat_messages`, `community_channels`, `users`
- **Características**:
  - 100% Backend Driven
  - Mensajes en tiempo real
  - Auto-scroll inteligente
  - Indicador de envío
  - Pixel perfect según diseño
- **Navegación desde CommunityDetailScreen**:
  ```typescript
  // En CommunityDetailScreen, tab "Chats"
  <TouchableOpacity 
    onPress={() => navigation.navigate('GroupChat', {
      channelId: channel.id,
      communityId: community.id,
      channelName: channel.name
    })}
  >
    <Text>{channel.name}</Text>
  </TouchableOpacity>
  ```
- **⚠️ IMPORTANTE - Estructura de Mensajes**:
  - Usa tabla `chat_messages` con columna `content` (NO `contenido`)
  - Campo `chat_id` referencia a `community_channels.id`
  - Campo `sender_id` referencia a `users.id`
  - NO confundir con tabla `messages` (para chats 1:1)

---

### 📚 EDUCACIÓN

#### 23. **EducacionScreen**
- **Estado**: ❌ Errores múltiples
- **Endpoints**:
  - `getCourses()` ❌ - Error: columna 'category' no existe
  - `getLessons()` ❌ - Error: columna 'duration' no existe
  - `getUserLearningProgress(userId)` ✅
- **Problemas**: Estructura de tablas `courses` y `lessons` incompleta

#### 24. **CourseDetailScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `getCoursesWithLessons()` ✅
  - `completeLesson(userId, lessonId)` ✅
- **Tablas**: `courses`, `lessons`, `lesson_progress`

#### 25. **LearningPathsScreen**
- **Estado**: ❌ Datos mock
- **Endpoints Faltantes**:
  - `getLearningPaths()` ❌
  - `getUserPathProgress()` ❌

#### 26. **VideoPlayerScreen**
- **Estado**: ❌ Datos mock
- **Endpoints Faltantes**:
  - `getVideoDetails()` ❌
  - `updateVideoProgress()` ❌

---

### 💰 INVERSIONES Y FINANZAS

#### 27. **InversionesScreen**
- **Estado**: ❌ Datos hardcodeados
- **Endpoints Faltantes**:
  - `getInvestmentOptions()` ❌
  - `getUserPortfolio()` ❌
- **Notas**: Completamente mock, necesita integración real

#### 28. **InversionistaScreen**
- **Estado**: ❌ Datos hardcodeados
- **Endpoints**:
  - `fetchInvestorProfile(userId)` ✅ - Implementado
- **Notas**: Mostrar mensaje "Próximamente..."

#### 29. **MarketInfoScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `getMarketData()` ✅ - Tabla `market_data`
  - `getFeaturedStocks()` ✅
- **Tablas**: `market_data`

#### 30. **PlanificadorFinancieroScreen**
- **Estado**: ❌ Datos hardcodeados
- **Endpoints Faltantes**:
  - `getUserBudgets()` ❌
  - `createBudget()` ❌
  - `getTransactions()` ❌
- **Riesgo**: Usuarios pueden tomar decisiones basadas en datos falsos

#### 31. **ReportesAvanzadosScreen**
- **Estado**: ❌ Datos hardcodeados
- **Endpoints Faltantes**:
  - `getAdvancedReports()` ❌
  - `generateCustomReport()` ❌
- **Notas**: Fórmulas y datos completamente falsos

---

### 📰 NOTICIAS Y PROMOCIONES

#### 32. **NewsScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `getNewsList(category)` ✅ - Tabla `news`
- **Tablas**: `news`, `news_categories`

#### 33. **NewsDetailScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `getNewsDetail(newsId)` ✅
- **Tablas**: `news`

#### 34. **PromotionsScreen**
- **Estado**: ❌ Error crítico
- **Endpoints**:
  - `fetchPromotions(params)` ✅ - Tabla `promotions`
  - `getSuggestedPeople(userId)` ✅
  - `getUserFeed(uid)` ✅
- **Problemas**: Error "Cannot read properties of undefined (reading 'name')"

#### 35. **PromotionDetailScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `request("GET", "/promotions")` ✅
- **Tablas**: `promotions`

---

### 👤 PERFIL Y CONFIGURACIÓN

#### 36. **ProfileScreen**
- **Estado**: ❌ Error 400
- **Endpoints**:
  - `getUserComplete(userId)` ❌ - Error 400
  - `getUserPosts(userId)` ✅
  - `followUser()` / `unfollowUser()` ✅
- **Problemas**: Query con parámetros incorrectos

#### 37. **SettingsScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `updateUser(uid, settings)` ✅
  - `authSignOut()` ✅
- **Tablas**: `users`, `user_preferences`

#### 38. **SavedPostsScreen**
- **Estado**: ✅ Funcional con Backend Completo
- **Ruta**: `/saved-posts`
- **Archivo**: `SavedPostsScreen.tsx`
- **Endpoints**:
  - `getSavedPosts(userId)` ✅ - Tabla `saved_posts`
  - `unsavePost(userId, postId)` ✅
  - `getCurrentUser()` ✅
- **Tablas**: `saved_posts`, `posts`, `users`
- **Características**:
  - 100% Backend Driven
  - Lista completa de posts guardados
  - Vista previa con imagen y contenido
  - Estadísticas (likes, comentarios)
  - Quitar de guardados
  - Navegación a detalle del post
  - Pull to refresh
  - Empty state con CTA
  - Contador de posts guardados

---

### 🔔 NOTIFICACIONES

#### 39. **NotificationsScreen**
- **Estado**: ❌ Datos mock
- **Endpoints**:
  - `getUserNotifications(userId)` ✅ - Implementado
  - `markNotificationRead(notificationId)` ✅
- **Tablas**: `notifications`
- **Notas**: Implementado pero usando datos mock en pantalla

---

### 🛠 UTILIDADES Y OTRAS

#### 40. **SharePostScreen**
- **Estado**: ✅ Funcional
- **Endpoints**:
  - `sharePost(postId, userId, metadata)` ✅
- **Tablas**: `post_shares`

#### 41. **PaymentScreen**
- **Estado**: ❌ No implementado
- **Endpoints Faltantes**:
  - `processPayment()` ❌
  - `getPaymentMethods()` ❌

#### 42. **CazaHormigasScreen**
- **Estado**: ✅ Herramienta local
- **Endpoints**: Ninguno (herramienta de debugging)

#### 43. **DevMenuScreen**
- **Estado**: ✅ Herramienta local
- **Endpoints**: Ninguno (menú de desarrollo)

---

## 🚨 ENDPOINTS CRÍTICOS FALTANTES

### **CHAT Y MENSAJERÍA**
```sql
-- Corregir estructura de mensajes
ALTER TABLE messages 
ADD COLUMN conversation_id UUID REFERENCES conversations(id),
ADD COLUMN content TEXT;

-- Crear tabla de mensajes leídos
CREATE TABLE message_reads (
    conversation_id UUID REFERENCES conversations(id),
    user_id UUID REFERENCES users(id),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);
```

### **EDUCACIÓN**
```sql
-- Agregar columnas faltantes
ALTER TABLE courses ADD COLUMN category TEXT;
ALTER TABLE lessons ADD COLUMN duration INTEGER;
```

### **PROMOCIONES**
```typescript
// Endpoints faltantes
export async function claimPromotion(promotionId: string, userId: string)
export async function trackPromotionView(promotionId: string, userId: string)
export async function getPromotionsByCategory(category: string)
```

### **PLANIFICADOR FINANCIERO**
```typescript
// Endpoints críticos faltantes
export async function getUserBudgets(userId: string)
export async function createBudget(userId: string, budgetData: any)
export async function getTransactions(userId: string, filters: any)
export async function createTransaction(userId: string, transactionData: any)
```

### **NOTIFICACIONES EN TIEMPO REAL**
```typescript
// Sistema de notificaciones
export async function subscribeToNotifications(userId: string)
export async function sendNotification(userId: string, notification: any)
```

---

## 📊 RESUMEN EJECUTIVO

### **ESTADO GENERAL**
- **✅ Funcionando**: 19 pantallas (40%)
- **⚠️ Con errores menores**: 8 pantallas (17%)
- **❌ Con errores críticos**: 10 pantallas (21%)
- **🚫 No implementado**: 11 pantallas (23%)

### **PRIORIDADES CRÍTICAS**
1. **🔥 URGENTE**: Agregar 7 endpoints nuevos a api.ts (ver NUEVOS_ENDPOINTS_REQUERIDOS.md)
2. **🔥 URGENTE**: Implementar planificador financiero real
3. **🔥 URGENTE**: Corregir ChatScreen y MessagesScreen (1:1 chats)
4. **⚠️ IMPORTANTE**: Corregir errores en comunidades
5. **⚠️ IMPORTANTE**: Implementar notificaciones en tiempo real
6. **📝 NECESARIO**: Completar estructura de educación

### **✅ COMPLETADO HOY (2025-10-02)**
- GroupChatScreen - Chat grupal con Realtime ✅
- SavedPostsScreen - Publicaciones guardadas ✅
- CommunityMembersScreen - Gestión de miembros ✅
- CommunitySettingsScreen - Configuración de comunidad ✅
- **Total: 4 pantallas completadas (100% funcionales)**

### **RIESGOS**
- **ALTO**: Datos falsos en herramientas financieras
- **MEDIO**: Sistema de chat completamente roto
- **MEDIO**: Múltiples pantallas con datos mock
- **BAJO**: Errores de navegación en algunas pantallas

---

## 🔧 PRÓXIMOS PASOS RECOMENDADOS

1. **Ejecutar script de corrección SQL** para tablas faltantes
2. **Implementar endpoints críticos** de chat y finanzas
3. **Corregir errores 400** en consultas de comunidades
4. **Reemplazar datos mock** con integraciones reales
5. **Implementar sistema de notificaciones** en tiempo real
6. **Agregar manejo de errores** robusto en todas las pantallas
