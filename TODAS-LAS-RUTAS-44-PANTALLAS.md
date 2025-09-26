# 🚀 TODAS LAS 44 PANTALLAS - RUTAS COMPLETAS

## 📋 BASE URL: http://localhost:8081

---

## 1️⃣ **AUTENTICACIÓN Y ONBOARDING (8 pantallas)**
```
/language-selection          - LanguageSelectionScreen
/welcome                     - WelcomeScreen  
/signin                      - SignInScreen
/signup                      - SignUpScreen
/upload-avatar               - UploadAvatarScreen
/pick-goals                  - PickGoalsScreen
/pick-interests              - PickInterestsScreen
/pick-knowledge              - PickKnowledgeScreen
```

## 2️⃣ **PRINCIPALES Y NAVEGACIÓN (8 pantallas)**
```
/home                        - HomeFeedScreen
/create-post                 - CreatePostScreen
/post/:postId                - PostDetailScreen
/share-post                  - SharePostScreen
/saved-posts                 - SavedPostsScreen
/profile                     - ProfileScreen (propio)
/profile/:userId             - ProfileScreen (otros usuarios)
/settings                    - SettingsScreen
```

## 3️⃣ **COMUNIDADES (6 pantallas)**
```
/communities                 - CommunitiesScreen
/community/:communityId      - CommunityDetailScreen
/community-recommendations   - CommunityRecommendationsScreen
/community-members/:id       - CommunityMembersScreen
/edit-community/:id          - EditCommunityScreen
/create-community            - CreateCommunityScreen
```

## 4️⃣ **CHAT Y COMUNICACIÓN (5 pantallas)**
```
/chats                       - ChatListScreen
/chat/:chatId                - ChatScreen
/group-chat/:groupId         - GroupChatScreen
/messages                    - MessagesScreen (placeholder)
/notifications               - NotificationsScreen
```

## 5️⃣ **EDUCACIÓN Y CURSOS (4 pantallas)**
```
/educacion                   - EducacionScreen
/learning-paths              - LearningPathsScreen
/course/:courseId            - CourseDetailScreen
/video-player                - VideoPlayerScreen
```

## 6️⃣ **INVERSIONES Y FINANZAS (5 pantallas)**
```
/inversiones                 - InversionesScreen
/inversionista               - InversionistaScreen
/market-info                 - MarketInfoScreen
/planificador-financiero     - PlanificadorFinancieroScreen
/caza-hormigas               - CazaHormigasScreen
```

## 7️⃣ **NOTICIAS Y PROMOCIONES (4 pantallas)**
```
/news                        - NewsScreen
/news/:newsId                - NewsDetailScreen
/promotions                  - PromotionsScreen
/promotion/:promotionId      - PromotionDetailScreen
```

## 8️⃣ **HERRAMIENTAS Y UTILIDADES (4 pantallas)**
```
/payment                     - PaymentScreen
/reportes-avanzados          - ReportesAvanzadosScreen
/investment-knowledge        - InvestmentKnowledgeScreen
/onboarding-complete         - OnboardingCompleteScreen
```

## 9️⃣ **DESARROLLO (1 pantalla)**
```
/dev-menu                    - DevMenuScreen (solo desarrollo)
```

---

## 📊 **TOTAL: 44 PANTALLAS CONFIRMADAS**

### ✅ **ORDEN DE TESTING PRIORITARIO:**

#### **🔥 CRÍTICAS (Flujo principal):**
1. `/language-selection`
2. `/welcome`
3. `/signin`
4. `/home`
5. `/create-post`
6. `/communities`
7. `/profile`

#### **⚡ IMPORTANTES (Funcionalidades clave):**
8. `/post/123`
9. `/community/1`
10. `/chats`
11. `/notifications`
12. `/educacion`
13. `/inversiones`

#### **📋 SECUNDARIAS (Completar funcionalidad):**
14. `/pick-goals`
15. `/pick-interests`
16. `/pick-knowledge`
17. `/market-info`
18. `/news`
19. `/promotions`

#### **🛠️ AVANZADAS (Herramientas especiales):**
20. `/planificador-financiero`
21. `/caza-hormigas`
22. `/reportes-avanzados`
23. `/learning-paths`
24. `/course/1`

---

## 🎯 **COMANDO PARA PROBAR TODAS:**

```bash
# Iniciar servidor web
npx expo start --web --clear

# Luego probar cada URL manualmente:
# http://localhost:8081/[ruta]
```

---

## 📝 **CHECKLIST DE VALIDACIÓN:**

```
□ /language-selection
□ /welcome  
□ /signin
□ /signup
□ /upload-avatar
□ /pick-goals
□ /pick-interests
□ /pick-knowledge
□ /home
□ /create-post
□ /post/123
□ /share-post
□ /saved-posts
□ /profile
□ /profile/123
□ /settings
□ /communities
□ /community/1
□ /community-recommendations
□ /chats
□ /chat/1
□ /group-chat/1
□ /messages
□ /notifications
□ /educacion
□ /learning-paths
□ /course/1
□ /video-player
□ /inversiones
□ /inversionista
□ /market-info
□ /planificador-financiero
□ /caza-hormigas
□ /news
□ /news/1
□ /promotions
□ /promotion/1
□ /payment
□ /reportes-avanzados
□ /investment-knowledge
□ /onboarding-complete
□ /dev-menu
```

**TOTAL: 44 RUTAS PARA VALIDAR** ✅
