# 🔐 CONFIGURACIÓN OAUTH - FACEBOOK Y GOOGLE

## ⚠️ PROBLEMA ACTUAL

El OAuth de Facebook y Google está fallando porque **faltan las Redirect URLs correctas en Supabase**.

---

## ✅ SOLUCIÓN: CONFIGURAR REDIRECT URLs EN SUPABASE

### 📍 Paso 1: Ir a Supabase Dashboard

1. Ir a: https://supabase.com/dashboard
2. Seleccionar proyecto: **Investi App**
3. Ir a: **Authentication → URL Configuration**

### 📍 Paso 2: Agregar Redirect URLs

En el campo **"Redirect URLs"**, agregar las siguientes URLs (una por línea):

```
https://www.investiiapp.com/auth/callback
https://www.investiiapp.com/*
investi-community://auth/callback
com.investi.app://auth/callback
exp://192.168.129.87:8083
```

**Explicación de cada URL:**
- `https://www.investiiapp.com/auth/callback` - Para web en producción
- `https://www.investiiapp.com/*` - Wildcard para cualquier ruta web
- `investi-community://auth/callback` - Para app móvil (scheme personalizado)
- `com.investi.app://auth/callback` - Para app móvil (package name)
- `exp://192.168.129.87:8083` - Para desarrollo local con Expo Go

### 📍 Paso 3: Verificar Site URL

Asegurarse que **Site URL** esté configurado como:
```
https://www.investiiapp.com
```

### 📍 Paso 4: Click en "Save"

---

## 🔧 CONFIGURACIÓN FACEBOOK (SI AÚN NO ESTÁ)

### 1. Facebook Developer Console
1. Ir a: https://developers.facebook.com/apps
2. Seleccionar tu app de Investi
3. Ir a **Settings → Basic**

### 2. Configurar App Domains
Agregar:
```
investiiapp.com
www.investiiapp.com
```

### 3. Agregar Platform - Android
1. Click en "+ Add Platform"
2. Seleccionar "Android"
3. Configurar:
   - **Package Name**: `com.investi.app`
   - **Class Name**: `com.investi.app.MainActivity`
   - **Key Hashes**: (Generar con el comando abajo)

### 4. Generar Key Hash para Android
```bash
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
```

Password por defecto: `android`

### 5. OAuth Redirect URIs
En **Facebook Login → Settings**, agregar:
```
https://paoliakwfoczcallnecf.supabase.co/auth/v1/callback
https://www.investiiapp.com/auth/callback
```

---

## 🔧 CONFIGURACIÓN GOOGLE (SI AÚN NO ESTÁ)

### 1. Google Cloud Console
1. Ir a: https://console.cloud.google.com
2. Seleccionar proyecto de Investi
3. Ir a **APIs & Services → Credentials**

### 2. Configurar OAuth 2.0 Client ID

#### Para Android:
1. Click en el Client ID de Android
2. **Package name**: `com.investi.app`
3. **SHA-1 certificate fingerprint**: (Generar con comando abajo)

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copiar el SHA-1 que aparece.

#### Para Web:
1. Crear nuevo OAuth 2.0 Client ID (Web application)
2. **Authorized JavaScript origins**:
   ```
   https://www.investiiapp.com
   https://paoliakwfoczcallnecf.supabase.co
   ```

3. **Authorized redirect URIs**:
   ```
   https://paoliakwfoczcallnecf.supabase.co/auth/v1/callback
   https://www.investiiapp.com/auth/callback
   ```

### 3. Copiar Client ID
Copiar el **Client ID** de Google y guardarlo.

---

## 📱 CONFIGURAR EN LA APP

### 1. Facebook App ID

Necesitas el Facebook App ID. Luego edita:

**Archivo**: `android/app/src/main/res/values/strings.xml`

Reemplazar:
```xml
<string name="facebook_app_id">TU_FACEBOOK_APP_ID</string>
<string name="fb_login_protocol_scheme">fbTU_FACEBOOK_APP_ID</string>
<string name="facebook_client_token">TU_FACEBOOK_CLIENT_TOKEN</string>
```

Por tus valores reales.

**Ejemplo** (si tu FB App ID es 123456789):
```xml
<string name="facebook_app_id">123456789</string>
<string name="fb_login_protocol_scheme">fb123456789</string>
<string name="facebook_client_token">abc123token</string>
```

### 2. Configurar en Supabase Dashboard

1. Ir a **Authentication → Providers**
2. Habilitar **Google** y **Facebook**
3. Configurar:

#### Facebook:
- **Facebook Client ID**: Tu FB App ID
- **Facebook Client Secret**: Tu FB App Secret (de FB Developer Console)

#### Google:
- **Google Client ID**: Tu Google Client ID
- **Google Client Secret**: Tu Google Client Secret

---

## ✅ VERIFICAR QUE TODO ESTÉ CORRECTO

### Checklist:

- [ ] Redirect URLs agregadas en Supabase
- [ ] Site URL configurado correctamente
- [ ] Facebook App configurado con package name correcto
- [ ] Google OAuth configurado con package name correcto
- [ ] Facebook App ID agregado en `strings.xml`
- [ ] Facebook habilitado en Supabase con credenciales
- [ ] Google habilitado en Supabase con credenciales

---

## 🧪 PROBAR

1. Rebuild de la app:
   ```bash
   eas build --profile playstore --platform android
   ```

2. Probar login con Facebook:
   - Debería abrir Facebook
   - Después de autorizar, debería volver a la app
   - Usuario creado en Supabase

3. Probar login con Google:
   - Debería abrir selector de cuenta Google
   - Después de autorizar, debería volver a la app
   - Usuario creado en Supabase

---

## 🐛 TROUBLESHOOTING

### Error: "Identificador de la app no válido" (Facebook)
- **Causa**: Facebook App ID incorrecto o no configurado
- **Solución**: Verificar `strings.xml` y Facebook Developer Console

### Error: "Redirect URI mismatch" (Google)
- **Causa**: La redirect URI no está en la lista de Google Console
- **Solución**: Agregar todas las redirect URIs en Google Cloud Console

### Error: "Invalid redirect URL" (Supabase)
- **Causa**: La redirect URL no está en la allowlist de Supabase
- **Solución**: Agregar las redirect URLs en Supabase Dashboard

---

## 📞 CONTACTO

Si después de seguir estos pasos aún hay problemas, revisar los logs:

```bash
# Logs de Android
adb logcat | grep -i oauth
adb logcat | grep -i facebook
adb logcat | grep -i google
```

---

**IMPORTANTE**: Después de configurar todo, hacer un **rebuild completo** de la app con EAS Build.
