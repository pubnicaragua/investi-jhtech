# 🚀 Guía Completa: Migración del Chat IRI de Mobile a Landing Web (Next.js)

## 📋 RESUMEN EJECUTIVO

Esta guía contiene **TODOS** los archivos, configuraciones, tablas de Supabase y dependencias necesarias para migrar el chat de IRI desde la app mobile (React Native) a tu landing web (Next.js + TypeScript).

---

## 📁 ARCHIVOS PRINCIPALES A MIGRAR

### 1. **Pantalla Principal del Chat**
**Archivo:** `src/screens/IRIChatScreen.tsx` (962 líneas)

**Adaptaciones necesarias para Next.js:**
- ❌ Remover: `react-native` imports → ✅ Usar: `react` + componentes HTML
- ❌ Remover: `SafeAreaView`, `KeyboardAvoidingView` → ✅ Usar: `div` con CSS
- ❌ Remover: `expo-linear-gradient` → ✅ Usar: CSS gradients o `framer-motion`
- ❌ Remover: `lucide-react-native` → ✅ Usar: `lucide-react`
- ❌ Remover: `expo-speech` → ✅ Usar: Web Speech API o ElevenLabs directamente
- ✅ Mantener: Lógica de mensajes, estados, API calls

**Ruta sugerida en Next.js:** `app/chat-iri/page.tsx` o `pages/chat-iri.tsx`

---

### 2. **Servicios de IA y Voz**

#### **a) Servicio de Voz IRI** 
**Archivo:** `src/services/iriVoiceService.ts` (148 líneas)

**Adaptaciones para Next.js:**
- ❌ Remover: `expo-av`, `expo-file-system` 
- ✅ Usar: `HTMLAudioElement` para reproducir audio
- ✅ Mantener: Lógica de ElevenLabs API
- ✅ Alternativa: Web Speech API (`window.speechSynthesis`)

**Ruta sugerida:** `lib/services/iriVoiceService.ts`

```typescript
// Ejemplo adaptado para Web
class IRIVoiceService {
  async speak(text: string): Promise<void> {
    // Opción 1: ElevenLabs (igual que mobile)
    const audioUrl = await this.textToSpeech(text);
    const audio = new Audio(audioUrl);
    await audio.play();
    
    // Opción 2: Web Speech API (gratis, nativo)
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
  }
}
```

---

#### **b) Servicio de OpenAI (Backup)**
**Archivo:** `src/services/openaiService.ts` (165 líneas)

**Adaptaciones:** Ninguna, funciona igual en Next.js
**Ruta sugerida:** `lib/services/openaiService.ts`

---

#### **c) Hook de IRI Voice**
**Archivo:** `src/hooks/useIRIVoice.ts` (178 líneas)

**Adaptaciones:** 
- ✅ Mantener toda la lógica
- ✅ Cambiar imports de servicios

**Ruta sugerida:** `hooks/useIRIVoice.ts`

---

### 3. **API de Supabase**

**Archivo:** `src/rest/api.ts` (líneas 3949-4030)

**Funciones necesarias:**
```typescript
// Guardar mensaje de chat
export async function saveIRIChatMessage(
  userId: string, 
  role: 'user' | 'assistant', 
  content: string
)

// Cargar historial
export async function loadIRIChatHistory(
  userId: string, 
  limit: number = 50
)

// Limpiar historial
export async function clearIRIChatHistory(userId: string)

// Obtener usuario actual
export async function getCurrentUserId()
```

**Ruta sugerida:** `lib/api/supabase.ts`

---

### 4. **Hook de Autenticación**

**Archivo:** `src/hooks/useAuthGuard.ts`

**Adaptaciones para Next.js:**
- ✅ Usar `useRouter` de Next.js en lugar de React Navigation
- ✅ Redirigir a `/login` en lugar de `navigation.navigate('Login')`

**Ruta sugerida:** `hooks/useAuthGuard.ts`

---

## 🎨 ASSETS NECESARIOS

Copiar estos archivos a tu landing:

```
assets/
├── iri-icono.jpg              → public/images/iri-icono.jpg
├── iri-icono-Sin-fondo.gif    → public/images/iri-icono-animated.gif
└── iri-icon.gif               → public/images/iri-icon.gif
```

---

## 🔐 VARIABLES DE ENTORNO (.env)

Crear archivo `.env.local` en la raíz del proyecto Next.js:

```bash
# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://paoliakwfoczcallnecf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o

# ============================================================================
# GROK API (Chat de IRI)
# ============================================================================
# IMPORTANTE: Obtener en https://console.groq.com/keys
NEXT_PUBLIC_GROK_API_KEY=tu-grok-api-key-aqui

# ============================================================================
# ELEVENLABS API (Voz de IRI) - OPCIONAL
# ============================================================================
# Si quieres voz profesional, obtener en https://elevenlabs.io
# Costo: $5/mes (100,000 caracteres)
ELEVENLABS_API_KEY=tu-elevenlabs-api-key-aqui
ELEVENLABS_VOICE_ID_FEMALE=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_ID_MALE=EXAVITQu4vr4xnSDxMaL

# ============================================================================
# ALTERNATIVA GRATUITA: Usar Web Speech API (nativo del navegador)
# No requiere API key, funciona offline
# ============================================================================
```

---

## 🗄️ TABLAS DE SUPABASE

### Tabla 1: `iri_chat_messages` (Historial de Chat)

```sql
-- Ejecutar en Supabase SQL Editor
CREATE TABLE IF NOT EXISTS iri_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_iri_chat_messages_user_id ON iri_chat_messages(user_id);
CREATE INDEX idx_iri_chat_messages_created_at ON iri_chat_messages(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE iri_chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view own messages" ON iri_chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create messages" ON iri_chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON iri_chat_messages
  FOR DELETE USING (auth.uid() = user_id);
```

---

### Tabla 2: `iri_conversations` (Opcional - Para estadísticas)

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

---

## 📦 DEPENDENCIAS NPM

### Para Next.js (package.json)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "axios": "^1.13.2",
    "lucide-react": "^0.400.0",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.0.0"
  }
}
```

**Instalar:**
```bash
npm install @supabase/supabase-js axios lucide-react
```

---

## 🔄 ENDPOINTS Y APIs UTILIZADOS

### 1. **Groq API (Grok)**
- **URL:** `https://api.groq.com/openai/v1/chat/completions`
- **Método:** POST
- **Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer GROK_API_KEY"
  }
  ```
- **Body:**
  ```json
  {
    "model": "llama-3.3-70b-versatile",
    "messages": [
      { "role": "system", "content": "SYSTEM_CONTEXT" },
      { "role": "user", "content": "mensaje del usuario" }
    ],
    "temperature": 0.7,
    "max_tokens": 1024
  }
  ```

---

### 2. **ElevenLabs API (Opcional - Voz)**
- **URL:** `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- **Método:** POST
- **Headers:**
  ```json
  {
    "xi-api-key": "ELEVENLABS_API_KEY",
    "Content-Type": "application/json"
  }
  ```
- **Body:**
  ```json
  {
    "text": "texto a convertir",
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
      "stability": 0.75,
      "similarity_boost": 0.75
    }
  }
  ```

---

### 3. **Supabase API**
- **URL Base:** `https://paoliakwfoczcallnecf.supabase.co`
- **Operaciones:**
  - `supabase.from('iri_chat_messages').insert()`
  - `supabase.from('iri_chat_messages').select()`
  - `supabase.from('iri_chat_messages').delete()`
  - `supabase.auth.getUser()`

---

## 🎯 ESTRUCTURA DE CARPETAS SUGERIDA (Next.js)

```
landing-web/
├── app/
│   └── chat-iri/
│       └── page.tsx              # Pantalla principal del chat
├── components/
│   └── chat/
│       ├── ChatMessage.tsx       # Componente de mensaje
│       ├── ChatInput.tsx         # Input de chat
│       └── VoiceButton.tsx       # Botón de voz
├── lib/
│   ├── services/
│   │   ├── iriVoiceService.ts   # Servicio de voz
│   │   └── openaiService.ts     # Servicio de OpenAI
│   ├── api/
│   │   └── supabase.ts          # Funciones de Supabase
│   └── supabase.ts              # Cliente de Supabase
├── hooks/
│   ├── useIRIVoice.ts           # Hook de voz
│   └── useAuthGuard.ts          # Hook de autenticación
├── public/
│   └── images/
│       ├── iri-icono.jpg
│       └── iri-icono-animated.gif
├── .env.local                    # Variables de entorno
└── package.json
```

---

## 🔧 ADAPTACIONES CLAVE DE REACT NATIVE A NEXT.JS

### 1. **Componentes de UI**

| React Native | Next.js (Web) |
|-------------|---------------|
| `<View>` | `<div>` |
| `<Text>` | `<p>`, `<span>`, `<h1>` |
| `<TouchableOpacity>` | `<button>` |
| `<TextInput>` | `<input>`, `<textarea>` |
| `<ScrollView>` | `<div style={{ overflow: 'auto' }}>` |
| `<Image>` | `<img>` o `<Image>` de Next.js |
| `SafeAreaView` | CSS padding/margin |
| `KeyboardAvoidingView` | CSS `position: fixed` |

---

### 2. **Estilos**

| React Native | Next.js |
|-------------|---------|
| `StyleSheet.create()` | CSS Modules, Tailwind, styled-components |
| `style={{ flex: 1 }}` | `className="flex-1"` (Tailwind) |
| `LinearGradient` | CSS `background: linear-gradient()` |

**Ejemplo de conversión:**
```typescript
// React Native
<View style={styles.container}>
  <Text style={styles.title}>Hola</Text>
</View>

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold' }
});

// Next.js con Tailwind
<div className="flex-1 bg-white">
  <h1 className="text-xl font-bold">Hola</h1>
</div>
```

---

### 3. **Navegación**

| React Native | Next.js |
|-------------|---------|
| `navigation.navigate('Screen')` | `router.push('/route')` |
| `navigation.goBack()` | `router.back()` |
| `useNavigation()` | `useRouter()` from `next/navigation` |

---

### 4. **Audio/Voz**

| React Native | Next.js |
|-------------|---------|
| `expo-speech` | `window.speechSynthesis` (Web Speech API) |
| `expo-av` | `new Audio(url)` |
| `Audio.Sound.createAsync()` | `audio.play()` |

**Ejemplo Web Speech API:**
```typescript
const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 1.0;
  utterance.pitch = 1.2; // Voz femenina
  window.speechSynthesis.speak(utterance);
};
```

---

## 📝 PROMPT PARA CONTEXTO DEL SISTEMA

Este es el contexto que usa IRI (incluir en tu código):

```typescript
const SYSTEM_CONTEXT = `Eres Irï, el asistente de inteligencia artificial de Investi, una aplicación de educación financiera y comunidad para jóvenes en Nicaragua.

CONTEXTO DE LA APP INVESTI:
- Investi es una plataforma que ayuda a jóvenes a aprender sobre finanzas personales, inversiones y emprendimiento
- Ofrece herramientas financieras como: Planificador Financiero, Caza Hormigas (para encontrar gastos innecesarios), Generador de Reportes
- Tiene comunidades donde los usuarios pueden conectar: Comunidades Públicas, Privadas y de Colegio
- Las comunidades de colegio permiten crear metas de ahorro grupales (ej: para giras de estudios)
- Ofrece cursos, videos educativos y noticias sobre finanzas, criptomonedas, inversiones y startups

TU PERSONALIDAD:
- Eres amigable, cercano y juvenil, pero profesional
- Usas un lenguaje simple y claro
- Das ejemplos prácticos y relevantes para jóvenes
- Motivas y educas sobre finanzas de forma positiva
- Puedes usar emojis ocasionalmente para ser más cercano

CÓMO RESPONDES:
- Respuestas concisas (máximo 3-4 párrafos)
- Si la pregunta es sobre finanzas, da consejos educativos generales
- Si preguntan sobre la app, explica las funcionalidades disponibles
- Si no sabes algo, sé honesto y sugiere recursos alternativos

⚠️ IMPORTANTE - DISCLAIMER:
- NO des consejos específicos de inversión
- NO recomiendes acciones, criptomonedas o instrumentos financieros específicos
- Siempre recuerda al usuario que consulte con un asesor financiero profesional para decisiones de inversión
- Tu rol es EDUCATIVO, no de asesoría financiera personalizada`;
```

---

## 🚀 PASOS DE IMPLEMENTACIÓN

### 1. **Configurar Supabase**
```bash
# Ejecutar SQL en Supabase SQL Editor
# Copiar y pegar las queries de las tablas arriba
```

### 2. **Instalar dependencias**
```bash
npm install @supabase/supabase-js axios lucide-react
```

### 3. **Crear archivo .env.local**
```bash
# Copiar las variables de entorno de arriba
```

### 4. **Crear estructura de carpetas**
```bash
mkdir -p lib/services lib/api hooks components/chat public/images
```

### 5. **Copiar y adaptar archivos**
- Copiar `IRIChatScreen.tsx` → Adaptar a `page.tsx`
- Copiar `iriVoiceService.ts` → Adaptar para Web
- Copiar `api.ts` funciones → Crear `supabase.ts`
- Copiar assets → `public/images/`

### 6. **Adaptar componentes**
- Cambiar imports de React Native a React
- Cambiar estilos a Tailwind/CSS
- Cambiar navegación a Next.js Router
- Adaptar audio a Web APIs

### 7. **Probar localmente**
```bash
npm run dev
# Abrir http://localhost:3000/chat-iri
```

---

## 🎨 RECOMENDACIONES DE SEO Y OPTIMIZACIÓN

### 1. **Metadata para SEO**
```typescript
// app/chat-iri/page.tsx
export const metadata = {
  title: 'Chat con IRI - Asistente Financiero IA | Investi',
  description: 'Habla con IRI, tu asistente de inteligencia artificial para educación financiera. Aprende sobre inversiones, ahorro y finanzas personales.',
  keywords: 'chat IA, asistente financiero, educación financiera, IRI, Investi',
  openGraph: {
    title: 'Chat con IRI - Asistente Financiero IA',
    description: 'Aprende sobre finanzas con IRI, tu asistente personal',
    images: ['/images/iri-icono.jpg'],
  }
};
```

### 2. **Optimización de Imágenes**
```typescript
import Image from 'next/image';

<Image 
  src="/images/iri-icono.jpg" 
  alt="IRI - Asistente Financiero IA"
  width={48}
  height={48}
  priority
/>
```

### 3. **Lazy Loading**
```typescript
import dynamic from 'next/dynamic';

const ChatComponent = dynamic(() => import('@/components/chat/ChatMessage'), {
  loading: () => <p>Cargando chat...</p>,
});
```

### 4. **Server-Side Rendering (SSR)**
```typescript
// Para cargar historial en el servidor
export async function getServerSideProps(context) {
  const { user } = await supabase.auth.getUser();
  const history = await loadIRIChatHistory(user.id);
  
  return {
    props: { history }
  };
}
```

---

## 💰 COSTOS ESTIMADOS

| Servicio | Costo Mensual | Límite |
|----------|---------------|--------|
| **Groq API** | Gratis / $0.10 por 1M tokens | Ilimitado (según plan) |
| **ElevenLabs** | $5/mes | 100,000 caracteres |
| **Web Speech API** | **GRATIS** | Ilimitado (nativo) |
| **Supabase** | Gratis / $25/mes | 500MB DB / 50GB bandwidth |
| **Next.js (Vercel)** | Gratis / $20/mes | 100GB bandwidth |
| **TOTAL** | **$0-50/mes** | Depende del tráfico |

**Recomendación:** Usar Web Speech API para voz (gratis) y Groq para IA.

---

## 🔥 OPTIMIZACIONES PARA GOOGLE ADS

### 1. **Landing Page Optimizada**
- ✅ Título claro: "Habla con IRI - Tu Asistente Financiero IA"
- ✅ CTA visible: "Empieza a chatear gratis"
- ✅ Velocidad: < 2 segundos de carga
- ✅ Mobile-first: Responsive design

### 2. **Tracking de Conversiones**
```typescript
// Google Analytics 4
gtag('event', 'chat_started', {
  event_category: 'engagement',
  event_label: 'IRI Chat'
});

gtag('event', 'message_sent', {
  event_category: 'engagement',
  value: 1
});
```

### 3. **Pixel de Facebook/Meta**
```typescript
fbq('track', 'Lead', {
  content_name: 'IRI Chat',
  content_category: 'Financial Education'
});
```

---

## 📞 SOPORTE Y CONTACTO

Si tienes dudas durante la implementación:
1. Revisa los archivos originales en `src/screens/IRIChatScreen.tsx`
2. Consulta la documentación de Next.js: https://nextjs.org/docs
3. Documentación de Supabase: https://supabase.com/docs

---

## ✅ CHECKLIST FINAL

- [ ] Ejecutar SQL en Supabase (tablas `iri_chat_messages`)
- [ ] Crear `.env.local` con API keys
- [ ] Instalar dependencias NPM
- [ ] Copiar assets a `public/images/`
- [ ] Adaptar `IRIChatScreen.tsx` a Next.js
- [ ] Adaptar `iriVoiceService.ts` para Web
- [ ] Crear funciones de Supabase en `lib/api/`
- [ ] Configurar metadata para SEO
- [ ] Probar localmente (`npm run dev`)
- [ ] Configurar Google Analytics
- [ ] Desplegar a Vercel/Netlify
- [ ] Configurar Google Ads

---

**¡Listo para migrar! 🎉**

Esta guía contiene TODO lo necesario. Compártela con tu equipo de desarrollo del landing.
