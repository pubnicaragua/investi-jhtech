# 🔧 NUEVOS ENDPOINTS REQUERIDOS - API.TS

## Fecha: 2025-10-02
## Pantallas implementadas: SavedPostsScreen, CommunityMembersScreen, CommunitySettingsScreen

---

## 📝 ENDPOINTS A AGREGAR EN `src/rest/api.ts`

### 1. **SavedPostsScreen - Endpoints**

```typescript
/**
 * Quita un post de los guardados del usuario
 * 
 * @param userId - ID del usuario
 * @param postId - ID del post a quitar
 * @returns void
 * 
 * USADO EN:
 * - SavedPostsScreen
 */
export async function unsavePost(userId: string, postId: string) {
  try {
    await request("DELETE", "/saved_posts", {
      params: {
        user_id: `eq.${userId}`,
        post_id: `eq.${postId}`
      }
    })
    return true
  } catch (error: any) {
    console.error('Error unsaving post:', error)
    throw error
  }
}
```

---

### 2. **CommunityMembersScreen - Endpoints**

```typescript
/**
 * Obtiene todos los miembros de una comunidad con sus datos de usuario
 * 
 * @param communityId - ID de la comunidad
 * @returns Array de miembros con datos de usuario
 * 
 * USADO EN:
 * - CommunityMembersScreen
 */
export async function getCommunityMembers(communityId: string) {
  try {
    const response = await request("GET", "/community_members", {
      params: {
        community_id: `eq.${communityId}`,
        select: "id,user_id,community_id,role,joined_at,user:users(id,nombre,full_name,avatar_url,photo_url,bio)",
        order: "joined_at.desc"
      }
    })
    return response || []
  } catch (error: any) {
    console.error('Error fetching community members:', error)
    return []
  }
}

/**
 * Elimina un miembro de la comunidad
 * 
 * @param communityId - ID de la comunidad
 * @param memberId - ID del registro de membresía (community_members.id)
 * @returns void
 * 
 * USADO EN:
 * - CommunityMembersScreen (solo admins)
 */
export async function removeCommunityMember(communityId: string, memberId: string) {
  try {
    await request("DELETE", "/community_members", {
      params: {
        id: `eq.${memberId}`,
        community_id: `eq.${communityId}`
      }
    })
    return true
  } catch (error: any) {
    console.error('Error removing community member:', error)
    throw error
  }
}

/**
 * Actualiza el rol de un miembro en la comunidad
 * 
 * @param communityId - ID de la comunidad
 * @param memberId - ID del registro de membresía
 * @param role - Nuevo rol ('admin' | 'moderator' | 'member')
 * @returns Miembro actualizado
 * 
 * USADO EN:
 * - CommunityMembersScreen (solo admins)
 */
export async function updateMemberRole(communityId: string, memberId: string, role: string) {
  try {
    const response = await request("PATCH", "/community_members", {
      params: {
        id: `eq.${memberId}`,
        community_id: `eq.${communityId}`
      },
      body: { role },
      headers: { Prefer: "return=representation" }
    })
    return response?.[0] || null
  } catch (error: any) {
    console.error('Error updating member role:', error)
    throw error
  }
}
```

---

### 3. **CommunitySettingsScreen - Endpoints**

```typescript
/**
 * Actualiza la configuración de una comunidad
 * 
 * @param communityId - ID de la comunidad
 * @param settings - Objeto con configuraciones a actualizar
 * @returns Comunidad actualizada
 * 
 * USADO EN:
 * - CommunitySettingsScreen (solo admins)
 */
export async function updateCommunitySettings(communityId: string, settings: {
  notifications_enabled?: boolean
  allow_member_posts?: boolean
  require_approval?: boolean
  allow_invites?: boolean
  type?: 'public' | 'private'
}) {
  try {
    const response = await request("PATCH", "/communities", {
      params: { id: `eq.${communityId}` },
      body: settings,
      headers: { Prefer: "return=representation" }
    })
    return response?.[0] || null
  } catch (error: any) {
    console.error('Error updating community settings:', error)
    throw error
  }
}

/**
 * Usuario abandona una comunidad
 * 
 * @param userId - ID del usuario
 * @param communityId - ID de la comunidad
 * @returns void
 * 
 * USADO EN:
 * - CommunitySettingsScreen
 */
export async function leaveCommunity(userId: string, communityId: string) {
  try {
    await request("DELETE", "/community_members", {
      params: {
        user_id: `eq.${userId}`,
        community_id: `eq.${communityId}`
      }
    })
    return true
  } catch (error: any) {
    console.error('Error leaving community:', error)
    throw error
  }
}

/**
 * Elimina una comunidad permanentemente (solo admins)
 * 
 * @param communityId - ID de la comunidad
 * @returns void
 * 
 * USADO EN:
 * - CommunitySettingsScreen (solo admins)
 * 
 * ⚠️ IMPORTANTE: Esta acción es irreversible
 * Debe eliminar en cascada:
 * - community_members
 * - community_channels
 * - posts de la comunidad
 * - etc.
 */
export async function deleteCommunity(communityId: string) {
  try {
    // Verificar que el usuario sea admin antes de llamar
    await request("DELETE", "/communities", {
      params: { id: `eq.${communityId}` }
    })
    return true
  } catch (error: any) {
    console.error('Error deleting community:', error)
    throw error
  }
}
```

---

## 🗄️ VERIFICACIONES DE BASE DE DATOS

### Tablas requeridas:

#### 1. **saved_posts**
```sql
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_post_id ON saved_posts(post_id);
```

#### 2. **community_members**
```sql
-- Ya existe, verificar columnas
ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'member' 
CHECK (role IN ('admin', 'moderator', 'member'));

ALTER TABLE community_members 
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();
```

#### 3. **communities** (agregar columnas de configuración)
```sql
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;

ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS allow_member_posts BOOLEAN DEFAULT true;

ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT false;

ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS allow_invites BOOLEAN DEFAULT true;

ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'public' 
CHECK (type IN ('public', 'private'));
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### SavedPostsScreen
- [x] Código de pantalla completo
- [ ] Endpoint `unsavePost()` agregado a api.ts
- [ ] Tabla `saved_posts` verificada en BD
- [ ] Navegación configurada
- [ ] Testing en dispositivo

### CommunityMembersScreen
- [x] Código de pantalla completo
- [ ] Endpoint `getCommunityMembers()` agregado a api.ts
- [ ] Endpoint `removeCommunityMember()` agregado a api.ts
- [ ] Endpoint `updateMemberRole()` agregado a api.ts
- [ ] Tabla `community_members` con columna `role` verificada
- [ ] Navegación desde CommunityDetailScreen configurada
- [ ] Testing de permisos (solo admins pueden modificar)

### CommunitySettingsScreen
- [x] Código de pantalla completo
- [ ] Endpoint `updateCommunitySettings()` agregado a api.ts
- [ ] Endpoint `leaveCommunity()` agregado a api.ts
- [ ] Endpoint `deleteCommunity()` agregado a api.ts
- [ ] Columnas de configuración agregadas a tabla `communities`
- [ ] Navegación desde CommunityDetailScreen configurada
- [ ] Testing de permisos (solo admins para settings)
- [ ] Testing de eliminación en cascada

---

## 🔗 NAVEGACIÓN DESDE CommunityDetailScreen

Agregar en el header de `CommunityDetailScreen.tsx`:

```typescript
// En el botón de "More" (3 puntos)
<TouchableOpacity 
  style={styles.headerActionBtn}
  onPress={() => {
    Alert.alert(
      'Opciones',
      'Selecciona una opción',
      [
        {
          text: 'Ver miembros',
          onPress: () => navigation.navigate('CommunityMembers', {
            communityId: community.id,
            communityName: community.name
          })
        },
        {
          text: 'Configuración',
          onPress: () => navigation.navigate('CommunitySettings', {
            communityId: community.id
          })
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    )
  }}
>
  <MoreHorizontal size={24} color="#111" />
</TouchableOpacity>
```

---

## 🎯 PRIORIDAD DE IMPLEMENTACIÓN

### Mañana (2025-10-03):

1. **ALTA PRIORIDAD** - Agregar endpoints a `api.ts`:
   - `unsavePost()`
   - `getCommunityMembers()`
   - `removeCommunityMember()`
   - `updateMemberRole()`
   - `updateCommunitySettings()`
   - `leaveCommunity()`
   - `deleteCommunity()`

2. **ALTA PRIORIDAD** - Verificar/crear columnas en BD:
   - `saved_posts` tabla completa
   - `community_members.role` columna
   - `communities` columnas de configuración

3. **MEDIA PRIORIDAD** - Configurar navegación:
   - Registrar rutas en navegador
   - Conectar desde CommunityDetailScreen
   - Conectar SavedPostsScreen desde ProfileScreen

4. **BAJA PRIORIDAD** - Testing:
   - Probar cada pantalla
   - Verificar permisos de admin
   - Verificar eliminación en cascada

---

## 📊 IMPACTO

### Pantallas completadas hoy: 3
- SavedPostsScreen ✅
- CommunityMembersScreen ✅
- CommunitySettingsScreen ✅

### Total pantallas funcionando: 19/48 (40%)

### Endpoints nuevos requeridos: 7
- unsavePost
- getCommunityMembers
- removeCommunityMember
- updateMemberRole
- updateCommunitySettings
- leaveCommunity
- deleteCommunity

---

**Última actualización**: 2025-10-02 23:42
**Estado**: Código completo, pendiente agregar endpoints a api.ts
