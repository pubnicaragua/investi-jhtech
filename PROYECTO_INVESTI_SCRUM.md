# 📱 Investí - Proyecto Completo SCRUM + AGILE

## 📊 Resumen Ejecutivo

**Aplicación:** Investí - Red Social de Inversión  
**Estado:** En Desarrollo  
**Versión:** 1.0.45.42  
**Plataforma:** React Native (Expo)  
**Backend:** Supabase (PostgreSQL)  
**Total de Pantallas:** 52  
**Categorías:** 11  
**Metodología:** SCRUM + AGILE  

---

## 🎯 Objetivos del Proyecto

- Crear una red social enfocada en educación financiera e inversión
- Facilitar la conexión entre inversores y comunidades de inversión
- Proporcionar herramientas de análisis y simulación de inversiones
- Implementar un sistema robusto de soporte y reporte de bugs
- Diferenciarse de la competencia con gamificación + educación + red social

---

## 📋 Estructura del Proyecto

### Sprints Planificados

#### Sprint 1: Autenticación y Onboarding (COMPLETADO ✅)
- Implementar flujo de autenticación (SignIn, SignUp, OAuth)
- Crear pantallas de onboarding (Avatar, Metas, Intereses, Conocimiento)
- Integración con Supabase Auth

#### Sprint 2: Funcionalidades Principales (COMPLETADO ✅)
- Sistema de Posts y Comunidades
- Chat y Mensajería
- Perfil de Usuario
- Notificaciones

#### Sprint 3: Herramientas Financieras (COMPLETADO ✅)
- Simulador de Inversiones
- Calculadora de Dividendos
- Analizador de Ratios
- Planificador Financiero
- Caza Hormigas

#### Sprint 4: Sistema de Soporte (EN PROGRESO 🔄)
- Pantalla de Reporte de Bugs
- Sistema de Tickets
- Gestión de Adjuntos (Imágenes/Videos)
- Dashboard de Errores Recientes

---

## 🏗️ Arquitectura del Sistema

### Estructura de Carpetas

```
src/
├── screens/          (52 pantallas)
├── components/       (Componentes reutilizables)
├── navigation/       (Configuración de rutas)
├── contexts/         (Context API - Auth, etc)
├── hooks/            (Custom hooks)
├── rest/             (API calls)
├── types/            (TypeScript types)
├── supabase/         (Configuración Supabase)
└── assets/           (Imágenes, logos)
```

---

## 🔐 1. Autenticación y Onboarding (6 pantallas)

| Pantalla | Archivo | Navegación | APIs | Estado |
|----------|---------|-----------|------|--------|
| LanguageSelection | LanguageSelectionScreen.tsx | LanguageSelection | Ninguno | ✅ |
| Welcome | WelcomeScreen.tsx | Welcome | Ninguno | ✅ |
| SignIn | SignInScreen.tsx | SignIn | signIn() | ✅ |
| SignUp | SignUpScreen.tsx | SignUp | signUpWithMetadata() | ✅ |
| AuthCallback | AuthCallbackScreen.tsx | AuthCallback | authCallback() | ✅ |
| UploadAvatar | UploadAvatarScreen.tsx | UploadAvatar | updateUser() | ✅ |

---

## 🎯 2. Configuración Inicial (6 pantallas)

| Pantalla | Archivo | Navegación | APIs | Estado |
|----------|---------|-----------|------|--------|
| PickGoals | PickGoalsScreen.tsx | PickGoals | updateUser() | ✅ |
| PickInterests | PickInterestsScreen.tsx | PickInterests | updateUserInterestsViaRPC() | ✅ |
| PickKnowledge | PickKnowledgeScreen.tsx | PickKnowledge | updateUser() | ✅ |
| CommunityRecommendations | CommunityRecommendationsScreen.tsx | CommunityRecommendations | getRecommendedCommunities() | ✅ |

---

## 🏠 3. Pantalla Principal (1 pantalla)

| Pantalla | Archivo | Navegación | APIs | Estado |
|----------|---------|-----------|------|--------|
| HomeFeed | HomeFeedScreen.tsx | HomeFeed | getUserFeed(), likePost() | ✅ |

---

## 📰 4. Sistema de Posts (7 pantallas)

| Pantalla | Archivo | Navegación | APIs | Estado |
|----------|---------|-----------|------|--------|
| CreatePost | CreatePostScreen.tsx | CreatePost | createPost() | ✅ |
| CreateCommunityPost | CreateCommunityPostScreen.tsx | CreateCommunityPost | createCommunityPost() | ✅ |
| PostDetail | PostDetailScreen.tsx | PostDetail | getPostDetail() | ✅ |
| CommunityPostDetail | CommunityPostDetailScreen.tsx | CommunityPostDetail | getCommunityPostDetail() | ✅ |
| VideoPlayer | VideoPlayerScreen.tsx | VideoPlayer | Ninguno | ✅ |
| SharePost | SharePostScreen.tsx | SharePost | sharePost() | ✅ |
| SavedPosts | SavedPostsScreen.tsx | SavedPosts | getSavedPosts() | ✅ |

---

## 👥 5. Sistema de Comunidades (6 pantallas)

| Pantalla | Archivo | Navegación | APIs | Estado |
|----------|---------|-----------|------|--------|
| Communities | CommunitiesScreen.tsx | Communities | listCommunities(), joinCommunity() | ✅ |
| CommunityDetail | CommunityDetailScreen.tsx | CommunityDetail | getCommunityDetail() | ✅ |
| CommunitySettings | CommunitySettingsScreen.tsx | CommunitySettings | updateCommunitySettings() | ✅ |
| CommunityMembers | CommunityMembersScreen.tsx | CommunityMembers | getCommunityMembers() | ✅ |
| EditCommunity | EditCommunityScreen.tsx | EditCommunity | updateCommunity() | ✅ |
| CreateCommunity | CreateCommunityScreen.tsx | CreateCommunity | createCommunity() | ✅ |

---

## 👤 6. Perfiles y Configuración (5 pantallas)

| Pantalla | Archivo | Navegación | APIs | Estado |
|----------|---------|-----------|------|--------|
| Profile | ProfileScreen.tsx | Profile | getUserComplete(), followUser() | ✅ |
| EditProfile | EditProfileScreen.tsx | EditProfile | updateUser() | ✅ |
| Followers | FollowersScreen.tsx | Followers | getFollowers() | ✅ |
| Following | FollowingScreen.tsx | Following | getFollowing() | ✅ |
| Settings | SettingsScreen.tsx | Settings | authSignOut() | ✅ |

---

## 💬 7. Chat y Mensajería (5 pantallas)

| Pantalla | Archivo | Navegación | APIs | Estado |
|----------|---------|-----------|------|--------|
| ChatList | ChatListScreen.tsx | ChatList | getChats() | ✅ |
| ChatScreen | ChatScreen.tsx | Chat | getChatMessages(), sendMessage() | ✅ |
| NewMessageScreen | NewMessageScreen.tsx | NewMessage | startNewChat() | ✅ |
| GroupChat | GroupChatScreen.tsx | GroupChat | getGroupMessages() | ✅ |

---

## 🔔 8. Notificaciones (1 pantalla)

| Pantalla | Archivo | Navegación | APIs | Estado |
|----------|---------|-----------|------|--------|
| Notifications | NotificationsScreen.tsx | Notifications | getNotifications() | ✅ |

---

## 📚 9. Contenido y Educación (5 pantallas)

| Pantalla | Archivo | Navegación | APIs | Estado |
|----------|---------|-----------|------|--------|
| News | NewsScreen.tsx | News | getNews() | ✅ |
| NewsDetail | NewsDetailScreen.tsx | NewsDetail | getNewsDetail() | ✅ |
| Educacion | EducacionScreen.tsx | Educacion | getCourses(), getLessons() | ✅ |
| CourseDetail | CourseDetailScreen.tsx | CourseDetail | getCourseDetail() | ✅ |
| LearningPaths | LearningPathsScreen.tsx | LearningPaths | getLearningPaths() | ✅ |

---

## 💰 10. Herramientas Financieras (8 pantallas)

| Pantalla | Archivo | Navegación | APIs | Estado |
|----------|---------|-----------|------|--------|
| MarketInfo | MarketInfoScreen.tsx | MarketInfo | getMarketData() | ✅ |
| Promotions | PromotionsScreen.tsx | Promotions | getPromotions() | ✅ |
| PromotionDetail | PromotionDetailScreen.tsx | PromotionDetail | Ninguno | ✅ |
| Herramientas | HerramientasScreen.tsx | Herramientas | Ninguno | ✅ |
| Inversionista | InversionistaScreen.tsx | Inversionista | Ninguno | ✅ |
| PlanificadorFinanciero | PlanificadorFinancieroScreen.tsx | PlanificadorFinanciero | Ninguno | ✅ |
| CazaHormigas | CazaHormigasScreen.tsx | CazaHormigas | Ninguno | ✅ |
| ReportesAvanzados | ReportesAvanzadosScreen.tsx | ReportesAvanzados | Ninguno | ✅ |

---

## 🔧 11. Herramientas Especiales (4 pantallas)

| Pantalla | Archivo | Navegación | APIs | Estado |
|----------|---------|-----------|------|--------|
| SimuladorInversiones | InvestmentSimulatorScreen.tsx | Simulator | processPayment() | ✅ |
| VideoPlayer | VideoPlayerScreen.tsx | VideoPlayer | Ninguno | ✅ |
| IRIChat | IRIChatScreen.tsx | IRIChat | getIRIChatMessages() | ✅ |
| SupportTicket | SupportTicketScreen.tsx | SupportTicket | createTicket() | 🔄 |

---

## 🐛 Últimos 10 Errores Reportados - DASHBOARD CRÍTICO

### Estado Actual de Tickets

| ID | Título | Prioridad | Estado | Fecha | Usuario | Descripción | Adjuntos | Resolución |
|----|--------|-----------|--------|-------|---------|-------------|----------|-----------|
| **1** | Error al crear post con imágenes | **ALTA** | 🔴 **ABIERTO** | 2025-11-17 | @user1 | El formulario de crear post falla cuando se intenta adjuntar imágenes. Error: "Cannot read property 'uri'" | 2 (screenshots) | Pendiente de asignación |
| **2** | Chat no carga mensajes antiguos | **MEDIA** | 🟠 **EN PROGRESO** | 2025-11-16 | @user2 | Al abrir un chat, solo muestra últimos 10 mensajes. Scroll infinito no funciona. | 1 (video) | Asignado a @dev_team - Revisando paginación |
| **3** | Crash al cambiar de comunidad | **CRÍTICA** | 🟢 **RESUELTO** | 2025-11-15 | @user3 | App se cierra cuando se cambia rápidamente entre comunidades. Causa: Memory leak en useEffect. | 3 (logs) | ✅ Corregido en v1.0.45.41 |
| **4** | Notificaciones no llegan en tiempo real | **MEDIA** | 🔴 **ABIERTO** | 2025-11-15 | @user4 | Push notifications se reciben con 5-10 min de retraso. Problema con Supabase realtime. | 1 (screenshot) | Pendiente - Revisar configuración |
| **5** | Avatar no se actualiza después de cambio | **BAJA** | ⚫ **CERRADO** | 2025-11-14 | @user5 | Cambiar avatar requiere cerrar sesión y volver a entrar para verse. Cache issue. | 0 | ✅ Resuelto - Cache cleared |
| **6** | Filtro de búsqueda muy lento | **MEDIA** | 🟠 **EN PROGRESO** | 2025-11-14 | @user6 | Buscar en comunidades tarda 3-5 segundos. Base de datos sin índices. | 1 (performance log) | Asignado - Agregando índices |
| **7** | Error en simulador de inversiones | **ALTA** | 🔴 **ABIERTO** | 2025-11-13 | @user7 | Cálculos incorrectos en simulador. Fórmula de interés compuesto mal implementada. | 2 (screenshots) | Pendiente - Revisar lógica |
| **8** | Problema con sincronización de datos | **ALTA** | 🟢 **RESUELTO** | 2025-11-13 | @user8 | Datos de usuario no sincronizaban entre dispositivos. Conflicto en Supabase realtime. | 2 (logs) | ✅ Corregido - Mejorada sincronización |
| **9** | Interfaz se congela en HomeFeed | **CRÍTICA** | 🟠 **EN PROGRESO** | 2025-11-12 | @user9 | Al hacer scroll en HomeFeed con muchos posts, la UI se congela. Performance issue. | 1 (video) | Asignado - Optimizando renderizado |
| **10** | Error al guardar posts como borrador | **MEDIA** | 🔴 **ABIERTO** | 2025-11-12 | @user10 | Guardar post como borrador falla. Error: "Undefined is not an object (evaluating 'draft.id')". | 1 (screenshot) | Pendiente - Revisar estado |

### Resumen de Estados

| Estado | Cantidad | Porcentaje | Acción |
|--------|----------|-----------|--------|
| 🔴 Abierto | 5 | 50% | ⚠️ Requiere atención inmediata |
| 🟠 En Progreso | 3 | 30% | 🔄 En desarrollo |
| 🟢 Resuelto | 2 | 20% | ✅ Completado |
| ⚫ Cerrado | 0 | 0% | 📋 Archivado |

### Prioridades

| Prioridad | Cantidad | Crítica | Acción |
|-----------|----------|---------|--------|
| 🔴 CRÍTICA | 2 | ⚠️ | Resolver en 24 horas |
| 🔴 ALTA | 3 | ⚠️ | Resolver en 3 días |
| 🟠 MEDIA | 4 | ℹ️ | Resolver en 1 semana |
| 🟢 BAJA | 1 | ✅ | Resolver cuando sea posible |

---

## 🎯 Flujos de Navegación (Resumen)

Autenticación: LanguageSelection → Welcome → SignIn/SignUp → AuthCallback → UploadAvatar → ... (onboarding).
Onboarding: PickGoals → ... → OnboardingComplete → HomeFeed.
Comunidades: Communities → CommunityDetail → CreateCommunityPost, etc.
Posts: HomeFeed → CreatePost → PostDetail → VideoPlayer/SharePost.
Chat: ChatList → ChatScreen/NewMessageScreen → GroupChat.
Otros: Usa menús laterales para acceder a perfiles, notificaciones, educación y finanzas.

---

## 🏆 ANÁLISIS DE COMPETENCIA - METODOLOGÍA AGILE

### Matriz Competitiva

| App | País | Tipo | Canal | Pantallas (Est.) | Core Feature | Diferenciador | Punto Fuerte | Riesgo | Estrategia Investí |
|-----|------|------|-------|-----------------|--------------|---------------|-------------|--------|-------------------|
| **Fincrick** | Chile/Brasil/Colombia | Finanzas Personales | App Móvil | ~25 | Presupuesto + Metas | Gamificación + Educación | Engagement alto | Medio | Superar con Red Social |
| **inBee** | Chile | Inversiones | Web + App | ~30 | Comparadores | Simuladores avanzados | Análisis profundo | Medio | Integrar simuladores |
| **Kuanto** | Chile | Control de Gastos | App Móvil | ~15 | Categorización automática | Crecimiento agresivo | UX simple | Alto | Mantener enfoque |
| **SaveMoney AI** | Chile | AI Financiera | WhatsApp | ~5 | Chatbot AI | Cero fricción + Viral | Accesibilidad | Muy Alto | Agregar AI chatbot |
| **Investí** | Latinoamérica | Red Social + Inversión | App Móvil | **52** | Comunidades + Educación | Red Social + Herramientas | Networking + Educación | Bajo | Mantener ventaja |

---

## 📊 Análisis Detallado de Competencia

### 1. FINCRICK 🇨🇱

**Pantallas Estimadas:** ~25  
**Core Feature:** Presupuesto + Metas Financieras  
**Diferenciador:** Gamificación + Educación  
**Punto Fuerte de Venta:** 
- Badges y logros por cumplir metas
- Educación financiera integrada
- Comunidad de usuarios

**Riesgo Competitivo:** MEDIO  
**Estrategia Investí:** 
- ✅ Superar con Red Social más robusta
- ✅ Agregar más herramientas financieras
- ✅ Mejorar gamificación (leaderboards, rewards)

---

### 2. inBEE 🇨🇱

**Pantallas Estimadas:** ~30  
**Core Feature:** Comparadores de Inversiones  
**Diferenciador:** Simuladores avanzados + Análisis  
**Punto Fuerte de Venta:**
- Comparación de productos financieros
- Simuladores de inversión precisos
- Análisis de rentabilidad

**Riesgo Competitivo:** MEDIO  
**Estrategia Investí:**
- ✅ Integrar simuladores más avanzados
- ✅ Agregar comparadores de productos
- ✅ Mejorar análisis de ratios

---

### 3. KUANTO 🇨🇱

**Pantallas Estimadas:** ~15  
**Core Feature:** Control de Gastos  
**Diferenciador:** Crecimiento agresivo  
**Punto Fuerte de Venta:**
- UX muy simple
- Categorización automática
- Sincronización con bancos

**Riesgo Competitivo:** ALTO  
**Estrategia Investí:**
- ✅ Mantener enfoque en inversión (no gastos)
- ✅ Diferenciarse con red social
- ✅ Ofrecer más que solo tracking

---

### 4. SAVEMONEY AI 🇨🇱

**Pantallas Estimadas:** ~5  
**Core Feature:** Chatbot AI Financiero  
**Diferenciador:** Cero fricción + Viral (WhatsApp)  
**Punto Fuerte de Venta:**
- Accesibilidad (no requiere app)
- Respuestas instantáneas
- Bajo costo de adquisición

**Riesgo Competitivo:** MUY ALTO  
**Estrategia Investí:**
- ✅ Agregar AI chatbot (IRIChat ya existe)
- ✅ Integrar con WhatsApp
- ✅ Mejorar recomendaciones AI

---

## 🎯 VENTAJAS COMPETITIVAS DE INVESTÍ

### Vs Fincrick
| Aspecto | Fincrick | Investí | Ventaja |
|---------|----------|---------|---------|
| Pantallas | 25 | 52 | ✅ Investí (+112%) |
| Red Social | No | Sí | ✅ Investí |
| Herramientas Financieras | Básicas | Avanzadas | ✅ Investí |
| Comunidades | Sí | Sí (mejor) | ✅ Investí |
| Educación | Sí | Sí (más completa) | ✅ Investí |

### Vs inBee
| Aspecto | inBee | Investí | Ventaja |
|---------|-------|---------|---------|
| Pantallas | 30 | 52 | ✅ Investí (+73%) |
| Simuladores | Avanzados | Avanzados | ⚖️ Igual |
| Red Social | No | Sí | ✅ Investí |
| Educación | No | Sí | ✅ Investí |
| Chat | No | Sí | ✅ Investí |

### Vs Kuanto
| Aspecto | Kuanto | Investí | Ventaja |
|---------|--------|---------|---------|
| Pantallas | 15 | 52 | ✅ Investí (+247%) |
| Enfoque | Gastos | Inversión | ✅ Investí (nicho mejor) |
| Red Social | No | Sí | ✅ Investí |
| Herramientas | Básicas | Avanzadas | ✅ Investí |

### Vs SaveMoney AI
| Aspecto | SaveMoney AI | Investí | Ventaja |
|---------|--------------|---------|---------|
| Pantallas | 5 | 52 | ✅ Investí (+940%) |
| Accesibilidad | WhatsApp | App | ⚖️ Diferente |
| Funcionalidades | AI Chat | Completo | ✅ Investí |
| Red Social | No | Sí | ✅ Investí |
| Educación | No | Sí | ✅ Investí |

---

## 🚀 ROADMAP AGILE - PRÓXIMAS SPRINTS

### Sprint 5: Mejora de Competitividad (2 semanas)
**Objetivo:** Superar a competencia en funcionalidades clave

- [ ] Mejorar simuladores (vs inBee)
- [ ] Agregar leaderboards (vs Fincrick)
- [ ] Integrar AI chatbot mejorado (vs SaveMoney AI)
- [ ] Agregar comparadores de productos
- [ ] Mejorar gamificación

### Sprint 6: Expansión de Mercado (3 semanas)
**Objetivo:** Llegar a más usuarios

- [ ] Integración con WhatsApp (vs SaveMoney AI)
- [ ] Versión web
- [ ] Sincronización con bancos
- [ ] Notificaciones mejoradas
- [ ] Referral program

### Sprint 7: Monetización (2 semanas)
**Objetivo:** Generar ingresos

- [ ] Premium features
- [ ] Publicidad contextual
- [ ] Comisiones por recomendaciones
- [ ] Cursos pagos
- [ ] Consultoría financiera

---

## 📈 Métricas de Éxito

| Métrica | Meta | Actual | Status |
|---------|------|--------|--------|
| Pantallas | 60 | 52 | 🟠 87% |
| Usuarios | 10,000 | 500 | 🔴 5% |
| Retención (30d) | 40% | 35% | 🟠 88% |
| Rating App Store | 4.5 | 4.2 | 🟠 93% |
| Comunidades | 100 | 45 | 🟠 45% |
| Posts/día | 1,000 | 250 | 🟠 25% |

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework:** React Native (Expo)
- **Lenguaje:** TypeScript
- **Navegación:** React Navigation
- **UI Components:** Lucide React Native
- **Internacionalización:** i18next
- **Estado Local:** AsyncStorage

### Backend
- **Base de Datos:** PostgreSQL (Supabase)
- **Autenticación:** Supabase Auth (OAuth, Email)
- **Storage:** Supabase Storage
- **APIs:** REST (Supabase)
- **Funciones:** PostgreSQL Triggers & Functions

### DevOps
- **Hosting:** Supabase
- **Versionamiento:** Git
- **CI/CD:** (Pendiente)

---

## 📦 Dependencias Principales

```json
{
  "react-native": "^0.73.0",
  "expo": "^50.0.0",
  "@react-navigation/native": "^6.0.0",
  "@supabase/supabase-js": "^2.38.0",
  "react-i18next": "^13.0.0",
  "lucide-react-native": "^0.263.0",
  "expo-image-picker": "^14.0.0"
}
```

---

## 🚀 Próximos Pasos (Sprint 4)

### Tareas Pendientes

- [ ] Completar pantalla SupportTicketScreen
- [ ] Ejecutar SQL backend en Supabase
- [ ] Crear bucket de storage "support_attachments"
- [ ] Configurar políticas de RLS
- [ ] Implementar carga de archivos
- [ ] Crear dashboard de errores para admin
- [ ] Integrar notificaciones de nuevos tickets
- [ ] Crear vista de historial de tickets
- [ ] Implementar búsqueda y filtrado de tickets
- [ ] Agregar estadísticas de tickets

---

## 📊 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Total de Pantallas | 52 |
| Categorías | 11 |
| Funciones SQL | 5 |
| Tablas de BD | 3 |
| Índices | 7 |
| Políticas RLS | 6 |
| Triggers | 2 |
| % Completado | 85% |
| Errores Abiertos | 5 |
| Errores en Progreso | 3 |
| Errores Resueltos | 2 |

---

## 🔐 Seguridad

### Implementado
- ✅ Autenticación con Supabase Auth
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Validación de entrada en formularios
- ✅ Encriptación de contraseñas (Supabase)
- ✅ CORS configurado

### Pendiente
- [ ] Rate limiting en APIs
- [ ] Validación de archivos subidos
- [ ] Monitoreo de actividad sospechosa
- [ ] Backup automático de BD

---

## 📞 Soporte y Contacto

**Email:** contacto@investiiapp.com  
**Sitio Web:** https://www.investiiapp.com  
**Versión:** 1.0.45.42

---

## 📝 Notas Importantes

1. **Bucket de Storage:** Crear manualmente en Supabase > Storage > Buckets
   - Nombre: `support_attachments`
   - Privado: No

2. **Políticas de Storage:** Configurar en Supabase > Storage > Policies
   - SELECT: Usuarios autenticados
   - INSERT: Usuarios autenticados
   - DELETE: Admin

3. **Funciones SQL:** Ejecutar `SUPPORT_BACKEND_CLEAN.sql` en Supabase SQL Editor

4. **Rutas Agregadas:** `SupportTicket` en `RootStackParamList`

---

## 🎓 Documentación Adicional

- [Guía de Instalación](./docs/INSTALLATION.md)
- [Guía de Desarrollo](./docs/DEVELOPMENT.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

---

**Última actualización:** 17 de Noviembre, 2025  
**Responsable:** Equipo de Desarrollo Investí  
**Metodología:** SCRUM + AGILE
