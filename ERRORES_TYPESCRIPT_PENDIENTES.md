# Errores TypeScript Pendientes

## Resumen
Este documento lista los errores de TypeScript que requieren atención en el proyecto.

## ✅ Correcciones Completadas

### 1. Función `unlikePost` agregada a `api.ts`
- **Archivo**: `src/rest/api.ts`
- **Estado**: ✅ COMPLETADO
- **Descripción**: Se agregó la función `unlikePost` que faltaba y era requerida por `PromotionsScreen.tsx`

```typescript
export async function unlikePost(post_id: string, user_id: string) {  
  try {  
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', post_id)
      .eq('user_id', user_id)
    
    if (error) throw error
    return { success: true }
  } catch (error: any) {  
    console.error('Error unliking post:', error)
    return null  
  }  
}
```

## ⚠️ Errores Pendientes por Archivo

### 1. `src/screens/PromotionsScreen.tsx`

#### Error: Tipos null en parámetros de API
**Líneas**: 55-58  
**Severidad**: Error  
**Descripción**: `getCurrentUserId()` puede retornar `null`, pero las funciones de API esperan `string`

**Solución**:
```typescript
const [promos, peopleRes, commRes, postsRes] = await Promise.all([
  getPromotions(uid || '', searchQuery),
  getSuggestedPeople(uid || ''),
  getSuggestedCommunities(uid || ''),
  getRecentPosts(uid || '', selectedPostFilter)
])
```

#### Error: Tipo del Set de posts liked
**Línea**: 66  
**Severidad**: Error  
**Descripción**: El Set no tiene tipo explícito

**Solución**:
```typescript
const liked = new Set<string>((postsRes || []).filter((p: any) => p.is_liked).map((p: any) => p.id as string))
```

#### Error: Navegación con tipos never
**Líneas**: 142, 146, 150, 237  
**Severidad**: Error  
**Descripción**: TypeScript no puede inferir los tipos de navegación correctamente

**Solución**: Usar type casting con `(navigation as any).navigate()`

---

### 2. `src/screens/EducacionScreen.tsx`

#### Error: Navegación con tipos never
**Líneas**: 88-91  
**Severidad**: Error  
**Descripción**: Similar al error en PromotionsScreen

**Solución**:
```typescript
const handleVideoPress = (video: Video) => (navigation as any).navigate('VideoPlayer', { videoId: video.id });
const handleCoursePress = (course: Course) => (navigation as any).navigate('CourseDetail', { courseId: course.id });
const handleToolPress = (tool: Tool) => (navigation as any).navigate(tool.route);
const handleNavigation = (screen: string) => (navigation as any).navigate(screen);
```

---

### 3. `src/screens/HomeFeedScreen.tsx`

#### Error: Tipos de Set incorrectos
**Líneas**: 138-140  
**Severidad**: Error  
**Descripción**: Los Sets no tienen el tipo correcto especificado

**Solución**:
```typescript
setLikedPosts(new Set<string>(liked))
setSavedPosts(new Set<string>(saved))
setFollowingUsers(new Set<string>(following))
```

#### Error: SafeAreaView con prop 'edges'
**Línea**: 480  
**Severidad**: Error  
**Descripción**: `SafeAreaView` de React Native no soporta la prop `edges`

**Solución**: Usar `SafeAreaView` de `react-native-safe-area-context` o remover la prop

---

### 4. `src/screens/VideoPlayerScreen.tsx`

#### Error: Tipo de Timeout
**Líneas**: 198, 234  
**Severidad**: Error  
**Descripción**: `setTimeout` retorna `number` en React Native, no `Timeout`

**Solución**:
```typescript
const controlsTimeout = useRef<number | null>(null);
```

---

### 5. `src/screens/SharePostScreen.tsx`

#### Error: Tipos incompatibles en FlatList
**Líneas**: 454, 457  
**Severidad**: Error  
**Descripción**: FlatList espera un tipo pero recibe `Community[] | User[]`

**Solución**: Crear un tipo union o usar listas separadas

---

### 6. `src/screens/CreatePostScreen.tsx`

#### Error: Tipo AudienceOption incompleto
**Línea**: 576  
**Severidad**: Error  
**Descripción**: Falta la propiedad `type` en el objeto retornado

**Solución**: Agregar la propiedad `type` al objeto

---

### 7. `src/screens/CommunityRecommendationsScreen.tsx`

#### Error: Propiedades de error no existen
**Líneas**: 311-312  
**Severidad**: Error  
**Descripción**: TypeScript no reconoce `message` y `stack` en tipo `{}`

**Solución**:
```typescript
} catch (error: any) {
  console.error('Error:', error?.message)
  console.error('Stack:', error?.stack)
}
```

#### Error: textShadow en StyleSheet
**Línea**: 1159  
**Severidad**: Error  
**Descripción**: `textShadow` no es una propiedad válida en React Native

**Solución**: Usar `textShadowColor`, `textShadowOffset`, `textShadowRadius`

---

### 8. `src/screens/CommunitySettingsScreen.tsx`

#### Error: Parámetro communityName no existe
**Línea**: 762  
**Severidad**: Error  
**Descripción**: La navegación espera solo `communityId`

**Solución**: Remover `communityName` del objeto de parámetros

---

### 9. `src/screens/CreateCommunityScreen.tsx`

#### Error: Parámetro communityName no existe
**Línea**: 325  
**Severidad**: Error  
**Descripción**: Similar al error anterior

**Solución**: Remover `communityName` del objeto de parámetros

---

### 10. `src/i18n/i18n.ts`

#### Error: compatibilityJSON no válido
**Severidad**: Warning  
**Descripción**: El valor 'v3' no es compatible con el tipo esperado

**Solución**:
```typescript
compatibilityJSON: 'v4' as const
```

---

## 📋 Prioridad de Corrección

### Alta Prioridad (Errores que impiden compilación)
1. ✅ `unlikePost` en api.ts - **COMPLETADO**
2. Tipos null en PromotionsScreen
3. Navegación en EducacionScreen y PromotionsScreen
4. Sets en HomeFeedScreen

### Media Prioridad (Errores de tipo)
5. VideoPlayerScreen Timeout types
6. SharePostScreen FlatList types
7. CreatePostScreen AudienceOption
8. CommunityRecommendationsScreen error handling

### Baja Prioridad (Warnings y mejoras)
9. CommunitySettings/CreateCommunity navigation params
10. i18n compatibilityJSON

---

## 🔧 Comando para Verificar Errores

```bash
npx tsc --noEmit
```

## 📝 Notas

- La mayoría de errores son de tipos TypeScript y no afectan la funcionalidad en runtime
- Se recomienda corregir los errores de alta prioridad primero
- Algunos errores pueden requerir actualizar las definiciones de tipos de navegación
- La función `unlikePost` ya fue agregada exitosamente a `src/rest/api.ts`

---

**Última actualización**: 2025-10-10
**Estado**: Función unlikePost agregada ✅
