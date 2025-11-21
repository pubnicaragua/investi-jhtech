# 📊 RESUMEN EJECUTIVO - Migración Chat IRI a Landing Web

## 🎯 OBJETIVO
Migrar el chat de IRI (Inteligencia Artificial) desde la app mobile (React Native) al landing web (Next.js) para campañas de Google Ads.

---

## 📦 ARCHIVOS ENTREGADOS

### 1. **GUIA_MIGRACION_IRI_A_LANDING_WEB.md**
- Guía completa con todos los archivos necesarios
- Variables de entorno (.env)
- Tablas de Supabase (SQL)
- Dependencias NPM
- Estructura de carpetas
- Recomendaciones de SEO

### 2. **EJEMPLOS_CODIGO_NEXTJS_IRI.md**
- Código adaptado 100% funcional para Next.js
- Cliente de Supabase
- Funciones de API
- Servicio de voz web (gratis)
- Hook useIRIVoice
- Componente de chat completo
- Tracking de Google Analytics

### 3. **Este archivo (RESUMEN_EJECUTIVO_IRI_LANDING.md)**
- Checklist de implementación
- Resumen de costos
- Próximos pasos

---

## 📁 ARCHIVOS PRINCIPALES DEL MOBILE

| Archivo Mobile | Líneas | Descripción | Adaptación |
|---------------|--------|-------------|------------|
| `src/screens/IRIChatScreen.tsx` | 962 | Pantalla principal del chat | ⚠️ Requiere adaptación completa |
| `src/services/iriVoiceService.ts` | 148 | Servicio de voz (ElevenLabs) | ⚠️ Adaptar a Web Speech API |
| `src/services/openaiService.ts` | 165 | Servicio de OpenAI (backup) | ✅ Funciona igual |
| `src/hooks/useIRIVoice.ts` | 178 | Hook de voz y Grok | ✅ Funciona igual |
| `src/rest/api.ts` (funciones IRI) | 82 | Funciones de Supabase | ✅ Funciona igual |
| `src/hooks/useAuthGuard.ts` | - | Protección de rutas | ⚠️ Adaptar a Next.js Router |

**TOTAL:** ~1,535 líneas de código a migrar

---

## 🗄️ TABLAS DE SUPABASE

### Tabla Principal: `iri_chat_messages`
```sql
CREATE TABLE iri_chat_messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Políticas RLS:**
- ✅ Users can view own messages
- ✅ Users can create messages
- ✅ Users can delete own messages

### Tabla Opcional: `iri_conversations`
Para estadísticas y análisis (no crítica).

---

## 🔑 VARIABLES DE ENTORNO

### Obligatorias:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://paoliakwfoczcallnecf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_GROK_API_KEY=tu-grok-api-key-aqui
```

### Opcionales (para voz profesional):
```bash
ELEVENLABS_API_KEY=tu-elevenlabs-api-key
ELEVENLABS_VOICE_ID_FEMALE=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_ID_MALE=EXAVITQu4vr4xnSDxMaL
```

**Nota:** Si no usas ElevenLabs, el sistema usa Web Speech API (gratis, nativo del navegador).

---

## 📦 DEPENDENCIAS NPM

```bash
npm install @supabase/supabase-js axios lucide-react
```

**Opcional (si usas Tailwind):**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 🎨 ASSETS

Copiar estos archivos:
```
Mobile: assets/iri-icono.jpg → Web: public/images/iri-icono.jpg
Mobile: assets/iri-icono-Sin-fondo.gif → Web: public/images/iri-icono-animated.gif
Mobile: assets/iri-icon.gif → Web: public/images/iri-icon.gif
```

---

## 🔌 ENDPOINTS Y APIs

### 1. Groq API (Grok)
- **URL:** `https://api.groq.com/openai/v1/chat/completions`
- **Modelo:** `llama-3.3-70b-versatile`
- **Costo:** Gratis / $0.10 por 1M tokens

### 2. Supabase
- **URL:** `https://paoliakwfoczcallnecf.supabase.co`
- **Operaciones:** INSERT, SELECT, DELETE en `iri_chat_messages`

### 3. ElevenLabs (Opcional)
- **URL:** `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- **Costo:** $5/mes (100,000 caracteres)

### 4. Web Speech API (Gratis)
- **Nativo del navegador:** `window.speechSynthesis`
- **Costo:** $0 (gratis, ilimitado)

---

## 💰 COSTOS ESTIMADOS

| Servicio | Plan Gratis | Plan Pagado | Recomendación |
|----------|-------------|-------------|---------------|
| **Groq API** | ✅ Disponible | $0.10/1M tokens | Usar gratis |
| **Supabase** | ✅ 500MB DB | $25/mes (8GB) | Usar gratis |
| **Voz (Web Speech API)** | ✅ Gratis | - | **USAR ESTE** |
| **Voz (ElevenLabs)** | ❌ No | $5/mes | Solo si necesitas calidad premium |
| **Next.js (Vercel)** | ✅ 100GB bandwidth | $20/mes | Usar gratis |
| **Google Ads** | - | Variable | Según presupuesto |

**TOTAL MENSUAL:** $0 (usando opciones gratuitas) o $5-50 (con ElevenLabs)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Configuración (30 min)
- [ ] Crear proyecto Next.js (`npx create-next-app@latest`)
- [ ] Instalar dependencias (`npm install @supabase/supabase-js axios lucide-react`)
- [ ] Crear archivo `.env.local` con variables de entorno
- [ ] Ejecutar SQL en Supabase (tabla `iri_chat_messages`)
- [ ] Copiar assets a `public/images/`

### Fase 2: Código Base (2-3 horas)
- [ ] Crear `lib/supabase.ts` (cliente de Supabase)
- [ ] Crear `lib/api/iriChat.ts` (funciones de API)
- [ ] Crear `lib/services/iriVoiceService.ts` (servicio de voz web)
- [ ] Crear `hooks/useIRIVoice.ts` (hook de voz)
- [ ] Crear `hooks/useAuthGuard.ts` (protección de rutas)

### Fase 3: Componentes (3-4 horas)
- [ ] Crear `app/chat-iri/page.tsx` (pantalla principal)
- [ ] Crear `app/chat-iri/layout.tsx` (metadata SEO)
- [ ] Crear componentes auxiliares (ChatMessage, ChatInput, etc.)
- [ ] Adaptar estilos (Tailwind o CSS modules)

### Fase 4: Testing (1 hora)
- [ ] Probar localmente (`npm run dev`)
- [ ] Verificar autenticación con Supabase
- [ ] Probar envío de mensajes
- [ ] Probar voz (Web Speech API)
- [ ] Probar historial de chat
- [ ] Probar en mobile (responsive)

### Fase 5: SEO y Analytics (1 hora)
- [ ] Configurar metadata (title, description, OG)
- [ ] Optimizar imágenes (Next.js Image)
- [ ] Configurar Google Analytics 4
- [ ] Configurar Google Tag Manager
- [ ] Configurar eventos de conversión

### Fase 6: Deployment (30 min)
- [ ] Subir a GitHub
- [ ] Conectar con Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Desplegar a producción
- [ ] Verificar funcionamiento en producción

### Fase 7: Google Ads (variable)
- [ ] Crear campaña de Google Ads
- [ ] Configurar conversiones
- [ ] Definir palabras clave
- [ ] Crear anuncios
- [ ] Configurar presupuesto
- [ ] Lanzar campaña

**TIEMPO TOTAL ESTIMADO:** 8-10 horas de desarrollo + configuración de Ads

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### Para el equipo de desarrollo del landing:

1. **Leer documentación completa:**
   - `GUIA_MIGRACION_IRI_A_LANDING_WEB.md` (guía principal)
   - `EJEMPLOS_CODIGO_NEXTJS_IRI.md` (código adaptado)

2. **Configurar Supabase:**
   - Ejecutar SQL de la tabla `iri_chat_messages`
   - Verificar que RLS esté habilitado
   - Obtener credenciales (URL y ANON_KEY)

3. **Obtener API Keys:**
   - Grok API: https://console.groq.com/keys
   - (Opcional) ElevenLabs: https://elevenlabs.io

4. **Crear proyecto Next.js:**
   ```bash
   npx create-next-app@latest landing-investi
   cd landing-investi
   npm install @supabase/supabase-js axios lucide-react
   ```

5. **Copiar código de ejemplos:**
   - Usar `EJEMPLOS_CODIGO_NEXTJS_IRI.md` como referencia
   - Adaptar según diseño del landing

6. **Probar localmente:**
   ```bash
   npm run dev
   # Abrir http://localhost:3000/chat-iri
   ```

7. **Desplegar a Vercel:**
   ```bash
   vercel --prod
   ```

8. **Configurar Google Ads:**
   - Crear campaña
   - Apuntar a URL del chat: `https://tu-landing.com/chat-iri`

---

## 📞 CONTACTO Y SOPORTE

Si durante la implementación surgen dudas:

1. **Revisar archivos de referencia:**
   - `src/screens/IRIChatScreen.tsx` (código original mobile)
   - `EJEMPLOS_CODIGO_NEXTJS_IRI.md` (código adaptado)

2. **Documentación oficial:**
   - Next.js: https://nextjs.org/docs
   - Supabase: https://supabase.com/docs
   - Groq: https://console.groq.com/docs

3. **Recursos adicionales:**
   - Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
   - Tailwind CSS: https://tailwindcss.com/docs

---

## 🎯 OBJETIVOS DE LA CAMPAÑA

### Métricas clave a trackear:
- ✅ **Visitas al chat:** Usuarios que llegan a `/chat-iri`
- ✅ **Mensajes enviados:** Cantidad de interacciones
- ✅ **Tiempo de sesión:** Duración promedio en el chat
- ✅ **Conversiones:** Usuarios que se registran después del chat
- ✅ **Costo por conversión:** ROI de Google Ads

### Eventos de Google Analytics:
```javascript
// Inicio de chat
gtag('event', 'chat_started', { event_category: 'engagement' });

// Mensaje enviado
gtag('event', 'message_sent', { event_category: 'engagement', value: 1 });

// Conversión (registro)
gtag('event', 'conversion', { send_to: 'AW-CONVERSION_ID' });
```

---

## 🔥 VENTAJAS COMPETITIVAS

### ¿Por qué IRI en el landing?
1. **Engagement inmediato:** Usuario interactúa desde el primer segundo
2. **Educación financiera:** Responde dudas antes de registrarse
3. **Diferenciación:** Pocas apps financieras tienen chat IA en landing
4. **Conversión:** Usuario conoce el valor antes de descargar app
5. **SEO:** Contenido dinámico mejora posicionamiento

### Optimizaciones para Google Ads:
- ✅ Landing page rápida (< 2 segundos)
- ✅ Mobile-first (mayoría de tráfico)
- ✅ CTA claro: "Habla con IRI gratis"
- ✅ Sin registro requerido (bajo friction)
- ✅ Tracking de conversiones

---

## 📊 MÉTRICAS DE ÉXITO

### Semana 1:
- [ ] 100+ visitas al chat
- [ ] 50+ mensajes enviados
- [ ] 10+ registros desde chat

### Mes 1:
- [ ] 1,000+ visitas al chat
- [ ] 500+ mensajes enviados
- [ ] 100+ registros desde chat
- [ ] Costo por conversión < $5

### Mes 3:
- [ ] 5,000+ visitas al chat
- [ ] 2,500+ mensajes enviados
- [ ] 500+ registros desde chat
- [ ] ROI positivo en Google Ads

---

## ✨ CONCLUSIÓN

**Todo está listo para migrar el chat de IRI al landing web.**

Los archivos entregados contienen:
- ✅ Código completo adaptado a Next.js
- ✅ Tablas de Supabase (SQL)
- ✅ Variables de entorno
- ✅ Dependencias NPM
- ✅ Assets necesarios
- ✅ Ejemplos de código funcional
- ✅ Guía de SEO y Google Ads

**Siguiente paso:** Compartir estos archivos con el equipo de desarrollo del landing y seguir el checklist de implementación.

---

**¡Éxito con la campaña de Google Ads! 🚀📈**
