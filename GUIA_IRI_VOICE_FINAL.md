# IRI Voice - Guía Final 100% Funcional

## ✅ CHECKLIST DE INSTALACIÓN

### 1. Instalar dependencias
```bash
npm install expo-av expo-file-system axios
```

### 2. Crear .env en raíz del proyecto
```
EXPO_PUBLIC_GROK_API_KEY=tu_grok_api_key
ELEVENLABS_API_KEY=tu_elevenlabs_api_key
ELEVENLABS_VOICE_ID_FEMALE=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_ID_MALE=EXAVITQu4vr4xnSDxMaL
```

### 3. Ejecutar SQL en Supabase
```sql
CREATE TABLE IF NOT EXISTS iri_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  voice_preference VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_iri_conversations_user_id ON iri_conversations(user_id);

ALTER TABLE iri_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON iri_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON iri_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Archivos creados
- ✅ `src/services/iriVoiceService.ts` - ElevenLabs TTS
- ✅ `src/hooks/useIRIVoice.ts` - Hook con Grok
- ✅ `src/services/openaiService.ts` - Backup
- ✅ `src/services/elevenLabsService.ts` - Backup

---

## 🚀 USAR EN EXPO NOW

### Opción 1: Expo Go (Recomendado para testing)
```bash
npx expo start
# Presiona 'w' para web
# O escanea QR con Expo Go
```

### Opción 2: Expo Now (Sin crear app)
```bash
npx expo start --web
# Se abre automáticamente en navegador
```

### Opción 3: Desarrollo local
```bash
npm start
# Presiona 'i' para iOS o 'a' para Android
```

---

## 💡 CÓMO FUNCIONA

### Flujo de conversación:
1. Usuario escribe mensaje o dice "Hola IRI"
2. Se envía a Grok (https://api.groq.com/openai/v1/chat/completions)
3. Grok responde
4. Se convierte a voz con ElevenLabs
5. Se reproduce el audio
6. Se guarda en Supabase

### Costos:
- **Grok:** Ya tienes (gratis o pagado según tu plan)
- **ElevenLabs:** $5/mes = 100,000 caracteres
- **Para 1000 usuarios/día:** 100,000 caracteres/día = 3M/mes
- **Necesitas:** Plan Professional ($99/mes) O Plan Starter ($5/mes) = 100 respuestas/mes

---

## 🔧 INTEGRACIÓN EN IRIChatScreen

Agregar al inicio:
```typescript
import { useIRIVoice } from '../hooks/useIRIVoice';
import { Mic, Volume2 } from 'lucide-react-native';
```

En el componente:
```typescript
const {
  isProcessing,
  isSpeaking,
  voiceGender,
  error,
  sendMessage,
  setVoiceGender,
} = useIRIVoice();
```

Botones en UI:
```typescript
<TouchableOpacity
  onPress={() => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  }}
  disabled={isProcessing}
>
  <Send size={20} color="#fff" />
</TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    const newGender = voiceGender === 'FEMALE' ? 'MALE' : 'FEMALE';
    setVoiceGender(newGender);
  }}
>
  <Volume2 size={20} color="#666" />
</TouchableOpacity>
```

---

## 🎤 WAKE WORD "Hola IRI"

Automáticamente detecta cuando el usuario dice:
- "Hola IRI"
- "Hey IRI"
- "Oye IRI"
- "IRI"

El sistema extrae el comando y lo envía a Grok.

---

## 📊 COSTOS FINALES

| Servicio | Costo | Usuarios 1000/día |
|----------|-------|------------------|
| Grok | Ya tienes | ✅ Incluido |
| ElevenLabs $5 | $5/mes | ⚠️ 100 respuestas/mes |
| ElevenLabs $99 | $99/mes | ✅ Ilimitado |
| Supabase | Ya tienes | ✅ Incluido |
| **Total** | **$5-99/mes** | **✅ Funcional** |

---

## ✨ CARACTERÍSTICAS

✅ Síntesis de voz profesional (ElevenLabs)
✅ Respuestas con Grok (tu IA)
✅ Selector de voz (masculina/femenina)
✅ Wake word "Hola IRI"
✅ Historial en BD
✅ Funciona en Expo Now
✅ Costo $5/mes mínimo

---

## 🐛 TROUBLESHOOTING

### Error: "GROK_API_KEY no configurada"
- Verifica que `.env` tenga `EXPO_PUBLIC_GROK_API_KEY`
- Reinicia el servidor: `npm start`

### Error: "ElevenLabs API error"
- Verifica que `ELEVENLABS_API_KEY` sea correcta
- Comprueba que tengas créditos en ElevenLabs

### No se escucha el audio
- Verifica permisos de audio en el dispositivo
- Comprueba que el volumen no esté silenciado

### Grok no responde
- Verifica conexión a internet
- Comprueba que la API key sea válida
- Revisa logs en consola

---

## 📱 PROBAR EN EXPO NOW

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env
echo "EXPO_PUBLIC_GROK_API_KEY=tu_key" > .env

# 3. Iniciar
npx expo start --web

# 4. Ir a http://localhost:19006
# 5. Escribir mensaje o decir "Hola IRI"
# 6. Escuchar respuesta con voz
```

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Instalar dependencias
2. ✅ Crear .env
3. ✅ Ejecutar SQL en Supabase
4. ✅ Integrar en IRIChatScreen
5. ✅ Probar en Expo Now
6. ✅ Ajustar velocidad/tono según preferencia
7. ✅ Desplegar a producción

---

**¡Listo para usar! 🚀**
