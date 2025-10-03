# 📋 CommunityDetailScreen - Casos de Uso Completos

## 🎯 Propósito de la Pantalla
Mostrar los detalles de una comunidad y permitir a los usuarios interactuar con ella (unirse, publicar, chatear, buscar inversores).

---

## 🔄 FLUJO PRINCIPAL

### 1. **Carga Inicial**
```
Usuario hace clic en una comunidad → CommunityDetailScreen
  ↓
Carga paralela de:
  - getCommunityDetails(communityId) → Detalles + contador miembros
  - getCommunityChannels(communityId) → Canales de chat
  - getCommunityPosts(communityId) → Posts de la comunidad
  - getCurrentUser() → Usuario actual
  ↓
Verifica membresía:
  - isUserMemberOfCommunity(userId, communityId)
  - Si es miembro → isJoined = true
  - Si no es miembro → isJoined = false
  ↓
Renderiza UI según estado de membresía
```

---

## 📱 COMPONENTES DE LA UI

### **A. HEADER**
```
┌─────────────────────────────────────┐
│ ← [Nombre Comunidad]     🔍  ⋯      │
└─────────────────────────────────────┘
```

**Elementos:**
- **Botón atrás (←):** Vuelve a la pantalla anterior
- **Nombre comunidad:** Título centrado
- **Búsqueda (🔍):** Buscar dentro de la comunidad (TODO)
- **Más opciones (⋯):** Menú contextual (TODO)

---

### **B. IMAGEN DE PORTADA + AVATAR**

#### Caso 1: Comunidad CON imagen de portada
```
┌─────────────────────────────────────┐
│     [Imagen de portada 1200x400]    │
│                                     │
│            ╭───────╮                │
│            │ Avatar│                │
│            │ 92x92 │                │
│            ╰───────╯                │
└─────────────────────────────────────┘
```

#### Caso 2: Comunidad SIN imagen de portada (TU CASO)
```
┌─────────────────────────────────────┐
│   [Color azul #2673f3 sólido]      │
│                                     │
│            ╭───────╮                │
│            │ Avatar│                │
│            │ 92x92 │                │
│            ╰───────╯                │
└─────────────────────────────────────┘
```

**Implementación:**
```typescript
{community.cover_image_url ? (
  <Image source={{ uri: community.cover_image_url }} />
) : (
  <View style={{ backgroundColor: '#2673f3', height: 150 }} />
)}
```

---

### **C. INFO DE LA COMUNIDAD**

```
┌─────────────────────────────────────┐
│   Inversiones Inmobiliarias Chile   │
│   👥 12k miembros · Comunidad pública│
│                                     │
│   [Unirse]      [Invitar]           │
└─────────────────────────────────────┘
```

#### Estados del Botón "Unirse":

| Estado | Apariencia | Acción | Habilitado |
|--------|-----------|--------|------------|
| **No unido** | Azul #2673f3 | joinCommunity() | ✅ Sí |
| **Unido** | Gris #e5e5e5 | Ninguna | ❌ No |

**Lógica:**
```typescript
const handleJoinCommunity = async () => {
  const result = await joinCommunity(userId, communityId)
  if (result === null) {
    // Ya estaba unido (error 23505)
    Alert.alert('Info', 'Ya eres miembro')
  } else {
    // Unión exitosa
    setIsJoined(true)
    Alert.alert('Éxito', '¡Te has unido!')
    loadCommunityData() // Recargar para actualizar contador
  }
}
```

#### Botón "Invitar":
```typescript
const handleInvite = async () => {
  await Share.share({
    message: `Únete a "${community.name}" en Investi\n\n${community.description}\n\nDescarga: https://investiiapp.com`,
    title: `Invitación a ${community.name}`
  })
}
```

---

### **D. TABS**

```
┌─────────────────────────────────────┐
│ Tú  💬Chats  📷Fotos  📁Archivos  👤Buscar│
│ ══                                  │
└─────────────────────────────────────┘
```

#### Tab 1: **Tú** (Posts)

**Caso A: Usuario NO unido**
```
┌─────────────────────────────────────┐
│ 👤 [Únete para publicar...]         │
│    (Input deshabilitado)            │
│                                     │
│ 🎉 Celebrar  📊 Encuesta  🤝 Socio  │
│    (Botones deshabilitados 50% opacity)│
│                                     │
│ Más relevantes                      │
│ ─────────────────                   │
│ [Lista de posts] (solo lectura)     │
└─────────────────────────────────────┘
```

**Caso B: Usuario unido**
```
┌─────────────────────────────────────┐
│ 👤 [Escribe algo...]  [Publicar]    │
│    (Input habilitado)               │
│                                     │
│ 🎉 Celebrar  📊 Encuesta  🤝 Socio  │
│    (Botones habilitados, clickeables)│
│                                     │
│ Más relevantes                      │
│ ─────────────────                   │
│ ┌─────────────────────────────────┐ │
│ │ 👤 Claudio Eslava  • Financiero │ │
│ │    10 h                         │ │
│ │ + Seguir                        │ │
│ │                                 │ │
│ │ Invertir en la bolsa puede...  │ │
│ │ ...Ver más                      │ │
│ │                                 │ │
│ │ [Gráfico/Imagen]                │ │
│ │                                 │ │
│ │ 👍 100  💬 100 comentarios      │ │
│ │ ↗ 10 compartidos                │ │
│ │                                 │ │
│ │ [Me gusta] [Comentar] [Compartir] [Enviar] │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Acciones Rápidas:**

1. **🎉 Celebrar un momento**
   ```typescript
   handleQuickAction('celebrate')
   → navigation.navigate('CreatePost', { 
       type: 'celebrate',
       communityId: community.id 
     })
   → CreatePostScreen con template de celebración
   ```

2. **📊 Crear una encuesta**
   ```typescript
   handleQuickAction('poll')
   → navigation.navigate('CreatePost', { 
       type: 'poll',
       communityId: community.id 
     })
   → CreatePostScreen con editor de encuestas
   ```

3. **🤝 Buscar un socio**
   ```typescript
   handleQuickAction('partner')
   → navigation.navigate('CreatePost', { 
       type: 'partner',
       communityId: community.id 
     })
   → CreatePostScreen con template de búsqueda de socio
   ```

**Acciones en Posts:**

1. **Me gusta**
   ```typescript
   likePost(postId, userId)
   → Incrementa contador
   → Cambia color del botón
   ```

2. **Comentar**
   ```typescript
   navigation.navigate('PostDetail', { postId })
   → Abre pantalla de detalle con comentarios
   ```

3. **Compartir**
   ```typescript
   Share.share({ message: postContent })
   → Abre share sheet nativo
   ```

4. **Enviar**
   ```typescript
   navigation.navigate('ChatScreen', { 
     userId: post.author.id,
     postId: post.id 
   })
   → Abre chat directo con el autor
   ```

---

#### Tab 2: **Chats** (Canales)

```
┌─────────────────────────────────────┐
│ Mensajes                            │
│ Inversiones Inmobiliarias Chile     │
│ 1,098 activos                       │
│ 12k miembros                        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [txt] General                   │ │
│ │       Conversaciones generales  │ │
│ ├─────────────────────────────────┤ │
│ │ [txt] Oportunidades             │ │
│ │       Comparte oportunidades    │ │
│ ├─────────────────────────────────┤ │
│ │ [txt] Análisis                  │ │
│ │       Análisis técnico          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Funcionalidad:**
- Lista de canales desde `getCommunityChannels(communityId)`
- Al hacer clic en un canal:
  ```typescript
  navigation.navigate('ChannelChat', { 
    channelId: channel.id,
    channelName: channel.name 
  })
  ```
- Si no hay canales: "No hay canales disponibles"

---

#### Tab 3: **Fotos** (Galería)

```
┌─────────────────────────────────────┐
│ ┌───┐ ┌───┐ ┌───┐                  │
│ │img│ │img│ │img│                  │
│ └───┘ └───┘ └───┘                  │
│ ┌───┐ ┌───┐ ┌───┐                  │
│ │img│ │img│ │img│                  │
│ └───┘ └───┘ └───┘                  │
└─────────────────────────────────────┘
```

**Estado Actual:** ⚠️ NO IMPLEMENTADO

**Necesita:**
```typescript
// En api.ts
export async function getCommunityPhotos(communityId: string) {
  const response = await request("GET", "/posts", {
    params: {
      community_id: `eq.${communityId}`,
      select: "id,image_url,created_at",
      not: "image_url.is.null", // Solo posts con imagen
      order: "created_at.desc"
    }
  })
  return response || []
}
```

---

#### Tab 4: **Archivos** (Documentos)

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ 📄 Análisis_Mercado_2024.pdf    │ │
│ │    2.5 MB                       │ │
│ ├─────────────────────────────────┤ │
│ │ 📊 Reporte_Trimestral.xlsx      │ │
│ │    1.8 MB                       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Estado Actual:** ⚠️ NO IMPLEMENTADO

**Necesita:**
```typescript
// En api.ts
export async function getCommunityFiles(communityId: string) {
  const response = await request("GET", "/community_files", {
    params: {
      community_id: `eq.${communityId}`,
      select: "id,file_name,file_url,file_size,file_type,created_at,user:users(nombre)",
      order: "created_at.desc"
    }
  })
  return response || []
}
```

---

#### Tab 5: **Buscar inversores**

```
┌─────────────────────────────────────┐
│ 🔍 [Buscar inversores...]           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 Juan Pérez                   │ │
│ │    Inversor Ángel               │ │
│ │    Especialista en startups...  │ │
│ │                      [Conectar] │ │
│ ├─────────────────────────────────┤ │
│ │ 👤 María González               │ │
│ │    Venture Capital              │ │
│ │    Enfocada en tecnología...    │ │
│ │                      [Conectar] │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Funcionalidad:**
- Input de búsqueda en tiempo real
- Llama `searchUsers(query)` al escribir
- Muestra resultados con botón "Conectar"
- Al hacer clic en "Conectar":
  ```typescript
  navigation.navigate('UserProfile', { userId: user.id })
  // O enviar solicitud de conexión
  ```

---

## 🔐 LÓGICA DE PERMISOS

### Matriz de Permisos

| Acción | Usuario NO Unido | Usuario Unido |
|--------|------------------|---------------|
| Ver posts | ✅ Sí | ✅ Sí |
| Ver canales | ✅ Sí | ✅ Sí |
| Ver fotos | ✅ Sí | ✅ Sí |
| Ver archivos | ✅ Sí | ✅ Sí |
| Buscar inversores | ✅ Sí | ✅ Sí |
| **Crear post** | ❌ No | ✅ Sí |
| **Comentar** | ❌ No | ✅ Sí |
| **Dar like** | ❌ No | ✅ Sí |
| **Usar quick actions** | ❌ No | ✅ Sí |
| **Enviar mensajes en canales** | ❌ No | ✅ Sí |

---

## 🎬 CASOS DE USO DETALLADOS

### **CASO 1: Usuario Nuevo Visita Comunidad**

**Precondiciones:**
- Usuario autenticado
- NO es miembro de la comunidad

**Flujo:**
1. Usuario hace clic en comunidad desde CommunitiesScreen
2. CommunityDetailScreen carga
3. Muestra:
   - ✅ Portada (imagen o color azul)
   - ✅ Avatar de comunidad
   - ✅ Nombre y meta (miembros)
   - ✅ Botón "Unirse" (azul, habilitado)
   - ✅ Botón "Invitar" (habilitado)
4. Tab "Tú" activo por defecto:
   - ❌ Input deshabilitado ("Únete para publicar...")
   - ❌ Quick actions deshabilitadas (50% opacity)
   - ✅ Posts visibles (solo lectura)
5. Usuario hace clic en "Unirse":
   - Llama `joinCommunity(userId, communityId)`
   - Botón cambia a "Unido" (gris, deshabilitado)
   - Input se habilita
   - Quick actions se habilitan
   - Alert: "¡Te has unido a la comunidad!"
   - Recarga datos (actualiza contador de miembros)

---

### **CASO 2: Usuario Miembro Publica**

**Precondiciones:**
- Usuario autenticado
- ES miembro de la comunidad

**Flujo:**
1. Usuario escribe en el input "Escribe algo..."
2. Aparece botón "Publicar"
3. Usuario hace clic en "Publicar":
   - Valida que `isJoined === true`
   - Llama `createPost({ user_id, community_id, contenido })`
   - Limpia input
   - Recarga posts
   - Alert: "¡Publicación creada!"
4. Nuevo post aparece al inicio de la lista

---

### **CASO 3: Usuario Usa Quick Action**

**Precondiciones:**
- Usuario ES miembro

**Flujo - Celebrar un momento:**
1. Usuario hace clic en "🎉 Celebrar un momento"
2. Valida `isJoined === true`
3. Navega a CreatePostScreen:
   ```typescript
   navigation.navigate('CreatePost', { 
     type: 'celebrate',
     communityId: community.id 
   })
   ```
4. CreatePostScreen muestra:
   - Template pre-llenado con emoji 🎉
   - Opciones de celebración (logro, hito, etc.)
5. Usuario publica
6. Regresa a CommunityDetailScreen
7. Post aparece en el feed

**Flujo - Crear encuesta:**
1. Usuario hace clic en "📊 Crear una encuesta"
2. Navega a CreatePostScreen con `type: 'poll'`
3. Muestra editor de encuestas:
   - Pregunta
   - Opciones (mínimo 2, máximo 4)
   - Duración
4. Usuario publica encuesta
5. Aparece en el feed como post especial

**Flujo - Buscar socio:**
1. Usuario hace clic en "🤝 Buscar un socio"
2. Navega a CreatePostScreen con `type: 'partner'`
3. Muestra formulario:
   - Tipo de socio buscado
   - Habilidades requeridas
   - Descripción del proyecto
4. Usuario publica
5. Aparece en el feed con tag especial

---

### **CASO 4: Usuario Interactúa con Post**

**Acción: Dar Like**
```
Usuario hace clic en "Me gusta"
  ↓
likePost(postId, userId)
  ↓
Incrementa contador local: likes + 1
Cambia color del ícono a azul
  ↓
Si ya dio like antes:
  - Error 23505 (ignorado)
  - Mantiene estado actual
```

**Acción: Comentar**
```
Usuario hace clic en "Comentar"
  ↓
navigation.navigate('PostDetail', { postId })
  ↓
PostDetailScreen muestra:
  - Post completo
  - Lista de comentarios
  - Input para comentar
```

**Acción: Compartir**
```
Usuario hace clic en "Compartir"
  ↓
Share.share({ message: post.content })
  ↓
Abre share sheet nativo:
  - WhatsApp
  - Email
  - Copiar link
  - Etc.
```

**Acción: Enviar**
```
Usuario hace clic en "Enviar"
  ↓
navigation.navigate('ChatScreen', { 
  userId: post.author.id,
  postId: post.id 
})
  ↓
Abre chat directo con el autor
Post pre-cargado para compartir
```

---

### **CASO 5: Usuario Explora Canales**

**Flujo:**
1. Usuario hace clic en tab "Chats"
2. Carga `getCommunityChannels(communityId)`
3. Muestra lista de canales:
   - General
   - Oportunidades
   - Análisis
   - Dudas
4. Usuario hace clic en "General":
   ```typescript
   navigation.navigate('ChannelChat', { 
     channelId: channel.id,
     channelName: channel.name,
     communityId: community.id
   })
   ```
5. ChannelChatScreen muestra:
   - Mensajes del canal
   - Input para enviar mensaje
   - Lista de participantes activos

---

### **CASO 6: Usuario Busca Inversores**

**Flujo:**
1. Usuario hace clic en tab "Buscar inversores"
2. Escribe en el input: "venture capital"
3. Al cambiar el texto:
   ```typescript
   onChangeText={setSearchQuery}
   → useEffect detecta cambio
   → loadTabData('search')
   → searchUsers(searchQuery)
   → setUsers(results)
   ```
4. Muestra resultados filtrados
5. Usuario hace clic en "Conectar":
   ```typescript
   navigation.navigate('UserProfile', { userId: user.id })
   // O enviar solicitud de conexión directa
   ```

---

## 🔄 ESTADOS DE LA PANTALLA

### Estado 1: **Cargando**
```
┌─────────────────────────────────────┐
│                                     │
│         [Loading spinner]           │
│                                     │
└─────────────────────────────────────┘
```

### Estado 2: **Error - Comunidad no encontrada**
```
┌─────────────────────────────────────┐
│                                     │
│   Comunidad no encontrada           │
│                                     │
│         [Volver]                    │
│                                     │
└─────────────────────────────────────┘
```

### Estado 3: **Cargado - Sin posts**
```
┌─────────────────────────────────────┐
│ [Header + Avatar + Botones]         │
│ [Tabs]                              │
│                                     │
│ No hay publicaciones aún            │
│ Sé el primero en compartir algo     │
│                                     │
└─────────────────────────────────────┘
```

### Estado 4: **Cargado - Con posts**
```
┌─────────────────────────────────────┐
│ [Header + Avatar + Botones]         │
│ [Tabs]                              │
│ [Input + Quick Actions]             │
│ Más relevantes                      │
│ [Post 1]                            │
│ [Post 2]                            │
│ [Post 3]                            │
└─────────────────────────────────────┘
```

---

## 🐛 PROBLEMAS ACTUALES Y SOLUCIONES

### ❌ Problema 1: No hay imagen de portada
**Solución:** ✅ Implementado fallback a color azul #2673f3

### ❌ Problema 2: Botón "Unirse" no actualiza
**Solución:** ✅ Implementado `isUserMemberOfCommunity()` para verificar membresía real

### ❌ Problema 3: No hay posts
**Solución:** 📄 Creado script SQL `SEED_COMMUNITY_DATA.sql` para insertar posts de prueba

### ❌ Problema 4: Quick actions no funcionan
**Solución:** ✅ Implementado navegación a CreatePostScreen con tipos

### ❌ Problema 5: Tab "Buscar inversiones" cortado
**Solución:** ✅ Ya usa ScrollView horizontal, debería verse completo

---

## 📊 DATA REQUERIDA EN SUPABASE

### Tabla: `communities`
```sql
- id (uuid)
- nombre (text)
- descripcion (text)
- icono_url (text) ← Avatar
- cover_image_url (text) ← Imagen de portada (NUEVO)
- tipo (text)
- created_at (timestamp)
```

### Tabla: `posts`
```sql
- id (uuid)
- user_id (uuid) → FK a users
- community_id (uuid) → FK a communities
- contenido (text)
- image_url (text) ← Opcional
- likes_count (integer)
- comment_count (integer)
- created_at (timestamp)
```

### Tabla: `user_communities`
```sql
- id (uuid)
- user_id (uuid) → FK a users
- community_id (uuid) → FK a communities
- joined_at (timestamp)
- UNIQUE(user_id, community_id)
```

### Tabla: `community_channels`
```sql
- id (uuid)
- community_id (uuid) → FK a communities
- name (text)
- description (text)
- type (text) ← 'text', 'voice', etc.
- created_at (timestamp)
```

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecutar script SQL** para nutrir la comunidad con posts
2. **Verificar membresía** en Supabase
3. **Probar flujo completo:**
   - ✅ Ver comunidad sin estar unido
   - ✅ Unirse a la comunidad
   - ✅ Crear post
   - ✅ Usar quick actions
   - ✅ Explorar canales
   - ✅ Buscar inversores

4. **Implementar pendientes:**
   - Tab Fotos (getCommunityPhotos)
   - Tab Archivos (getCommunityFiles)
   - Navegación a ChannelChat
   - Navegación a PostDetail

---

## 📝 RESUMEN

**Estado Actual:**
- ✅ Header con portada (imagen o color azul)
- ✅ Verificación de membresía real
- ✅ Botón "Unirse" funcional
- ✅ Botón "Invitar" funcional
- ✅ Input habilitado/deshabilitado según membresía
- ✅ Quick actions habilitadas/deshabilitadas según membresía
- ✅ Posts desde backend
- ✅ Canales desde backend
- ✅ Búsqueda de usuarios funcional
- ⚠️ Fotos: Pendiente implementar
- ⚠️ Archivos: Pendiente implementar

**Próximo:** Nutrir base de datos con posts de prueba usando el script SQL.
