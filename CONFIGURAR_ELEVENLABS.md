# 🔧 Configurar ElevenLabs API

## Error Actual
```
ERROR  Error en ElevenLabs TTS: [AxiosError: Request failed with status code 401]
```

Esto significa que la API Key de ElevenLabs es inválida o está mal configurada.

## Solución

### 1. Obtener API Key de ElevenLabs

1. Ve a https://elevenlabs.io/
2. Inicia sesión o crea una cuenta
3. Ve a tu perfil → API Keys
4. Copia tu API Key

### 2. Configurar en .env

Abre el archivo `.env` y verifica que tengas:

```env
ELEVENLABS_API_KEY=tu_api_key_aqui
ELEVENLABS_VOICE_ID_FEMALE=tu_voice_id_femenino
ELEVENLABS_VOICE_ID_MALE=tu_voice_id_masculino
```

### 3. Voice IDs Disponibles

**Voces en Español:**
- **Rachel (Femenino)**: `21m00Tcm4TlvDq8ikWAM`
- **Antoni (Masculino)**: `ErXwobaYiN019PkySvjV`
- **Bella (Femenino)**: `EXAVITQu4vr4xnSDxMaL`
- **Josh (Masculino)**: `TxGEqnHWrfWFTfGW9XjX`

### 4. Ejemplo de .env Correcto

```env
ELEVENLABS_API_KEY=sk_1234567890abcdef
ELEVENLABS_VOICE_ID_FEMALE=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_ID_MALE=ErXwobaYiN019PkySvjV
```

### 5. Reiniciar App

Después de cambiar el `.env`:

```bash
# Detener Expo
Ctrl + C

# Limpiar caché
npx expo start -c
```

## Alternativa: Usar Solo expo-speech

Si no quieres usar ElevenLabs, la app ya tiene fallback a `expo-speech` que funciona sin API Key.

El código ya está configurado para usar `expo-speech` automáticamente si ElevenLabs falla.
