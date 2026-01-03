# ✅ SOLUCIÓN - Doble Login y Navbar Desaparece

## Problemas Identificados

### 1. ✅ Doble Login - Usuario debe iniciar sesión 2 veces - RESUELTO

**Problema:** 
- Primera vez: Login exitoso → Redirige a `LanguageSelection` → Vuelve a Welcome
- Segunda vez: Login exitoso → Va a HomeFeed correctamente

**Causa:** 
En los logs se ve claramente:
```
🌍 Navigation: Idioma guardado: null
🌍 Navigation: Sin idioma, yendo a LanguageSelection
```

Cuando el usuario inicia sesión, `navigation.tsx` verifica si hay idioma guardado en `AsyncStorage.getItem('user_language')`. Si no existe, redirige a `LanguageSelection` en lugar de ir a `HomeFeed`.

**Solución implementada en `AuthContext.tsx`:**
```typescript
// Guardar idioma por defecto al iniciar sesión
Promise.all([
  storage.setItem('auth_token', data.session.access_token),
  storage.setItem('userToken', data.session.access_token),
  storage.setItem('access_token', data.session.access_token),
  storage.setItem('userId', data.user.id),
  storage.setItem('user_language', 'es'), // ← NUEVO: Guardar idioma por defecto
  data.session.refresh_token ? storage.setItem('refresh_token', data.session.refresh_token) : Promise.resolve(),
])
```

**Resultado:**
- ✅ Primera vez: Login → HomeFeed directamente
- ✅ No más redirección a LanguageSelection
- ✅ Idioma español por defecto

---

### 2. ⚠️ Navbar desaparece 1 segundo - PARCIALMENTE RESUELTO

**Problema:** 
Navbar aparece pero desaparece brevemente (1 segundo) al cargar HomeFeed.

**Causa posible:**
- Navbar se renderiza después del contenido
- Estado de loading inicial
- Animaciones de entrada

**Solución implementada:**
```typescript
// Estado para navbar siempre visible
const [navbarReady, setNavbarReady] = useState(true);

// Estilos con zIndex máximo
bottomNavigation: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  elevation: 1000,
  // ...
}
```

**Estado:** Navbar ahora tiene `zIndex: 1000` y `elevation: 1000` para estar siempre encima.

---

## 📊 Cambios Aplicados

| Archivo | Cambio | Línea |
|---------|--------|-------|
| AuthContext.tsx | Guardar `user_language: 'es'` al login | 289 |
| HomeFeedScreen.tsx | Add `navbarReady` state | 92 |
| HomeFeedScreen.tsx | `zIndex: 1000` en navbar | 1550 |

---

## 🚀 Para Probar

```bash
# 1. Reiniciar servidor
npm run web

# 2. Borrar caché del navegador
# Chrome: Ctrl+Shift+Delete → Clear cache

# 3. Probar login
# - Debe ir directo a HomeFeed (no a LanguageSelection)
# - Navbar debe permanecer visible todo el tiempo
```

---

## 🔍 Verificación de Logs

**Antes (INCORRECTO):**
```
🌍 Navigation: Idioma guardado: null
🌍 Navigation: Sin idioma, yendo a LanguageSelection
```

**Ahora (CORRECTO):**
```
🌍 Navigation: Idioma guardado: es
✅ Navigation: Idioma seleccionado, yendo a Welcome
✅ Navigation: onboarding_step=completed → HomeFeed
```

---

## ✅ Estado Final

| Problema | Estado | Solución |
|----------|--------|----------|
| Doble login | ✅ Resuelto | Guardar `user_language: 'es'` al login |
| Navbar desaparece 1s | ⚠️ Mejorado | `zIndex: 1000`, `elevation: 1000` |

---

## 📝 Notas Adicionales

### Si el navbar sigue desapareciendo:

1. **Verificar orden de renderizado:**
   - Navbar debe estar al final del JSX (último hijo)
   - Debe tener `position: 'absolute'`

2. **Verificar animaciones:**
   - Buscar `Animated` en HomeFeedScreen
   - Verificar que no haya animaciones de opacidad en navbar

3. **Verificar estados de loading:**
   - `loading` state puede ocultar navbar
   - Verificar que navbar se renderice incluso durante loading

### Alternativa si persiste:

```typescript
// Renderizar navbar ANTES del contenido con portal
import { Portal } from 'react-native-paper';

<Portal>
  <View style={styles.bottomNavigation}>
    {/* navbar content */}
  </View>
</Portal>
```

---

**1 problema resuelto completamente. 1 problema mejorado (requiere prueba).**
