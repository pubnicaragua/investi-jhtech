# Guía de Pruebas - ProfileScreen

## Fecha: 2025-10-02

## Objetivo
Verificar que la pantalla ProfileScreen funcione correctamente después de las correcciones implementadas.

## Pre-requisitos

1. ✅ Tener un usuario autenticado
2. ✅ Tener acceso a la consola de desarrollo (Metro Bundler o React Native Debugger)
3. ✅ Tener al menos un usuario en la base de datos con posts y comunidades

## Casos de Prueba

### 🧪 Caso 1: Cargar Mi Propio Perfil

**Pasos:**
1. Navegar a la pantalla Profile desde el menú principal
2. Observar los logs en la consola

**Resultado Esperado:**
```
[ProfileScreen] Starting loadProfile...
[ProfileScreen] Current user ID: <tu-uuid>
[ProfileScreen] Target user ID: <tu-uuid>
[getUserComplete] Fetching profile for userId: <tu-uuid>
[getUserComplete] User data fetched: <tu-nombre>
[getUserComplete] Stats fetched: { followers_count: X, following_count: Y, posts_count: Z }
[getUserComplete] Posts fetched: X
[getUserComplete] Communities fetched: Y
[getUserComplete] Profile complete: <tu-nombre> with X posts
[ProfileScreen] User data received: Success
[ProfileScreen] Profile set with X posts
[ProfileScreen] Loading own profile data...
[ProfileScreen] Saved posts: X Recommended: Y
[ProfileScreen] loadProfile finished
```

**Verificaciones:**
- ✅ Se muestra tu avatar y nombre
- ✅ Se muestran las estadísticas correctas (posts, followers, following)
- ✅ Se muestran tus posts en la pestaña "Posts"
- ✅ Se muestra la pestaña "Saved" con posts guardados
- ✅ Se muestra la pestaña "Communities" con comunidades recomendadas
- ✅ Aparece el botón "Editar Perfil"
- ✅ No hay errores en la consola

---

### 🧪 Caso 2: Cargar Perfil de Otro Usuario

**Pasos:**
1. Desde el feed, hacer clic en el avatar de otro usuario
2. Observar los logs en la consola

**Resultado Esperado:**
```
[ProfileScreen] Starting loadProfile...
[ProfileScreen] Current user ID: <tu-uuid>
[ProfileScreen] Target user ID: <otro-uuid>
[getUserComplete] Fetching profile for userId: <otro-uuid>
[getUserComplete] User data fetched: <nombre-otro-usuario>
[getUserComplete] Stats fetched: { followers_count: X, following_count: Y, posts_count: Z }
[getUserComplete] Posts fetched: X
[getUserComplete] Communities fetched: Y
[getUserComplete] Profile complete: <nombre-otro-usuario> with X posts
[ProfileScreen] User data received: Success
[ProfileScreen] Profile set with X posts
[ProfileScreen] Loading other user profile, communities: Y
[ProfileScreen] loadProfile finished
```

**Verificaciones:**
- ✅ Se muestra el avatar y nombre del otro usuario
- ✅ Se muestran las estadísticas del otro usuario
- ✅ Se muestran los posts del otro usuario
- ✅ Se muestra la pestaña "Communities" con las comunidades del usuario
- ✅ NO se muestra la pestaña "Saved"
- ✅ Aparece el botón "Seguir" o "Siguiendo"
- ✅ Aparece el botón de mensaje
- ✅ No hay errores en la consola

---

### 🧪 Caso 3: Pull to Refresh

**Pasos:**
1. Estando en cualquier perfil, hacer pull-to-refresh
2. Observar que se recarga la información

**Resultado Esperado:**
- ✅ Aparece el indicador de carga
- ✅ Se ejecuta nuevamente `loadProfile()`
- ✅ Los datos se actualizan
- ✅ El indicador de carga desaparece

---

### 🧪 Caso 4: Manejo de Errores - Usuario No Encontrado

**Pasos:**
1. Navegar a un perfil con un userId inválido
2. Observar el comportamiento

**Resultado Esperado:**
```
[ProfileScreen] Starting loadProfile...
[getUserComplete] Fetching profile for userId: <uuid-invalido>
[getUserComplete] Error fetching user: <error>
[getUserComplete] Critical error fetching complete user profile: <error>
[ProfileScreen] User data received: Failed
[ProfileScreen] getUserComplete returned null
```

**Verificaciones:**
- ✅ Se muestra un Alert con mensaje de error
- ✅ Se muestra pantalla de error con botón "Reintentar"
- ✅ No se rompe la aplicación

---

### 🧪 Caso 5: Manejo de Errores - Fallo en Stats

**Escenario:** La función RPC `get_user_stats` falla pero el resto funciona

**Resultado Esperado:**
```
[getUserComplete] Error fetching stats, using defaults: <error>
[getUserComplete] Posts fetched: X
[getUserComplete] Communities fetched: Y
[getUserComplete] Profile complete: <nombre> with X posts
```

**Verificaciones:**
- ✅ El perfil se carga correctamente
- ✅ Las estadísticas muestran valores por defecto (0 o el count de posts)
- ✅ Los posts y comunidades se muestran normalmente
- ✅ No se muestra error al usuario

---

### 🧪 Caso 6: Manejo de Errores - Fallo en Posts

**Escenario:** La carga de posts falla pero el resto funciona

**Resultado Esperado:**
```
[getUserComplete] User data fetched: <nombre>
[getUserComplete] Stats fetched: { ... }
[getUserComplete] Error fetching posts: <error>
[getUserComplete] Communities fetched: Y
[getUserComplete] Profile complete: <nombre> with 0 posts
```

**Verificaciones:**
- ✅ El perfil se carga correctamente
- ✅ La pestaña "Posts" muestra mensaje de "No hay posts"
- ✅ Las estadísticas y comunidades se muestran normalmente
- ✅ No se muestra error al usuario

---

### 🧪 Caso 7: Seguir/Dejar de Seguir Usuario

**Pasos:**
1. Ir al perfil de otro usuario
2. Hacer clic en "Seguir"
3. Verificar que cambie a "Siguiendo"
4. Hacer clic en "Siguiendo"
5. Verificar que cambie a "Seguir"

**Verificaciones:**
- ✅ El botón cambia de estado correctamente
- ✅ El contador de followers se actualiza
- ✅ Si hay error, se muestra un Alert

---

### 🧪 Caso 8: Navegación entre Pestañas

**Pasos:**
1. En tu propio perfil, cambiar entre pestañas: Posts → Saved → Communities
2. Verificar que cada pestaña muestra el contenido correcto

**Verificaciones:**
- ✅ Pestaña "Posts" muestra tus posts
- ✅ Pestaña "Saved" muestra posts guardados
- ✅ Pestaña "Communities" muestra comunidades recomendadas
- ✅ El indicador visual de pestaña activa funciona
- ✅ No hay errores al cambiar de pestaña

---

## Checklist de Verificación General

### Funcionalidad
- [ ] Carga correcta del perfil propio
- [ ] Carga correcta del perfil de otro usuario
- [ ] Pull-to-refresh funciona
- [ ] Seguir/dejar de seguir funciona
- [ ] Navegación entre pestañas funciona
- [ ] Botón "Editar Perfil" navega correctamente
- [ ] Botón de mensaje funciona

### Manejo de Errores
- [ ] Usuario no encontrado muestra error apropiado
- [ ] Fallo en stats no bloquea la carga
- [ ] Fallo en posts no bloquea la carga
- [ ] Fallo en communities no bloquea la carga
- [ ] Mensajes de error son claros para el usuario

### UI/UX
- [ ] Avatar se muestra correctamente
- [ ] Banner se muestra si existe
- [ ] Estadísticas se muestran correctamente
- [ ] Bio y ubicación se muestran si existen
- [ ] Icono de verificado aparece si aplica
- [ ] Loading spinner aparece durante la carga
- [ ] Refresh indicator funciona correctamente

### Performance
- [ ] La carga inicial es rápida (< 3 segundos)
- [ ] No hay memory leaks
- [ ] No hay renders innecesarios
- [ ] Las imágenes cargan correctamente

### Logs
- [ ] Los logs son claros y descriptivos
- [ ] Los errores incluyen detalles suficientes
- [ ] No hay logs excesivos que saturen la consola

---

## Problemas Conocidos y Soluciones

### Problema: "Cannot find name 'authState'"
**Solución:** Ya corregido. Se usa `getCurrentUserId()` en su lugar.

### Problema: "Error fetching complete user profile"
**Solución:** Ya corregido. Se cambió de GET a POST para la llamada RPC.

### Problema: "Cannot find name 'isFollowing'"
**Solución:** Ya corregido. Se agregó el estado `isFollowing` al componente.

---

## Comandos Útiles para Debugging

### Ver logs en tiempo real (Metro)
```bash
# En la terminal donde corre Metro Bundler
# Los logs aparecerán automáticamente
```

### Ver logs en React Native Debugger
1. Abrir React Native Debugger
2. Ir a Console
3. Filtrar por "[ProfileScreen]" o "[getUserComplete]"

### Limpiar caché si hay problemas
```bash
npm start -- --reset-cache
```

---

## Reporte de Bugs

Si encuentras algún bug, documenta:

1. **Pasos para reproducir**
2. **Comportamiento esperado**
3. **Comportamiento actual**
4. **Logs de la consola**
5. **Screenshots si aplica**
6. **Dispositivo/Emulador usado**

---

## Conclusión

Después de ejecutar todos los casos de prueba, el ProfileScreen debe:
- ✅ Cargar correctamente en ambos casos (propio perfil y de otros)
- ✅ Manejar errores gracefully sin romper la app
- ✅ Mostrar logs claros para debugging
- ✅ Proporcionar buena experiencia de usuario

**Estado:** ✅ LISTO PARA PRUEBAS
