# 🚨 CORRECCIONES FINALES URGENTES - INVESTI

## ✅ COMPLETADO

### 1. SQL para Market Data y Notificaciones ✅
**Archivo:** `POBLAR_MARKET_DATA_Y_NOTIFICACIONES.sql`
- Puebla 14 stocks en market_data
- Genera notificaciones reales de likes y comentarios
- **EJECUTAR AHORA**

### 2. Scroll Infinito en HomeFeed ✅
- Ya implementado en `HomeFeedScreen.tsx`
- Repite posts indefinidamente
- Muestra "Cargando más..." al hacer scroll

## 🔧 CORRECCIONES PENDIENTES CRÍTICAS

### 1. Compartir Posts - Error share_platform

**Problema:** `Cannot read property 'share_platform' of undefined`

**Archivo:** `src/screens/HomeFeedScreen.tsx`

**Buscar función `handleShare` y reemplazar:**
```typescript
const handleShare = async (postId: string, content: string) => {
  try {
    // Usar Share nativo de React Native
    await Share.share({
      message: content || 'Mira esta publicación en Investi',
      title: 'Compartir publicación',
    });
    
    // Registrar el share en la base de datos
    if (userId) {
      await sharePost(postId, userId, 'native');
    }
  } catch (error) {
    console.error('Error sharing:', error);
    Alert.alert('Error', 'No se pudo compartir la publicación');
  }
};
```

### 2. Enviar Posts - Seleccionar Destinatario

**Problema:** Lleva a "Chat desconectado" en lugar de seleccionar contacto

**Archivo:** `src/screens/HomeFeedScreen.tsx`

**Buscar función `handleSendMessage` y reemplazar:**
```typescript
const handleSendMessage = async (postId: string, postUserId: string) => {
  // Navegar a lista de contactos para seleccionar destinatario
  navigation.navigate('SelectContact', {
    postId: postId,
    postContent: posts.find(p => p.id === postId)?.content || '',
    returnScreen: 'HomeFeed'
  });
};
```

**Crear nueva pantalla:** `src/screens/SelectContactScreen.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { supabase } from '../supabase';
import { getCurrentUserId } from '../rest/client';

export function SelectContactScreen({ navigation, route }: any) {
  const { postId, postContent } = route.params;
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const userId = await getCurrentUserId();
    
    // Obtener usuarios que sigue
    const { data } = await supabase
      .from('user_follows')
      .select(`
        following:users!user_follows_following_id_fkey(
          id,
          full_name,
          nombre,
          username,
          avatar_url,
          photo_url
        )
      `)
      .eq('follower_id', userId);
    
    if (data) {
      setContacts(data.map(d => d.following));
    }
    setLoading(false);
  };

  const handleSelectContact = async (contactId: string) => {
    // Crear o encontrar conversación
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
    
    // Enviar mensaje con el post
    if (conversationId) {
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: `Te comparto esta publicación: ${postContent}`,
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
        <Text style={styles.headerTitle}>Enviar a...</Text>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleSelectContact(item.id)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.full_name || item.nombre || item.username).substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.contactName}>
              {item.full_name || item.nombre || item.username}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  contactName: { fontSize: 16, fontWeight: '600' },
});
```

### 3. PostDetailScreen - Mostrar Comentarios

**Problema:** Muestra número de comentarios pero no los comentarios

**Archivo:** `src/screens/PostDetailScreen.tsx`

**Agregar carga de comentarios:**
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

// En el render, después de los botones de acción:
<View style={styles.commentsSection}>
  <Text style={styles.commentsTitle}>Comentarios ({comments.length})</Text>
  {comments.map(comment => (
    <View key={comment.id} style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>
          {(comment.user.full_name || comment.user.nombre).substring(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.commentContent}>
        <Text style={styles.commentAuthor}>
          {comment.user.full_name || comment.user.nombre}
        </Text>
        <Text style={styles.commentText}>{comment.contenido}</Text>
        <Text style={styles.commentTime}>
          {new Date(comment.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  ))}
</View>
```

### 4. NewsScreen - SafeArea y Mostrar Todas las Noticias

**Problema:** Se corta el header, solo muestra 3 noticias

**Archivo:** `src/screens/NewsScreen.tsx`

**Cambios:**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// Cambiar container por SafeAreaView
<SafeAreaView style={styles.container} edges={['top']}>
  {/* Contenido */}
</SafeAreaView>

// Cargar TODAS las noticias
const loadNews = async () => {
  const { data } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false });
    // SIN .limit(3)
  
  if (data) {
    setNews(data);
  }
};
```

### 5. Educación - SafeArea

**Archivo:** `src/screens/EducacionScreen.tsx`

**Cambio:**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={styles.container} edges={['top']}>
  {/* Contenido */}
</SafeAreaView>
```

### 6. Herramientas Financieras - Agregar 3 Más

**Archivo:** Buscar donde están definidas las herramientas

**Agregar:**
```typescript
const FINANCIAL_TOOLS = [
  { id: 'planner', name: 'Planificador Financiero', description: 'Organiza ingresos y gastos', icon: '📊', color: '#3B82F6' },
  { id: 'ant-hunter', name: 'El Caza Hormigas', description: 'Detecta gastos innecesarios', icon: '🐜', color: '#EF4444' },
  { id: 'report', name: 'Generador de Reporte', description: 'Análisis financiero profesional', icon: '📈', color: '#10B981' },
  // NUEVAS 3 HERRAMIENTAS:
  { id: 'roi', name: 'Calculadora de ROI', description: 'Calcula retorno de inversión', icon: '💰', color: '#F59E0B' },
  { id: 'budget', name: 'Seguimiento de Presupuesto', description: 'Monitorea tu presupuesto mensual', icon: '📝', color: '#8B5CF6' },
  { id: 'debt', name: 'Calculadora de Deudas', description: 'Planifica pago de deudas', icon: '💳', color: '#EC4899' },
];
```

### 7. MarketInfoScreen - Disclaimer y Simulación

**Agregar al hacer click en un stock:**
```typescript
const handleStockPress = (stock: Stock) => {
  Alert.alert(
    '⚠️ Aviso Importante',
    'Esta es una simulación con fines educativos. Los datos mostrados no garantizan resultados reales y no constituyen asesoría financiera. Invierte bajo tu propio riesgo.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Continuar',
        onPress: () => navigation.navigate('InvestmentSimulator', { stock })
      }
    ]
  );
};
```

## 📋 CHECKLIST URGENTE

### Hacer AHORA:
- [ ] Ejecutar `POBLAR_MARKET_DATA_Y_NOTIFICACIONES.sql`
- [ ] Corregir `handleShare` en HomeFeedScreen
- [ ] Crear `SelectContactScreen.tsx`
- [ ] Corregir `handleSendMessage` en HomeFeedScreen
- [ ] Agregar carga de comentarios en PostDetailScreen
- [ ] Corregir SafeArea en NewsScreen y Educación
- [ ] Agregar 3 herramientas financieras
- [ ] Agregar disclaimer en MarketInfoScreen

### Verificar:
- [ ] Scroll infinito funciona
- [ ] Compartir posts funciona
- [ ] Enviar posts abre selector de contactos
- [ ] Comentarios se muestran en PostDetailScreen
- [ ] Todas las noticias se muestran
- [ ] Headers no se cortan
- [ ] 6 herramientas financieras totales

## 🎯 RESULTADO ESPERADO

- ✅ 14 stocks en market_data
- ✅ Notificaciones reales de likes/comentarios
- ✅ Scroll infinito funcional
- ✅ Compartir posts sin errores
- ✅ Enviar posts con selector de contactos
- ✅ Comentarios visibles en posts
- ✅ Todas las noticias visibles
- ✅ Headers correctos con SafeArea
- ✅ 6 herramientas financieras
- ✅ Disclaimer en simulación

---

**PRIORIDAD #1:** Ejecutar SQL y corregir compartir/enviar posts
