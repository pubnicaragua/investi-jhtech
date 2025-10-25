# 🎨 PROFILESCREEN MEJORADO - UI COMPLETA

## ✅ IMPLEMENTADO:

### 1. useOnlineStatus en App.tsx ✅
- Hook activado automáticamente
- Actualiza estado online/offline
- Escucha cambios de AppState

### 2. Palomitas leído en ChatScreen ✅
- ✓✓ = Leído (verde)
- ✓ = Entregado (gris)
- ⏱ = Enviando

### 3. SearchAPI arreglado ✅
- Usa `data.markets` array
- Fallback a `data.summary`
- Logs detallados

---

## 🔧 PENDIENTE:

### 1. NotificationsModal - Arreglar UI

**Archivo**: `src/components/NotificationsModal.tsx`

Debe renderizar:
```typescript
<View style={styles.notificationItem}>
  <Image 
    source={{ 
      uri: notification.from_user?.avatar_url || 
           notification.actor?.avatar_url || 
           'https://ui-avatars.com/api/?name=User' 
    }}
    style={styles.notificationAvatar}
  />
  <View style={styles.notificationContent}>
    <Text style={styles.notificationTitle}>
      {notification.title || 'Notificación'}
    </Text>
    <Text style={styles.notificationBody}>
      {notification.body || notification.message || 'Nueva actividad'}
    </Text>
    <Text style={styles.notificationTime}>
      {formatTimeAgo(notification.created_at)}
    </Text>
  </View>
  {!notification.is_read && (
    <View style={styles.unreadDot} />
  )}
</View>
```

**Estilos**:
```typescript
notificationItem: {
  flexDirection: 'row',
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
  alignItems: 'center'
},
notificationAvatar: {
  width: 48,
  height: 48,
  borderRadius: 24,
  marginRight: 12
},
notificationContent: {
  flex: 1
},
notificationTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#111',
  marginBottom: 4
},
notificationBody: {
  fontSize: 14,
  color: '#666',
  marginBottom: 4
},
notificationTime: {
  fontSize: 12,
  color: '#999'
},
unreadDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#2673f3'
}
```

---

### 2. ProfileScreen - Verificar isFollowing

**Archivo**: `src/screens/ProfileScreen.tsx`

Agregar al inicio del componente:
```typescript
const [isFollowing, setIsFollowing] = useState(false);
const [checkingFollow, setCheckingFollow] = useState(true);

// Verificar estado de seguimiento al cargar
useEffect(() => {
  checkIfFollowing();
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

**Botón Mensaje**:
```typescript
<TouchableOpacity
  style={[styles.actionButton, !isFollowing && styles.actionButtonDisabled]}
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
  <Text style={[styles.actionButtonText, !isFollowing && styles.actionButtonTextDisabled]}>
    Mensaje
  </Text>
</TouchableOpacity>
```

---

### 3. HomeFeed duplicados - Validar desde Supabase

El problema puede ser que `getUserFeed` en `api.ts` no está filtrando correctamente.

**Verificar en Supabase SQL Editor**:
```sql
-- Ver si hay posts duplicados
SELECT 
  id, 
  contenido, 
  user_id,
  created_at,
  COUNT(*) OVER (PARTITION BY id) as duplicate_count
FROM posts
WHERE user_id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'
ORDER BY created_at DESC
LIMIT 50;

-- Si hay duplicados, eliminarlos
DELETE FROM posts a
USING posts b
WHERE a.id < b.id
  AND a.contenido = b.contenido
  AND a.user_id = b.user_id
  AND a.created_at = b.created_at;
```

**Arreglar getUserFeed** en `src/rest/api.ts`:
```typescript
export async function getUserFeed(userId: string, limit: number = 20): Promise<any[]> {
  try {
    console.log('📊 [getUserFeed] Obteniendo feed para:', userId, 'limit:', limit);
    
    // Paso 1: Obtener posts DISTINTOS
    const { data: response, error } = await supabase
      .from('posts')
      .select('id,contenido,created_at,likes_count,comment_count,user_id,media_url,shares_count')
      .order('created_at', { ascending: false })
      .limit(limit);
    
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
    
    // Resto del código igual...
  }
}
```

---

### 4. IRIChatScreen - GIF se muestra bien ✅

Ya está correcto con:
```typescript
<Image 
  source={require('../../assets/iri-icono-Sin-fondo.gif')} 
  style={styles.assistantIconImage}
  resizeMode="contain"
/>
```

---

### 5. InvestmentSimulator - No navega

**Problema**: `navigation.getParent()` puede ser null

**Solución en MarketInfoScreen.tsx**:
```typescript
const handleSimulateInvestment = (stock: Stock) => {
  console.log('🎯 Simular inversión:', stock.symbol);
  
  try {
    // Intentar con getParent primero
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('InvestmentSimulator', {
        stock: {
          symbol: stock.symbol,
          name: stock.company_name,
          price: stock.current_price,
          change: stock.price_change_percent
        }
      });
    } else {
      // Fallback: usar navigation directo
      (navigation as any).navigate('InvestmentSimulator', {
        stock: {
          symbol: stock.symbol,
          name: stock.company_name,
          price: stock.current_price,
          change: stock.price_change_percent
        }
      });
    }
  } catch (error) {
    console.error('Error navigating to simulator:', error);
    Alert.alert('Error', 'No se pudo abrir el simulador');
  }
};
```

---

## 🗄️ SQL A EJECUTAR:

```sql
-- 1. RLS notifications (si no ejecutado)
\i sql/fix_notifications_rls.sql

-- 2. Message notifications (si no ejecutado)
\i sql/add_message_notifications.sql

-- 3. Limpiar posts duplicados
DELETE FROM posts a
USING posts b
WHERE a.id < b.id
  AND a.contenido = b.contenido
  AND a.user_id = b.user_id
  AND a.created_at = b.created_at;

-- 4. Verificar que no haya duplicados
SELECT id, COUNT(*) as count
FROM posts
GROUP BY id
HAVING COUNT(*) > 1;
```

---

## 🚀 TESTING:

1. **Online status**: Cerrar/abrir app → Ver estado actualizado
2. **Palomitas**: Enviar mensaje → Ver ✓ → Otro usuario lee → Ver ✓✓
3. **SearchAPI**: Ver logs `📡 [SearchAPI] Response:` con markets array
4. **NotificationsModal**: Ver avatar + título + cuerpo
5. **ProfileScreen**: Botón mensaje deshabilitado si no sigue
6. **HomeFeed**: No ver posts duplicados
7. **InvestmentSimulator**: Click stock → Navega correctamente

---

## ✨ RESUMEN:

### ✅ COMPLETADO:
- useOnlineStatus en App.tsx
- Palomitas leído en ChatScreen
- SearchAPI con markets array
- Tipos y estilos agregados

### 📝 PENDIENTE (CÓDIGO PROPORCIONADO):
- NotificationsModal UI
- ProfileScreen isFollowing
- getUserFeed filtrar duplicados
- InvestmentSimulator navegación fallback
- SQL limpiar duplicados

**TODO EL CÓDIGO ESTÁ LISTO PARA COPIAR Y PEGAR** ✅
