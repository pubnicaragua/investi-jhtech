# Solución: Error de Grok API en Producción

## Problema
La API de Grok muestra un mensaje de configuración en el APK de producción, indicando que la API key no está configurada.

## Causa
La variable de entorno `EXPO_PUBLIC_GROK_API_KEY` no está siendo incluida en el build de producción.

## Solución

### 1. Verificar que el archivo `.env` existe

Crea el archivo `.env` en la raíz del proyecto si no existe:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=tu_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_key
EXPO_PUBLIC_GROK_API_KEY=tu_grok_api_key_aqui
```

### 2. Configurar EAS Build para incluir variables de entorno

Crea o actualiza `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_GROK_API_KEY": "tu_grok_api_key_aqui"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_GROK_API_KEY": "tu_grok_api_key_aqui"
      },
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 3. Usar EAS Secrets (RECOMENDADO)

Para no exponer la API key en el código:

```bash
# Agregar secret a EAS
eas secret:create --scope project --name EXPO_PUBLIC_GROK_API_KEY --value "tu_grok_api_key_aqui"

# Verificar que se creó
eas secret:list
```

Luego actualiza `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_GROK_API_KEY": "@EXPO_PUBLIC_GROK_API_KEY"
      }
    }
  }
}
```

### 4. Rebuild con las variables correctas

```bash
# Limpiar cache
npx expo start -c

# Crear nuevo build
eas build --platform android --profile production
```

## Validación

Después del build, verifica:

1. Instalar el APK en un dispositivo
2. Abrir el chat con Irï
3. Enviar un mensaje
4. Verificar que NO aparezca el error de configuración

## Alternativa: Hardcodear temporalmente (NO RECOMENDADO)

Si necesitas una solución rápida para testing:

```typescript
// En IRIChatScreen.tsx (línea 41)
const GROK_API_KEY = process.env.EXPO_PUBLIC_GROK_API_KEY || 'tu_api_key_temporal';
```

⚠️ **ADVERTENCIA**: NO subas esto a producción. Usa EAS Secrets en su lugar.

## Obtener una API Key de Groq

1. Ir a https://console.groq.com
2. Crear cuenta o iniciar sesión
3. Ir a "API Keys"
4. Crear nueva key
5. Copiar la key (solo se muestra una vez)

## Debugging

Para verificar si la API key se está cargando:

```typescript
// Agregar en IRIChatScreen.tsx
console.log('🔑 API Key status:', {
  exists: !!GROK_API_KEY,
  length: GROK_API_KEY?.length,
  preview: GROK_API_KEY ? `${GROK_API_KEY.substring(0, 10)}...` : 'NOT FOUND'
});
```

## Checklist de Solución

- [ ] Crear archivo `.env` con `EXPO_PUBLIC_GROK_API_KEY`
- [ ] Configurar `eas.json` con las variables de entorno
- [ ] Usar `eas secret:create` para la API key
- [ ] Rebuild con `eas build --platform android --profile production`
- [ ] Instalar y probar en dispositivo
- [ ] Verificar que el chat con Irï funciona sin errores

## Notas Importantes

- Las variables de entorno con prefijo `EXPO_PUBLIC_` son accesibles en el cliente
- Nunca expongas API keys sensibles en el código fuente
- Usa EAS Secrets para producción
- Reinicia el servidor después de cambiar `.env`

## Referencias

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build Secrets](https://docs.expo.dev/build-reference/variables/)
- [Groq API Documentation](https://console.groq.com/docs)
