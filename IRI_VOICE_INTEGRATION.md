# IRI Voice Integration - Guía de Implementación

## Resumen de lo creado

1. **iriVoiceService.ts** - Servicio de síntesis de voz con Google Cloud TTS
2. **useIRIVoice.ts** - Hook personalizado para manejar voz + Grok
3. **openaiService.ts** - Servicio de OpenAI (backup)
4. **elevenLabsService.ts** - Servicio de ElevenLabs (backup)

---

## Instalación de dependencias

```bash
npm install expo-av expo-file-system axios
```

---

## Variables de entorno (.env)

```
GOOGLE_CLOUD_API_KEY=tu_clave_google_cloud
GROK_API_KEY=tu_clave_grok_existente
```

---

## Integración en IRIChatScreen

Agregar al inicio del archivo:

```typescript
import { useIRIVoice } from '../hooks/useIRIVoice';
import iriVoiceService from '../services/iriVoiceService';
import { Mic, Volume2, Settings } from 'lucide-react-native';
```

En el componente:

```typescript
export default function IRIChatScreen({ navigation }: any) {
  useAuthGuard();
  
  // Hook de voz
  const {
    isListening,
    isProcessing,
    isSpeaking,
    voiceGender,
    conversationHistory,
    error,
    sendMessage,
    setVoiceGender,
    clearHistory,
  } = useIRIVoice();

  // ... resto del código ...
}
```

---

## Agregar botones de voz en la UI

En la sección de input, agregar:

```typescript
<View style={styles.voiceControlsContainer}>
  {/* Botón micrófono */}
  <TouchableOpacity
    style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
    onPress={() => isListening ? stopListening() : startListening()}
  >
    <Mic size={20} color={isListening ? '#2563EB' : '#666'} />
  </TouchableOpacity>

  {/* Selector de voz */}
  <TouchableOpacity
    style={styles.voiceButton}
    onPress={() => {
      const newGender = voiceGender === 'FEMALE' ? 'MALE' : 'FEMALE';
      setVoiceGender(newGender);
    }}
  >
    <Volume2 size={20} color="#666" />
    <Text style={styles.voiceGenderText}>
      {voiceGender === 'FEMALE' ? 'F' : 'M'}
    </Text>
  </TouchableOpacity>

  {/* Botón enviar */}
  <TouchableOpacity
    style={[styles.sendButton, isProcessing && styles.sendButtonDisabled]}
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
</View>
```

---

## Estilos para controles de voz

```typescript
voiceControlsContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  backgroundColor: '#f5f5f5',
  borderRadius: 12,
},
voiceButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#e0e0e0',
},
voiceButtonActive: {
  backgroundColor: '#e3f2fd',
  borderColor: '#2563EB',
},
voiceGenderText: {
  fontSize: 10,
  fontWeight: 'bold',
  color: '#666',
  marginTop: 2,
},
sendButton: {
  flex: 1,
  height: 40,
  backgroundColor: '#2563EB',
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
},
sendButtonDisabled: {
  opacity: 0.5,
},
```

---

## Funcionalidad de Wake Word

Cuando el usuario dice "Hola IRI", el sistema automáticamente:
1. Detecta el wake word
2. Extrae el comando
3. Envía a Grok
4. Reproduce respuesta con voz

```typescript
// En el hook useIRIVoice
if (IRIVoiceService.isWakeWord(transcribedText)) {
  const command = IRIVoiceService.extractCommand(transcribedText);
  await sendMessage(command);
}
```

---

## Tabla en Supabase

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
```

---

## Costos Finales

- **Google Cloud TTS:** Gratis (5M caracteres/mes)
- **Grok API:** Ya existe en tu proyecto
- **Supabase:** Ya existe en tu proyecto
- **Total:** $0 adicionales

---

## Próximos pasos

1. Instalar dependencias
2. Agregar variables de entorno
3. Crear tabla en Supabase
4. Integrar hook en IRIChatScreen
5. Agregar botones de voz en UI
6. Probar wake word "Hola IRI"
7. Ajustar velocidad y tono de voz según preferencia

---

## Características implementadas

✅ Síntesis de voz profesional (Google Cloud)
✅ Respuestas con Grok (IA existente)
✅ Selector de voz (masculina/femenina)
✅ Control de velocidad y tono
✅ Wake word "Hola IRI"
✅ Historial de conversaciones
✅ Guardado en base de datos
✅ Costo $0 para tu escala
