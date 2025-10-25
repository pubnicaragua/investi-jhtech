# 🎯 INSTRUCCIONES FINALES - 10 PROBLEMAS RESTANTES

## ✅ YA COMPLETADOS: 13/23 (57%)

Problemas 1, 2, 3, 4, 5, 6, 7, 8, 12, 14, 15, 16, 23

---

## ⚡ PROBLEMAS 9-13: CAMBIOS RÁPIDOS

### 9. Educación scroll bugs
**Archivo**: `src/screens/EducacionScreen.tsx`
**Línea**: ~200-250 (buscar ScrollView horizontal de herramientas)

**Cambio**:
```tsx
// ANTES:
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {tools.map(...)}
</ScrollView>

// DESPUÉS:
<FlatList
  horizontal
  data={tools}
  renderItem={({ item }) => <ToolCard tool={item} />}
  keyExtractor={(item) => item.id}
  showsHorizontalScrollIndicator={false}
  bounces={false}
  contentContainerStyle={{ paddingHorizontal: 16 }}
/>
```

---

### 10. Herramientas cortadas + 3 nuevas
**Archivo**: `src/screens/EducacionScreen.tsx`

**Cambio 1 - Arreglar width**:
```tsx
// Buscar: toolGridCard
toolGridCard: {
  width: (SCREEN_WIDTH - 48) / 2.5,  // CAMBIAR de /2 a /2.5
  ...
}
```

**Cambio 2 - Agregar 3 herramientas nuevas**:
```tsx
// Agregar al array de tools:
{
  id: 'calculadora-roi',
  title: 'Calculadora ROI',
  icon: 'calculator',
  color: '#8B5CF6',
  route: 'CalculadoraROI'
},
{
  id: 'analisis-riesgo',
  title: 'Análisis de Riesgo',
  icon: 'shield-checkmark',
  color: '#EC4899',
  route: 'AnalisisRiesgo'
},
{
  id: 'diversificacion',
  title: 'Diversificación',
  icon: 'pie-chart',
  color: '#14B8A6',
  route: 'Diversificacion'
}
```

---

### 11. Foto portada ProfileScreen
**Archivo**: `src/screens/ProfileScreen.tsx`

**Agregar después del banner (línea ~540)**:
```tsx
{isOwnProfile && (
  <TouchableOpacity 
    style={styles.editCoverButton}
    onPress={handleChangeCoverPhoto}
  >
    <Edit2 size={20} color="#fff" />
  </TouchableOpacity>
)}
```

**Agregar función**:
```tsx
const handleChangeCoverPhoto = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  })

  if (!result.canceled && result.assets[0]) {
    const uri = result.assets[0].uri
    const userId = await getCurrentUserId()
    
    // Subir a Supabase Storage
    const fileName = `cover_${userId}_${Date.now()}.jpg`
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, {
        uri,
        type: 'image/jpeg',
        name: fileName
      })
    
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      await supabase
        .from('users')
        .update({ cover_photo_url: publicUrl })
        .eq('id', userId)
      
      Alert.alert('✓ Actualizado', 'Foto de portada actualizada')
      loadProfile()
    }
  }
}
```

**Agregar estilo**:
```tsx
editCoverButton: {
  position: 'absolute',
  bottom: 16,
  right: 16,
  backgroundColor: 'rgba(0,0,0,0.6)',
  borderRadius: 20,
  padding: 8,
}
```

---

### 13. Seguir usuario estado + notif
**Archivo**: `src/screens/HomeFeedScreen.tsx`

**Línea ~500 (buscar botón Seguir)**:
```tsx
// ANTES:
{!isOwnPost && (
  <TouchableOpacity onPress={() => handleFollow(item.user_id)}>
    <Text>Seguir</Text>
  </TouchableOpacity>
)}

// DESPUÉS:
{!isOwnPost && !followingUsers.has(item.user_id) && (
  <TouchableOpacity 
    style={styles.followButton}
    onPress={() => handleFollow(item.user_id)}
  >
    <Plus size={16} color="#2673f3" />
    <Text style={styles.followText}>Seguir</Text>
  </TouchableOpacity>
)}
```

**Agregar estado**:
```tsx
const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())

// En loadFeed():
const { data: following } = await supabase
  .from('user_follows')
  .select('followed_id')
  .eq('follower_id', currentUserId)

if (following) {
  setFollowingUsers(new Set(following.map(f => f.followed_id)))
}
```

**Agregar estilos**:
```tsx
followButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#2673f3',
},
followText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#2673f3',
}
```

---

## 🔥 PROBLEMAS 17-22: IMPLEMENTACIONES COMPLETAS

### 17. Invitar dentro/fuera app
**Archivo**: Buscar función `handleInvite` en todos los screens

**Cambio**:
```tsx
const handleInvite = () => {
  Alert.alert(
    'Invitar',
    '¿Cómo quieres invitar?',
    [
      {
        text: 'Compartir fuera de la app',
        onPress: async () => {
          await Share.share({
            message: '¡Únete a Investí! La mejor app para inversionistas 🚀\n\nhttps://investi.app'
          })
        }
      },
      {
        text: 'Invitar conexión',
        onPress: () => navigation.navigate('SelectConnection', {
          onSelect: async (userId) => {
            // Enviar invitación
            await supabase.from('invitations').insert({
              from_user_id: currentUserId,
              to_user_id: userId,
              type: 'community',
              community_id: communityId
            })
            Alert.alert('✓ Enviado', 'Invitación enviada')
          }
        })
      },
      { text: 'Cancelar', style: 'cancel' }
    ]
  )
}
```

---

### 18. CommunityDetail tabs deslizar
**Archivo**: `src/screens/CommunityDetailScreen.tsx`

**Instalar**:
```bash
npm install react-native-tab-view
```

**Cambio completo** (línea ~800):
```tsx
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'

const [index, setIndex] = useState(0)
const [routes] = useState([
  { key: 'posts', title: 'Publicaciones' },
  { key: 'userPosts', title: 'Tus Publicaciones' },
  { key: 'chats', title: 'Chats' },
  { key: 'multimedia', title: 'Multimedia' },
  { key: 'search', title: 'Buscar' },
])

const renderScene = SceneMap({
  posts: PostsRoute,
  userPosts: UserPostsRoute,
  chats: ChatsRoute,
  multimedia: MultimediaRoute,
  search: SearchRoute,
})

<TabView
  navigationState={{ index, routes }}
  renderScene={renderScene}
  onIndexChange={setIndex}
  renderTabBar={props => (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={{ backgroundColor: '#2673f3' }}
      style={{ backgroundColor: '#fff' }}
      labelStyle={{ color: '#111', fontSize: 14 }}
    />
  )}
/>
```

---

### 19. GroupChat hardcode
**Archivo**: `src/screens/GroupChatScreen.tsx`

**Buscar líneas con "12k miembros" y "1,098 activos"**:
```tsx
// ANTES:
<Text>12k miembros</Text>
<Text>1,098 activos</Text>

// DESPUÉS:
<Text>{community?.members_count || 0} miembros</Text>
<Text>{community?.active_members_count || 0} activos</Text>
```

**Cargar datos reales**:
```tsx
const [community, setCommunity] = useState(null)

useEffect(() => {
  const loadCommunity = async () => {
    const { data } = await supabase
      .from('communities')
      .select('members_count, active_members_count')
      .eq('id', communityId)
      .single()
    
    setCommunity(data)
  }
  loadCommunity()
}, [communityId])
```

---

### 20 y 22. EditCommunity imagen
**Archivo**: `src/screens/EditCommunityScreen.tsx`

**Cambio en handleSave**:
```tsx
const handleSave = async () => {
  try {
    let imageUrl = community.icono_url
    
    // 1. PRIMERO subir imagen si hay una nueva
    if (selectedImage) {
      const fileName = `community_${communityId}_${Date.now()}.jpg`
      const { data, error } = await supabase.storage
        .from('community-images')
        .upload(fileName, {
          uri: selectedImage,
          type: 'image/jpeg',
          name: fileName
        })
      
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('community-images')
          .getPublicUrl(fileName)
        imageUrl = publicUrl
      }
    }
    
    // 2. DESPUÉS actualizar todo junto
    const { error } = await supabase
      .from('communities')
      .update({
        name: communityName,
        description: communityDescription,
        icono_url: imageUrl,
        type: isPrivate ? 'private' : 'public',
        tags: selectedTags,
        settings: {
          require_approval: requireApproval,
          show_member_count: showMemberCount,
          show_member_list: showMemberList
        }
      })
      .eq('id', communityId)
    
    if (!error) {
      Alert.alert('✓ Guardado', 'Comunidad actualizada')
      navigation.goBack()
    }
  } catch (error) {
    console.error('Error:', error)
    Alert.alert('Error', 'No se pudo guardar')
  }
}
```

---

### 21. CommunitySettings completo
**Archivo**: `src/screens/CommunitySettingsScreen.tsx`

**Implementar TODOS los switches**:
```tsx
const [settings, setSettings] = useState({
  allowPosts: true,
  allowInvitations: true,
  allowComments: true,
  allowReactions: true,
  enableNotifications: true,
  notifyNewMembers: true,
  notifyNewPosts: false,
  notifyNewComments: false,
  autoModeration: false,
  offensiveLanguageFilter: true,
  spamFilter: true,
})

const handleSaveSettings = async () => {
  const { error } = await supabase
    .from('communities')
    .update({ settings })
    .eq('id', communityId)
  
  if (!error) {
    Alert.alert('✓ Guardado', 'Configuración actualizada')
  }
}

// Render:
<Switch
  value={settings.allowPosts}
  onValueChange={(value) => setSettings({...settings, allowPosts: value})}
/>
// ... repetir para cada setting
```

**Gestionar miembros (CRUD)**:
```tsx
const handleRemoveMember = async (userId) => {
  Alert.alert(
    'Eliminar miembro',
    '¿Estás seguro?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await supabase
            .from('user_communities')
            .delete()
            .eq('user_id', userId)
            .eq('community_id', communityId)
          
          Alert.alert('✓ Eliminado')
          loadMembers()
        }
      }
    ]
  )
}
```

---

## 📊 RESUMEN FINAL

**COMPLETADOS**: 13/23 (57%)
**PENDIENTES CON INSTRUCCIONES**: 10/23 (43%)

Todos los problemas tienen solución completa documentada arriba.

**Tiempo estimado para implementar los 10 restantes**: 2-3 horas

¡TODO LISTO PARA IMPLEMENTAR! 🚀
