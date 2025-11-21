# 🔑 CÓMO CONSEGUIR FACEBOOK CLIENT TOKEN

## **FECHA**: 10 de Noviembre, 2025

---

## 📋 **PASOS PARA OBTENER EL CLIENT TOKEN**

### **1. Ir a Facebook Developers**

```
https://developers.facebook.com/apps/1520057669018241/settings/basic/
```

**O navegar manualmente**:
1. https://developers.facebook.com/
2. Mis Apps → Seleccionar tu app `1520057669018241`
3. Configuración → Básica

---

### **2. Encontrar el Client Token**

En la página de configuración básica, busca:

```
┌─────────────────────────────────────┐
│ App ID: 1520057669018241            │
│ App Secret: [Mostrar]               │
│ Client Token: [Mostrar]  ← ESTE    │
└─────────────────────────────────────┘
```

**Importante**: 
- El **Client Token** es diferente del **App Secret**
- Está en la misma página, más abajo
- Puede que necesites hacer clic en "Mostrar" para verlo

---

### **3. Copiar el Client Token**

Una vez que lo veas, cópialo. Se verá algo así:

```
abc123def456ghi789jkl012mno345pqr678
```

(Es un string largo de caracteres alfanuméricos)

---

### **4. Agregarlo en strings.xml**

**Archivo**: `android/app/src/main/res/values/strings.xml`

**Línea 8** (actualmente dice `TU_FACEBOOK_CLIENT_TOKEN`):

```xml
<string name="facebook_client_token">PEGAR_AQUI_TU_CLIENT_TOKEN</string>
```

**Ejemplo** (si tu token es `abc123def456`):

```xml
<string name="facebook_client_token">abc123def456ghi789jkl012mno345pqr678</string>
```

---

## ✅ **RESULTADO FINAL EN strings.xml**

```xml
<resources>
  <string name="app_name">Investi App</string>
  <string name="expo_splash_screen_resize_mode" translatable="false">contain</string>
  <string name="expo_splash_screen_status_bar_translucent" translatable="false">false</string>
  <string name="expo_runtime_version">1.0.0</string>
  <string name="facebook_app_id">1520057669018241</string>
  <string name="fb_login_protocol_scheme">fb1520057669018241</string>
  <string name="facebook_client_token">TU_CLIENT_TOKEN_REAL_AQUI</string>
</resources>
```

---

## 🔐 **CONFIGURACIÓN ADICIONAL EN SUPABASE**

Para que Facebook OAuth funcione completamente, también necesitas:

### **1. Ir a Supabase Dashboard**

```
https://supabase.com/dashboard/project/TU_PROJECT_ID/auth/providers
```

### **2. Habilitar Facebook Provider**

1. Buscar "Facebook" en la lista de providers
2. Hacer clic en "Enable"
3. Agregar:
   - **Facebook Client ID**: `1520057669018241` (tu App ID)
   - **Facebook Client Secret**: (obtenerlo de Facebook Developers → App Secret)

### **3. Configurar Redirect URL en Facebook**

En Facebook Developers:

1. Ir a: Productos → Facebook Login → Configuración
2. Agregar en "URI de redireccionamiento de OAuth válidos":

```
https://TU_PROJECT_REF.supabase.co/auth/v1/callback
```

**Ejemplo**:
```
https://abcdefghijk.supabase.co/auth/v1/callback
```

---

## ⚠️ **IMPORTANTE**

### **¿Es obligatorio el Client Token?**

**NO es obligatorio para desarrollo**, pero:

- ✅ **SÍ es obligatorio para producción** (Play Store)
- ✅ **SÍ es necesario para que Facebook OAuth funcione al 100%**
- ⚠️ Sin él, Facebook puede rechazar el login en producción

### **¿Qué pasa si no lo agrego ahora?**

- La app compilará sin problemas
- Google Play aceptará el AAB
- **PERO**: Facebook login puede fallar con error "Invalid Client Token"

---

## 🚀 **RECOMENDACIÓN**

**Opción 1: Agregarlo ahora** (recomendado)
```bash
1. Obtener Client Token de Facebook Developers
2. Agregarlo en strings.xml
3. Rebuild: npx expo run:android
4. Facebook OAuth funcionará 100%
```

**Opción 2: Dejarlo para después**
```bash
1. Dejar "TU_FACEBOOK_CLIENT_TOKEN" como está
2. Subir a Play Store sin Facebook OAuth funcional
3. Agregarlo en una actualización futura
```

---

## 📊 **RESUMEN**

| Item | Estado | Obligatorio |
|------|--------|-------------|
| Facebook App ID | ✅ Configurado: `1520057669018241` | ✅ SÍ |
| Facebook Scheme | ✅ Configurado: `fb1520057669018241` | ✅ SÍ |
| Facebook Client Token | ⚠️ Pendiente | ⚠️ Para producción |
| Supabase Facebook Provider | ⚠️ Verificar | ✅ SÍ |

---

## 🔍 **VERIFICAR QUE FACEBOOK FUNCIONA**

Después de agregar el Client Token:

```bash
1. npx expo start --clear
2. Ir a SignIn o SignUp
3. Hacer tap en botón de Facebook
4. Debería abrir Facebook login
5. Después de autorizar → Redirigir a la app
```

**Si falla**:
- Verificar que el Client Token es correcto
- Verificar que Supabase tiene Facebook habilitado
- Verificar que la Redirect URL está en Facebook Developers

---

**¿Necesitas ayuda para obtener el Client Token?** Avísame y te guío paso a paso.
