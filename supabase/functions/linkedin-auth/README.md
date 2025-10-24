# LinkedIn OAuth Edge Function

Esta Edge Function maneja el flujo de autenticación OAuth con LinkedIn.

## Configuración

### Variables de Entorno

Configura las siguientes variables en Supabase Dashboard > Edge Functions > Secrets:

```bash
LINKEDIN_CLIENT_ID=tu_linkedin_client_id
LINKEDIN_CLIENT_SECRET=tu_linkedin_client_secret
SUPABASE_URL=https://paoliakwfoczcallnecf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### Deployment

Para desplegar esta función:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Link al proyecto
supabase link --project-ref paoliakwfoczcallnecf

# Deploy la función
supabase functions deploy linkedin-auth

# Configurar secrets
supabase secrets set LINKEDIN_CLIENT_ID=your_client_id
supabase secrets set LINKEDIN_CLIENT_SECRET=your_client_secret
supabase secrets set SUPABASE_URL=https://paoliakwfoczcallnecf.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Uso

### En el Cliente (React Native)

```typescript
const handleLinkedInAuth = async () => {
  try {
    setLoading(true)
    const linkedInAuthUrl = `${SUPABASE_URL}/functions/v1/linkedin-auth`
    
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

### Flujo de Autenticación

1. Usuario hace click en "Sign in with LinkedIn"
2. App redirige a `/functions/v1/linkedin-auth`
3. Edge Function redirige a LinkedIn OAuth
4. Usuario autoriza en LinkedIn
5. LinkedIn redirige de vuelta a `/functions/v1/linkedin-auth/callback`
6. Edge Function:
   - Intercambia el código por access token
   - Obtiene el perfil del usuario de LinkedIn
   - Crea o actualiza el usuario en Supabase
   - Genera un session token
7. Redirige a la app con el token: `investi-community://auth/callback?access_token=...`

## Testing

### Local Testing

```bash
# Iniciar función localmente
supabase functions serve linkedin-auth --env-file ./supabase/.env.local

# Probar endpoint
curl http://localhost:54321/functions/v1/linkedin-auth
```

### Production Testing

```bash
# Probar en producción
curl https://paoliakwfoczcallnecf.supabase.co/functions/v1/linkedin-auth
```

## Troubleshooting

### Error: "Invalid redirect_uri"
- Verifica que `REDIRECT_URI` en la función coincida con la configurada en LinkedIn
- Debe ser: `https://paoliakwfoczcallnecf.supabase.co/functions/v1/linkedin-auth/callback`

### Error: "User creation failed"
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurado correctamente
- Verifica que la tabla `users` tenga los permisos correctos

### Error: "Session generation failed"
- Verifica que el email del usuario esté confirmado
- Verifica los logs en Supabase Dashboard > Logs

## Seguridad

- Nunca expongas `LINKEDIN_CLIENT_SECRET` en el cliente
- Usa HTTPS en producción
- Valida el parámetro `state` para prevenir CSRF attacks
- Rate limit la función para prevenir abuse

## Referencias

- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy/docs)
