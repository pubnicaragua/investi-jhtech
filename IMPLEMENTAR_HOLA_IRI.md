# 🎤 Implementar "Hola Iri" - Reconocimiento de Voz Continuo

## ❌ ESTADO ACTUAL

**Lo que tienes ahora:**
- ✅ Botón de micrófono con animación
- ✅ Chat de Iri funcional
- ✅ Respuestas con voz (ElevenLabs)
- ❌ NO detecta "Hola Iri" automáticamente
- ❌ NO funciona en background

## ✅ LO QUE NECESITAS PARA "HOLA IRI" REAL

### 1. Instalar Librería de Voice Recognition

```bash
npx expo install @react-native-voice/voice
```

**IMPORTANTE:** Esta librería NO funciona en Expo Go, solo en EAS Build.

### 2. Configurar Permisos en app.json

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-voice/voice",
        {
          "microphonePermission": "Permite a Investí usar el micrófono para 'Hola Iri'",
          "speechRecognitionPermission": "Permite a Investí reconocer tu voz"
        }
      ]
    ],
    "android": {
      "permissions": [
        "RECORD_AUDIO",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### 3. Crear Servicio de Voice Recognition

Archivo: `src/services/voiceRecognitionService.ts`

```typescript
import Voice from '@react-native-voice/voice';

class VoiceRecognitionService {
  private isListening: boolean = false;
  private onWakeWordDetected: (() => void) | null = null;

  constructor() {
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }

  async startListening(callback: () => void) {
    this.onWakeWordDetected = callback;
    
    try {
      await Voice.start('es-ES');
      this.isListening = true;
      console.log('🎤 Listening for "Hola Iri"...');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  }

  async stopListening() {
    try {
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  private onSpeechResults(event: any) {
    const results = event.value || [];
    
    for (const result of results) {
      const text = result.toLowerCase();
      
      // Detectar "Hola Iri"
      if (text.includes('hola iri') || text.includes('hey iri') || text.includes('oye iri')) {
        console.log('✅ Wake word detected!');
        
        if (this.onWakeWordDetected) {
          this.onWakeWordDetected();
        }
        
        // Reiniciar escucha
        this.stopListening();
        setTimeout(() => {
          if (this.isListening) {
            this.startListening(this.onWakeWordDetected!);
          }
        }, 1000);
        
        break;
      }
    }
  }

  private onSpeechError(event: any) {
    console.error('Voice recognition error:', event.error);
    
    // Reintentar después de error
    setTimeout(() => {
      if (this.isListening && this.onWakeWordDetected) {
        this.startListening(this.onWakeWordDetected);
      }
    }, 2000);
  }

  destroy() {
    Voice.destroy().then(Voice.removeAllListeners);
  }
}

export default new VoiceRecognitionService();
```

### 4. Integrar en App.tsx

```typescript
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import voiceRecognitionService from './src/services/voiceRecognitionService';

function App() {
  const navigation = useNavigation();

  useEffect(() => {
    // Iniciar escucha de "Hola Iri"
    voiceRecognitionService.startListening(() => {
      // Navegar a Iri cuando se detecte
      navigation.navigate('Iri' as never);
    });

    return () => {
      voiceRecognitionService.stopListening();
    };
  }, []);

  // ... resto del código
}
```

### 5. Configurar Background Mode (Opcional)

Para que funcione en background como Siri:

**app.json:**
```json
{
  "expo": {
    "android": {
      "permissions": [
        "RECORD_AUDIO",
        "FOREGROUND_SERVICE",
        "WAKE_LOCK"
      ]
    }
  }
}
```

**Crear servicio de background:**
```typescript
// src/services/backgroundVoiceService.ts
import { AppState } from 'react-native';
import voiceRecognitionService from './voiceRecognitionService';

class BackgroundVoiceService {
  start() {
    AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        // Mantener escucha en background
        voiceRecognitionService.startListening(() => {
          // Abrir app y navegar a Iri
        });
      }
    });
  }
}

export default new BackgroundVoiceService();
```

---

## 🚀 PASOS PARA IMPLEMENTAR

### Paso 1: Instalar dependencias
```bash
npx expo install @react-native-voice/voice
```

### Paso 2: Configurar app.json
Agregar permisos y plugin de voice recognition.

### Paso 3: Crear servicios
- `voiceRecognitionService.ts`
- `backgroundVoiceService.ts` (opcional)

### Paso 4: Integrar en App.tsx
Iniciar escucha al abrir la app.

### Paso 5: Build con EAS
```bash
eas build --platform android --profile preview
```

### Paso 6: Probar en dispositivo
- Decir "Hola Iri"
- Debe abrir el chat automáticamente

---

## ⚠️ LIMITACIONES

### En Expo Go:
- ❌ NO funciona
- ❌ Voice recognition no disponible

### En EAS Build:
- ✅ Funciona
- ✅ Detecta "Hola Iri"
- ⚠️ Solo en foreground (app abierta)

### Para Background (como Siri):
- Requiere servicio nativo de Android
- Más complejo de implementar
- Consume más batería

---

## 💡 ALTERNATIVA SIMPLE (RECOMENDADA)

Si no quieres implementar todo esto, puedes:

1. **Mantener botón de micrófono en Iri**
   - Usuario presiona micrófono
   - Habla su pregunta
   - Iri responde

2. **Agregar botón flotante en HomeFeed**
   - Botón que abre Iri directamente
   - Más simple y funcional

3. **Shortcut en navegación**
   - Acceso rápido a Iri desde cualquier pantalla

---

## 🎯 RESUMEN

**Para "Hola Iri" real necesitas:**
1. ✅ Instalar `@react-native-voice/voice`
2. ✅ Configurar permisos en `app.json`
3. ✅ Crear `voiceRecognitionService.ts`
4. ✅ Integrar en `App.tsx`
5. ✅ Build con EAS (NO funciona en Expo Go)

**Tiempo estimado:** 2-3 horas de desarrollo + testing

**¿Vale la pena?** Depende:
- ✅ Si quieres experiencia tipo Siri → Sí
- ❌ Si solo quieres acceso rápido → No (usa botón)

---

## 📞 ¿Quieres que lo implemente?

Si quieres que implemente el reconocimiento de voz completo, dime y lo hago. Pero ten en cuenta:
- Solo funcionará en EAS Build
- No funcionará en Expo Go
- Requiere permisos de micrófono
- Consume más batería
