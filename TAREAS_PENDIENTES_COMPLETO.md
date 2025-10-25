# 📋 TAREAS PENDIENTES - ESTADO COMPLETO

## ✅ COMPLETADAS

### 1. Navegación AngelInvestor → Inversionista ✅
- **Archivo:** `SettingsScreen.tsx`
- **Cambio:** `navigation.navigate("Inversionista")`

### 2. InversionistaScreen actualizado ✅
- **Mensaje:** "Muy pronto podrás acceder a una red exclusiva..."
- **Palabras en azul:** "red exclusiva", "Match"
- **Emojis:** 🔎 🤝 💼 📊 🌐
- **Sin fechas**

### 3. Logs de API 403 eliminados ✅
- **Archivo:** `searchApiService.ts`
- **Cambio:** Eliminados console.log de API

### 4. SQL para herramientas creado ✅
- **Archivo:** `AGREGAR_HERRAMIENTAS.sql`
- **Acción:** Ejecutar en Supabase

---

## ⏳ EN PROGRESO

### 5. Corregir Seguir usuario (duplicate key)
**Error:** `duplicate key value violates unique constraint "user_follows_follower_id_following_id_key"`

**Solución:**
```typescript
// En HomeFeedScreen.tsx o donde esté handleFollow
const handleFollow = async (userId: string) => {
  try {
    // Verificar si ya sigue
    const { data: existing } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', userId)
      .single();
    
    if (existing) {
      // Ya sigue, hacer unfollow
      await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId);
    } else {
      // No sigue, hacer follow
      await supabase
        .from('user_follows')
        .insert({
          follower_id: currentUserId,
          following_id: userId
        });
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 6. Corregir Guardar Post
**Problema:** No guarda posts

**Solución:**
```typescript
// Verificar que la tabla saved_posts existe
// Y que el insert se hace correctamente
const handleSavePost = async (postId: string) => {
  const { data: existing } = await supabase
    .from('saved_posts')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single();
  
  if (existing) {
    // Ya guardado, eliminar
    await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);
  } else {
    // No guardado, guardar
    await supabase
      .from('saved_posts')
      .insert({ user_id: userId, post_id: postId });
  }
};
```

### 7. Botón Enviar → Lista de chats
**Problema:** Lleva a "chat desconectado"

**Solución:** Navegar a lista de usuarios para chat
```typescript
// En HomeFeedScreen o donde esté el botón Enviar
navigation.navigate('ChatList'); // O 'Messages'
```

### 8. CourseDetailScreen - Mostrar lección
**Problema:** Solo muestra "Lección seleccionada" en log

**Solución:** Crear modal o pantalla para mostrar contenido de lección

### 9. Filtros en Cursos con scroll horizontal
**Solución:** Agregar ScrollView horizontal con categorías

### 10. PromotionsScreen optimizada
**Problema:** Búsqueda lenta

**Solución:** Ya tiene índices SQL, optimizar UI

### 11. Grok API para APK
**Solución:** Verificar que EXPO_PUBLIC_GROK_API_KEY esté en .env

### 12. InvestmentSimulator screen
**Solución:** Crear pantalla hardcoded con escenarios

### 13. Crear comunidad - Dropdown
**Solución:** Cambiar scroll por Picker/Dropdown

---

## 📝 ARCHIVOS A MODIFICAR

1. `HomeFeedScreen.tsx` - handleFollow, handleSave
2. `CourseDetailScreen.tsx` - Mostrar lección
3. `CoursesScreen.tsx` - Agregar filtros horizontales
4. `PromotionsScreen.tsx` - Optimizar búsqueda
5. `CreateCommunityScreen.tsx` - Cambiar a dropdown
6. Crear `InvestmentSimulatorScreen.tsx`

---

## 🎯 PRIORIDAD

1. **ALTA:** Seguir usuario (error crítico)
2. **ALTA:** Guardar post (error crítico)
3. **ALTA:** Botón Enviar → Chats
4. **MEDIA:** Mostrar lección en cursos
5. **MEDIA:** Filtros en cursos
6. **MEDIA:** InvestmentSimulator
7. **BAJA:** Dropdown crear comunidad

---

## 📊 SQL A EJECUTAR

1. `EJECUTAR_AHORA.sql` - Actualizar usuarios sin nombre
2. `AGREGAR_HERRAMIENTAS.sql` - Agregar 3 herramientas

---

## ⏱️ TIEMPO ESTIMADO

- Correcciones críticas (1-3): 2-3 horas
- Correcciones medias (4-6): 3-4 horas
- Correcciones bajas (7): 1 hora

**TOTAL:** 6-8 horas
