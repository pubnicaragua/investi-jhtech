# IRI Voice AI - Guía de Instalación y Setup

## 1. Dependencias a Instalar

```bash
# Audio y reconocimiento de voz
npm install expo-av expo-speech expo-audio react-native-sound react-native-permissions

# Detección de wake word
npm install @react-native-voice/voice

# APIs
npm install axios openai

# Estado y contexto
npm install zustand
```

---

## 2. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```
OPENAI_API_KEY=tu_clave_openai
ELEVENLABS_API_KEY=tu_clave_elevenlabs
ELEVENLABS_VOICE_ID_FEMALE=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_ID_MALE=EXAVITQu4vr4xnSDxMaL
SUPABASE_URL=tu_url_supabase
SUPABASE_ANON_KEY=tu_clave_anon
```

---

## 3. Configuración de APIs

### OpenAI (GPT-4 + Whisper)
1. Ir a https://platform.openai.com/api-keys
2. Crear nueva API key
3. Copiar en `.env`

### ElevenLabs (Síntesis de voz profesional)
1. Ir a https://elevenlabs.io/
2. Registrarse y crear cuenta
3. Ir a API Keys
4. Copiar API key
5. Ir a Voices y obtener IDs de voces

### Voces disponibles en ElevenLabs
- Femeninas: Rachel, Bella, Ava, Sophia, Domi, Elli, Gal, Liv, Mimi, Premom, Sarah, Serena, Victoria, Zoey
- Masculinas: Adam, Arnold, Chris, Ethan, George, Gigi, Glinda, Jester, Liam, Matilda, Onyx, River

---

## 4. Estructura de Carpetas

```
src/
├── screens/
│   └── IRIChatScreen.tsx (modificado)
├── services/
│   ├── iriVoiceService.ts (NUEVO)
│   ├── openaiService.ts (NUEVO)
│   └── elevenLabsService.ts (NUEVO)
├── hooks/
│   └── useIRIVoice.ts (NUEVO)
├── store/
│   └── iriStore.ts (NUEVO)
└── types/
    └── iri.ts (NUEVO)
```

---

## 5. Tabla en Supabase

Ejecutar en SQL Editor de Supabase:

```sql
CREATE TABLE IF NOT EXISTS iri_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  voice_preference VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iri_voice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_gender VARCHAR(20) DEFAULT 'female',
  voice_speed FLOAT DEFAULT 1.0,
  voice_pitch FLOAT DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_iri_conversations_user_id ON iri_conversations(user_id);
CREATE INDEX idx_iri_voice_settings_user_id ON iri_voice_settings(user_id);
```

---

## 6. Permisos en app.json

```json
{
  "plugins": [
    [
      "expo-permissions",
      {
        "microphonePermission": "Necesitamos acceso al micrófono para que IRI pueda escucharte"
      }
    ]
  ]
}
```

---

## 7. Próximos pasos

1. Instalar todas las dependencias
2. Configurar las APIs
3. Crear la tabla en Supabase
4. Implementar los servicios
5. Crear el hook personalizado
6. Integrar en IRIChatScreen

---

Continúa con la implementación en los archivos de código.
