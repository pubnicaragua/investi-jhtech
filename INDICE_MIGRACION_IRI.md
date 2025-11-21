# 📚 ÍNDICE COMPLETO - Migración Chat IRI a Landing Web

## 🎯 ARCHIVOS GENERADOS PARA LA MIGRACIÓN

Este índice contiene **TODOS** los archivos necesarios para migrar el chat de IRI desde la app mobile (React Native) al landing web (Next.js).

---

## 📄 ARCHIVOS DE DOCUMENTACIÓN

### 1. **GUIA_MIGRACION_IRI_A_LANDING_WEB.md** ⭐ PRINCIPAL
**Descripción:** Guía completa con toda la información necesaria para la migración.

**Contenido:**
- ✅ Lista de archivos a migrar
- ✅ Variables de entorno (.env)
- ✅ Tablas de Supabase (descripción)
- ✅ Dependencias NPM
- ✅ Endpoints y APIs utilizados
- ✅ Estructura de carpetas sugerida
- ✅ Tabla de conversión React Native → Next.js
- ✅ Recomendaciones de SEO
- ✅ Optimizaciones para Google Ads
- ✅ Costos estimados
- ✅ Checklist de implementación

**Cuándo usar:** Leer PRIMERO antes de empezar la migración.

---

### 2. **EJEMPLOS_CODIGO_NEXTJS_IRI.md** ⭐ CÓDIGO
**Descripción:** Código completo adaptado y listo para copiar/pegar en Next.js.

**Contenido:**
- ✅ Cliente de Supabase (`lib/supabase.ts`)
- ✅ Funciones de API (`lib/api/iriChat.ts`)
- ✅ Servicio de voz web (`lib/services/iriVoiceService.ts`)
- ✅ Hook useIRIVoice (`hooks/useIRIVoice.ts`)
- ✅ Componente de chat completo (`app/chat-iri/page.tsx`)
- ✅ Metadata para SEO (`app/chat-iri/layout.tsx`)
- ✅ Configuración de Tailwind
- ✅ Tracking de Google Analytics

**Cuándo usar:** Durante el desarrollo, para copiar código funcional.

---

### 3. **RESUMEN_EJECUTIVO_IRI_LANDING.md** ⭐ RESUMEN
**Descripción:** Resumen ejecutivo con checklist y métricas.

**Contenido:**
- ✅ Tabla de archivos principales
- ✅ Tablas de Supabase (resumen)
- ✅ Variables de entorno (lista)
- ✅ Dependencias NPM
- ✅ Endpoints y APIs
- ✅ Costos estimados
- ✅ Checklist de implementación (7 fases)
- ✅ Próximos pasos inmediatos
- ✅ Métricas de éxito
- ✅ Ventajas competitivas

**Cuándo usar:** Para presentar a stakeholders o equipo de desarrollo.

---

### 4. **SQL_IRI_CHAT_COMPLETO.sql** ⭐ BASE DE DATOS
**Descripción:** Script SQL completo listo para ejecutar en Supabase.

**Contenido:**
- ✅ Tabla `iri_chat_messages` (principal)
- ✅ Tabla `iri_conversations` (opcional, estadísticas)
- ✅ Índices para performance
- ✅ Row Level Security (RLS) completo
- ✅ Políticas de seguridad (4 políticas)
- ✅ Trigger para `updated_at`
- ✅ Funciones útiles (estadísticas)
- ✅ Vista de estadísticas
- ✅ Verificación automática
- ✅ Queries útiles para testing

**Cuándo usar:** Ejecutar en Supabase SQL Editor ANTES de empezar el desarrollo.

---

### 5. **Este archivo (INDICE_MIGRACION_IRI.md)**
**Descripción:** Índice de todos los archivos generados.

**Cuándo usar:** Para navegar entre los archivos de documentación.

---

## 📁 ARCHIVOS ORIGINALES DEL MOBILE (Referencia)

### Archivos principales a migrar:

| Archivo | Ubicación | Líneas | Descripción |
|---------|-----------|--------|-------------|
| **IRIChatScreen.tsx** | `src/screens/` | 962 | Pantalla principal del chat |
| **iriVoiceService.ts** | `src/services/` | 148 | Servicio de voz (ElevenLabs) |
| **openaiService.ts** | `src/services/` | 165 | Servicio de OpenAI (backup) |
| **useIRIVoice.ts** | `src/hooks/` | 178 | Hook de voz y Grok |
| **api.ts** (funciones IRI) | `src/rest/` | 82 | Funciones de Supabase |
| **useAuthGuard.ts** | `src/hooks/` | - | Protección de rutas |

**TOTAL:** ~1,535 líneas de código

---

## 🎨 ASSETS NECESARIOS

| Archivo Mobile | Ubicación Web | Descripción |
|---------------|---------------|-------------|
| `assets/iri-icono.jpg` | `public/images/iri-icono.jpg` | Icono de IRI (estático) |
| `assets/iri-icono-Sin-fondo.gif` | `public/images/iri-icono-animated.gif` | Icono animado de IRI |
| `assets/iri-icon.gif` | `public/images/iri-icon.gif` | Icono alternativo |

---

## 🔑 VARIABLES DE ENTORNO

Crear archivo `.env.local` en la raíz del proyecto Next.js:

```bash
# Supabase (obligatorio)
NEXT_PUBLIC_SUPABASE_URL=https://paoliakwfoczcallnecf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Grok API (obligatorio)
NEXT_PUBLIC_GROK_API_KEY=tu-grok-api-key-aqui

# ElevenLabs (opcional - solo si quieres voz premium)
ELEVENLABS_API_KEY=tu-elevenlabs-api-key
ELEVENLABS_VOICE_ID_FEMALE=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_ID_MALE=EXAVITQu4vr4xnSDxMaL

# Google Analytics (opcional - para tracking)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 📦 DEPENDENCIAS NPM

```bash
# Obligatorias
npm install @supabase/supabase-js axios lucide-react

# Opcionales (si usas Tailwind)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

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

**Ejecutar:** `SQL_IRI_CHAT_COMPLETO.sql` en Supabase SQL Editor

---

## 🔌 ENDPOINTS Y APIs

| API | URL | Costo |
|-----|-----|-------|
| **Groq (Grok)** | `https://api.groq.com/openai/v1/chat/completions` | Gratis / $0.10 por 1M tokens |
| **Supabase** | `https://paoliakwfoczcallnecf.supabase.co` | Gratis (500MB DB) |
| **ElevenLabs** | `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` | $5/mes (opcional) |
| **Web Speech API** | Nativo del navegador | **GRATIS** ✅ |

---

## 📊 ESTRUCTURA DE CARPETAS (Next.js)

```
landing-web/
├── app/
│   └── chat-iri/
│       ├── page.tsx              # Pantalla principal del chat
│       └── layout.tsx            # Metadata SEO
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
│   │   └── iriChat.ts           # Funciones de Supabase
│   └── supabase.ts              # Cliente de Supabase
├── hooks/
│   ├── useIRIVoice.ts           # Hook de voz
│   └── useAuthGuard.ts          # Hook de autenticación
├── public/
│   └── images/
│       ├── iri-icono.jpg
│       └── iri-icono-animated.gif
├── .env.local                    # Variables de entorno
├── package.json
└── tailwind.config.ts
```

---

## ✅ CHECKLIST RÁPIDO

### Antes de empezar:
- [ ] Leer `GUIA_MIGRACION_IRI_A_LANDING_WEB.md`
- [ ] Leer `RESUMEN_EJECUTIVO_IRI_LANDING.md`
- [ ] Obtener API key de Grok: https://console.groq.com/keys

### Configuración (30 min):
- [ ] Ejecutar `SQL_IRI_CHAT_COMPLETO.sql` en Supabase
- [ ] Crear proyecto Next.js
- [ ] Instalar dependencias NPM
- [ ] Crear archivo `.env.local`
- [ ] Copiar assets a `public/images/`

### Desarrollo (3-4 horas):
- [ ] Copiar código de `EJEMPLOS_CODIGO_NEXTJS_IRI.md`
- [ ] Adaptar estilos según diseño del landing
- [ ] Probar localmente (`npm run dev`)

### Deployment (30 min):
- [ ] Subir a GitHub
- [ ] Conectar con Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Desplegar a producción

### Google Ads (variable):
- [ ] Configurar Google Analytics
- [ ] Crear campaña de Google Ads
- [ ] Configurar conversiones
- [ ] Lanzar campaña

---

## 🚀 ORDEN DE LECTURA RECOMENDADO

### Para Desarrolladores:
1. **GUIA_MIGRACION_IRI_A_LANDING_WEB.md** (leer completo)
2. **SQL_IRI_CHAT_COMPLETO.sql** (ejecutar en Supabase)
3. **EJEMPLOS_CODIGO_NEXTJS_IRI.md** (copiar código)
4. **RESUMEN_EJECUTIVO_IRI_LANDING.md** (checklist)

### Para Project Managers:
1. **RESUMEN_EJECUTIVO_IRI_LANDING.md** (resumen y métricas)
2. **GUIA_MIGRACION_IRI_A_LANDING_WEB.md** (detalles técnicos)

### Para Stakeholders:
1. **RESUMEN_EJECUTIVO_IRI_LANDING.md** (solo secciones de costos y métricas)

---

## 💰 COSTOS TOTALES

| Servicio | Costo Mensual |
|----------|---------------|
| Groq API | **$0** (gratis) |
| Supabase | **$0** (plan gratis) |
| Web Speech API | **$0** (nativo) |
| Next.js (Vercel) | **$0** (plan gratis) |
| **TOTAL** | **$0/mes** ✅ |

**Opcional:**
- ElevenLabs (voz premium): $5/mes
- Vercel Pro: $20/mes
- Supabase Pro: $25/mes

---

## 📞 SOPORTE

Si tienes dudas durante la implementación:

1. **Revisar archivos de referencia:**
   - Código original: `src/screens/IRIChatScreen.tsx`
   - Código adaptado: `EJEMPLOS_CODIGO_NEXTJS_IRI.md`

2. **Documentación oficial:**
   - Next.js: https://nextjs.org/docs
   - Supabase: https://supabase.com/docs
   - Groq: https://console.groq.com/docs
   - Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

3. **Recursos adicionales:**
   - Tailwind CSS: https://tailwindcss.com/docs
   - Lucide Icons: https://lucide.dev

---

## 🎯 OBJETIVO FINAL

**Tener el chat de IRI funcionando en el landing web para:**
- ✅ Captar usuarios desde Google Ads
- ✅ Ofrecer educación financiera inmediata
- ✅ Aumentar conversiones (registros)
- ✅ Diferenciarse de la competencia
- ✅ Mejorar SEO con contenido dinámico

---

## 📈 MÉTRICAS DE ÉXITO

### Semana 1:
- 100+ visitas al chat
- 50+ mensajes enviados
- 10+ registros desde chat

### Mes 1:
- 1,000+ visitas al chat
- 500+ mensajes enviados
- 100+ registros desde chat
- Costo por conversión < $5

### Mes 3:
- 5,000+ visitas al chat
- 2,500+ mensajes enviados
- 500+ registros desde chat
- ROI positivo en Google Ads

---

## ✨ RESUMEN

**Archivos generados:** 5 documentos completos
**Código total:** ~1,535 líneas adaptadas
**Tiempo estimado:** 8-10 horas de desarrollo
**Costo mensual:** $0 (usando opciones gratuitas)
**ROI esperado:** Positivo en 3 meses

---

**¡Todo listo para migrar el chat de IRI al landing web! 🚀**

Siguiente paso: Compartir estos archivos con el equipo de desarrollo del landing.
