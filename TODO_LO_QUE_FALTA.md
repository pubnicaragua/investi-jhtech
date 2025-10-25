# ✅ TODO LO QUE FALTA - ESTADO REAL

## ✅ COMPLETADO

### 1. API Real de Market Data ✅
- **Cambiado a Financial Modeling Prep API**
- API Key: `igaze6ph1NawrHgRDjsWwuFq`
- **Funciona sin CORS**
- **Datos reales en tiempo real**
- Ya no necesita Supabase

### 2. Scroll Infinito en HomeFeed ✅
- Ya implementado
- Repite posts indefinidamente

## 🔧 LO QUE FALTA HACER

### 1. Corregir Compartir Posts ❌

**Archivo:** `src/screens/HomeFeedScreen.tsx`

**Buscar la función `handleShare` (línea ~240) y reemplazar:**

```typescript
const handleShare = async (postId: string, content: string) => {
  try {
    await Share.share({
      message: content || 'Mira esta publicación en Investi',
      title: 'Compartir publicación',
    });
    
    if (userId) {
      await sharePost(postId, userId, 'native');
    }
  } catch (error) {
    console.error('Error sharing:', error);
  }
};
```

### 2. Corregir Enviar Posts ❌

**Archivo:** `src/screens/HomeFeedScreen.tsx`

**Buscar `handleSendMessage` y reemplazar:**

```typescript
const handleSendMessage = async (postId: string, postUserId: string) => {
  navigation.navigate('SelectContact', {
    postId: postId,
    postContent: posts.find(p => p.id === postId)?.content || '',
  });
};
```

**Crear archivo:** `src/screens/SelectContactScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../supabase';
import { getCurrentUserId } from '../rest/client';

export function SelectContactScreen({ navigation, route }: any) {
  const { postId, postContent } = route.params;
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const userId = await getCurrentUserId();
    
    const { data } = await supabase
      .from('user_follows')
      .select(`
        following:users!user_follows_following_id_fkey(
          id, full_name, nombre, username, avatar_url, photo_url
        )
      `)
      .eq('follower_id', userId);
    
    if (data) {
      setContacts(data.map((d: any) => d.following));
    }
  };

  const handleSelectContact = async (contactId: string) => {
    const userId = await getCurrentUserId();
    
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${userId},user2_id.eq.${contactId}),and(user1_id.eq.${contactId},user2_id.eq.${userId})`)
      .single();
    
    let conversationId = existingConv?.id;
    
    if (!conversationId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ user1_id: userId, user2_id: contactId })
        .select('id')
        .single();
      
      conversationId = newConv?.id;
    }
    
    if (conversationId) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: `Te comparto: ${postContent}`,
        metadata: { post_id: postId }
      });
      
      navigation.navigate('Chat', { conversationId, userId: contactId });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Enviar a...</Text>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelectContact(item.id)}
          >
            {item.avatar_url || item.photo_url ? (
              <Image source={{ uri: item.avatar_url || item.photo_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.full_name || item.nombre || item.username).substring(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.name}>{item.full_name || item.nombre || item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 18, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '600' },
});
```

**Agregar ruta en navigation:**
```typescript
// En el Stack Navigator
<Stack.Screen name="SelectContact" component={SelectContactScreen} />
```

### 3. Mostrar Comentarios en PostDetailScreen ❌

**Archivo:** `src/screens/PostDetailScreen.tsx`

**Agregar al inicio:**
```typescript
const [comments, setComments] = useState([]);

useEffect(() => {
  loadComments();
}, [postId]);

const loadComments = async () => {
  const { data } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(id, full_name, nombre, avatar_url, photo_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
  
  if (data) {
    setComments(data);
  }
};
```

**Agregar en el render (después de los botones):**
```typescript
<View style={styles.commentsSection}>
  <Text style={styles.commentsTitle}>Comentarios ({comments.length})</Text>
  {comments.map((comment: any) => (
    <View key={comment.id} style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>
          {(comment.user.full_name || comment.user.nombre).substring(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.commentContent}>
        <Text style={styles.commentAuthor}>{comment.user.full_name || comment.user.nombre}</Text>
        <Text style={styles.commentText}>{comment.contenido}</Text>
        <Text style={styles.commentTime}>{new Date(comment.created_at).toLocaleDateString()}</Text>
      </View>
    </View>
  ))}
</View>
```

### 4. Corregir NewsScreen ❌

**Archivo:** `src/screens/NewsScreen.tsx`

**Cambios:**
1. Importar SafeAreaView correcto:
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';
```

2. Cambiar container:
```typescript
<SafeAreaView style={styles.container} edges={['top']}>
```

3. Cargar TODAS las noticias (quitar limit):
```typescript
const { data } = await supabase
  .from('news')
  .select('*')
  .order('published_at', { ascending: false });
  // SIN .limit(3)
```

### 5. Corregir EducacionScreen ❌

**Archivo:** `src/screens/EducacionScreen.tsx`

**Cambios:**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={styles.container} edges={['top']}>
```

### 6. Agregar 3 Herramientas Financieras ❌

**Buscar donde están las herramientas y agregar:**
```typescript
const FINANCIAL_TOOLS = [
  { id: 'planner', name: 'Planificador Financiero', icon: '📊', color: '#3B82F6' },
  { id: 'ant-hunter', name: 'El Caza Hormigas', icon: '🐜', color: '#EF4444' },
  { id: 'report', name: 'Generador de Reporte', icon: '📈', color: '#10B981' },
  // NUEVAS:
  { id: 'roi', name: 'Calculadora de ROI', icon: '💰', color: '#F59E0B' },
  { id: 'budget', name: 'Seguimiento de Presupuesto', icon: '📝', color: '#8B5CF6' },
  { id: 'debt', name: 'Calculadora de Deudas', icon: '💳', color: '#EC4899' },
];
```

### 7. ProfileScreen - Cargar Posts ❌

**Archivo:** `src/screens/ProfileScreen.tsx`

**En la función `loadProfile`, después de cargar userData:**
```typescript
const { data: userPosts } = await supabase
  .from('posts')
  .select(`
    id, contenido, content, image_url, media_url,
    likes_count, comment_count, shares_count, created_at,
    user:users!posts_user_id_fkey(id, full_name, nombre, avatar_url),
    community:communities(id, name, nombre)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

if (userPosts) {
  setFeed(userPosts);
}
```

### 8. Generar Notificaciones Reales ❌

**Ya está en SQL:** `POBLAR_MARKET_DATA_Y_NOTIFICACIONES.sql`

**Solo ejecutar el SQL**

## 📋 CHECKLIST FINAL

- [ ] Ejecutar `POBLAR_MARKET_DATA_Y_NOTIFICACIONES.sql`
- [ ] Corregir `handleShare` en HomeFeedScreen
- [ ] Crear `SelectContactScreen.tsx`
- [ ] Corregir `handleSendMessage` en HomeFeedScreen
- [ ] Agregar comentarios en PostDetailScreen
- [ ] Corregir SafeArea en NewsScreen
- [ ] Corregir SafeArea en EducacionScreen
- [ ] Agregar 3 herramientas financieras
- [ ] Cargar posts en ProfileScreen

## 🎯 RESUMEN

### ✅ Ya Funciona:
- Market Data con API real (FMP)
- Scroll infinito en HomeFeed
- Keys duplicadas corregidas

### ❌ Falta Hacer (9 tareas):
1. Compartir posts
2. Enviar posts (crear SelectContactScreen)
3. Mostrar comentarios
4. NewsScreen SafeArea
5. EducacionScreen SafeArea
6. 3 herramientas más
7. ProfileScreen posts
8. Ejecutar SQL notificaciones
9. Agregar ruta SelectContact

**Tiempo estimado: 2-3 horas**
