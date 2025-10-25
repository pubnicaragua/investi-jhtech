# 🚨 EJECUTAR AHORA - PASOS FINALES

## 1️⃣ EJECUTAR EN SUPABASE (URGENTE)

**Archivo**: `EJECUTAR_EN_SUPABASE_URGENTE.sql`

Esto corrige:
- ✅ Función `notify_on_follow()` con columnas correctas
- ✅ RLS Policies para notifications (permite INSERT desde triggers)
- ✅ Trigger automático para notificaciones

## 2️⃣ EJECUTAR SQL ADICIONAL (SUGERENCIAS)

**Archivo**: `sql/fix_suggested_people_v2.sql`

Esto corrige:
- ✅ Error "column reference user_id is ambiguous"
- ✅ Mejora algoritmo de personas sugeridas

## 3️⃣ RESTAURAR PromotionsScreen

**Comando en terminal**:
```bash
git checkout a98b9e7 -- src/screens/PromotionsScreen.tsx
```

Esto restaura la UI bonita del commit a98b9e7

---

## 4️⃣ PROBLEMAS IDENTIFICADOS

### ❌ API MarketInfo
**Problema**: API key es de plan legacy (expiró Agosto 31, 2025)
**Solución**: 
1. Obtener nueva API key en https://site.financialmodelingprep.com/developer/docs/pricing
2. Actualizar en `.env` o código:
```
EXPO_PUBLIC_FMP_API_KEY=TU_NUEVA_API_KEY
```

**Mientras tanto**: La app mostrará mensaje "No hay datos de mercado" (sin mock data)

---

## 5️⃣ RESUMEN DE FIXES APLICADOS

### ✅ ChatScreen TypeScript
- 5 errores corregidos con `|| ''` y `|| undefined`

### ✅ MarketInfo
- Eliminado MOCK_STOCKS fallback
- Agregados logs detallados
- Navega a InvestmentSimulator

### ✅ Notifications RLS
- Policies agregadas para permitir INSERT desde triggers
- Usuarios pueden leer/actualizar sus propias notificaciones

### ✅ Suggested People
- Función v2 corregida (ambiguous user_id)

---

## 🎯 DESPUÉS DE EJECUTAR TODO

1. **Reiniciar app** (Ctrl+C y `npm start`)
2. **Probar seguir usuario** → Debe crear notificación SIN error RLS
3. **Ver MarketInfo** → Logs mostrarán error 403 de API
4. **Ver Promotions** → UI bonita restaurada
5. **Ver personas sugeridas** → Más variedad, sin error ambiguous

---

## 📋 CHECKLIST FINAL

- [ ] Ejecutar `EJECUTAR_EN_SUPABASE_URGENTE.sql`
- [ ] Ejecutar `sql/fix_suggested_people_v2.sql`
- [ ] Restaurar PromotionsScreen: `git checkout a98b9e7 -- src/screens/PromotionsScreen.tsx`
- [ ] Obtener nueva API key de Financial Modeling Prep
- [ ] Reiniciar app
- [ ] Probar todas las funcionalidades

---

## ⚠️ IMPORTANTE

**NO HACER COMMIT** hasta confirmar que todo funciona correctamente después de:
1. Ejecutar los SQL
2. Restaurar PromotionsScreen
3. Probar la app

Una vez confirmado, hacer commit de TODO junto.
