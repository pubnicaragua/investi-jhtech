# 📱 División de Pantallas para Testing - Investi App

## 🎯 Flujo Principal de la Aplicación

Basándome en la navegación (`navigation.tsx`), aquí está el flujo completo dividido en **dos mitades** para que cada desarrollador pruebe una parte:

---

## 👨‍💻 **MITAD 1 - GABRIEL** (Flujo de Autenticación + Onboarding)

### **1. Pantallas de Autenticación y Setup**
- ✅ **LanguageSelection** - Selección de idioma
- ✅ **Welcome** - Pantalla de bienvenida
- ✅ **SignIn** - Inicio de sesión (OAuth incluido)
- ✅ **SignUp** - Registro (OAuth incluido)
- ✅ **AuthCallback** - Callback de OAuth

### **2. Onboarding Inicial**
- ✅ **UploadAvatar** - Subir foto de perfil
- ✅ **PickGoals** - Seleccionar objetivos
- ✅ **PickInterests** - Seleccionar intereses
- ✅ **PickKnowledge** - Nivel de conocimiento
- ✅ **InvestmentKnowledge** - Conocimiento específico
- ✅ **CommunityRecommendations** - Recomendaciones de comunidades

### **3. Pantalla Principal**
- ✅ **HomeFeed** - Feed principal (posts, noticias, etc.)

---

## 👨‍💻 **MITAD 2 - DESARROLLADOR CUBANO** (Funcionalidades Avanzadas)

### **4. Sistema de Posts y Contenido**
- ✅ **CreatePost** - Crear publicación
- ✅ **CreateCommunityPost** - Crear post en comunidad
- ✅ **PostDetail** - Detalle de publicación
- ✅ **CommunityPostDetail** - Detalle de post comunitario
- ✅ **VideoPlayer** - Reproductor de videos
- ✅ **SharePost** - Compartir publicación
- ✅ **SavedPosts** - Posts guardados

### **5. Comunidades**
- ✅ **Communities** - Lista de comunidades
- ✅ **CommunityDetail** - Detalle de comunidad
- ✅ **CommunitySettings** - Configuración de comunidad
- ✅ **CommunityMembers** - Miembros de comunidad
- ✅ **EditCommunity** - Editar comunidad
- ✅ **CreateCommunity** - Crear comunidad

### **6. Perfiles y Social**
- ✅ **Profile** - Perfil de usuario
- ✅ **EditProfile** - Editar perfil
- ✅ **Followers** - Seguidores
- ✅ **Following** - Siguiendo
- ✅ **Settings** - Configuraciones

### **7. Chat y Mensajería**
- ✅ **ChatList** - Lista de chats
- ✅ **ChatScreen** - Pantalla de chat individual
- ✅ **NewMessageScreen** - Nuevo mensaje
- ✅ **GroupChat** - Chat grupal
- ✅ **Messages** - Mensajes

### **8. Notificaciones**
- ✅ **Notifications** - Centro de notificaciones

### **9. Contenido y Educación**
- ✅ **News** - Noticias
- ✅ **NewsDetail** - Detalle de noticia
- ✅ **Educacion** - Educación financiera
- ✅ **CourseDetail** - Detalle de curso
- ✅ **LearningPaths** - Rutas de aprendizaje

### **10. Herramientas Financieras**
- ✅ **MarketInfo** - Información de mercado
- ✅ **Promotions** - Promociones
- ✅ **PromotionDetail** - Detalle de promoción
- ✅ **Inversiones** - Inversiones
- ✅ **Inversionista** - Perfil de inversionista
- ✅ **PlanificadorFinanciero** - Planificador financiero
- ✅ **CazaHormigas** - Ahorro (Caza Hormigas)
- ✅ **ReportesAvanzados** - Reportes avanzados

### **11. Herramientas de Pago**
- ✅ **Payment** - Pantalla de pagos

### **12. Chat con IA**
- ✅ **IRIChatScreen** - Chat con IA (IRI)

---

## 📋 **Instrucciones para Testing**

### **Para cada pantalla probar:**

1. **✅ Navegación** - ¿Se puede llegar desde el menú?
2. **✅ Funcionalidad** - ¿Todos los botones funcionan?
3. **✅ Inputs** - ¿Campos de texto, dropdowns, etc.?
4. **✅ API calls** - ¿Se conecta correctamente a Supabase?
5. **✅ UI/UX** - ¿Se ve bien? ¿Responsive?
6. **✅ Error handling** - ¿Maneja errores correctamente?
7. **✅ Loading states** - ¿Muestra loading correctamente?

### **Casos especiales:**
- **OAuth**: Probar Google, Facebook (si funciona), LinkedIn
- **Deep linking**: Probar URLs de callback
- **Onboarding**: Completar flujo completo
- **Comunidades**: Crear, editar, unirse
- **Chat**: Enviar mensajes, crear grupos
- **Pagos**: Si aplica

---

## 📊 **Distribución de Trabajo**

| Desarrollador | Pantallas | Complejidad |
|---------------|-----------|-------------|
| **Gabriel** | 12 pantallas | Media (autenticación + onboarding) |
| **Cubano** | 35+ pantallas | Alta (funcionalidades avanzadas) |

---

## 🎯 **Prioridades por Mitad**

### **Gabriel (Mitad 1) - CRÍTICO**
1. **Autenticación completa** (SignIn/SignUp con OAuth)
2. **Onboarding funcional** (hasta HomeFeed)
3. **Deep linking** (URLs de callback)

### **Cubano (Mitad 2) - IMPORTANTE**
1. **Sistema de posts** (crear, ver, compartir)
2. **Comunidades** (crear, gestionar)
3. **Chat y mensajería**
4. **Herramientas financieras**

---

## 📱 **Flujo de Testing Recomendado**

### **Gabriel:**
1. LanguageSelection → Welcome → SignIn/SignUp → AuthCallback
2. UploadAvatar → PickGoals → PickInterests → PickKnowledge → CommunityRecommendations → HomeFeed

### **Cubano:**
1. HomeFeed → CreatePost → Communities → Profile
2. ChatList → Settings → Educacion → Inversiones

---

## ⚡ **Tiempo Estimado**

- **Gabriel**: 45-60 minutos (autenticación + onboarding)
- **Cubano**: 90-120 minutos (funcionalidades complejas)

**Total**: ~2-3 horas para testing completo

---

## 📸 **Capturas de Pantalla**

Para cada pantalla probada, tomar:
1. **Screenshot de la pantalla principal**
2. **Screenshot de cualquier modal/popup**
3. **Screenshot de errores si ocurren**
4. **Nota del resultado** (✅ Funciona / ❌ Error / ⚠️ Problema menor)

---

## 🚨 **Problemas Comunes a Buscar**

- **Deep linking no funciona** (OAuth callbacks)
- **API calls fallan** (conexión a Supabase)
- **Estados de loading infinitos**
- **Navegación rota** entre pantallas
- **Inputs no guardan** datos
- **UI se rompe** en diferentes dispositivos

---

**¡Éxito con el testing!** 🚀
