# 🚨 EJECUTAR AHORA - LISTA FINAL

## ✅ CÓDIGO CORREGIDO (ya aplicado):

1. **ChatScreen** - Usa `participant.id` para crear conversación
2. **HomeFeed** - Carga posts REALES de BD (no duplicados)
3. **MarketInfo** - Usa datos de Supabase

## 📋 SQL A EJECUTAR EN SUPABASE:

### 1. RLS Policies (CRÍTICO):
```sql
-- Archivo: EJECUTAR_EN_SUPABASE_URGENTE.sql
-- Ejecutar TODO el archivo
```

### 2. Función personas sugeridas:
```sql
-- Archivo: sql/fix_suggested_people_v2.sql
```

### 3. Community invitations:
```sql
-- Archivo: sql/fix_community_invitations.sql
```

---

## 🐛 PROBLEMAS PENDIENTES:

### 1. ❌ Notificaciones RLS
**Error**: `new row violates row-level security policy`
**Solución**: Ejecutar `EJECUTAR_EN_SUPABASE_URGENTE.sql` (tiene las policies correctas)

### 2. ❌ Chat no llega a otra persona
**Causa**: `conversationId` era undefined
**Fix**: Ya aplicado - usa `participant.id`

### 3. ❌ Seguir/Conectar cambia pero error RLS
**Causa**: Función `request_user_connection` intenta insertar notificación
**Solución**: Ejecutar SQL con policies

### 4. ❌ Scroll infinito duplica posts
**Fix**: Ya aplicado - carga posts reales de BD

### 5. ❌ Invitar a grupo error expires_at
**Solución**: Ejecutar `sql/fix_community_invitations.sql`

### 6. ❌ PromotionsScreen en blanco
**Fix**: Ya restaurado del commit a98b9e7

### 7. ⚠️ Notificaciones diseño mal
**Pendiente**: Revisar `NotificationsScreen` para mostrar nombres correctamente

### 8. ⚠️ MarketInfo API 404
**Fix**: Ya aplicado - usa datos de Supabase

### 9. ⚠️ Chat tiempo real lento
**Solución**: Ya usa Realtime de Supabase (debería ser instantáneo)

### 10. ⚠️ SafeAreaView
**Pendiente**: Revisar cada pantalla

---

## 🎯 ORDEN DE EJECUCIÓN:

1. **EJECUTAR SQL** (3 archivos en Supabase)
2. **REINICIAR APP**: `npm start`
3. **PROBAR**:
   - Seguir usuario
   - Enviar mensaje
   - Scroll infinito
   - Invitar a comunidad
   - Ver notificaciones

---

## 📊 DESPUÉS DE EJECUTAR SQL:

✅ Seguir usuario sin error RLS
✅ Chat funciona y llega a otra persona
✅ Notificaciones se crean correctamente
✅ Invitar a comunidad funciona
✅ Scroll infinito sin duplicados
✅ MarketInfo con datos de Supabase

---

## ⚡ COMMIT FINAL:

```bash
git add .
git commit -m "fix: Múltiples correcciones críticas

✅ ChatScreen: Usa participant.id para conversación
✅ HomeFeed: Scroll infinito con posts reales (no duplicados)
✅ MarketInfo: Usa datos de Supabase
✅ PromotionsScreen: Restaurado UI bonita
✅ SQL: RLS policies + expires_at + suggested_people_v2

🐛 Fixes:
- Chat conversationId undefined
- Posts duplicados SEBASTIAN 22
- RLS notifications
- Community invitations expires_at
- API MarketInfo 404

📁 15+ archivos modificados
🗄️ 3 archivos SQL nuevos"
```

---

## 🚀 PRÓXIMOS PASOS (OPCIONAL):

1. **NotificationsScreen**: Mostrar nombres de usuarios
2. **SafeAreaView**: Revisar todas las pantallas
3. **Chat realtime**: Optimizar si sigue lento
4. **API MarketInfo**: Poblar datos en Supabase

**¿TODO CLARO?** 🎯
