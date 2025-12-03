# 🔐 Resumen Visual - Archivos de OAuth

## 📁 Estructura de Archivos

```
investi-jhtech/
│
├── 🔑 CONFIGURACIÓN PRINCIPAL
│   └── src/supabase.ts
│       └── Inicializa cliente Supabase con OAuth config
│
├── 🖥️ PANTALLAS DE AUTENTICACIÓN
│   ├── src/screens/SignInScreen.tsx
│   │   └── Login con email + OAuth (Google, Facebook, LinkedIn)
│   │
│   ├── src/screens/SignUpScreen.tsx
│   │   └── Registro con email + OAuth (Google, Facebook, LinkedIn)
│   │
│   ├── src/screens/AuthCallbackScreen.tsx
│   │   └── Procesa callback de OAuth después de autenticación
│   │
│   └── src/screens/OAuthLoadingScreen.tsx
│       └── Pantalla de carga durante OAuth
│
├── 🎯 CONTEXTO Y HOOKS
│   ├── src/contexts/AuthContext.tsx
│   │   └── Gestiona estado global de autenticación
│   │
│   └── src/hooks/useAuthGuard.ts
│       └── Protege rutas que requieren autenticación
│
├── 🚀 EDGE FUNCTIONS (Supabase)
│   └── supabase/functions/linkedin-auth/
│       ├── index.ts
│       │   └── Maneja flujo OAuth de LinkedIn
│       │
│       └── README.md
│           └── Documentación de Edge Function
│
└── 📋 DOCUMENTACIÓN
    ├── VALIDACION_OAUTH_COMPLETA.md (NUEVO)
    │   └── Validación completa de todos los archivos
    │
    └── TAREA_GOOGLE_PLAY_RECHAZO.md (NUEVO)
        └── Plan de acción para resolver rechazo de Google Play
```

---

## 🔗 Flujo de Archivos

### Flujo 1: Google OAuth

```
SignInScreen.tsx (línea 284)
    ↓ handleOAuth("google")
    ↓
supabase.ts (línea 40-50)
    ↓ supabase.auth.signInWithOAuth()
    ↓
Navegador abre Google
    ↓
Usuario autoriza
    ↓
Redirección a: investi-community://auth/callback
    ↓
AuthCallbackScreen.tsx (línea 134-185)
    ↓ getSessionFromUrl()
    ↓
AuthContext.tsx (línea 87-135)
    ↓ onAuthStateChange listener
    ↓
Navega a Onboarding
```

---

### Flujo 2: Facebook OAuth

```
SignInScreen.tsx (línea 284)
    ↓ handleOAuth("facebook")
    ↓
supabase.ts (línea 40-50)
    ↓ supabase.auth.signInWithOAuth()
    ↓
Navegador abre Facebook
    ↓
Usuario autoriza
    ↓
Redirección a: investi-community://auth/callback
    ↓
AuthCallbackScreen.tsx (línea 134-185)
    ↓ getSessionFromUrl()
    ↓
AuthContext.tsx (línea 87-135)
    ↓ onAuthStateChange listener
    ↓
Navega a Onboarding
```

---

### Flujo 3: LinkedIn OAuth (con Edge Function)

```
SignInScreen.tsx (línea 304)
    ↓ handleOAuth("linkedin_oidc")
    ↓
Fetch a: /functions/v1/linkedin-auth
    ↓
linkedin-auth/index.ts (línea 42-60)
    ↓ Genera URL de LinkedIn
    ↓
Navegador abre LinkedIn
    ↓
Usuario autoriza
    ↓
Redirección a: /functions/v1/linkedin-auth/callback
    ↓
linkedin-auth/index.ts (línea 70-150)
    ↓ Intercambia código por tokens
    ↓
Redirección a: investi-community://auth/callback?access_token=...
    ↓
AuthCallbackScreen.tsx (línea 70-132)
    ↓ Extrae tokens de URL
    ↓
AuthContext.tsx (línea 87-135)
    ↓ onAuthStateChange listener
    ↓
Navega a Onboarding
```

---

## 📊 Matriz de Responsabilidades

| Archivo | Responsabilidad | Proveedores | Estado |
|---------|-----------------|-------------|--------|
| `supabase.ts` | Inicializar cliente | Google, Facebook, LinkedIn | ✅ |
| `SignInScreen.tsx` | UI de login | Google, Facebook, LinkedIn | ✅ |
| `SignUpScreen.tsx` | UI de registro | Google, Facebook, LinkedIn | ✅ |
| `AuthCallbackScreen.tsx` | Procesar callback | Google, Facebook, LinkedIn | ✅ |
| `OAuthLoadingScreen.tsx` | Pantalla de carga | Todos | ✅ |
| `AuthContext.tsx` | Gestionar estado | Todos | ✅ |
| `useAuthGuard.ts` | Proteger rutas | Todos | ✅ |
| `linkedin-auth/index.ts` | Edge Function | LinkedIn | ✅ |

---

## 🔑 Líneas Clave por Archivo

### `src/supabase.ts`
```typescript
// Línea 40-50: Configuración OAuth
auth: {
  storage: AsyncStorage,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,  // ✅ Detecta sesión en URL
  flowType: 'implicit',      // ✅ Flujo implícito
}
```

### `src/screens/SignInScreen.tsx`
```typescript
// Línea 37-148: handleOAuth
const handleOAuth = async (provider: "google" | "facebook" | "linkedin_oidc") => {
  // Google/Facebook: supabase.auth.signInWithOAuth()
  // LinkedIn: fetch /functions/v1/linkedin-auth
}

// Línea 280-310: Botones de OAuth
<TouchableOpacity onPress={() => handleOAuth("facebook")} />
<TouchableOpacity onPress={() => handleOAuth("google")} />
<TouchableOpacity onPress={() => handleOAuth("linkedin_oidc")} />
```

### `src/screens/SignUpScreen.tsx`
```typescript
// Línea 36-134: handleOAuth (idéntico a SignInScreen)
// Línea 440-470: Botones de OAuth
```

### `src/screens/AuthCallbackScreen.tsx`
```typescript
// Línea 70-132: Manejo de LinkedIn callback
const isLinkedInCallback = initialUrl && (...)
const accessToken = urlParams.get('access_token')
await supabase.auth.setSession({ access_token, refresh_token })

// Línea 134-185: Manejo de Google/Facebook callback
const result = await supabase.auth.getSessionFromUrl({ url: initialUrl })
```

### `src/contexts/AuthContext.tsx`
```typescript
// Línea 87-135: Listener de cambios de sesión
const { data: authData } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    if (session) {
      setIsAuthenticated(true)
      // Guardar tokens en AsyncStorage
    }
  }
)

// Línea 108-115: Guardar tokens
await storage.setItem('auth_token', session.access_token)
await storage.setItem('refresh_token', session.refresh_token)
```

### `supabase/functions/linkedin-auth/index.ts`
```typescript
// Línea 42-60: Iniciar OAuth
const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
authUrl.searchParams.set('client_id', LINKEDIN_CLIENT_ID)
authUrl.searchParams.set('redirect_uri', REDIRECT_URI)

// Línea 70-150: Procesar callback
const code = url.searchParams.get('code')
// Intercambiar código por tokens
```

---

## ✅ Validación de Cada Archivo

### ✅ `src/supabase.ts`
- [x] Cliente inicializado
- [x] OAuth config correcta
- [x] detectSessionInUrl: true
- [x] flowType: 'implicit'

### ✅ `src/screens/SignInScreen.tsx`
- [x] handleOAuth implementado
- [x] Soporta Google
- [x] Soporta Facebook
- [x] Soporta LinkedIn
- [x] Botones de OAuth visibles

### ✅ `src/screens/SignUpScreen.tsx`
- [x] handleOAuth implementado
- [x] Soporta Google
- [x] Soporta Facebook
- [x] Soporta LinkedIn
- [x] Botones de OAuth visibles

### ✅ `src/screens/AuthCallbackScreen.tsx`
- [x] Detecta LinkedIn callback
- [x] Detecta Google/Facebook callback
- [x] Extrae tokens correctamente
- [x] Establece sesión
- [x] Navega a Onboarding

### ✅ `src/screens/OAuthLoadingScreen.tsx`
- [x] Existe
- [x] Muestra loading

### ✅ `src/contexts/AuthContext.tsx`
- [x] Listener de cambios de sesión
- [x] Guarda tokens en AsyncStorage
- [x] Restaura sesión guardada
- [x] Maneja logout
- [x] Carga datos de usuario

### ✅ `src/hooks/useAuthGuard.ts`
- [x] Existe
- [x] Protege rutas

### ✅ `supabase/functions/linkedin-auth/index.ts`
- [x] Inicia OAuth
- [x] Procesa callback
- [x] Intercambia código por tokens
- [x] Maneja CORS
- [x] Redirige correctamente

---

## 🚀 Próximos Pasos

1. **Verificar credenciales**:
   - [ ] Google Client ID en `.env`
   - [ ] Facebook App ID en `.env`
   - [ ] LinkedIn Client ID en Supabase secrets
   - [ ] LinkedIn Client Secret en Supabase secrets

2. **Probar flujos**:
   - [ ] Probar Google OAuth en desarrollo
   - [ ] Probar Facebook OAuth en desarrollo
   - [ ] Probar LinkedIn OAuth en desarrollo
   - [ ] Probar en dispositivo real

3. **Monitorear**:
   - [ ] Revisar logs de Supabase
   - [ ] Revisar logs de Edge Functions
   - [ ] Monitorear errores de OAuth

---

## 📞 Documentación

- **Validación Completa**: `VALIDACION_OAUTH_COMPLETA.md`
- **Tarea Google Play**: `TAREA_GOOGLE_PLAY_RECHAZO.md`
- **Supabase OAuth**: https://supabase.com/docs/guides/auth
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Facebook OAuth**: https://developers.facebook.com/docs/facebook-login
- **LinkedIn OAuth**: https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication

---

**Última actualización**: Diciembre 3, 2025
**Estado**: ✅ Todos los archivos validados
