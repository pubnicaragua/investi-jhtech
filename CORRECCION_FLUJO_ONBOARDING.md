# Corrección del Flujo de Onboarding

## 🐛 Problema Detectado

El flujo de onboarding estaba completamente invertido. Después de seleccionar las metas, el usuario era enviado directamente a la pantalla de conocimientos financieros, omitiendo la pantalla de intereses.

### Flujo Incorrecto (Antes)
```
Metas → Conocimientos → Intereses → ???
```

### Flujo Correcto (Ahora)
```
Metas → Intereses → Conocimientos → Comunidades Recomendadas
```

---

## ✅ Cambios Realizados

### 1. **PickGoalsScreen.tsx** (Líneas 111, 117)
**Antes:**
```typescript
onboarding_step: 'pick_knowledge'
navigation.navigate("PickKnowledge")
```

**Después:**
```typescript
onboarding_step: 'pick_interests'
navigation.navigate("PickInterests")
```

**Razón:** Después de seleccionar metas, el usuario debe ir a seleccionar intereses, no conocimientos.

---

### 2. **PickInterestsScreen.tsx** (Líneas 115, 124)
**Antes:**
```typescript
navigation.navigate("PickGoals")  // En ambos lugares
```

**Después:**
```typescript
navigation.navigate("PickKnowledge")  // En ambos lugares
```

**Razón:** Después de seleccionar intereses, el usuario debe ir a seleccionar su nivel de conocimientos.

---

### 3. **PickKnowledgeScreen.tsx** (Línea 61)
**Antes:**
```typescript
navigation.navigate("PickInterests")
```

**Después:**
```typescript
navigation.navigate("CommunityRecommendations")
```

**Razón:** Después de seleccionar el nivel de conocimientos, el usuario debe ver las comunidades recomendadas basadas en sus selecciones.

---

### 4. **api.ts - saveUserInterests()** (Líneas 1325-1344)
**Antes:**
```typescript
export async function saveUserInterests(userId: string, interests: string[], experienceLevel?: string) {
  try {
    return await request("POST", "/user_interests", {
      body: {
        user_id: userId,
        interests: interests,
        experience_level: experienceLevel || 'beginner'
      }
    })
  } catch (error: any) {
    console.error('Error saving user interests:', error)
    throw error
  }
}
```

**Después:**
```typescript
export async function saveUserInterests(userId: string, interests: string[], experienceLevel?: string) {
  try {
    // Guardar intereses
    await request("POST", "/user_interests", {
      body: {
        user_id: userId,
        interests: interests,
        experience_level: experienceLevel || 'beginner'
      }
    })
    
    // Actualizar paso de onboarding
    await updateUser(userId, { onboarding_step: 'pick_knowledge' })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error saving user interests:', error)
    throw error
  }
}
```

**Razón:** La función ahora actualiza automáticamente el paso de onboarding después de guardar los intereses.

---

### 5. **api.ts - saveUserKnowledgeLevel()** (Líneas 1361-1381)
**Antes:**
```typescript
export async function saveUserKnowledgeLevel(userId: string, level: string, specificAreas?: string[], learningGoals?: string[]) {
  try {
    return await request("POST", "/user_knowledge", {
      body: {
        user_id: userId,
        level: level,
        specific_areas: specificAreas || [],
        learning_goals: learningGoals || []
      }
    })
  } catch (error: any) {
    console.error('Error saving user knowledge level:', error)
    throw error
  }
}
```

**Después:**
```typescript
export async function saveUserKnowledgeLevel(userId: string, level: string, specificAreas?: string[], learningGoals?: string[]) {
  try {
    // Guardar nivel de conocimiento
    await request("POST", "/user_knowledge", {
      body: {
        user_id: userId,
        level: level,
        specific_areas: specificAreas || [],
        learning_goals: learningGoals || []
      }
    })
    
    // Actualizar paso de onboarding a completado
    await updateUser(userId, { onboarding_step: 'completed' })
    
    return { success: true }
  } catch (error: any) {
    console.error('Error saving user knowledge level:', error)
    throw error
  }
}
```

**Razón:** La función ahora marca el onboarding como completado después de guardar el nivel de conocimientos.

---

## 🎯 Flujo Completo Corregido

```
1. PickGoalsScreen
   ↓ (Guarda metas + onboarding_step = 'pick_interests')
   
2. PickInterestsScreen
   ↓ (Guarda intereses + onboarding_step = 'pick_knowledge')
   
3. PickKnowledgeScreen
   ↓ (Guarda conocimientos + onboarding_step = 'completed')
   
4. CommunityRecommendationsScreen
   (Muestra comunidades basadas en metas, intereses y conocimientos)
```

---

## 📝 Notas Importantes

1. **Pasos de Onboarding:** El campo `onboarding_step` en la tabla `users` ahora se actualiza correctamente en cada paso:
   - Después de metas: `'pick_interests'`
   - Después de intereses: `'pick_knowledge'`
   - Después de conocimientos: `'completed'`

2. **Algoritmo de Recomendaciones:** La pantalla `CommunityRecommendationsScreen` debe usar la función `getRecommendedCommunitiesByGoals()` que ya existe en `api.ts` para mostrar comunidades basadas en las selecciones del usuario.

3. **Validaciones:** Todas las pantallas tienen validaciones para asegurar que el usuario complete los pasos requeridos antes de continuar.

---

## 🧪 Pruebas Recomendadas

1. Iniciar sesión con un usuario nuevo
2. Completar el flujo de onboarding en orden:
   - Seleccionar 1-3 metas
   - Seleccionar 3 intereses
   - Seleccionar nivel de conocimientos
3. Verificar que se muestre la pantalla de comunidades recomendadas
4. Verificar que las comunidades mostradas sean relevantes a las selecciones del usuario

---

## 📅 Fecha de Corrección
2025-10-02

## 👨‍💻 Archivos Modificados
- `src/screens/PickGoalsScreen.tsx`
- `src/screens/PickInterestsScreen.tsx`
- `src/screens/PickKnowledgeScreen.tsx`
- `src/rest/api.ts`
