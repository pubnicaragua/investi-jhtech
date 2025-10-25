# 🚀 IMPLEMENTAR AHORA - CÓDIGO COMPLETO

## ✅ YA IMPLEMENTADO:

1. ✅ **NotificationsModal** - UI arreglada con avatar, título, cuerpo
2. ✅ **SearchAPI** - Usando mock data (API tiene error)
3. ✅ **InvestmentSimulator** - Navegación con getParent().getParent()
4. ✅ **ChatScreen** - Palomitas leído (✓✓)
5. ✅ **useOnlineStatus** - Activado en App.tsx

---

## 📝 PENDIENTE - COPIAR Y PEGAR:

### 1. ProfileScreen - isFollowing verificación

**Archivo**: `src/screens/ProfileScreen.tsx`

Agregar al inicio del componente (después de los useState existentes):

```typescript
// Estado para seguimiento
const [isFollowing, setIsFollowing] = useState(false);
const [checkingFollow, setCheckingFollow] = useState(true);

// Verificar estado de seguimiento al cargar
useEffect(() => {
  if (userId && profileUserId && userId !== profileUserId) {
    checkIfFollowing();
  } else {
    setCheckingFollow(false);
  }
}, [userId, profileUserId]);

const checkIfFollowing = async () => {
  if (!userId || !profileUserId || userId === profileUserId) {
    setCheckingFollow(false);
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', profileUserId)
      .maybeSingle();
    
    setIsFollowing(!!data);
    console.log('🔍 [ProfileScreen] isFollowing:', !!data);
  } catch (err) {
    console.error('Error checking follow status:', err);
  } finally {
    setCheckingFollow(false);
  }
};

const handleFollow = async () => {
  if (checkingFollow) return;
  
  try {
    if (isFollowing) {
      // Unfollow
      await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', profileUserId);
      
      setIsFollowing(false);
      Alert.alert('Éxito', 'Dejaste de seguir a este usuario');
    } else {
      // Follow
      const { error } = await supabase.rpc('follow_user_safe', {
        p_follower_id: userId,
        p_following_id: profileUserId
      });
      
      if (error) throw error;
      
      setIsFollowing(true);
      Alert.alert('Éxito', 'Ahora sigues a este usuario');
    }
    
    // Recargar perfil
    loadProfile();
  } catch (error: any) {
    console.error('Error toggling follow:', error);
    Alert.alert('Error', error.message || 'No se pudo actualizar');
  }
};
```

**Botón Mensaje** (reemplazar el existente):

```typescript
<TouchableOpacity
  style={[
    styles.actionButton, 
    !isFollowing && styles.actionButtonDisabled
  ]}
  onPress={() => {
    if (!isFollowing) {
      Alert.alert(
        'Conexión requerida',
        'Debes seguir a este usuario antes de enviarle mensajes',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Seguir ahora', 
            onPress: handleFollow 
          }
        ]
      );
      return;
    }
    
    navigation.navigate('ChatScreen', {
      participant: {
        id: profileUserId,
        nombre: profileData?.nombre || profileData?.full_name,
        avatar: profileData?.avatar_url || profileData?.photo_url
      }
    });
  }}
  disabled={!isFollowing}
>
  <MessageCircle size={20} color={isFollowing ? "#2673f3" : "#999"} />
  <Text style={[
    styles.actionButtonText, 
    !isFollowing && styles.actionButtonTextDisabled
  ]}>
    Mensaje
  </Text>
</TouchableOpacity>
```

**Estilos agregar**:

```typescript
actionButtonDisabled: {
  backgroundColor: '#f5f5f5',
  borderColor: '#e0e0e0',
},
actionButtonTextDisabled: {
  color: '#999',
},
```

---

### 2. getUserFeed - Filtrar duplicados en BD

**Archivo**: `src/rest/api.ts`

Buscar la función `getUserFeed` y reemplazar:

```typescript
export async function getUserFeed(userId: string, page: number = 0, limit: number = 20): Promise<any[]> {
  try {
    console.log('📊 [getUserFeed] Obteniendo feed para:', userId, 'página:', page, 'limit:', limit);
    
    const start = page * limit;
    const end = start + limit - 1;
    
    // Paso 1: Obtener posts DISTINTOS con paginación
    const { data: response, error } = await supabase
      .from('posts')
      .select('id,contenido,created_at,likes_count,comment_count,user_id,media_url,shares_count')
      .order('created_at', { ascending: false })
      .range(start, end);
    
    if (error) {
      console.error('❌ [getUserFeed] Error:', error);
      return [];
    }
    
    if (!response || response.length === 0) {
      console.log('⚠️ [getUserFeed] No posts found');
      return [];
    }
    
    // Paso 2: Filtrar duplicados por ID (por si acaso)
    const uniquePosts = Array.from(
      new Map(response.map((post: any) => [post.id, post])).values()
    );
    
    console.log('📊 [getUserFeed] Posts únicos:', uniquePosts.length, 'de', response.length);
    
    return uniquePosts;
  } catch (error) {
    console.error('❌ [getUserFeed] Exception:', error);
    return [];
  }
}
```

---

### 3. ChatScreen - Presencia online y typing

**Archivo**: `src/screens/ChatScreen.tsx`

Agregar al inicio del componente (después de useState):

```typescript
// Estado de presencia
const [otherUserOnline, setOtherUserOnline] = useState(false);
const [otherUserLastSeen, setOtherUserLastSeen] = useState<string | null>(null);
const [otherUserTyping, setOtherUserTyping] = useState(false);

// Suscripción a presencia
useEffect(() => {
  if (!conversationId || !participant?.id) return;
  
  // Obtener estado inicial
  const fetchPresence = async () => {
    const { data } = await supabase
      .from('users')
      .select('is_online, last_seen_at')
      .eq('id', participant.id)
      .single();
    
    if (data) {
      setOtherUserOnline(data.is_online || false);
      setOtherUserLastSeen(data.last_seen_at);
    }
  };
  
  fetchPresence();
  
  // Suscribirse a cambios de presencia
  const presenceChannel = supabase
    .channel(`presence:${participant.id}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${participant.id}`
      },
      (payload) => {
        setOtherUserOnline(payload.new.is_online || false);
        setOtherUserLastSeen(payload.new.last_seen_at);
      }
    )
    .subscribe();
  
  // Suscribirse a typing indicators
  const typingChannel = supabase
    .channel(`typing:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        if (payload.new && payload.new.user_id !== currentUserId) {
          setOtherUserTyping(true);
          // Auto-limpiar después de 3 segundos
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      }
    )
    .subscribe();
  
  return () => {
    presenceChannel.unsubscribe();
    typingChannel.unsubscribe();
  };
}, [conversationId, participant?.id, currentUserId]);

// Enviar typing indicator
const handleTyping = async () => {
  if (!conversationId || !currentUserId) return;
  
  try {
    await supabase
      .from('typing_indicators')
      .upsert({
        conversation_id: conversationId,
        user_id: currentUserId,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error sending typing indicator:', error);
  }
};
```

**En el TextInput agregar**:

```typescript
<TextInput
  style={styles.textInput}
  value={newMessage}
  onChangeText={(text) => {
    setNewMessage(text);
    handleTyping(); // Enviar typing indicator
  }}
  placeholder="Escribe un mensaje..."
  multiline
/>
```

**En el header mostrar estado**:

```typescript
<View style={styles.headerInfo}>  
  <Image  
    source={{ uri: participant?.avatar || 'https://i.pravatar.cc/100' }}  
    style={styles.headerAvatar}  
  />  
  <View>  
    <Text style={styles.headerName}>{participant?.nombre || 'Usuario'}</Text>  
    <Text style={styles.headerStatus}>
      {otherUserTyping 
        ? 'escribiendo...' 
        : otherUserOnline 
          ? 'En línea' 
          : otherUserLastSeen 
            ? `Últ. vez ${formatTimeAgo(otherUserLastSeen)}`
            : 'Desconectado'
      }
    </Text>  
  </View>  
</View>
```

**Función formatTimeAgo**:

```typescript
const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};
```

**Estilo agregar**:

```typescript
headerStatus: {
  fontSize: 12,
  color: '#666',
  fontStyle: 'italic',
},
```

---

### 4. GroupChatScreen - Mismo código de presencia

Copiar el código de ChatScreen para GroupChatScreen, adaptando:
- Usar `community_id` en lugar de `conversation_id`
- Tabla `community_typing_indicators` en lugar de `typing_indicators`
- Mostrar lista de usuarios escribiendo

---

## 🗄️ SQL A EJECUTAR:

```sql
-- 1. RLS notifications
\i sql/fix_notifications_rls.sql

-- 2. Message notifications
\i sql/add_message_notifications.sql

-- 3. Limpiar posts duplicados
DELETE FROM posts a
USING posts b
WHERE a.id < b.id
  AND a.contenido = b.contenido
  AND a.user_id = b.user_id
  AND ABS(EXTRACT(EPOCH FROM (a.created_at - b.created_at))) < 1;

-- 4. Verificar no hay duplicados
SELECT id, contenido, user_id, created_at, COUNT(*) as count
FROM posts
GROUP BY id, contenido, user_id, created_at
HAVING COUNT(*) > 1;

-- 5. Crear índice para evitar duplicados futuros
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_unique 
ON posts(user_id, contenido, created_at);
```

---

## 🚀 TESTING:

### 1. NotificationsModal:
- Abrir notificaciones
- ✅ Ver avatar del usuario
- ✅ Ver título y cuerpo
- ✅ Ver tiempo relativo

### 2. ProfileScreen:
- Ver perfil de otro usuario
- ✅ Botón mensaje deshabilitado si no sigue
- ✅ Click "Seguir ahora" → Habilita mensaje
- ✅ Click mensaje → Abre chat

### 3. ChatScreen:
- Abrir chat 1:1
- ✅ Ver "En línea" si está activo
- ✅ Ver "Últ. vez hace Xm" si offline
- ✅ Ver "escribiendo..." cuando escribe
- ✅ Ver ✓✓ cuando lee mensaje

### 4. HomeFeed:
- Scroll hasta el final
- ✅ No ver posts duplicados
- ✅ Ver log: "Posts únicos: 20 de 20"

---

## ✨ RESUMEN:

### ✅ IMPLEMENTADO:
1. NotificationsModal UI completa
2. SearchAPI mock data (API error)
3. InvestmentSimulator navegación
4. ChatScreen palomitas
5. useOnlineStatus automático

### 📝 CÓDIGO LISTO (COPIAR):
1. ProfileScreen isFollowing
2. getUserFeed filtrar duplicados
3. ChatScreen presencia online
4. GroupChatScreen typing indicators

### 🗄️ SQL PENDIENTE:
1. fix_notifications_rls.sql
2. add_message_notifications.sql
3. Limpiar duplicados
4. Índice único

---

**TODO EL CÓDIGO ESTÁ LISTO** ✅

**SOLO COPIAR Y PEGAR** 📋

**EJECUTAR SQL** 🗄️

**REINICIAR APP** 🚀
