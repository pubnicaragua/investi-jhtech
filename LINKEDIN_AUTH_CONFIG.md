# 🔐 Configuración de LinkedIn OAuth

## ✅ Credenciales Configuradas

### LinkedIn App Credentials
```
Client ID: 7799o54h2bysvt
Client Secret: [CONFIGURAR EN VARIABLES DE ENTORNO]
```

**Nota:** El Client Secret debe configurarse como variable de entorno en Supabase, no debe estar en el código.

### Edge Function URL
```
https://paoliakwfoczcallnecf.supabase.co/functions/v1/linkedin-auth
```

---

## 📝 Configuración en LinkedIn Developer Portal

### 1. Redirect URIs Autorizados

Debes agregar estos URIs en tu LinkedIn App:

```
https://paoliakwfoczcallnecf.supabase.co/functions/v1/linkedin-auth/callback
https://paoliakwfoczcallnecf.supabase.co/auth/callback
```

### 2. Scopes Requeridos

```
openid
profile
email
```

### 3. Verificar Configuración

1. Ir a: https://www.linkedin.com/developers/apps
2. Seleccionar tu app: `7799o54h2bysvt`
3. En "Auth" tab:
   - Verificar que los Redirect URIs estén agregados
   - Verificar que los scopes estén habilitados
4. En "Products" tab:
   - Asegurar que "Sign In with LinkedIn using OpenID Connect" esté habilitado

---

## 🧪 Probar LinkedIn Auth

### Opción 1: Desde la App

1. Abrir la app
2. Ir a Sign In
3. Click en botón de LinkedIn
4. Debería redirigir a LinkedIn para autorizar
5. Después de autorizar, debería volver a la app con sesión iniciada

### Opción 2: Probar Edge Function Directamente

```bash
# Test endpoint principal
curl -X GET \
  "https://paoliakwfoczcallnecf.supabase.co/functions/v1/linkedin-auth" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o"
```

Debería redirigir a LinkedIn OAuth.

---

## 🔧 Variables de Entorno en Supabase

Asegúrate de configurar estas variables en Supabase Dashboard:

1. Ir a: https://supabase.com/dashboard/project/paoliakwfoczcallnecf/settings/functions
2. Agregar variables de entorno:

```
LINKEDIN_CLIENT_ID=7799o54h2bysvt
LINKEDIN_CLIENT_SECRET=[TU_CLIENT_SECRET_AQUI]
```

**Importante:** Obtén el Client Secret desde tu LinkedIn Developer Portal.

---

## 📊 Flujo de Autenticación

```
1. Usuario click en "Sign in with LinkedIn"
   ↓
2. App llama a: /functions/v1/linkedin-auth
   ↓
3. Edge Function redirige a LinkedIn OAuth
   ↓
4. Usuario autoriza en LinkedIn
   ↓
5. LinkedIn redirige a: /functions/v1/linkedin-auth/callback?code=...
   ↓
6. Edge Function:
   - Intercambia code por access_token
   - Obtiene perfil de usuario
   - Crea/actualiza usuario en Supabase
   - Genera sesión
   ↓
7. Redirige a app con sesión activa
```

---

## ⚠️ Troubleshooting

### Error: "redirect_uri_mismatch"
**Solución:** Verificar que los Redirect URIs en LinkedIn Developer Portal coincidan exactamente:
```
https://paoliakwfoczcallnecf.supabase.co/functions/v1/linkedin-auth/callback
```

### Error: "invalid_client"
**Solución:** Verificar que Client ID y Client Secret sean correctos en las variables de entorno.

### Error: "unauthorized_client"
**Solución:** Verificar que "Sign In with LinkedIn using OpenID Connect" esté habilitado en Products.

### Error: "access_denied"
**Solución:** El usuario canceló la autorización. Normal, no es un error del sistema.

---

## 📱 Implementación en la App

### SignInScreen.tsx
```typescript
const handleOAuth = async (provider: "linkedin_oidc") => {
  const linkedInAuthUrl = `${supabase.supabaseUrl}/functions/v1/linkedin-auth`
  const response = await fetch(linkedInAuthUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
  })
  // ... manejo de redirección
}
```

### AuthCallbackScreen.tsx
Maneja el callback después de la autenticación exitosa.

---

## ✅ Checklist de Configuración

- [x] Credenciales de LinkedIn configuradas en edge function
- [ ] Variables de entorno configuradas en Supabase Dashboard
- [ ] Redirect URIs agregados en LinkedIn Developer Portal
- [ ] Scopes habilitados (openid, profile, email)
- [ ] "Sign In with LinkedIn using OpenID Connect" habilitado
- [ ] Edge function desplegada en Supabase
- [ ] Probado flujo completo de autenticación

---

## 🚀 Desplegar Edge Function

```bash
# Desde la raíz del proyecto
supabase functions deploy linkedin-auth

# O si ya tienes Supabase CLI configurado
cd supabase/functions/linkedin-auth
supabase functions deploy
```

---

**Última actualización:** Octubre 29, 2025  
**Estado:** ✅ Credenciales configuradas, pendiente despliegue
