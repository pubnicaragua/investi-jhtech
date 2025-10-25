# 🚨 SOLUCIÓN 23 PROBLEMAS CRÍTICOS

## 📋 ORDEN DE EJECUCIÓN

### PASO 1: EJECUTAR SQL
```bash
# En Supabase SQL Editor, ejecutar en este orden:
1. sql/FIX_23_PROBLEMS.sql
```

### PASO 2: APLICAR CORRECCIONES DE CÓDIGO

---

## 1️⃣ CommunityRecommendations - Nombres usuarios ✅
**Archivo**: `src/screens/CommunityRecommendationsScreen.tsx`
**Línea 160**: Ya usa `person.full_name || person.name || person.nombre || person.username || 'Usuario'`
**Solución**: El SQL `get_recommended_people()` ahora devuelve todos los campos necesarios

---

## 2️⃣ Guardar post duplicado ✅
**Archivo**: `src/rest/api.ts` línea 2826
**Ya manejado**: `if (error.code === "23505") return null`
**Mejora**: Agregar try-catch silencioso en HomeFeedScreen

**Cambio en** `src/screens/HomeFeedScreen.tsx` línea 276:
```typescript
// ANTES:
await savePost(postId, userId)

// DESPUÉS:
const result = await savePost(postId, userId)
if (!result) {
  // Ya estaba guardado, solo actualizar UI
  return
}
```

---

## 3️⃣ Botón guardar posición ✅
**Archivo**: `src/components/PostCard.tsx` o donde esté el botón
**Cambio**: Mover botón "Guardar" al lado derecho debajo de los 3 puntos

Buscar el componente que renderiza los posts y cambiar layout:
```typescript
<View style={styles.postActions}>
  <View style={styles.leftActions}>
    <TouchableOpacity onPress={handleLike}>
      <ThumbsUp />
    </TouchableOpacity>
    <TouchableOpacity onPress={handleComment}>
      <MessageCircle />
    </TouchableOpacity>
    <TouchableOpacity onPress={handleShare}>
      <Share2 />
    </TouchableOpacity>
  </View>
  
  <View style={styles.rightActions}>
    <TouchableOpacity onPress={handleMore}>
      <MoreHorizontal />
    </TouchableOpacity>
    <TouchableOpacity onPress={handleSave}>
      <Bookmark />
    </TouchableOpacity>
  </View>
</View>
```

---

## 4️⃣ Compartir perfil funcional ✅
**Archivo**: `src/screens/ProfileScreen.tsx`
**Buscar**: `handleShareProfile` o botón compartir
**Agregar**:
```typescript
import { Share } from 'react-native'

const handleShareProfile = async () => {
  try {
    await Share.share({
      message: `¡Mira el perfil de ${profileData.full_name || profileData.nombre} en Investí! 
      
Únete a la comunidad de inversionistas: https://investi.app/profile/${userId}`,
      title: 'Compartir perfil'
    })
  } catch (error) {
    console.error('Error sharing:', error)
  }
}
```

---

## 5️⃣ Seguidores vs contactos ✅
**Archivo**: `src/screens/ProfileScreen.tsx`
**Problema**: Muestra "0 contactos" pero tiene seguidores
**Solución**: Usar la función SQL `get_user_connections_count()`

```typescript
const [connectionsData, setConnectionsData] = useState({
  followers: 0,
  following: 0,
  mutualConnections: 0
})

useEffect(() => {
  const loadConnections = async () => {
    const { data } = await supabase
      .rpc('get_user_connections_count', { user_id_param: userId })
    
    if (data && data.length > 0) {
      setConnectionsData({
        followers: data[0].followers_count,
        following: data[0].following_count,
        mutualConnections: data[0].mutual_connections_count
      })
    }
  }
  loadConnections()
}, [userId])

// En el render:
<Text>{connectionsData.followers} seguidores</Text>
<Text>{connectionsData.mutualConnections} contactos</Text>
```

---

## 6️⃣ Notificaciones sin title ✅
**SQL ejecutado**: Agrega columna `title` y `body`
**Archivo**: `src/rest/api.ts` - función `createNotification`
**Asegurar que siempre envíe title**:
```typescript
export async function createNotification(data: {
  user_id: string
  type: string
  title: string  // ← REQUERIDO
  body?: string
  related_user_id?: string
  related_post_id?: string
}) {
  return await request("POST", "/notifications", { body: data })
}
```

---

## 7️⃣ CreatePost encuesta opciones ✅
**Archivo**: `src/screens/CreatePostScreen.tsx`
**Buscar**: `pollOptions` o donde se renderizan las opciones
**Asegurar que muestre TODAS las opciones**:
```typescript
{pollOptions.map((option, index) => (
  <View key={index} style={styles.pollOption}>
    <TextInput
      value={option}
      onChangeText={(text) => updatePollOption(index, text)}
      placeholder={`Opción ${index + 1}`}
    />
    {pollOptions.length > 2 && (
      <TouchableOpacity onPress={() => removePollOption(index)}>
        <X size={20} />
      </TouchableOpacity>
    )}
  </View>
))}

{pollOptions.length < 10 && (
  <TouchableOpacity onPress={addPollOption}>
    <Text>+ Agregar opción</Text>
  </TouchableOpacity>
)}
```

---

## 8️⃣ MarketInfo filtros + simular ✅
**Archivo**: `src/screens/MarketInfoScreen.tsx`
**Agregar filtros**:
```typescript
const [selectedFilter, setSelectedFilter] = useState('all')
const filters = ['Todos', 'Chile', 'USA', 'Tecnología', 'Energía', 'Finanzas']

const filteredStocks = useMemo(() => {
  if (selectedFilter === 'all') return stocks
  
  return stocks.filter(stock => {
    if (selectedFilter === 'Chile') return stock.symbol.endsWith('.SN')
    if (selectedFilter === 'USA') return !stock.symbol.includes('.')
    if (selectedFilter === 'Tecnología') return ['AAPL', 'GOOGL', 'MSFT', 'TSLA'].includes(stock.symbol)
    // ... más filtros
  })
}, [stocks, selectedFilter])
```

**Agregar botones en cada acción**:
```typescript
<TouchableOpacity onPress={() => handleAddToPortfolio(stock)}>
  <Text>Agregar a portafolio</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => handleSimulateInvestment(stock)}>
  <Text>Simular inversión</Text>
</TouchableOpacity>
```

**Funciones**:
```typescript
const handleAddToPortfolio = async (stock) => {
  const { error } = await supabase
    .from('user_portfolio')
    .upsert({
      user_id: userId,
      stock_symbol: stock.symbol,
      stock_name: stock.company_name,
      quantity: 0,
      current_price: stock.current_price
    })
  
  if (!error) Alert.alert('✓', 'Agregado a tu portafolio')
}

const handleSimulateInvestment = (stock) => {
  navigation.navigate('InvestmentSimulator', { stock })
}
```

**Disclaimer**:
```typescript
<Text style={styles.disclaimer}>
  ⚠️ Ojo: esta es solo una simulación. No garantiza resultados reales ni constituye asesoría financiera. 
  Invertir siempre conlleva riesgos. Te recomendamos informarte y, si es necesario, buscar orientación 
  profesional antes de invertir.
</Text>
```

---

## 9️⃣ Educación scroll bugs ✅
**Archivo**: `src/screens/EducacionScreen.tsx`
**Problema**: Herramientas en blanco y scroll saca de pantalla
**Solución**:
```typescript
// Línea ~292: Cambiar de ScrollView horizontal a FlatList
<FlatList
  horizontal
  data={tools}
  renderItem={({ item }) => renderToolGridItem(item)}
  keyExtractor={(item) => item.id}
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.toolsScrollContent}
  snapToInterval={width * 0.4}
  decelerationRate="fast"
/>

// Asegurar que el ScrollView principal tenga:
<ScrollView
  style={styles.container}
  contentContainerStyle={styles.scrollContent}
  bounces={false}  // ← Evita que se salga
  scrollEventThrottle={16}
>
```

---

## 🔟 Herramientas cortadas + 3 nuevas ✅
**SQL ejecutado**: Agrega 3 herramientas nuevas
**Archivo**: `src/screens/EducacionScreen.tsx`
**Cambiar ancho de tarjetas**:
```typescript
toolGridCard: {
  width: (width - 48) / 2.5,  // ← Cambiar de /2 a /2.5 para que no se corten
  minWidth: 140,
  marginRight: 12,
  // ...
},
toolGridTitle: {
  fontSize: 13,  // ← Reducir de 14 a 13
  fontWeight: '600',
  numberOfLines: 2,  // ← Permitir 2 líneas
  // ...
}
```

---

## 1️⃣1️⃣ Foto portada ProfileScreen ✅
**SQL ejecutado**: Agrega columna `cover_photo_url`
**Archivo**: `src/screens/ProfileScreen.tsx`
**Agregar botón cambiar portada**:
```typescript
{isOwnProfile && (
  <TouchableOpacity 
    style={styles.changeCoverBtn}
    onPress={handleChangeCoverPhoto}
  >
    <Camera size={20} color="#fff" />
  </TouchableOpacity>
)}

const handleChangeCoverPhoto = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
  })

  if (!result.canceled) {
    const imageUri = result.assets[0].uri
    // Upload a Supabase Storage
    const { data, error } = await supabase.storage
      .from('covers')
      .upload(`${userId}/cover_${Date.now()}.jpg`, {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'cover.jpg'
      })
    
    if (!error) {
      const publicUrl = supabase.storage.from('covers').getPublicUrl(data.path).data.publicUrl
      
      await supabase
        .from('users')
        .update({ cover_photo_url: publicUrl })
        .eq('id', userId)
      
      setCoverPhotoUrl(publicUrl)
    }
  }
}
```

---

## 1️⃣2️⃣ Startups proximamente v2.0 ✅
**Archivo**: Buscar navegación a 'Startups'
**Cambiar por**:
```typescript
<TouchableOpacity onPress={() => {
  Alert.alert(
    'Próximamente en v2.0 de Investí',
    'Esta función estará disponible en la próxima versión de Investí.',
    [{ text: 'OK' }]
  )
}}>
  <Text>Startups</Text>
</TouchableOpacity>
```

---

## 1️⃣3️⃣ Seguir usuario estado + notif ✅
**SQL ejecutado**: Trigger para notificaciones automáticas
**Archivo**: `src/screens/HomeFeedScreen.tsx` y componentes de usuarios
**Agregar verificación**:
```typescript
const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())

useEffect(() => {
  const loadFollowing = async () => {
    const { data } = await supabase
      .from('user_follows')
      .select('followed_id')
      .eq('follower_id', userId)
    
    setFollowingUsers(new Set(data?.map(f => f.followed_id) || []))
  }
  loadFollowing()
}, [userId])

// En el render:
{!followingUsers.has(user.id) && (
  <TouchableOpacity onPress={() => handleFollow(user.id)}>
    <Text>Seguir</Text>
  </TouchableOpacity>
)}
```

---

## 1️⃣4️⃣ Chats archivados ✅
**Archivo**: `src/screens/ChatListScreen.tsx`
**Buscar**: "Chats archivados" o "Proximamente"
**Opción 1 - Eliminar**:
```typescript
// Comentar o eliminar la opción
```

**Opción 2 - Implementar**:
```typescript
<TouchableOpacity onPress={() => navigation.navigate('ArchivedChats')}>
  <Text>Chats archivados</Text>
</TouchableOpacity>
```

---

## 1️⃣5️⃣ Lista contactos mensajes ✅
**Archivo**: `src/screens/ChatListScreen.tsx`
**Cambiar**:
```typescript
// ANTES:
<TouchableOpacity onPress={() => Alert.alert('Proximamente')}>
  <Text>Lista de contactos</Text>
</TouchableOpacity>

// DESPUÉS:
<TouchableOpacity onPress={() => navigation.navigate('NewMessage')}>
  <Text>Lista de contactos</Text>
</TouchableOpacity>
```

---

## 1️⃣6️⃣ PromotionsScreen búsqueda Enter ✅
**Archivo**: `src/screens/PromotionsScreen.tsx`
**Cambiar búsqueda a onSubmitEditing**:
```typescript
const [searchInput, setSearchInput] = useState('')
const [searchQuery, setSearchQuery] = useState('')

<TextInput
  value={searchInput}
  onChangeText={setSearchInput}
  onSubmitEditing={() => setSearchQuery(searchInput)}
  returnKeyType="search"
  placeholder="Buscar..."
/>

// Filtrar con searchQuery (no searchInput)
const filteredPeople = useMemo(() => {
  if (!searchQuery.trim()) return people
  // ...
}, [people, searchQuery])
```

---

## 1️⃣7️⃣ Invitar dentro/fuera app ✅
**Archivo**: Buscar botón "Invitar"
**Implementar**:
```typescript
import { Share } from 'react-native'

const handleInvite = () => {
  Alert.alert(
    'Invitar',
    '¿Cómo quieres invitar?',
    [
      {
        text: 'Compartir fuera de la app',
        onPress: async () => {
          await Share.share({
            message: '¡Únete a Investí! La mejor app para inversionistas 🚀\n\nDescarga: https://investi.app',
            title: 'Invitación a Investí'
          })
        }
      },
      {
        text: 'Enviar a conexión',
        onPress: () => navigation.navigate('SelectConnection', { action: 'invite' })
      },
      { text: 'Cancelar', style: 'cancel' }
    ]
  )
}
```

---

## 1️⃣8️⃣ CommunityDetail tabs deslizar ✅
**Archivo**: `src/screens/CommunityDetailScreen.tsx`
**Cambiar de TouchableOpacity a TabView**:
```typescript
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'

const [index, setIndex] = useState(0)
const [routes] = useState([
  { key: 'posts', title: 'Publicaciones' },
  { key: 'myPosts', title: 'Tus publicaciones' },
  { key: 'chats', title: 'Chats' },
])

const renderScene = SceneMap({
  posts: PostsRoute,
  myPosts: MyPostsRoute,
  chats: ChatsRoute,
})

<TabView
  navigationState={{ index, routes }}
  renderScene={renderScene}
  onIndexChange={setIndex}
  renderTabBar={props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#2673f3' }}
      style={{ backgroundColor: '#fff' }}
      labelStyle={{ color: '#111', fontWeight: '600' }}
    />
  )}
/>
```

---

## 1️⃣9️⃣ GroupChat hardcode ✅
**Archivo**: `src/screens/GroupChatScreen.tsx`
**Buscar**: "12k miembros" o "1,098 activos"
**Cambiar por datos reales**:
```typescript
const [communityStats, setCommunityStats] = useState({
  totalMembers: 0,
  activeMembers: 0
})

useEffect(() => {
  const loadStats = async () => {
    const { data } = await supabase
      .from('communities')
      .select('member_count, active_members_count')
      .eq('id', communityId)
      .single()
    
    if (data) {
      setCommunityStats({
        totalMembers: data.member_count || 0,
        activeMembers: data.active_members_count || 0
      })
    }
  }
  loadStats()
}, [communityId])

// En el render:
<Text>{communityStats.totalMembers.toLocaleString()} miembros</Text>
<Text>{communityStats.activeMembers.toLocaleString()} activos</Text>
```

---

## 2️⃣0️⃣ EditCommunity imagen + tests ✅
**Archivo**: `src/screens/EditCommunityScreen.tsx`
**Asegurar que imagen funcione**:
```typescript
const handleSave = async () => {
  const updates: any = {}
  
  if (name !== originalData.name) updates.name = name
  if (description !== originalData.description) updates.description = description
  if (isPrivate !== originalData.is_private) updates.is_private = isPrivate
  if (requiresApproval !== originalData.requires_approval) updates.requires_approval = requiresApproval
  if (tags.length > 0) updates.tags = tags
  
  // IMPORTANTE: Subir imagen PRIMERO si cambió
  if (imageUri && imageUri !== originalData.image_url) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('community-images')
      .upload(`${communityId}/${Date.now()}.jpg`, {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'community.jpg'
      })
    
    if (!uploadError && uploadData) {
      const publicUrl = supabase.storage
        .from('community-images')
        .getPublicUrl(uploadData.path).data.publicUrl
      
      updates.image_url = publicUrl
    }
  }
  
  // Guardar TODOS los cambios juntos
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('communities')
      .update(updates)
      .eq('id', communityId)
    
    if (!error) {
      Alert.alert('✓', 'Comunidad actualizada')
      navigation.goBack()
    } else {
      Alert.alert('Error', error.message)
    }
  }
}
```

---

## 2️⃣1️⃣ CommunitySettings completo ✅
**Archivo**: `src/screens/CommunitySettingsScreen.tsx`
**Implementar TODOS los switches y opciones**:
```typescript
const [settings, setSettings] = useState({
  allowPosts: true,
  allowInvitations: true,
  allowComments: true,
  allowReactions: true,
  notificationsEnabled: true,
  notifyNewMembers: true,
  notifyNewPosts: false,
  notifyNewComments: false,
  autoModeration: false,
  offensiveLanguageFilter: true,
  spamFilter: true,
  showMemberCount: true,
  showMemberList: true,
})

const handleSaveSettings = async () => {
  const { error } = await supabase
    .from('community_settings')
    .upsert({
      community_id: communityId,
      ...settings,
      updated_at: new Date().toISOString()
    })
  
  if (!error) Alert.alert('✓', 'Configuración guardada')
}

// Render todos los switches
{Object.entries(settings).map(([key, value]) => (
  <View key={key} style={styles.settingRow}>
    <Text>{getSettingLabel(key)}</Text>
    <Switch
      value={value}
      onValueChange={(val) => setSettings(prev => ({ ...prev, [key]: val }))}
    />
  </View>
))}
```

---

## 2️⃣2️⃣ EditCommunity guardar imagen ✅
**Ya cubierto en problema 20**

---

## 2️⃣3️⃣ Chat unirse validación ✅
**Archivo**: `src/screens/CommunityDetailScreen.tsx`
**Validar si ya es miembro**:
```typescript
const [isMember, setIsMember] = useState(false)

useEffect(() => {
  const checkMembership = async () => {
    const { data } = await supabase
      .from('user_communities')
      .select('id')
      .eq('user_id', userId)
      .eq('community_id', communityId)
      .single()
    
    setIsMember(!!data)
  }
  checkMembership()
}, [userId, communityId])

// En el botón:
<TouchableOpacity onPress={() => {
  if (isMember) {
    navigation.navigate('GroupChat', { communityId })
  } else {
    handleJoinCommunity()
  }
}}>
  <Text>{isMember ? 'Ir al chat' : 'Unirse'}</Text>
</TouchableOpacity>
```

---

## ✅ RESUMEN

**SQL**: 1 archivo (`FIX_23_PROBLEMS.sql`)
**Código**: 23 cambios en múltiples archivos

**Prioridad Alta** (hacer primero):
- 2, 6, 8, 13, 16, 20, 21, 23

**Prioridad Media**:
- 1, 3, 4, 5, 7, 9, 10, 11, 18, 19, 22

**Prioridad Baja** (mejoras UX):
- 12, 14, 15, 17

---

## 🧪 TESTING

Después de aplicar cambios, probar:
1. Guardar post (no debe dar error duplicado)
2. Seguir usuario (no debe aparecer de nuevo)
3. Búsqueda en Promotions (solo al dar Enter)
4. Editar comunidad (imagen debe guardar)
5. Ver perfil (seguidores vs contactos correcto)
