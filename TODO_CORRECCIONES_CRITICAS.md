# 🚨 CORRECCIONES CRÍTICAS PENDIENTES

**Fecha:** 25 de Octubre 2025 - 8:40 PM
**Prioridad:** ALTA

---

## ✅ COMPLETADAS

### 1. ✅ Header CommunityRecommendations
- Reducido fontSize de 20px a 17px
- Ya no choca con "Omitir"

### 2. ✅ Onboarding completo
- Validación agregada en navigation/index.tsx
- Flujo garantizado paso por paso

### 3. ✅ ProfileScreen comunidades sugeridas
- Cambiado a getRecommendedCommunitiesByGoals()
- isMember: false correctamente

### 4. ✅ parent_comment_id removido
- Error de columna inexistente resuelto

### 5. ⚠️ MediaTypeOptions deprecated (EN PROGRESO)
- ProfileScreen.tsx ✅
- EditProfileScreen.tsx ✅
- **PENDIENTES:** 10+ archivos más

---

## 🚨 PENDIENTES CRÍTICAS

### 1. ⚠️ EJECUTAR SQL EN SUPABASE
**Archivo:** `CORRECCIONES_URGENTES.sql`
**Acción:** Copiar y pegar en Supabase SQL Editor
**Arregla:**
- Trigger de likes
- Políticas RLS
- Contadores de likes

### 2. ⚠️ CONFIGURAR GROK_API_KEY
**Archivo:** `.env`
**Valor actual:** `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`
**Estado:** ✅ YA CONFIGURADO
**Acción:** Reiniciar servidor con `npm start --reset-cache`

### 3. 🔴 COMENTARIOS NO SE ACTUALIZAN EN TIEMPO REAL
**Problema:** Los comentarios se envían pero no se reflejan en la UI
**Archivos afectados:**
- PostDetailScreen.tsx
- HomeFeedScreen.tsx
- ProfileScreen.tsx

**Solución:**
1. Agregar realtime subscription a post_comments
2. Actualizar comment_count en tiempo real
3. Refrescar lista de comentarios automáticamente

### 4. 🔴 BOTÓN "ENVIAR" NO LLEVA CONTEXTO DEL POST
**Problema:** Al hacer clic en "Enviar", no se pasa el post como contexto
**Solución:**
1. Crear modal de selección de usuarios
2. Pasar post_id y contenido del post
3. Crear conversación con el post compartido

### 5. 🔴 MÚLTIPLES IMÁGENES NO SE MUESTRAN (CARRUSEL)
**Problema:** Solo se muestra la primera imagen de un post con múltiples imágenes
**Solución:**
1. Implementar FlatList horizontal con paginación
2. Agregar indicadores de página (dots)
3. Permitir swipe entre imágenes

### 6. 🔴 BOTÓN "CONTINUAR" MAL POSICIONADO
**Pantalla:** PickKnowledgeScreen (Imagen 2)
**Problema:** El botón está muy abajo y se solapa con el texto
**Solución:**
1. Reducir marginTop del botón
2. Ajustar padding del contenedor
3. Verificar en diferentes tamaños de pantalla

### 7. 🔴 TABS NO FUNCIONAN EN COMMUNITYDETAILSCREEN
**Problema:** Los tabs "Publicaciones", "Chats", "Multimedia" no se deslizan
**Solución:**
1. Verificar que ScrollView horizontal tenga flexDirection: 'row'
2. Agregar contentContainerStyle con gap
3. Asegurar que cada tab tenga width definido

### 8. 🔴 BOTONES ROTOS EN COMMUNITYDETAILSCREEN (Imagen 3)
**Problema:** Botones "Recomendar", "Comentar", "Compartir", "Enviar" se ven mal
**Solución:**
1. Revisar estilos de postActions
2. Asegurar flexWrap y gap correctos
3. Verificar que los iconos tengan el tamaño correcto

### 9. 🔴 COMMUNITYPOSTDETAIL NO EXISTE
**Problema:** Al hacer clic en un post de comunidad, dice "Post no encontrado"
**Solución:**
1. Crear CommunityPostDetailScreen.tsx
2. Agregar ruta en navigation
3. Pasar communityPostId correctamente

### 10. 🔴 SHAREPOST NO FUNCIONAL
**Problema:** SharePost no está implementado al 100%
**Solución:**
1. Crear modal de compartir
2. Opciones: Compartir en chat, Compartir en comunidad, Compartir externo
3. Implementar lógica de compartir en cada opción

### 11. 🔴 GROUPCHATSCREEN UI MEJORABLE
**Problema:** La UI es básica y poco atractiva
**Solución:**
1. Agregar burbujas de mensaje más modernas
2. Mejorar colores y sombras
3. Agregar animaciones de entrada
4. Mejorar header con info del grupo

### 12. 🔴 ERROR DE NETWORK EN UPLOAD DE IMÁGENES
**Problema:** `StorageUnknownError: Network request failed`
**Causa:** Posible problema de permisos o configuración de Supabase Storage
**Solución:**
1. Verificar políticas RLS de storage
2. Verificar que el bucket 'avatars' exista
3. Verificar permisos de escritura

### 13. 🔴 COMENTARIOS DUPLICADOS (6018 comentarios)
**Problema:** Hay 6018 comentarios por inserts falsos
**Solución:**
```sql
-- Eliminar comentarios duplicados o de prueba
DELETE FROM post_comments 
WHERE created_at < '2025-10-20' -- Ajustar fecha según necesidad
OR contenido LIKE '%test%' 
OR contenido LIKE '%prueba%';

-- Recalcular comment_count
UPDATE posts p
SET comment_count = (
  SELECT COUNT(*)
  FROM post_comments pc
  WHERE pc.post_id = p.id
);
```

---

## 📋 ORDEN DE PRIORIDAD

### AHORA MISMO (Crítico)
1. ✅ Ejecutar CORRECCIONES_URGENTES.sql
2. ✅ Reiniciar servidor con API key configurada
3. 🔴 Arreglar comentarios en tiempo real
4. 🔴 Implementar carrusel de imágenes

### HOY (Alta)
5. 🔴 Arreglar botón "Enviar" con contexto
6. 🔴 Arreglar botón "Continuar" en PickKnowledgeScreen
7. 🔴 Arreglar tabs en CommunityDetailScreen
8. 🔴 Arreglar botones en CommunityDetailScreen

### MAÑANA (Media)
9. 🔴 Crear CommunityPostDetailScreen
10. 🔴 Implementar SharePost completo
11. 🔴 Mejorar UI de GroupChatScreen
12. 🔴 Limpiar comentarios duplicados

### DESPUÉS (Baja)
13. 🔴 Arreglar error de network en uploads
14. 🔴 Terminar de actualizar MediaTypeOptions en todos los archivos

---

## 📝 NOTAS

- El API key de Grok ya está configurado correctamente
- Los comentarios se están enviando pero no se reflejan en la UI
- Hay 6018 comentarios de prueba que deben limpiarse
- Las imágenes múltiples no se muestran en carrusel
- Los tabs de CommunityDetail no son funcionales

---

**Generado:** 25 de Octubre 2025 - 8:40 PM
**Estado:** 5/13 Completadas
