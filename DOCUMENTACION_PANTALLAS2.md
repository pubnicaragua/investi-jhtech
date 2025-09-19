# 📱 Aplicación Investi - Documentación REAL de Pantallas

## 📊 Resumen General REAL
- **Total de Archivos de Pantallas**: 48
- **Pantallas con Backend Real**: 15
- **Pantallas con Datos Hardcodeados**: 20
- **Pantallas Placeholder**: 8
- **Pantallas Duplicadas**: 5
- **Estado**: 🚨 MUCHAS PANTALLAS USAN DATOS FALSOS

## 🏠 Pantallas Principales

### 1. HomeFeedScreen
- **Ruta**: `/`
- **Descripción**: Muestra el feed principal de publicaciones
- **Endpoints**: 
  - `GET /posts` - Obtener publicaciones
- **Datos Hardcodeados**: No
- **Estado**: ✅ Activa

### 2. ProfileScreen
- **Ruta**: `/profile/:userId?`
- **Descripción**: Muestra el perfil del usuario
- **Endpoints**:
  - `GET /users/:id` - Obtener datos del usuario
  - `GET /users/:id/posts` - Obtener publicaciones del usuario
- **Datos Hardcodeados**: No
- **Estado**: ✅ Activa

## 🔐 Autenticación

### 3. SignInScreen
- **Ruta**: `/signin`
- **Descripción**: Inicio de sesión
- **Endpoints**:
  - `POST /auth/signin` - Iniciar sesión
- **Datos Hardcodeados**: No
- **Estado**: ✅ Activa

### 4. SignUpScreen
- **Ruta**: `/signup`
- **Descripción**: Registro de nuevo usuario
- **Endpoints**:
  - `POST /auth/signup` - Registrar usuario
- **Datos Hardcodeados**: No
- **Estado**: ✅ Activa

## 🔐 Flujo de Autenticación (3/3 Registradas)

| Pantalla | Archivo | Endpoints REALES | Datos Hardcodeados | Estado REAL | Problemas CRÍTICOS |
|----------|---------|------------------|-------------------|-------------|--------------------|
| Selección Idioma | `LanguageSelectionScreen.tsx` | Ninguno | Lista de idiomas | ✅ Solo UI | - |
| Bienvenida | `WelcomeScreen.tsx` | Ninguno | Slides hardcodeados | ✅ Solo UI | - |
| Inicio de Sesión | `SignInScreen.tsx` | `POST /auth/signin` | No | ✅ Activa | - |

## 📱 Onboarding

### 5. LanguageSelectionScreen
- **Ruta**: `/language`
- **Descripción**: Selección de idioma inicial
- **Endpoints**: Ninguno
- **Datos Hardcodeados**: Idiomas disponibles
- **Estado**: ✅ Activa

### 6. UploadAvatarScreen
- **Ruta**: `/upload-avatar`
- **Descripción**: Subir foto de perfil
- **Endpoints**:
  - `POST /users/avatar` - Subir avatar
- **Datos Hardcodeados**: No
- **Estado**: ✅ Activa

## 📰 Contenido

### 7. NewsScreen
- **Ruta**: `/news`
- **Descripción**: Lista de noticias
- **Endpoints**:
  - `GET /news` - Obtener noticias
- **Datos Hardcodeados**: Datos de ejemplo cuando falla la API
- **Estado**: ✅ Activa

### 8. EducacionScreen
- **Ruta**: `/education`
- **Descripción**: Contenido educativo
- **Endpoints**:
  - `GET /courses` - Obtener cursos
  - `GET /videos` - Obtener videos
- **Datos Hardcodeados**: Categorías de educación
- **Estado**: ✅ Activa

## 💬 Comunicación

### 9. ChatListScreen
- **Ruta**: `/chats`
- **Descripción**: Lista de chats
- **Endpoints**:
  - `GET /chats` - Obtener chats
- **Datos Hardcodeados**: No
- **Estado**: ✅ Activa

### 10. ChatScreen
- **Ruta**: `/chat/:chatId`
- **Descripción**: Chat individual
- **Endpoints**:
  - `GET /messages/:chatId` - Obtener mensajes
  - `POST /messages` - Enviar mensaje
- **Datos Hardcodeados**: No
- **Estado**: ✅ Activa

## 🛠️ Herramientas

### 11. PlanificadorFinancieroScreen
- **Ruta**: `/financial-planner`
- **Descripción**: Planificador financiero
- **Endpoints**:
  - `GET /budgets` - Obtener presupuestos
  - `GET /transactions` - Obtener transacciones
- **Datos Hardcodeados**: Datos de ejemplo
- **Estado**: ✅ Activa

### 12. ReportesAvanzadosScreen
- **Ruta**: `/reports`
- **Descripción**: Reportes financieros
- **Endpoints**:
  - `GET /reports` - Obtener reportes
- **Datos Hardcodeados**: Fórmulas y plantillas
- **Estado**: ✅ Activa

## 📊 Análisis

### Pantallas con Datos Hardcodeados
1. **PlanificadorFinancieroScreen**: Datos de ejemplo de presupuestos y transacciones
2. **EducacionScreen**: Categorías de educación
3. **NewsScreen**: Datos de ejemplo cuando falla la API
4. **ReportesAvanzadosScreen**: Fórmulas y plantillas

### Endpoints por Implementar
1. `POST /promotions` - Crear promoción
2. `GET /investment-opportunities` - Obtener oportunidades de inversión
3. `POST /investment` - Realizar inversión

## 📝 Notas Adicionales
- Las pantallas marcadas con ✅ están completamente funcionales
- Las pantallas con datos hardcodeados deberían migrarse a consumir APIs reales
- Se recomienda implementar manejo de errores consistente en todas las pantallas
