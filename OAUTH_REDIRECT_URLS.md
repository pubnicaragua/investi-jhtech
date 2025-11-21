# URLs de Redirección OAuth - Configuración Supabase

## 📋 URLs que DEBEN estar configuradas en Supabase Dashboard

Ve a: **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**

### URLs de Redirección Requeridas:

```
investi-community://auth/callback
https://investi.app/auth/callback
https://paoliakwfoczcallnecf.supabase.co/auth/callback
http://localhost:19006/auth/callback
exp://192.168.1.100:8081/--/auth/callback
```

### Explicación de cada URL:

1. **`investi-community://auth/callback`**
   - Para la app móvil (Android/iOS)
   - Usa el custom scheme definido en `app.config.js`

2. **`https://investi.app/auth/callback`**
   - Para la versión web en producción
   - Dominio personalizado (si aplica)

3. **`https://paoliakwfoczcallnecf.supabase.co/auth/callback`**
   - URL de Supabase por defecto
   - Necesaria para LinkedIn Edge Function

4. **`http://localhost:19006/auth/callback`**
   - Para desarrollo web local con Expo
   - Puerto por defecto de Expo Web

5. **`exp://192.168.1.100:8081/--/auth/callback`**
   - Para desarrollo móvil con Expo Go
   - Reemplaza `192.168.1.100` con tu IP local

## 🔧 Site URL Configuration

En **Supabase Dashboard → Authentication → URL Configuration → Site URL**:

```
https://investi.app
```

O para desarrollo:
```
http://localhost:19006
```

## 🔐 Configuración de Proveedores OAuth

### Google OAuth
1. Ve a: **Authentication → Providers → Google**
2. Habilita el provider
3. Agrega Client ID y Client Secret de Google Cloud Console
4. En Google Cloud Console, agrega estas Authorized redirect URIs:
   ```
   https://paoliakwfoczcallnecf.supabase.co/auth/v1/callback
   ```

### Facebook OAuth
1. Ve a: **Authentication → Providers → Facebook**
2. Habilita el provider
3. Agrega App ID y App Secret de Facebook Developers
4. En Facebook Developers, agrega estas Valid OAuth Redirect URIs:
   ```
   https://paoliakwfoczcallnecf.supabase.co/auth/v1/callback
   ```

### LinkedIn OAuth (Custom Edge Function)
1. La configuración está en: `supabase/functions/linkedin-auth/index.ts`
2. Variables de entorno necesarias en Supabase:
   - `LINKEDIN_CLIENT_ID`
   - `LINKEDIN_CLIENT_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`

## ✅ Verificación

Para verificar que todo está configurado correctamente:

1. Revisa los logs en la consola cuando hagas login
2. Busca mensajes como:
   ```
   [AuthCallback] 🔐 Handling auth callback...
   [AuthCallback] ✅ OAuth user authenticated
   [AuthCallback] ✅ Redirecting to Onboarding flow
   ```

3. Si ves errores, verifica:
   - Las URLs de redirección en Supabase Dashboard
   - Los Client IDs y Secrets de cada proveedor
   - Los logs de la Edge Function de LinkedIn (si aplica)

## 🐛 Troubleshooting

### Error: "No se pudo recuperar la sesión"
- Verifica que la URL de redirección esté en la lista de Supabase
- Revisa que `detectSessionInUrl: true` en `src/supabase.ts`

### Error: "Invalid redirect URL"
- Agrega la URL exacta a la lista de Redirect URLs en Supabase
- Asegúrate de que no haya espacios ni caracteres extra

### LinkedIn no funciona
- Verifica que la Edge Function esté desplegada
- Revisa los logs de la función en Supabase Dashboard
- Confirma que las variables de entorno estén configuradas
