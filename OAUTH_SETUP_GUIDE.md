# 🔐 Guía de Configuración OAuth para Investi App

Esta guía te ayudará a configurar los proveedores de OAuth (Google, Facebook, LinkedIn) en Supabase para permitir que los usuarios inicien sesión con sus cuentas sociales.

## 📋 Tabla de Contenidos

1. [Google OAuth](#google-oauth)
2. [Facebook OAuth](#facebook-oauth)
3. [LinkedIn OAuth](#linkedin-oauth)
4. [Configuración en Supabase](#configuración-en-supabase)
5. [URLs de Callback](#urls-de-callback)
6. [Testing](#testing)

---

## 🔵 Google OAuth

### Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API** y **Google Identity Services**

### Paso 2: Configurar OAuth Consent Screen

1. En el menú lateral, ve a **APIs & Services** > **OAuth consent screen**
2. Selecciona **External** como tipo de usuario
3. Completa la información requerida:
   - **App name**: Investi App
   - **User support email**: tu correo
   - **Developer contact**: tu correo
4. Agrega los scopes necesarios:
   - `email`
   - `profile`
   - `openid`
5. Guarda y continúa

### Paso 3: Crear Credenciales OAuth

1. Ve a **APIs & Services** > **Credentials**
2. Click en **Create Credentials** > **OAuth 2.0 Client ID**
3. Selecciona **Web application**
4. Configura:
   - **Name**: Investi Web Client
   - **Authorized JavaScript origins**:
     ```
     https://paoliakwfoczcallnecf.supabase.co
     https://investi.app
     http://localhost:8081
     ```
   - **Authorized redirect URIs**:
     ```
     https://paoliakwfoczcallnecf.supabase.co/auth/v1/callback
     investi-community://auth/callback
     ```
5. Guarda y copia el **Client ID** y **Client Secret**

### Paso 4: Configurar en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** > **Providers**
3. Busca **Google** y habilítalo
4. Pega el **Client ID** y **Client Secret**
5. Guarda los cambios

✅ **Google OAuth está listo!**

---

## 🔴 Facebook OAuth

### Paso 1: Crear App en Facebook Developers

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Click en **My Apps** > **Create App**
3. Selecciona **Consumer** como tipo de app
4. Completa la información:
   - **App Name**: Investi App
   - **App Contact Email**: tu correo
5. Click en **Create App**

### Paso 2: Configurar Facebook Login

1. En el dashboard de tu app, busca **Facebook Login** y agrégalo
2. Selecciona **Web** como plataforma
3. En **Settings** > **Basic**:
   - Copia el **App ID** y **App Secret**
   - Agrega **Privacy Policy URL** y **Terms of Service URL**
4. En **Facebook Login** > **Settings**:
   - **Valid OAuth Redirect URIs**:
     ```
     https://paoliakwfoczcallnecf.supabase.co/auth/v1/callback
     investi-community://auth/callback
     ```
   - **Client OAuth Login**: Activado
   - **Web OAuth Login**: Activado
   - **Use Strict Mode for Redirect URIs**: Activado

### Paso 3: Configurar Permisos

1. Ve a **App Review** > **Permissions and Features**
2. Solicita los siguientes permisos:
   - `email` (aprobado por defecto)
   - `public_profile` (aprobado por defecto)

### Paso 4: Configurar en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Authentication** > **Providers**
3. Busca **Facebook** y habilítalo
4. Pega el **App ID** como Client ID
5. Pega el **App Secret** como Client Secret
6. Guarda los cambios

### Paso 5: Publicar la App (Importante)

1. En Facebook Developers, ve a **Settings** > **Basic**
2. Cambia el **App Mode** de **Development** a **Live**
3. Completa todos los requisitos necesarios

### ⚠️ Nota para Desarrolladores en Cuba

Si no puedes acceder a Facebook desde Cuba:
- Usa un VPN confiable (ProtonVPN, NordVPN)
- Considera usar un servidor proxy
- Como alternativa, pide a un colega fuera de Cuba que configure la app

✅ **Facebook OAuth está listo!**

---

## 🔵 LinkedIn OAuth

### Importante: LinkedIn requiere implementación custom

LinkedIn **NO está soportado nativamente por Supabase**, por lo que necesitas implementar un flujo OAuth custom.

### Paso 1: Crear App en LinkedIn Developers

1. Ve a [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click en **Create App**
3. Completa la información:
   - **App name**: Investi App
   - **LinkedIn Page**: Crea o selecciona una página de empresa
   - **Privacy policy URL**: URL de tu política de privacidad
   - **App logo**: Logo de Investi
4. Acepta los términos y crea la app

### Paso 2: Configurar OAuth Settings

1. En tu app, ve a la pestaña **Auth**
2. Copia el **Client ID** y **Client Secret**
3. En **Redirect URLs**, agrega:
   ```
   https://paoliakwfoczcallnecf.supabase.co/auth/v1/callback
   https://investi.app/auth/callback
   investi-community://auth/callback
   ```

### Paso 3: Solicitar Permisos

1. Ve a la pestaña **Products**
2. Solicita acceso a:
   - **Sign In with LinkedIn using OpenID Connect**
   - Espera aprobación (puede tomar 1-2 días)

### Paso 4: Implementar en el Backend

Necesitas crear una Edge Function en Supabase o un endpoint en tu backend:

```typescript
// supabase/functions/linkedin-auth/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID')
const LINKEDIN_CLIENT_SECRET = Deno.env.get('LINKEDIN_CLIENT_SECRET')
const REDIRECT_URI = 'https://paoliakwfoczcallnecf.supabase.co/auth/v1/callback'

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (!code) {
    // Redirect to LinkedIn OAuth
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20profile%20email`
    return Response.redirect(authUrl, 302)
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: LINKEDIN_CLIENT_ID!,
      client_secret: LINKEDIN_CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI
    })
  })

  const { access_token } = await tokenResponse.json()

  // Get user info
  const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  })

  const userData = await userResponse.json()

  // Create or update user in Supabase
  // ... implementar lógica de creación de usuario

  return new Response(JSON.stringify({ success: true, user: userData }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Paso 5: Actualizar el Cliente

En `SignInScreen.tsx` y `SignUpScreen.tsx`, actualiza el handler de LinkedIn:

```typescript
const handleLinkedInAuth = async () => {
  try {
    setLoading(true)
    const linkedInAuthUrl = 'https://paoliakwfoczcallnecf.supabase.co/functions/v1/linkedin-auth'
    
    if (Platform.OS === 'web') {
      window.location.href = linkedInAuthUrl
    } else {
      await Linking.openURL(linkedInAuthUrl)
    }
  } catch (err: any) {
    Alert.alert("Error", err?.message || "No se pudo iniciar con LinkedIn")
  } finally {
    setLoading(false)
  }
}
```

⚠️ **LinkedIn OAuth requiere más trabajo de implementación**

---

## ⚙️ Configuración en Supabase

### URL de Callback Principal

Tu URL de callback de Supabase es:
```
https://paoliakwfoczcallnecf.supabase.co/auth/v1/callback
```

Esta URL debe estar configurada en **TODOS** los proveedores OAuth.

### Site URL

1. Ve a **Authentication** > **URL Configuration**
2. Configura:
   - **Site URL**: `https://investi.app` (o tu dominio de producción)
   - **Redirect URLs**: 
     ```
     https://investi.app/auth/callback
     investi-community://auth/callback
     http://localhost:8081/auth/callback
     ```

### Email Templates

Personaliza los templates de email en **Authentication** > **Email Templates**:
- Confirmation email
- Reset password email
- Magic link email

---

## 🔗 URLs de Callback

### Para Desarrollo Local
```
http://localhost:8081/auth/callback
investi-community://auth/callback
```

### Para Producción
```
https://investi.app/auth/callback
investi-community://auth/callback
```

### Deep Link Scheme
```
investi-community://
```

---

## 🧪 Testing

### 1. Probar en Desarrollo

```bash
# Iniciar el servidor de desarrollo
npm start

# O con Expo
npx expo start
```

### 2. Probar cada Provider

1. **Google**: Debería funcionar inmediatamente
2. **Facebook**: Asegúrate de que la app esté en modo "Live"
3. **LinkedIn**: Requiere implementación custom

### 3. Verificar Logs

En Supabase Dashboard:
- Ve a **Authentication** > **Users** para ver usuarios creados
- Ve a **Logs** para ver errores de autenticación

### 4. Probar en Dispositivo Real

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

---

## 🐛 Troubleshooting

### Error: "Invalid redirect_uri"
- Verifica que la URL de callback esté exactamente igual en el proveedor OAuth y en Supabase
- No olvides incluir `https://` en las URLs

### Error: "App not approved"
- Facebook: Cambia la app a modo "Live"
- LinkedIn: Espera la aprobación de permisos

### Error: "OAuth provider not enabled"
- Ve a Supabase Dashboard > Authentication > Providers
- Asegúrate de que el provider esté habilitado y configurado

### Deep Links no funcionan en la app
- Verifica `app.config.js` tenga el scheme correcto
- Rebuild la app después de cambiar la configuración
- En Android, verifica los intent filters

---

## 📚 Recursos Adicionales

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)

---

## ✅ Checklist Final

Antes de lanzar a producción:

- [ ] Google OAuth configurado y probado
- [ ] Facebook OAuth configurado en modo "Live"
- [ ] LinkedIn OAuth implementado (si es necesario)
- [ ] URLs de callback configuradas en todos los providers
- [ ] Site URL configurada en Supabase
- [ ] Deep linking probado en iOS y Android
- [ ] Email templates personalizados
- [ ] Política de privacidad y términos de servicio publicados
- [ ] Probado en dispositivos reales

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo o consulta la documentación oficial de cada proveedor.
