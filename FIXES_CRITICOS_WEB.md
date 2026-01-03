# 🔧 FIXES CRÍTICOS PARA WEB - Investí

## Problemas Identificados y Soluciones

### 1. ✅ Navegación Redirige a LanguageSelection (RESUELTO)
**Problema:** Después del login, redirige a LanguageSelection en lugar de HomeFeed
**Causa:** `navigation.tsx` verifica idioma para usuarios no autenticados
**Solución:** Eliminar verificación de idioma, ir directo a Welcome

### 2. ✅ Sin Scroll en Web (HomeFeed) (RESUELTO)
**Problema:** No se puede hacer scroll en HomeFeed en web
**Causa:** Falta `overflow: 'auto'` en contenedor
**Solución:** Agregar `overflow: 'auto'` para web en `feedContainer`

### 3. 🔄 Sin Scroll en Web (MarketInfo) (EN PROGRESO)
**Problema:** No se puede hacer scroll en MarketInfo en web
**Solución:** Agregar `overflow: 'auto'` en ScrollView para web

### 4. 🔄 Logos No Cargan en MarketInfo (EN PROGRESO)
**Problema:** `ERR_NAME_NOT_RESOLVED` para logos de Clearbit
**Causa:** Clearbit requiere dominio exacto, no todos los símbolos tienen logo
**Solución:** Usar fallback con imagen placeholder o icono genérico

### 5. ⏳ PromotionsScreen en Blanco (PENDIENTE)
**Problema:** PromotionsScreen no carga datos
**Solución:** Verificar llamada a `get_promotions` RPC y agregar logs

### 6. ⏳ Health Endpoint 404 (PENDIENTE)
**Problema:** `HEAD /rest/v1/health` retorna 404
**Causa:** Endpoint no existe en Supabase
**Solución:** Remover llamadas a `/health` endpoint

### 7. ⏳ Sin Scroll en Sidebar (PENDIENTE)
**Problema:** Sidebar no permite scroll en web
**Solución:** Agregar `overflow: 'auto'` en contenedor del sidebar

### 8. ⏳ Feedback Dinámico MarketInfo (PENDIENTE)
**Problema:** "Cargando datos del mercado..." es estático
**Solución:** Mostrar progreso: "Cargando 5/20 acciones..."

## Archivos Modificados

1. ✅ `navigation.tsx` - Línea 335-337
2. ✅ `src/screens/HomeFeedScreen.tsx` - Líneas 1385-1392
3. 🔄 `src/screens/MarketInfoScreen.tsx` - Estilos + Loading
4. ⏳ `src/screens/PromotionsScreen.tsx` - Data loading
5. ⏳ `src/services/searchApiService.ts` - Logo fallback
6. ⏳ Buscar y remover health endpoint calls

## Próximos Pasos

1. Agregar scroll a MarketInfo
2. Implementar logo fallback con placeholder
3. Agregar feedback dinámico de carga
4. Corregir PromotionsScreen data loading
5. Remover health endpoint calls
6. Agregar scroll a sidebar
7. Commit y push todos los cambios
