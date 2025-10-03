# 📚 Documentación API.TS

## 🎯 Propósito
Este archivo centraliza **TODAS** las llamadas a la API de Supabase. Es la capa de acceso a datos de la aplicación.

---

## ⚠️ PROBLEMA CRÍTICO: Error PGRST201

### ¿Qué es?
Error que ocurre cuando Supabase encuentra **múltiples foreign keys** entre dos tablas y no sabe cuál usar.

### Ejemplo Real
La tabla `posts` tiene **2 foreign keys** hacia `users`:
1. `posts_user_id_fkey` → Autor del post
2. `posts_pinned_by_fkey` → Usuario que fijó el post

### ❌ Query que FALLA:
```typescript
select: "id,contenido,users(nombre,avatar_url)"
// Error PGRST201: "Could not embed because more than one relationship was found"
```

### ✅ Query CORRECTA:
```typescript
select: "id,contenido,users!posts_user_id_fkey(nombre,avatar_url)"
// Especifica EXPLÍCITAMENTE qué foreign key usar
```

---

## 🔧 Soluciones Implementadas

### Solución 1: Especificar Foreign Key
**Usado en:** `getCommunityPosts()`

```typescript
select: "users!posts_user_id_fkey(id,nombre,full_name,username,photo_url,avatar_url,role)"
```

### Solución 2: Queries Separadas
**Usado en:** `getUserFeed()`

```typescript
// Paso 1: Obtener posts sin relaciones
const posts = await request("GET", "/posts", {
  params: { select: "id,contenido,user_id" }
})

// Paso 2: Obtener usuarios por separado
const userIds = [...new Set(posts.map(p => p.user_id))]
const users = await request("GET", "/users", {
  params: { id: `in.(${userIds.join(',')})` }
})

// Paso 3: Mapear manualmente
return posts.map(post => ({
  ...post,
  author: users.find(u => u.id === post.user_id)
}))
```

---

## 📋 Funciones Críticas Documentadas

### COMUNIDADES

#### `getCommunityPosts(communityId, limit)`
- **Propósito:** Obtiene posts de una comunidad
- **⚠️ CRÍTICO:** Usa `users!posts_user_id_fkey` para evitar PGRST201
- **Usado en:** CommunityDetailScreen (tab "Tú")
- **Última modificación:** 2025-10-02

#### `getCommunityDetails(communityId)`
- **Propósito:** Detalles completos de comunidad + conteo de miembros
- **Mapeo:** nombre→name, descripcion→description, icono_url→image_url
- **Usado en:** CommunityDetailScreen

#### `joinCommunity(uid, community_id)`
- **Propósito:** Usuario se une a comunidad
- **Nota:** Error 23505 = ya está unido
- **Usado en:** CommunityDetailScreen (botón "Unirse")

### POSTS / FEED

#### `getUserFeed(uid, limit)`
- **Propósito:** Feed principal de posts
- **⚠️ CRÍTICO:** Usa estrategia de queries separadas
- **Usado en:** HomeScreen, FeedScreen
- **Tiene fallback:** Sí

#### `createPost(data)`
- **Propósito:** Crear nuevo post
- **Campos:** user_id, community_id?, contenido, media_url?
- **Usado en:** CreatePostScreen, CommunityDetailScreen, HomeScreen

#### `likePost(post_id, user_id, is_like)`
- **Propósito:** Dar like/dislike a post
- **Nota:** Error 23505 = ya dio like
- **Usado en:** PostCard, PostDetailScreen, CommunityDetailScreen

#### `commentPost(post_id, user_id, contenido, parent_id?)`
- **Propósito:** Comentar post (soporta respuestas anidadas)
- **Usado en:** PostDetailScreen, CommentSection

### HELPERS

#### `getCurrentUser()`
- **Propósito:** Obtiene usuario autenticado actual
- **Proceso:** Token → JWT decode → getMe()
- **Usado en:** Todas las pantallas protegidas

#### `getCurrentUserId()`
- **Propósito:** Solo ID del usuario (más rápido)
- **Usado en:** Operaciones rápidas de autenticación

---

## 🗺️ Mapeo de Campos Español → Inglés

| Tabla | Campo DB (ES) | Campo Frontend (EN) |
|-------|---------------|---------------------|
| communities | nombre | name |
| communities | descripcion | description |
| communities | icono_url | image_url |
| communities | tipo | type |
| posts | contenido | content |
| posts | likes_count | likes |
| posts | comment_count | comments |
| users | nombre | name |
| users | photo_url | avatar |

---

## 📝 Convenciones de Código

### Retornos
- `null` → Error no crítico o no encontrado
- `throw error` → Error crítico
- `[]` → Array vacío si no hay datos

### Documentación
Cada función debe tener:
```typescript
/**
 * Descripción breve
 * 
 * @param param1 - Descripción
 * @returns Qué retorna
 * 
 * USADO EN:
 * - Pantalla1
 * - Pantalla2
 * 
 * NOTAS ESPECIALES (si aplica)
 */
```

---

## 🚨 Antes de Modificar

1. ✅ Lee los comentarios de la función
2. ✅ Verifica si usa relaciones múltiples
3. ✅ Identifica TODAS las pantallas que la usan
4. ✅ Prueba en TODAS esas pantallas
5. ✅ Actualiza la documentación
6. ✅ Agrega nota en HISTORIAL DE CAMBIOS

---

## 📊 Historial de Cambios Críticos

### 2025-10-02
- **getCommunityPosts():** Agregado `users!posts_user_id_fkey` para evitar PGRST201
- **getUserFeed():** Implementada estrategia de queries separadas
- **Documentación:** Agregada exhaustivamente a todas las funciones

---

## 🔍 Debugging

### Si ves error PGRST201:
1. Identifica qué tablas están relacionadas
2. Verifica cuántos foreign keys hay entre ellas
3. Especifica el FK correcto: `tabla!nombre_fk(campos)`
4. O usa queries separadas

### Si una función deja de funcionar:
1. Revisa el historial de cambios en los comentarios
2. Verifica si cambió la estructura de la BD
3. Prueba la query directamente en Supabase
4. Revisa los logs de error

---

## 📞 Contacto
Para dudas sobre este archivo, revisar los comentarios inline o consultar con el equipo de backend.

**Última actualización:** 2025-10-02
