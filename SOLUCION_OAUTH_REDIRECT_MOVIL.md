# 🔧 SOLUCIÓN: OAuth Redirige a Web en Lugar de App Móvil

## **FECHA**: 10 de Noviembre, 2025 - 12:50 PM

---

## 🚨 **PROBLEMA IDENTIFICADO**

### **Síntomas**:

1. **Facebook OAuth**: Muestra "Identificador de aplicación no válido"
2. **Google OAuth**: Redirige a `investiiapp.com` (web) en lugar de la app móvil
3. **LinkedIn OAuth**: Probablemente tiene el mismo problema

### **Causa Raíz**:

El código estaba usando `Linking.createURL('auth/callback')` que genera URLs de la web (`https://investiiapp.com`) en lugar del **scheme personalizado de la app** (`investi-community://`).

---

## ✅ **SOLUCIÓN APLICADA**

### **Cambios en SignInScreen.tsx y SignUpScreen.tsx**:

**ANTES** (incorrecto):
```typescript
let redirectTo = ''
try {
  redirectTo = Linking.createURL('auth/callback')  // ❌ Genera URL web
} catch (e) {
  redirectTo = `${window.location.origin}/auth/callback`
}
```

**DESPUÉS** (correcto):
```typescript
// For mobile: use app scheme. For web: use window origin
let redirectTo = ''
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
  redirectTo = `${window.location.origin}/auth/callback`
} else {
  // Mobile: use custom scheme that matches app.config.js
  redirectTo = 'investi-community://auth/callback'  // ✅ Scheme de la app
}
console.log('[SignInScreen] OAuth redirectTo:', redirectTo, 'Platform:', Platform.OS)
```

---

## 📋 **CONFIGURACIÓN EN SUPABASE**

Para que esto funcione, necesitas agregar el **redirect URL** en Supabase:

### **1. Ir a Supabase Dashboard**

```
https://supabase.com/dashboard/project/TU_PROJECT_ID/auth/url-configuration
```

### **2. Agregar Redirect URLs**

En "Redirect URLs", agregar:

```
investi-community://auth/callback
```

**Ejemplo completo**:
```
Site URL: https://investiiapp.com
Redirect URLs:
  - https://investiiapp.com/auth/callback
  - investi-community://auth/callback  ← AGREGAR ESTE
```

### **3. Guardar cambios**

Click en "Save" en Supabase Dashboard

---

## 🔐 **CONFIGURACIÓN EN FACEBOOK DEVELOPERS**

Para Facebook OAuth, también necesitas configurar el redirect:

### **1. Ir a Facebook Developers**

```
https://developers.facebook.com/apps/1520057669018241/fb-login/settings/
```

### **2. Agregar URI de Redireccionamiento**

En "URI de redireccionamiento de OAuth válidos", agregar:

```
investi-community://auth/callback
```

**Ejemplo completo**:
```
URI de redireccionamiento de OAuth válidos:
  - https://paoliakvfoczcallnecf.supabase.co/auth/v1/callback
  - investi-community://auth/callback  ← AGREGAR ESTE
```

### **3. Guardar cambios**

Click en "Guardar cambios"

---

## 🔐 **CONFIGURACIÓN EN GOOGLE CLOUD CONSOLE**

Para Google OAuth:

### **1. Ir a Google Cloud Console**

```
https://console.cloud.google.com/apis/credentials
```

### **2. Editar OAuth 2.0 Client ID**

1. Seleccionar tu Client ID
2. En "URIs de redireccionamiento autorizados", agregar:

```
investi-community://auth/callback
```

### **3. Guardar**

Click en "Guardar"

---

## 📱 **VERIFICAR app.config.js**

El scheme `investi-community` está correctamente configurado:

```javascript
// app.config.js
export default {
  expo: {
    scheme: 'investi-community',  // ✅ Correcto
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'investi-community',
            host: 'auth',
            pathPrefix: '/callback'
          }
        ],
        category: ['BROWSABLE', 'DEFAULT']
      }
    ],
    // ...
  }
}
```

---

## 🚀 **PASOS PARA PROBAR**

### **1. Rebuild la app**

```bash
npx expo run:android
```

**Importante**: Necesitas rebuild porque cambiamos el código de OAuth

### **2. Probar Facebook OAuth**

1. Abrir app
2. Ir a SignIn
3. Tap en botón de Facebook
4. Debería abrir Facebook login
5. Después de autorizar → Redirigir a la app (NO a la web)

### **3. Probar Google OAuth**

1. Abrir app
2. Ir a SignIn
3. Tap en botón de Google
4. Seleccionar cuenta
5. Después de autorizar → Redirigir a la app (NO a la web)

### **4. Verificar en consola**

Buscar en logs:
```
[SignInScreen] OAuth redirectTo: investi-community://auth/callback Platform: android
```

---

## 🔍 **DEBUGGING**

### **Si sigue redirigiendo a la web**:

1. **Verificar que hiciste rebuild**:
```bash
npx expo run:android
```

2. **Verificar logs en consola**:
```
[SignInScreen] OAuth redirectTo: investi-community://auth/callback
```

Si dice `https://investiiapp.com`, el código no se actualizó.

3. **Verificar Supabase**:
- Dashboard → Auth → URL Configuration
- Debe tener `investi-community://auth/callback` en Redirect URLs

### **Si Facebook dice "Identificador no válido"**:

1. **Verificar Facebook Developers**:
   - App ID: `1520057669018241` ✅
   - Redirect URI: `investi-community://auth/callback` ⚠️ Agregar

2. **Verificar strings.xml**:
```xml
<string name="facebook_app_id">1520057669018241</string>
<string name="fb_login_protocol_scheme">fb1520057669018241</string>
```

### **Si Google no funciona**:

1. **Verificar Google Cloud Console**:
   - OAuth Client ID configurado
   - Redirect URI: `investi-community://auth/callback` agregado

2. **Verificar Supabase**:
   - Google Provider habilitado
   - Client ID y Secret configurados

---

## 📊 **RESUMEN DE CAMBIOS**

| Archivo | Cambio | Estado |
|---------|--------|--------|
| `SignInScreen.tsx` | redirectTo usa `investi-community://` | ✅ Corregido |
| `SignUpScreen.tsx` | redirectTo usa `investi-community://` | ✅ Corregido |
| `app.config.js` | scheme configurado | ✅ Ya estaba |
| Supabase Redirect URLs | Agregar scheme | ⚠️ **PENDIENTE** |
| Facebook Redirect URI | Agregar scheme | ⚠️ **PENDIENTE** |
| Google Redirect URI | Agregar scheme | ⚠️ **PENDIENTE** |

---

## ✅ **CHECKLIST FINAL**

Antes de probar, verificar:

- [ ] ✅ Código actualizado en SignInScreen.tsx
- [ ] ✅ Código actualizado en SignUpScreen.tsx
- [ ] ⚠️ Supabase: `investi-community://auth/callback` agregado
- [ ] ⚠️ Facebook: `investi-community://auth/callback` agregado
- [ ] ⚠️ Google: `investi-community://auth/callback` agregado
- [ ] ⚠️ Rebuild: `npx expo run:android`

---

## 🎯 **RESULTADO ESPERADO**

Después de aplicar todo:

1. **Facebook OAuth**: 
   - ✅ Abre Facebook login
   - ✅ Redirige a la app (NO a la web)
   - ✅ Usuario autenticado

2. **Google OAuth**:
   - ✅ Abre Google login
   - ✅ Redirige a la app (NO a la web)
   - ✅ Usuario autenticado

3. **LinkedIn OAuth**:
   - ✅ Abre LinkedIn login
   - ✅ Redirige a la app (NO a la web)
   - ✅ Usuario autenticado

---

**¿Necesitas ayuda para configurar Supabase, Facebook o Google?** Avísame y te guío paso a paso.
