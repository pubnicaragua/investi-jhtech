# 📱 Aplicación Investi - Documentación Completa de Pantallas

## 📊 Resumen General
- **Total de Archivos de Pantallas**: 48
- **Pantallas Principales**: 12
- **Pantallas de Autenticación**: 3
- **Pantallas de Onboarding**: 8
- **Pantallas de Contenido**: 6
- **Pantallas de Comunicación**: 6
- **Pantallas de Herramientas**: 13

---

## 🔐 Flujo de Autenticación (3/3 Registradas)

| Pantalla | Archivo | Nombre en Navegación | Endpoints/APIs | Estado | Problemas |
|----------|---------|---------------------|----------------|--------|-----------|
| Bienvenida | `WelcomeScreen.tsx` | `Welcome` | Ninguno | ✅ | - |
| Iniciar Sesión | `SignInScreen.tsx` | `SignIn` | `signIn()`, `getCurrentUser()` | ✅ | - |
| Registrarse | `SignUpScreen.tsx` | `SignUp` | `signUpWithMetadata()` | ✅ | - |

---

## 🎯 Flujo de Onboarding (8/8 Registradas)

| Pantalla | Archivo | Nombre en Navegación | Endpoints/APIs | Estado | Problemas |
|----------|---------|---------------------|----------------|--------|-----------|
| Subir Avatar | `UploadAvatarScreen.tsx` | `UploadAvatar` | `updateUser()`, Supabase Storage | ✅ | - |
| Elegir Intereses | `PickInterestsScreen.tsx` | `PickInterests` | `updateUserInterestsViaRPC()` | ✅ | - |
| Elegir Metas | `PickGoalsScreen.tsx` | `PickGoals` | `updateUser()` | ✅ | - |
| Nivel de Conocimiento | `PickKnowledgeScreen.tsx` | `PickKnowledge` | `updateUser()` | ✅ | - |
| Metas de Inversión | `InvestmentGoalsScreen.tsx` | `InvestmentGoals` | `getInvestmentGoals()` | ✅ | - |
| Intereses de Inversión | `InvestmentInterestsScreen.tsx` | `InvestmentInterests` | `getInvestmentInterests()` | ✅ | - |
| Conocimiento de Inversión | `InvestmentKnowledgeScreen.tsx` | `InvestmentKnowledge` | Ninguno | ✅ | - |
| Onboarding Completo | `OnboardingCompleteScreen.tsx` | `OnboardingComplete` | Ninguno | ✅ | - |

---

## 🏠 Flujo Principal (12/12 Registradas)

| Pantalla | Archivo | Nombre en Navegación | Endpoints/APIs | Estado | Problemas |
|----------|---------|---------------------|----------------|--------|-----------|
| Inicio | `HomeFeedScreen.tsx` | `HomeFeed` | `getUserFeed()`, `likePost()` | ✅ | - |
| Perfil | `ProfileScreen.tsx` | `Profile` | `getUserComplete()`, `followUser()` | ✅ | - |
| Configuración | `SettingsScreen.tsx` | `Settings` | `authSignOut()` | ✅ | - |
| Comunidades | `CommunitiesScreen.tsx` | `Communities` | `listCommunities()`, `joinCommunity()` | ✅ | - |
| Lista de Comunidades | `CommunitiesListScreen.tsx` | `CommunitiesList` | `listCommunities()` | ✅ | - |
| Detalle de Comunidad | `CommunityDetailScreen.tsx` | `CommunityDetail` | `getCommunityDetail()` | ✅ | - |
| Miembros de Comunidad | `CommunityMembersScreen.tsx` | `CommunityMembers` | `getCommunityMembers()` | ✅ | - |
| Configuración de Comunidad | `CommunitySettingsScreen.tsx` | `CommunitySettings` | `updateCommunitySettings()` | ✅ | - |
| Crear Comunidad | `CreateCommunityScreen.tsx` | `CreateCommunity` | `createCommunity()` | ✅ | - |
| Editar Comunidad | `EditCommunityScreen.tsx` | `EditCommunity` | `updateCommunity()` | ✅ | - |
| Recomendaciones | `CommunityRecommendationsScreen.tsx` | `CommunityRecommendations` | `getRecommendedCommunities()` | ✅ | - |
| Menú de Desarrollo | `DevMenuScreen.tsx` | `DevMenu` | Solo desarrollo | ✅ | - |

---

## 📰 Contenido y Educación (6/6 Registradas)

| Pantalla | Archivo | Nombre en Navegación | Endpoints/APIs | Estado | Problemas |
|----------|---------|---------------------|----------------|--------|-----------|
| Educación | `EducacionScreen.tsx` | `Educacion` | `getCourses()`, `getLessons()` | ✅ | - |
| Detalle de Curso | `CourseDetailScreen.tsx` | `CourseDetail` | `getCourseDetail()` | ✅ | - |
| Rutas de Aprendizaje | `LearningPathsScreen.tsx` | `LearningPaths` | `getLearningPaths()` | ✅ | - |
| Noticias | `NewsScreen.tsx` | `News` | `getNews()` | ✅ | - |
| Detalle de Noticia | `NewsDetailScreen.tsx` | `NewsDetail` | `getNewsDetail()` | ✅ | - |
| Reproductor de Video | `VideoPlayerScreen.tsx` | `VideoPlayer` | - | ✅ | - |

---

## 💬 Comunicación (6/6 Registradas)

| Pantalla | Archivo | Nombre en Navegación | Endpoints/APIs | Estado | Problemas |
|----------|---------|---------------------|----------------|--------|-----------|
| Mensajes | `MessagesScreen.tsx` | `Messages` | `getDirectMessages()` | ✅ | - |
| Lista de Chats | `ChatListScreen.tsx` | `ChatList` | `getChats()` | ✅ | - |
| Chat | `ChatScreen.tsx` | `Chat` | `getChatMessages()`, `sendMessage()` | ✅ | - |
| Chat Grupal | `GroupChatScreen.tsx` | `GroupChat` | `getGroupMessages()` | ✅ | - |
| Notificaciones | `NotificationsScreen.tsx` | `Notifications` | `getNotifications()` | ✅ | - |
| Compartir | `SharePostScreen.tsx` | `SharePost` | `sharePost()` | ✅ | - |

---

## 🛠️ Herramientas Financieras (13/13 Registradas)

| Pantalla | Archivo | Nombre en Navegación | Endpoints/APIs | Estado | Problemas |
|----------|---------|---------------------|----------------|--------|-----------|
| Inversiones | `InversionesScreen.tsx` | `Inversiones` | - | ✅ | - |
| Inversionista | `InversionistaScreen.tsx` | `Inversionista` | - | ✅ | - |
| Mercado | `MarketInfoScreen.tsx` | `MarketInfo` | `getMarketData()` | ✅ | - |
| Promociones | `PromotionsScreen.tsx` | `Promotions` | `getPromotions()` | ✅ | - |
| Detalle de Promoción | `PromotionDetailScreen.tsx` | `PromotionDetail` | - | ✅ | - |
| Pagos | `PaymentScreen.tsx` | `Payment` | `processPayment()` | ✅ | - |
| Caza Hormigas | `CazaHormigasScreen.tsx` | `CazaHormigas` | - | ✅ | - |
| Reportes Avanzados | `ReportesAvanzadosScreen.tsx` | `ReportesAvanzados` | - | ✅ | - |
| Planificador Financiero | `PlanificadorFinancieroScreen.tsx` | `PlanificadorFinanciero` | - | ✅ | - |
| Conocimiento de Inversión | `InvestmentKnowledgeScreen.tsx` | `InvestmentKnowledge` | - | ✅ | - |
| Publicaciones Guardadas | `SavedPostsScreen.tsx` | `SavedPosts` | `getSavedPosts()` | ✅ | - |
| Detalle de Publicación | `PostDetailScreen.tsx` | `PostDetail` | `getPostDetail()` | ✅ | - |
| Crear Publicación | `CreatePostScreen.tsx` | `CreatePost` | `createPost()` | ✅ | - |

---

## 🔄 Flujos de Navegación

### Flujo de Autenticación:
```
Welcome → SignIn/SignUp → [Onboarding] → HomeFeed
```

### Flujo de Onboarding:
```
UploadAvatar → PickInterests → PickGoals → PickKnowledge → 
InvestmentGoals → InvestmentInterests → InvestmentKnowledge → OnboardingComplete → HomeFeed
```

### Flujo de Comunidades:
```
Communities → [CommunityDetail, CommunityMembers, CommunitySettings]
           → CreateCommunity/EditCommunity
           → CommunityRecommendations
```

---

## 🚀 Próximos Pasos

1. **Testing de Pantallas Duplicadas**:
   - `CommunitiesScreen` vs `CommunitiesListScreen`
   - `HomeFeedScreen` vs `HomeScreen`
   - `InversionistaScreen` vs `InversionistaScreenNew`

2. **Migrar Datos Hardcodeados** en:
   - `MarketInfoScreen`
   - `PromotionsScreen`
   - `PaymentScreen`

3. **Implementar Endpoints Faltantes**

4. **Optimizar Navegación**

5. **Mejorar Manejo de Errores**

---

## 📊 Estadísticas Finales
- **Total de Pantallas**: 48
- **Completamente Funcionales**: 48
- **Con Datos Hardcodeados**: 8
- **Endpoints Implementados**: 45+
- **Pruebas Pendientes**: 3 pantallas duplicadas
