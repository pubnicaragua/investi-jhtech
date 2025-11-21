# Investí - Pantallas Descartadas y No Activas

## Pantallas Descartadas (No en flujo de navegación)

### DebugStorage

Archivo: src/screens/DebugStorageScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/DebugStorageScreen.tsx
Navegación: DebugStorage
Estado: Descartada
Endpoints: Ninguno
Razón: Pantalla de debug para testing

---

### DevMenu

Archivo: src/screens/DevMenuScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/DevMenuScreen.tsx
Navegación: DevMenu
Estado: Descartada
Endpoints: Ninguno
Razón: Menú de desarrollo

---

### ForgotPassword

Archivo: src/screens/ForgotPasswordScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/ForgotPasswordScreen.tsx
Navegación: ForgotPassword
Estado: Descartada
Endpoints:
  - sendPasswordReset(email)
  - resetPassword(token, newPassword)
Razón: Funcionalidad no implementada

---

### EditInterests

Archivo: src/screens/EditInterestsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/EditInterestsScreen.tsx
Navegación: EditInterests
Estado: Descartada
Endpoints:
  - updateUserInterests(userId, interests)
Razón: Funcionalidad movida a Profile

---

### PendingRequests

Archivo: src/screens/PendingRequestsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/PendingRequestsScreen.tsx
Navegación: PendingRequests
Estado: Descartada
Endpoints:
  - getPendingRequests(communityId)
Razón: No implementada

---

### ManageModerators

Archivo: src/screens/ManageModeratorsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/ManageModeratorsScreen.tsx
Navegación: ManageModerators
Estado: Descartada
Endpoints:
  - getModerators(communityId)
  - addModerator(communityId, userId)
Razón: No implementada

---

### BlockedUsers

Archivo: src/screens/BlockedUsersScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/BlockedUsersScreen.tsx
Navegación: BlockedUsers
Estado: Descartada
Endpoints:
  - getBlockedUsers(userId)
  - unblockUser(userId, targetUserId)
Razón: No implementada

---

### MessagesScreen

Archivo: src/screens/MessagesScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/MessagesScreen.tsx
Navegación: Messages
Estado: Descartada
Endpoints: Ninguno
Razón: Reemplazada por ChatList

---

### CommunitiesListScreen

Archivo: src/screens/CommunitiesListScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CommunitiesListScreen.tsx
Navegación: CommunitiesList
Estado: Descartada
Endpoints: Ninguno
Razón: Reemplazada por Communities

---

### InvestmentKnowledgeScreen

Archivo: src/screens/InvestmentKnowledgeScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/InvestmentKnowledgeScreen.tsx
Navegación: InvestmentKnowledge
Estado: Descartada
Endpoints: Ninguno
Razón: Reemplazada por PickKnowledge

---

### InvestionsScreen

Archivo: src/screens/InvestionsScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/InvestionsScreen.tsx
Navegación: Inversiones
Estado: Descartada
Endpoints: Ninguno
Razón: Funcionalidad movida

---

### PaymentScreen

Archivo: src/screens/PaymentScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/PaymentScreen.tsx
Navegación: Payment
Estado: Descartada
Endpoints:
  - processPayment(userId, amount, method)
Razón: No implementada

---

### SimuladorJubilacionScreen

Archivo: src/screens/SimuladorJubilacionScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/SimuladorJubilacionScreen.tsx
Navegación: SimuladorJubilacion
Estado: Descartada
Endpoints: Ninguno
Razón: No implementada

---

### SimuladorPortafolioScreen

Archivo: src/screens/SimuladorPortafolioScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/SimuladorPortafolioScreen.tsx
Navegación: SimuladorPortafolio
Estado: Descartada
Endpoints: Ninguno
Razón: No implementada

---

### CalculadoraDividendosScreen

Archivo: src/screens/CalculadoraDividendosScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CalculadoraDividendosScreen.tsx
Navegación: CalculadoraDividendos
Estado: Descartada
Endpoints: Ninguno
Razón: No implementada

---

### CalculadoraInteresScreen

Archivo: src/screens/CalculadoraInteresScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/CalculadoraInteresScreen.tsx
Navegación: CalculadoraInteres
Estado: Descartada
Endpoints: Ninguno
Razón: No implementada

---

### AnalizadorRatiosScreen

Archivo: src/screens/AnalizadorRatiosScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/AnalizadorRatiosScreen.tsx
Navegación: AnalizadorRatios
Estado: Descartada
Endpoints: Ninguno
Razón: No implementada

---

### ComparadorInversionesScreen

Archivo: src/screens/ComparadorInversionesScreen.tsx
GitHub: https://github.com/pubnicaragua/investi-jhtech/blob/main/src/screens/ComparadorInversionesScreen.tsx
Navegación: ComparadorInversiones
Estado: Descartada
Endpoints: Ninguno
Razón: No implementada

---

## Resumen de Pantallas

Total de pantallas en proyecto: 52
Pantallas activas: 48
Pantallas descartadas: 4

Pantallas activas por categoría:
- Autenticación y Onboarding: 6
- Configuración Inicial: 4
- Pantalla Principal: 1
- Sistema de Posts: 7
- Sistema de Comunidades: 6
- Perfiles y Configuración: 5
- Chat y Mensajería: 5
- Notificaciones: 2
- Contenido y Educación: 6
- Herramientas Financieras: 8
- Herramientas Especiales: 3

Total: 53 pantallas (incluyendo descartadas)

---

## Flujos de Navegación Principales

Autenticación:
LanguageSelection -> Welcome -> SignIn/SignUp -> AuthCallback -> UploadAvatar

Onboarding:
UploadAvatar -> PickGoals -> PickInterests -> PickKnowledge -> CommunityRecommendations -> HomeFeed

Comunidades:
Communities -> CommunityDetail -> CreateCommunityPost / CommunitySettings / CommunityMembers

Posts:
HomeFeed -> CreatePost -> PostDetail -> VideoPlayer / SharePost / SavedPosts

Chat:
ChatList -> ChatScreen / NewMessageScreen -> GroupChat

Perfil:
Profile -> EditProfile / Followers / Following

Educación:
Educacion -> CourseDetail -> LessonDetail

Finanzas:
MarketInfo -> Promotions / Herramientas / CazaHormigas / ReportesAvanzados

Soporte:
Settings -> SupportTicket

---

## Tecnologías Utilizadas

Frontend:
- React Native (Expo)
- TypeScript
- React Navigation
- Lucide React Native
- i18next (internacionalización)
- AsyncStorage

Backend:
- Supabase (PostgreSQL)
- Supabase Auth (OAuth, Email)
- Supabase Storage
- REST APIs
- PostgreSQL Triggers & Functions

DevOps:
- GitHub (versionamiento)
- Supabase (hosting)

---

## Endpoints Principales por Categoría

Autenticación:
- signIn(email, password)
- signUpWithMetadata(email, password, metadata)
- authCallback(token)
- getCurrentUser()

Usuarios:
- updateUser(userId, data)
- getUserComplete(userId)
- getUserStats(userId)
- followUser(userId, targetUserId)
- unfollowUser(userId, targetUserId)

Posts:
- createPost(userId, data)
- getPostDetail(postId)
- likePost(userId, postId)
- unlikePost(userId, postId)
- getPostComments(postId)
- createComment(userId, postId, data)
- deletePost(userId, postId)

Comunidades:
- listCommunities(limit, offset)
- getCommunityDetail(communityId)
- createCommunity(userId, data)
- updateCommunity(communityId, data)
- joinCommunity(userId, communityId)
- leaveCommunity(userId, communityId)
- getCommunityMembers(communityId)

Chat:
- getChats(userId)
- getChatMessages(chatId)
- sendMessage(userId, chatId, data)
- startNewChat(userId, targetUserId)

Notificaciones:
- getNotifications(userId)
- markAsRead(notificationId)
- deleteNotification(notificationId)

Educación:
- getCourses(limit, offset)
- getCourseDetail(courseId)
- getLessons(courseId)
- getLessonDetail(lessonId)
- enrollCourse(userId, courseId)
- completeLesson(userId, lessonId)

Finanzas:
- getMarketData()
- getStockInfo(symbol)
- getPromotions(limit, offset)
- calculateSimulation(params)
- processPayment(userId, amount)

Soporte:
- createTicket(userId, data)
- getTickets(userId)
- uploadAttachment(ticketId, file)

---

## Métricas del Proyecto

Total de pantallas: 52
Categorías: 11
Funciones SQL: 5
Tablas de BD: 3
Índices: 7
Políticas RLS: 6
Triggers: 2
Porcentaje completado: 85%

---

## Estado de Desarrollo

Sprint 1 (Autenticación y Onboarding): Completado
Sprint 2 (Funcionalidades Principales): Completado
Sprint 3 (Herramientas Financieras): Completado
Sprint 4 (Sistema de Soporte): En progreso

Próximos sprints:
Sprint 5: Mejora de competitividad
Sprint 6: Expansión de mercado
Sprint 7: Monetización

---

Fin de documentación técnica del proyecto Investí
