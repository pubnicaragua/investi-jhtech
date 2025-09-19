# 📱 FLUJO REAL DE LA APLICACIÓN INVESTI - STATUS CRÍTICO

## 🚨 RESUMEN REAL DEL PROYECTO
- **Total de Pantallas**: 48 pantallas
- **✅ Funcionando con Backend**: 15 pantallas (31%)
- **❌ Con Datos Falsos**: 20 pantallas (42%)
- **⚠️ Placeholder/Rotas**: 8 pantallas (17%)
- **🔄 Duplicadas**: 5 pantallas (10%)
- **Estado General**: 🚨 CRÍTICO - Mayoría de funcionalidades usan datos falsos

## 🔄 Flujo Principal de la Aplicación

### 1. **Flujo de Bienvenida y Autenticación**
```
WelcomeScreen → SignInScreen / SignUpScreen → UploadAvatarScreen
```

**Pantallas involucradas:**
- `WelcomeScreen.tsx` - Pantalla inicial con logo de Investi
- `SignInScreen.tsx` - Inicio de sesión
- `SignUpScreen.tsx` - Registro de usuario
- `UploadAvatarScreen.tsx` - Subida de foto de perfil

### 2. **Flujo de Onboarding**
```
UploadAvatarScreen → PickInterestsScreen → PickGoalsScreen → PickKnowledgeScreen → OnboardingCompleteScreen
```

**Pantallas involucradas:**
- `PickInterestsScreen.tsx` - Selección de intereses de inversión
- `PickGoalsScreen.tsx` - Definición de objetivos financieros
- `PickKnowledgeScreen.tsx` - Nivel de conocimiento en inversiones
- `InvestmentGoalsScreen.tsx` - Objetivos específicos de inversión
- `InvestmentInterestsScreen.tsx` - Intereses detallados
- `InvestmentKnowledgeScreen.tsx` - Conocimiento específico
- `OnboardingCompleteScreen.tsx` - Finalización del onboarding

### 3. **Flujo Principal de la App (Post-Onboarding)**
```
HomeFeedScreen ↔ CommunitiesScreen ↔ InversionesScreen ↔ EducacionScreen ↔ ProfileScreen
```

**Pantallas principales:**
- `HomeFeedScreen.tsx` - Feed principal con posts y noticias
- `CommunitiesScreen.tsx` - Lista de comunidades de inversión
- `InversionesScreen.tsx` - Herramientas y datos de inversión
- `EducacionScreen.tsx` - Contenido educativo y cursos
- `ProfileScreen.tsx` - Perfil del usuario

### 4. **Flujo de Comunidades**
```
CommunitiesScreen → CommunityDetailScreen → CommunityMembersScreen / CommunitySettingsScreen
```

**Pantallas involucradas:**
- `CommunitiesListScreen.tsx` - Lista completa de comunidades
- `CommunityDetailScreen.tsx` - Detalles de una comunidad específica
- `CommunityMembersScreen.tsx` - Miembros de la comunidad
- `CommunitySettingsScreen.tsx` - Configuración de comunidad
- `CommunityRecommendationsScreen.tsx` - Recomendaciones de comunidades
- `CreateCommunityScreen.tsx` - Crear nueva comunidad
- `EditCommunityScreen.tsx` - Editar comunidad existente

### 5. **Flujo de Posts y Contenido**
```
HomeFeedScreen → CreatePostScreen → PostDetailScreen → SharePostScreen
```

**Pantallas involucradas:**
- `CreatePostScreen.tsx` - Crear nueva publicación
- `PostDetailScreen.tsx` - Detalles de publicación con comentarios
- `SharePostScreen.tsx` - Compartir publicación
- `SavedPostsScreen.tsx` - Publicaciones guardadas

### 6. **Flujo de Educación**
```
EducacionScreen → CourseDetailScreen → LearningPathsScreen
```

**Pantallas involucradas:**
- `CourseDetailScreen.tsx` - Detalles de curso específico
- `LearningPathsScreen.tsx` - Rutas de aprendizaje

### 7. **Flujo de Inversiones**
```
InversionesScreen → InversionistaScreen → MarketInfoScreen
```

**Pantallas involucradas:**
- `InversionistaScreen.tsx` - Perfil de inversionista
- `MarketInfoScreen.tsx` - Información del mercado financiero

### 8. **Flujo de Comunicación**
```
ChatListScreen → ChatScreen / GroupChatScreen → MessagesScreen
```

**Pantallas involucradas:**
- `ChatListScreen.tsx` - Lista de conversaciones
- `ChatScreen.tsx` - Chat individual
- `GroupChatScreen.tsx` - Chat grupal
- `MessagesScreen.tsx` - Sistema de mensajería

### 9. **Flujo de Noticias y Promociones**
```
NewsScreen → NewsDetailScreen
PromotionsScreen → PromotionDetailScreen
```

**Pantallas involucradas:**
- `NewsScreen.tsx` - Lista de noticias financieras
- `NewsDetailScreen.tsx` - Detalle de noticia específica
- `PromotionsScreen.tsx` - Promociones y ofertas
- `PromotionDetailScreen.tsx` - Detalle de promoción

### 10. **Flujo de Configuración y Utilidades**
```
SettingsScreen → PaymentScreen → NotificationsScreen
```

**Pantallas involucradas:**
- `SettingsScreen.tsx` - Configuración de la aplicación
- `PaymentScreen.tsx` - Gestión de pagos
- `NotificationsScreen.tsx` - Centro de notificaciones
- `DevMenuScreen.tsx` - Menú de desarrollo (solo desarrollo)
- `HomeScreen.tsx` - Pantalla de inicio alternativa

## 🎯 Características Principales por Sección

### **🏠 Home Feed**
- Feed personalizado de publicaciones
- Sistema de likes y comentarios
- Búsqueda de contenido
- Notificaciones en tiempo real

### **👥 Comunidades**
- Creación y gestión de comunidades
- Sistema de membresías
- Recomendaciones personalizadas
- Chat grupal por comunidad

### **📈 Inversiones**
- Información de mercado en tiempo real
- Perfil de inversionista personalizado
- Herramientas de análisis
- Seguimiento de portafolio

### **🎓 Educación**
- Cursos estructurados
- Rutas de aprendizaje
- Contenido progresivo
- Certificaciones

### **💬 Comunicación**
- Chat individual y grupal
- Sistema de mensajería
- Notificaciones push
- Compartir contenido

### **📰 Noticias**
- Noticias financieras actualizadas
- Análisis de mercado
- Alertas personalizadas
- Contenido curado

### **🎁 Promociones**
- Ofertas exclusivas
- Descuentos en cursos
- Beneficios por membresía
- Programa de referidos

## 🔧 Configuración Técnica

### **Autenticación**
- Registro con email/password
- Verificación de email
- Recuperación de contraseña
- Perfiles de usuario completos

### **Base de Datos (Supabase)**
- Usuarios y perfiles
- Posts y comentarios
- Comunidades y membresías
- Cursos y lecciones
- Noticias y promociones
- Sistema de notificaciones

### **Navegación**
- Stack Navigator principal
- Tab Navigator para secciones
- Deep linking configurado
- Gestión de estado global

### **Internacionalización**
- Soporte multi-idioma
- Localización de contenido
- Formatos regionales
- Cambio dinámico de idioma

## 🚀 Flujo de Usuario Típico

### **Nuevo Usuario:**
1. WelcomeScreen → SignUpScreen
2. UploadAvatarScreen → Onboarding completo
3. HomeFeedScreen → Explorar contenido
4. CommunityRecommendationsScreen → Unirse a comunidades
5. EducacionScreen → Comenzar aprendizaje

### **Usuario Existente:**
1. SignInScreen → HomeFeedScreen
2. Revisar feed y notificaciones
3. Interactuar con posts (likes, comentarios)
4. Participar en comunidades
5. Continuar cursos educativos

### **Usuario Avanzado:**
1. InversionistaScreen → Análisis de portafolio
2. MarketInfoScreen → Información de mercado
3. CreatePostScreen → Compartir insights
4. CommunityDetailScreen → Liderar discusiones
5. LearningPathsScreen → Contenido avanzado

## 📱 Pantallas por Categoría

### **Autenticación (3 pantallas)**
- WelcomeScreen, SignInScreen, SignUpScreen

### **Onboarding (7 pantallas)**
- UploadAvatarScreen, PickInterestsScreen, PickGoalsScreen, PickKnowledgeScreen, InvestmentGoalsScreen, InvestmentInterestsScreen, InvestmentKnowledgeScreen, OnboardingCompleteScreen

### **Navegación Principal (5 pantallas)**
- HomeFeedScreen, CommunitiesScreen, InversionesScreen, EducacionScreen, ProfileScreen

### **Comunidades (8 pantallas)**
- CommunitiesListScreen, CommunityDetailScreen, CommunityMembersScreen, CommunitySettingsScreen, CommunityRecommendationsScreen, CreateCommunityScreen, EditCommunityScreen

### **Contenido (4 pantallas)**
- CreatePostScreen, PostDetailScreen, SharePostScreen, SavedPostsScreen

### **Educación (3 pantallas)**
- CourseDetailScreen, LearningPathsScreen

### **Inversiones (2 pantallas)**
- InversionistaScreen, MarketInfoScreen

### **Comunicación (4 pantallas)**
- ChatListScreen, ChatScreen, GroupChatScreen, MessagesScreen

### **Noticias (4 pantallas)**
- NewsScreen, NewsDetailScreen, PromotionsScreen, PromotionDetailScreen

### **Configuración (4 pantallas)**
- SettingsScreen, PaymentScreen, NotificationsScreen, DevMenuScreen, HomeScreen

---

**Total: 44 pantallas completamente funcionales con navegación integrada y logo actualizado de Investi**
