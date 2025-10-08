# 🧪 Rutas de Testing - Investi App

## 📱 Pantallas a Validar

### **Chat y Mensajería**
```
/chats                    → ChatListScreen (lista de conversaciones)
/chat/123                 → ChatScreen (chat 1:1 con usuario 123)
/group-chat/456           → GroupChatScreen (chat grupal 456)
/messages                 → MessagesScreen (bandeja de mensajes)
```

### **Comunidades**
```
/communities              → CommunitiesScreen (explorar comunidades)
/community/789            → CommunityDetailScreen (detalle de comunidad 789)
/community-recommendations → CommunityRecommendationsScreen (onboarding)
```

### **Inversiones**
```
/inversiones              → InversionesScreen (portfolio)
/inversionista            → InversionistaScreen (perfil inversionista)
```

### **Educación**
```
/educacion                → EducacionScreen (lista de cursos)
/course/101               → CourseDetailScreen (detalle de curso 101)
/learning-paths           → LearningPathsScreen (rutas de aprendizaje)
```

### **Onboarding**
```
/pick-knowledge           → PickKnowledgeScreen (seleccionar nivel)
/pick-goals               → PickGoalsScreen (seleccionar objetivos)
/pick-interests           → PickInterestsScreen (seleccionar intereses)
/upload-avatar            → UploadAvatarScreen (subir foto)
```

### **Otras Pantallas**
```
/home                     → HomeFeedScreen (feed principal)
/profile/123              → ProfileScreen (perfil de usuario 123)
/settings                 → SettingsScreen (configuración)
/notifications            → NotificationsScreen (notificaciones)
/news                     → NewsScreen (noticias)
/market-info              → MarketInfoScreen (información de mercado)
/promotions               → PromotionsScreen (promociones)
/saved-posts              → SavedPostsScreen (posts guardados)
```

---

## 🌐 URLs para Expo Go

Reemplaza `192.168.x.x` con tu IP local:

```bash
# Chat
exp://192.168.x.x:8081/--/chats
exp://192.168.x.x:8081/--/chat/123
exp://192.168.x.x:8081/--/group-chat/456
exp://192.168.x.x:8081/--/messages

# Comunidades
exp://192.168.x.x:8081/--/communities
exp://192.168.x.x:8081/--/community/789

# Inversiones
exp://192.168.x.x:8081/--/inversiones
exp://192.168.x.x:8081/--/inversionista

# Educación
exp://192.168.x.x:8081/--/educacion
exp://192.168.x.x:8081/--/course/101
exp://192.168.x.x:8081/--/learning-paths

# Onboarding
exp://192.168.x.x:8081/--/pick-knowledge
```

---

## 🔧 Comandos de Testing

### **Abrir pantalla específica (Android):**
```bash
npx uri-scheme open "exp://192.168.x.x:8081/--/chats" --android
```

### **Abrir pantalla específica (iOS):**
```bash
npx uri-scheme open "exp://192.168.x.x:8081/--/chats" --ios
```

### **Ver logs mientras pruebas:**
```bash
npx react-native log-android
# o
npx react-native log-ios
```

---

## 📊 Matriz de Validación

| Pantalla | Ruta | Backend | UI | Navegación | Status |
|----------|------|---------|----|-----------:|--------|
| ChatListScreen | `/chats` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |
| ChatScreen | `/chat/:id` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |
| GroupChatScreen | `/group-chat/:id` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |
| CommunitiesScreen | `/communities` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |
| CommunityDetailScreen | `/community/:id` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |
| InversionesScreen | `/inversiones` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |
| InversionistaScreen | `/inversionista` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |
| PickKnowledgeScreen | `/pick-knowledge` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |
| MessagesScreen | `/messages` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |
| EducacionScreen | `/educacion` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |
| CourseDetailScreen | `/course/:id` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |
| LearningPathsScreen | `/learning-paths` | ⏳ | ⏳ | ⏳ | 🔴 Pendiente |

**Leyenda:**
- 🔴 Pendiente
- 🟡 En progreso
- 🟢 Completado
- ⏳ No iniciado

---

## 🎯 Plan de Validación

### **Día 1: Chat y Mensajería (4 pantallas)**
- [ ] ChatListScreen
- [ ] ChatScreen
- [ ] GroupChatScreen
- [ ] MessagesScreen

**Tiempo estimado:** 8 horas (2 hrs por pantalla)

---

### **Día 2: Comunidades (2 pantallas)**
- [ ] CommunitiesScreen
- [ ] CommunityDetailScreen

**Tiempo estimado:** 4 horas

---

### **Día 3: Inversiones y Educación (5 pantallas)**
- [ ] InversionesScreen
- [ ] InversionistaScreen
- [ ] EducacionScreen
- [ ] CourseDetailScreen
- [ ] LearningPathsScreen

**Tiempo estimado:** 10 horas

---

### **Día 4: Onboarding (1 pantalla + fixes)**
- [ ] PickKnowledgeScreen
- [ ] Fixes de bugs encontrados

**Tiempo estimado:** 4 horas

---

## 🐛 Bugs Comunes a Buscar

### **Backend:**
- [ ] Endpoints retornan 404
- [ ] Datos no cargan
- [ ] Timeout en requests
- [ ] Errores de autenticación
- [ ] Datos duplicados

### **UI:**
- [ ] Textos cortados
- [ ] Imágenes no cargan
- [ ] Botones no responden
- [ ] Loading infinito
- [ ] Scroll no funciona
- [ ] Colores incorrectos
- [ ] Espaciado incorrecto

### **Navegación:**
- [ ] No navega a siguiente pantalla
- [ ] Back button no funciona
- [ ] Parámetros no se pasan
- [ ] Deep links rotos
- [ ] Drawer no abre

---

## 📝 Template de Reporte de Bug

```markdown
## Bug: [Título corto]

**Pantalla:** [Nombre de pantalla]
**Ruta:** [/ruta]
**Severidad:** [Crítico/Alto/Medio/Bajo]

**Descripción:**
[Descripción detallada del bug]

**Pasos para Reproducir:**
1. Ir a [pantalla]
2. Hacer [acción]
3. Observar [resultado]

**Resultado Esperado:**
[Qué debería pasar]

**Resultado Actual:**
[Qué pasa realmente]

**Screenshots:**
[Adjuntar capturas]

**Logs:**
```
[Pegar logs relevantes]
```

**Dispositivo:**
- Modelo: [ej. Pixel 5]
- Android: [ej. 13]
- App Version: [ej. 1.0.0]
```

---

## ✅ Checklist de Validación por Pantalla

Para cada pantalla, verificar:

### **Backend (30 min):**
- [ ] Endpoint existe y responde
- [ ] Datos cargan correctamente
- [ ] Maneja errores gracefully
- [ ] Loading states funcionan
- [ ] Refresh funciona

### **UI (1 hora):**
- [ ] Pixel perfect con Figma
- [ ] Todos los textos visibles
- [ ] Imágenes cargan
- [ ] Botones tienen feedback
- [ ] Colores correctos
- [ ] Espaciado correcto
- [ ] Responsive en diferentes pantallas

### **Navegación (30 min):**
- [ ] Navega desde otras pantallas
- [ ] Deep link funciona
- [ ] Parámetros se pasan correctamente
- [ ] Back button funciona
- [ ] No hay memory leaks

---

**Última actualización:** 8 de Octubre, 2025  
**Total pantallas:** 12  
**Tiempo estimado:** 24 horas  
**Estado:** 🔴 Pendiente
