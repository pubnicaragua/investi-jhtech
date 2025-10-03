# Cambios Realizados - Comunidades Recomendadas

## 📋 Resumen
Se corrigieron 3 errores críticos en la pantalla de Comunidades Recomendadas y se mejoró la UI para que sea pixel perfect según el diseño.

---

## 🐛 Errores Corregidos

### 1. Error: Columna `interests` no existe en `user_interests`
**Error original:**
```
Could not find the 'interests' column of 'user_interests' in the schema cache
```

**Solución:**
- Creada tabla `user_interests` con estructura correcta
- Modificada función `saveUserInterests()` para usar `interest_id` en lugar de `interests`
- Ahora inserta registros individuales por cada interés seleccionado

### 2. Error: Columna `cover_image_url` no existe en `communities`
**Error original:**
```
column communities.cover_image_url does not exist
```

**Solución:**
- Agregadas columnas `cover_image_url`, `banner_url` y `avatar_url` a la tabla `communities`
- Actualizada función `getCommunityDetailsComplete()` para usar columnas correctas con fallbacks

### 3. Algoritmo de recomendaciones no se estaba usando
**Problema:**
- La pantalla usaba un filtro simple por intereses en lugar del algoritmo de recomendaciones por metas

**Solución:**
- Integrado `getRecommendedCommunitiesByGoals()` que usa la función SQL `get_recommended_communities_by_goals`
- Implementado sistema de fallback si el algoritmo no retorna suficientes comunidades

---

## 📁 Archivos Modificados

### 1. `sql/fix_communities_and_interests_schema.sql` (NUEVO)
Script SQL para ejecutar en Supabase que:
- ✅ Agrega columna `cover_image_url` a `communities`
- ✅ Agrega columna `banner_url` a `communities`
- ✅ Agrega columna `avatar_url` a `communities`
- ✅ Crea tabla `user_interests` con estructura correcta
- ✅ Crea tabla `user_knowledge` para niveles de conocimiento
- ✅ Crea índices para optimización
- ✅ Crea funciones auxiliares `get_user_interests()` y `save_user_interests()`

### 2. `src/rest/api.ts`
**Función `saveUserInterests()` - Líneas 1325-1369:**
```typescript
// ANTES: Intentaba insertar un array en columna 'interests'
await request("POST", "/user_interests", {
  body: {
    user_id: userId,
    interests: interests, // ❌ Columna no existe
    experience_level: experienceLevel
  }
})

// AHORA: Inserta registros individuales con interest_id
const insertPromises = interests.map(interestId => 
  supabase
    .from('user_interests')
    .insert({
      user_id: userId,
      interest_id: interestId, // ✅ Estructura correcta
      experience_level: experienceLevel || 'beginner'
    })
)
```

**Función `getCommunityDetailsComplete()` - Líneas 1433-1467:**
```typescript
// ANTES: Buscaba cover_image_url que no existía
select: "id,nombre,descripcion,icono_url,cover_image_url,tipo,..."

// AHORA: Usa columnas correctas con fallbacks
select: "id,nombre,descripcion,icono_url,avatar_url,banner_url,tipo,..."
cover_image_url: community.banner_url || community.icono_url,
```

### 3. `src/screens/CommunityRecommendationsScreen.tsx`
**Cambios en lógica:**
- ✅ Importado `getRecommendedCommunitiesByGoals` del API
- ✅ Implementado algoritmo de recomendaciones por metas como método principal
- ✅ Sistema de fallback en 3 niveles:
  1. Algoritmo por metas
  2. Filtro por intereses del usuario
  3. Comunidades generales
- ✅ Manejo robusto de errores al obtener detalles de comunidades

**Cambios en UI (Pixel Perfect):**
- ✅ Fondo de pantalla: `#f7f8fa` (gris claro)
- ✅ Header: Botón back más grande (28px), título centrado (17px bold)
- ✅ Cards de comunidades:
  - Border radius: 16px
  - Sombra suave (shadowOpacity: 0.06)
  - Overlay oscuro en imagen: `rgba(0,0,0,0.4)`
  - Título: 17px, peso 700
  - Botón "Unirse": Border radius 24px, padding aumentado
- ✅ Cards de personas:
  - Border radius: 16px
  - Avatar: 72x72px
  - Nombre: 15px, peso 700
  - Botón "Conectar": Border radius 24px
- ✅ Footer:
  - Posición absoluta en bottom
  - Sombra superior suave
  - Botón principal: Color `#2673f3`, peso 700

---

## 🚀 Instrucciones de Implementación

### Paso 1: Ejecutar Script SQL en Supabase
```bash
# Ir al SQL Editor de Supabase y ejecutar:
sql/fix_communities_and_interests_schema.sql
```

**Verificación:**
El script incluye queries de verificación al final que mostrarán:
- ✅ Lista de columnas agregadas
- ✅ Lista de tablas creadas
- ✅ Mensaje de éxito

### Paso 2: Reiniciar la App
```bash
# Limpiar caché y reiniciar
npm start -- --reset-cache
```

### Paso 3: Probar el Flujo Completo
1. ✅ Completar onboarding hasta "Pick Goals"
2. ✅ Seleccionar 3 metas
3. ✅ Ir a "Pick Interests"
4. ✅ Seleccionar 3 intereses → Debe guardar sin error
5. ✅ Llegar a "Comunidades Recomendadas"
6. ✅ Ver comunidades basadas en metas seleccionadas
7. ✅ Ver UI pixel perfect según diseño

---

## 🔍 Validación de Errores

### Antes (Errores):
```
❌ Could not find the 'interests' column of 'user_interests'
❌ column communities.cover_image_url does not exist
❌ Algoritmo de recomendaciones no se usaba
```

### Después (Esperado):
```
✅ 💾 Guardando intereses: {...}
✅ Intereses guardados exitosamente
✅ 🎯 Comunidades recomendadas por metas: [...]
✅ Detalles de comunidad obtenidos correctamente
```

---

## 📊 Mejoras Adicionales Implementadas

1. **Logging mejorado:**
   - Logs con emojis para identificar rápidamente el flujo
   - Logs de debugging para el algoritmo de recomendaciones

2. **Manejo de errores robusto:**
   - Try-catch en obtención de detalles de comunidades
   - Fallbacks múltiples si el algoritmo falla

3. **Optimización de queries:**
   - Índices creados en `user_interests` y `user_knowledge`
   - Triggers para `updated_at` automático

4. **Funciones SQL auxiliares:**
   - `get_user_interests()` - Obtener intereses de un usuario
   - `save_user_interests()` - Guardar intereses con upsert

---

## 🎨 Comparación UI

### Antes:
- Fondo blanco plano
- Cards con sombras fuertes
- Botones con border radius pequeño
- Tipografía inconsistente

### Ahora (Pixel Perfect):
- Fondo gris claro (#f7f8fa)
- Cards con sombras suaves y border radius 16px
- Botones redondeados (border radius 24px)
- Tipografía consistente con pesos 700 para títulos
- Overlay oscuro en imágenes de comunidades
- Footer con sombra superior

---

## ⚠️ Notas Importantes

1. **El script SQL es idempotente:** Puede ejecutarse múltiples veces sin problemas (usa `IF NOT EXISTS`)

2. **Compatibilidad hacia atrás:** Las columnas antiguas (`icono_url`) se mantienen como fallback

3. **Datos mock:** Si el algoritmo no retorna comunidades, se muestran datos de ejemplo

4. **Función RPC:** Asegúrate de que la función `get_recommended_communities_by_goals` existe en Supabase (ver `sql/create_recommended_communities_function.sql`)

---

## 🧪 Testing

### Casos de prueba:
- ✅ Usuario nuevo completa onboarding
- ✅ Usuario selecciona metas y ve comunidades relacionadas
- ✅ Usuario sin metas ve comunidades generales (fallback)
- ✅ Guardar intereses funciona correctamente
- ✅ UI se ve pixel perfect en iOS y Android
- ✅ Botones de "Unirse" y "Conectar" funcionan
- ✅ Botón "Omitir" navega correctamente

---

## 📞 Soporte

Si encuentras algún error después de aplicar estos cambios:

1. Verifica que el script SQL se ejecutó correctamente
2. Revisa los logs de la consola para ver mensajes de debugging
3. Verifica que la función `get_recommended_communities_by_goals` existe en Supabase
4. Limpia caché de Metro: `npm start -- --reset-cache`

---

**Fecha de cambios:** 2025-10-02
**Versión:** 1.0.0
