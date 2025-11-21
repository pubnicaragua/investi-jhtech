# Investí - Documentación Técnica del Proyecto

## Resumen Ejecutivo

Aplicación: Investí - Red Social de Inversión  
Estado: En Desarrollo  
Versión: 1.0.45.42  
Plataforma: React Native (Expo)  
Backend: Supabase (PostgreSQL)  
Total de Pantallas: 52 (48 activas + 4 descartadas)  
Categorías: 11  

---

## 1. Autenticación y Onboarding (6 pantallas)

### LanguageSelection

Archivo: src/screens/LanguageSelectionScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/LanguageSelectionScreen.tsx
Navegación: LanguageSelection
Estado: Activa
Endpoints: Ninguno

---

### Welcome

Archivo: src/screens/WelcomeScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/WelcomeScreen.tsx
Navegación: Welcome
Estado: Activa
Endpoints: Ninguno

---

### SignIn

Archivo: src/screens/SignInScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/SignInScreen.tsx
Navegación: SignIn
Estado: Activa
Endpoints:
  - signIn(email, password)
  - signInWithOAuth(provider)
  - getCurrentUser()

---

### SignUp

Archivo: src/screens/SignUpScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/SignUpScreen.tsx
Navegación: SignUp
Estado: Activa
Endpoints:
  - signUpWithMetadata(email, password, metadata)
  - validateEmail(email)
  - sendVerificationEmail(email)

---

### AuthCallback

Archivo: src/screens/AuthCallbackScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/AuthCallbackScreen.tsx
Navegación: AuthCallback
Estado: Activa
Endpoints:
  - authCallback(token)
  - verifyToken(token)

---

### UploadAvatar

Archivo: src/screens/UploadAvatarScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/UploadAvatarScreen.tsx
Navegación: UploadAvatar
Estado: Activa
Endpoints:
  - updateUser(userId, {avatar_url})
  - uploadToStorage(file, bucket)

---

## 2. Configuración Inicial (6 pantallas)

### PickGoals

Archivo: src/screens/PickGoalsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/PickGoalsScreen.tsx
Navegación: PickGoals
Estado: Activa
Endpoints:
  - updateUser(userId, {goals})
  - getUserGoals(userId)
  - createUserGoals(userId, goalIds)

---

### PickInterests

Archivo: src/screens/PickInterestsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/PickInterestsScreen.tsx
Navegación: PickInterests
Estado: Activa
Endpoints:
  - updateUserInterestsViaRPC(userId, interests)
  - getAvailableInterests()

---

### PickKnowledge

Archivo: src/screens/PickKnowledgeScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/PickKnowledgeScreen.tsx
Navegación: PickKnowledge
Estado: Activa
Endpoints:
  - updateUser(userId, {nivel_finanzas})

---

### CommunityRecommendations

Archivo: src/screens/CommunityRecommendationsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CommunityRecommendationsScreen.tsx
Navegación: CommunityRecommendations
Estado: Activa
Endpoints:
  - getRecommendedCommunities(userId)
  - joinCommunity(userId, communityId)

---

## 3. Pantalla Principal (1 pantalla)

### HomeFeed

Archivo: src/screens/HomeFeedScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/HomeFeedScreen.tsx
Navegación: HomeFeed
Estado: Activa
Endpoints:
  - getUserFeed(userId, limit, offset)
  - likePost(userId, postId)
  - unlikePost(userId, postId)
  - getPostComments(postId)

---

## 4. Sistema de Posts (7 pantallas)

### CreatePost

Archivo: src/screens/CreatePostScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CreatePostScreen.tsx
Navegación: CreatePost
Estado: Activa
Endpoints:
  - createPost(userId, {title, content, media})
  - uploadMedia(file, bucket)

---

### CreateCommunityPost

Archivo: src/screens/CreateCommunityPostScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CreateCommunityPostScreen.tsx
Navegación: CreateCommunityPost
Estado: Activa
Endpoints:
  - createCommunityPost(userId, communityId, {title, content, media})

---

### PostDetail

Archivo: src/screens/PostDetailScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/PostDetailScreen.tsx
Navegación: PostDetail
Estado: Activa
Endpoints:
  - getPostDetail(postId)
  - getPostComments(postId, limit, offset)
  - createComment(userId, postId, {content})
  - deletePost(userId, postId)

---

### CommunityPostDetail

Archivo: src/screens/CommunityPostDetailScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CommunityPostDetailScreen.tsx
Navegación: CommunityPostDetail
Estado: Activa
Endpoints:
  - getCommunityPostDetail(postId)
  - getPostComments(postId)

---

### VideoPlayer

Archivo: src/screens/VideoPlayerScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/VideoPlayerScreen.tsx
Navegación: VideoPlayer
Estado: Activa
Endpoints: Ninguno

---

### SharePost

Archivo: src/screens/SharePostScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/SharePostScreen.tsx
Navegación: SharePost
Estado: Activa
Endpoints:
  - sharePost(postId, {platform, message})

---

### SavedPosts

Archivo: src/screens/SavedPostsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/SavedPostsScreen.tsx
Navegación: SavedPosts
Estado: Activa
Endpoints:
  - getSavedPosts(userId)
  - savePost(userId, postId)
  - unsavePost(userId, postId)

---

## 5. Sistema de Comunidades (6 pantallas)

### Communities

Archivo: src/screens/CommunitiesScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CommunitiesScreen.tsx
Navegación: Communities
Estado: Activa
Endpoints:
  - listCommunities(limit, offset)
  - searchCommunities(query)
  - joinCommunity(userId, communityId)
  - leaveCommunity(userId, communityId)

---

### CommunityDetail

Archivo: src/screens/CommunityDetailScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CommunityDetailScreen.tsx
Navegación: CommunityDetail
Estado: Activa
Endpoints:
  - getCommunityDetail(communityId)
  - getCommunityPosts(communityId, limit, offset)
  - joinCommunity(userId, communityId)

---

### CommunitySettings

Archivo: src/screens/CommunitySettingsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CommunitySettingsScreen.tsx
Navegación: CommunitySettings
Estado: Activa
Endpoints:
  - updateCommunitySettings(communityId, settings)
  - getCommunitySettings(communityId)

---

### CommunityMembers

Archivo: src/screens/CommunityMembersScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CommunityMembersScreen.tsx
Navegación: CommunityMembers
Estado: Activa
Endpoints:
  - getCommunityMembers(communityId, limit, offset)
  - removeMember(communityId, userId)

---

### EditCommunity

Archivo: src/screens/EditCommunityScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/EditCommunityScreen.tsx
Navegación: EditCommunity
Estado: Activa
Endpoints:
  - updateCommunity(communityId, {name, description, avatar})

---

### CreateCommunity

Archivo: src/screens/CreateCommunityScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CreateCommunityScreen.tsx
Navegación: CreateCommunity
Estado: Activa
Endpoints:
  - createCommunity(userId, {name, description, category})

---

## 6. Perfiles y Configuración (5 pantallas)

### Profile

Archivo: src/screens/ProfileScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/ProfileScreen.tsx
Navegación: Profile
Estado: Activa
Endpoints:
  - getUserComplete(userId)
  - getUserStats(userId)
  - followUser(userId, targetUserId)
  - unfollowUser(userId, targetUserId)

---

### EditProfile

Archivo: src/screens/EditProfileScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/EditProfileScreen.tsx
Navegación: EditProfile
Estado: Activa
Endpoints:
  - updateUser(userId, {name, bio, avatar})

---

### Followers

Archivo: src/screens/FollowersScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/FollowersScreen.tsx
Navegación: Followers
Estado: Activa
Endpoints:
  - getFollowers(userId)
  - unfollowUser(userId, targetUserId)

---

### Following

Archivo: src/screens/FollowingScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/FollowingScreen.tsx
Navegación: Following
Estado: Activa
Endpoints:
  - getFollowing(userId)
  - unfollowUser(userId, targetUserId)

---

### Settings

Archivo: src/screens/SettingsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/SettingsScreen.tsx
Navegación: Settings
Estado: Activa
Endpoints:
  - authSignOut()
  - updateSettings(userId, settings)

---

## 7. Chat y Mensajería (5 pantallas)

### ChatList

Archivo: src/screens/ChatListScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/ChatListScreen.tsx
Navegación: ChatList
Estado: Activa
Endpoints:
  - getChats(userId)
  - deleteChat(chatId)

---

### ChatScreen

Archivo: src/screens/ChatScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/ChatScreen.tsx
Navegación: Chat
Estado: Activa
Endpoints:
  - getChatMessages(chatId, limit, offset)
  - sendMessage(userId, chatId, {content})
  - markAsRead(chatId)

---

### NewMessageScreen

Archivo: src/screens/NewMessageScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/NewMessageScreen.tsx
Navegación: NewMessage
Estado: Activa
Endpoints:
  - startNewChat(userId, targetUserId)
  - searchUsers(query)

---

### GroupChat

Archivo: src/screens/GroupChatScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/GroupChatScreen.tsx
Navegación: GroupChat
Estado: Activa
Endpoints:
  - getGroupMessages(groupId)
  - sendGroupMessage(userId, groupId, {content})

---

### ArchivedChats

Archivo: src/screens/ArchivedChatsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/ArchivedChatsScreen.tsx
Navegación: ArchivedChats
Estado: Activa
Endpoints:
  - getArchivedChats(userId)
  - unarchiveChat(chatId)

---

## 8. Notificaciones (2 pantallas)

### Notifications

Archivo: src/screens/NotificationsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/NotificationsScreen.tsx
Navegación: Notifications
Estado: Activa
Endpoints:
  - getNotifications(userId)
  - markAsRead(notificationId)
  - deleteNotification(notificationId)

---

### NotificationSettings

Archivo: src/screens/NotificationSettingsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/NotificationSettingsScreen.tsx
Navegación: NotificationSettings
Estado: Activa
Endpoints:
  - updateNotificationSettings(userId, settings)

---

## 9. Contenido y Educación (6 pantallas)

### News

Archivo: src/screens/NewsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/NewsScreen.tsx
Navegación: News
Estado: Activa
Endpoints:
  - getNews(limit, offset)
  - searchNews(query)

---

### NewsDetail

Archivo: src/screens/NewsDetailScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/NewsDetailScreen.tsx
Navegación: NewsDetail
Estado: Activa
Endpoints:
  - getNewsDetail(newsId)

---

### Educacion

Archivo: src/screens/EducacionScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/EducacionScreen.tsx
Navegación: Educacion
Estado: Activa
Endpoints:
  - getCourses(limit, offset)
  - getLessons(courseId)

---

### CourseDetail

Archivo: src/screens/CourseDetailScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CourseDetailScreen.tsx
Navegación: CourseDetail
Estado: Activa
Endpoints:
  - getCourseDetail(courseId)
  - enrollCourse(userId, courseId)

---

### LearningPaths

Archivo: src/screens/LearningPathsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/LearningPathsScreen.tsx
Navegación: LearningPaths
Estado: Activa
Endpoints:
  - getLearningPaths()

---

### LessonDetail

Archivo: src/screens/LessonDetailScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/LessonDetailScreen.tsx
Navegación: LessonDetail
Estado: Activa
Endpoints:
  - getLessonDetail(lessonId)
  - completeLesson(userId, lessonId)

---

## 10. Herramientas Financieras (8 pantallas)

### MarketInfo

Archivo: src/screens/MarketInfoScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/MarketInfoScreen.tsx
Navegación: MarketInfo
Estado: Activa
Endpoints:
  - getMarketData()
  - getStockInfo(symbol)

---

### Promotions

Archivo: src/screens/PromotionsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/PromotionsScreen.tsx
Navegación: Promotions
Estado: Activa
Endpoints:
  - getPromotions(limit, offset)
  - getPromotionDetail(promotionId)

---

### PromotionDetail

Archivo: src/screens/PromotionDetailScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/PromotionDetailScreen.tsx
Navegación: PromotionDetail
Estado: Activa
Endpoints:
  - getPromotionDetail(promotionId)

---

### Herramientas

Archivo: src/screens/HerramientasScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/HerramientasScreen.tsx
Navegación: Herramientas
Estado: Activa
Endpoints: Ninguno

---

### Inversionista

Archivo: src/screens/InversionistaScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/InversionistaScreen.tsx
Navegación: Inversionista
Estado: Activa
Endpoints: Ninguno

---

### PlanificadorFinanciero

Archivo: src/screens/PlanificadorFinancieroScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/PlanificadorFinancieroScreen.tsx
Navegación: PlanificadorFinanciero
Estado: Activa
Endpoints: Ninguno

---

### CazaHormigas

Archivo: src/screens/CazaHormigasScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CazaHormigasScreen.tsx
Navegación: CazaHormigas
Estado: Activa
Endpoints: Ninguno

---

### ReportesAvanzados

Archivo: src/screens/ReportesAvanzadosScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/ReportesAvanzadosScreen.tsx
Navegación: ReportesAvanzados
Estado: Activa
Endpoints: Ninguno

---

## 11. Herramientas Especiales (3 pantallas)

### InvestmentSimulator

Archivo: src/screens/InvestmentSimulatorScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/InvestmentSimulatorScreen.tsx
Navegación: InvestmentSimulator
Estado: Activa
Endpoints:
  - calculateSimulation(params)
  - processPayment(userId, amount)

---

### IRIChat

Archivo: src/screens/IRIChatScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/IRIChatScreen.tsx
Navegación: IRIChat
Estado: Activa
Endpoints:
  - getIRIChatMessages(userId)
  - sendIRIMessage(userId, message)

---

### SupportTicket

Archivo: src/screens/SupportTicketScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/SupportTicketScreen.tsx
Navegación: SupportTicket
Estado: Activa
Endpoints:
  - createTicket(userId, {title, description, priority})
  - getTickets(userId)
  - uploadAttachment(ticketId, file)

---

Continúa en PROYECTO_SCRUM_PROFESIONAL_PARTE2.md
