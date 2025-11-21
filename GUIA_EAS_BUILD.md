# 🚀 Guía Completa para EAS Build - Investí App

## ✅ Pre-requisitos

1. **Cuenta de Expo**
   - Crea cuenta en https://expo.dev
   - Instala EAS CLI: `npm install -g eas-cli`
   - Login: `eas login`

2. **Variables de Entorno Configuradas**
   Tu `.env` actual:
   ```env
   ELEVENLABS_API_KEY=sk_1f761cf886d39ceccf5774358d5d5609dc298acc5d994a66
   ELEVENLABS_VOICE_ID_FEMALE=GJid0jgRsqjUy21Avuex
   ELEVENLABS_VOICE_ID_MALE=93nuHbke4dTER9x2pDwE
   ```

---

## 📝 Paso 1: Configurar Secrets en EAS

```bash
# Configurar secrets de ElevenLabs
eas secret:create --scope project --name ELEVENLABS_API_KEY --value sk_1f761cf886d39ceccf5774358d5d5609dc298acc5d994a66 --type string

eas secret:create --scope project --name ELEVENLABS_VOICE_ID_FEMALE --value GJid0jgRsqjUy21Avuex --type string

eas secret:create --scope project --name ELEVENLABS_VOICE_ID_MALE --value 93nuHbke4dTER9x2pDwE --type string
```

**Verificar secrets:**
```bash
eas secret:list
```

---

## 🔧 Paso 2: Configurar app.json

Verifica que tu `app.json` tenga los permisos necesarios:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          }
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

---

## 🏗️ Paso 3: Crear Build

### Opción A: Build de Preview (Recomendado para testing)
```bash
eas build --platform android --profile preview
```

### Opción B: Build de Producción
```bash
eas build --platform android --profile production
```

### Opción C: Build Local (más rápido)
```bash
eas build --platform android --profile preview --local
```

---

## 📱 Paso 4: Instalar y Probar

1. **Descargar APK**
   - Ve a https://expo.dev/accounts/[tu-usuario]/projects/investi-jhtech/builds
   - Descarga el APK generado

2. **Instalar en dispositivo**
   - Transfiere el APK a tu dispositivo Android
   - Habilita "Instalar apps desconocidas"
   - Instala el APK

3. **Probar funcionalidades**
   - ✅ Crear post
   - ✅ Crear encuesta
   - ✅ Eliminar post
   - ✅ Navegar a Iri
   - ✅ Navegar a SupportTicket
   - ✅ Navegar a CartolaExtractor
   - ✅ Voz de Iri (ElevenLabs)
   - ✅ Selector de voz ♀/♂
   - ✅ Tap en mensaje para reproducir

---

## 🔍 Verificación de Variables de Entorno

### En el código, las variables se acceden así:

```typescript
// iriVoiceService.ts
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID_FEMALE = process.env.ELEVENLABS_VOICE_ID_FEMALE;
const VOICE_ID_MALE = process.env.ELEVENLABS_VOICE_ID_MALE;
```

### Verificar en build:
```bash
# Ver logs del build
eas build:view [BUILD_ID]

# Ver configuración
eas build:configure
```

---

## ⚠️ Solución de Problemas

### Error 401 de ElevenLabs

**Causa:** API Key inválida o no configurada

**Solución:**
1. Verifica que el secret esté creado:
   ```bash
   eas secret:list
   ```

2. Si no existe, créalo:
   ```bash
   eas secret:create --scope project --name ELEVENLABS_API_KEY --value sk_1f761cf886d39ceccf5774358d5d5609dc298acc5d994a66 --type string
   ```

3. Reconstruye la app:
   ```bash
   eas build --platform android --profile preview --clear-cache
   ```

### Variables no se cargan

**Solución:**
1. Verifica que `eas.json` tenga las variables en `env`:
   ```json
   "env": {
     "ELEVENLABS_API_KEY": "@ELEVENLABS_API_KEY",
     "ELEVENLABS_VOICE_ID_FEMALE": "@ELEVENLABS_VOICE_ID_FEMALE",
     "ELEVENLABS_VOICE_ID_MALE": "@ELEVENLABS_VOICE_ID_MALE"
   }
   ```

2. El prefijo `@` indica que es un secret de EAS

### Build falla

**Solución:**
```bash
# Limpiar caché
eas build --platform android --profile preview --clear-cache

# Ver logs detallados
eas build:view [BUILD_ID]
```

---

## 🎯 Checklist Final

Antes de hacer el build de producción:

- [ ] Secrets configurados en EAS
- [ ] `eas.json` actualizado con variables
- [ ] `app.json` con permisos correctos
- [ ] SQL ejecutado en Supabase (`FIX_TRIGGERS_DEFINITIVO.sql`)
- [ ] Navegación probada en Expo Go
- [ ] Build de preview probado y funcional
- [ ] Voz de Iri funcionando
- [ ] Todos los errores resueltos

---

## 🚀 Comandos Rápidos

```bash
# 1. Configurar secrets (solo una vez)
eas secret:create --scope project --name ELEVENLABS_API_KEY --value sk_1f761cf886d39ceccf5774358d5d5609dc298acc5d994a66 --type string
eas secret:create --scope project --name ELEVENLABS_VOICE_ID_FEMALE --value GJid0jgRsqjUy21Avuex --type string
eas secret:create --scope project --name ELEVENLABS_VOICE_ID_MALE --value 93nuHbke4dTER9x2pDwE --type string

# 2. Crear build de preview
eas build --platform android --profile preview

# 3. Ver builds
eas build:list

# 4. Descargar APK
# Ir a: https://expo.dev/accounts/[tu-usuario]/projects/investi-jhtech/builds
```

---

## 📊 Diferencias entre Expo Go y EAS Build

| Característica | Expo Go | EAS Build |
|----------------|---------|-----------|
| Voice Recognition | ❌ No funciona | ✅ Funciona |
| ElevenLabs TTS | ⚠️ Puede fallar | ✅ Funciona |
| Permisos nativos | ❌ Limitados | ✅ Completos |
| Variables .env | ✅ Funciona | ✅ Funciona con secrets |
| Velocidad | ⚡ Rápido | 🐢 Más lento |
| Ideal para | Desarrollo | Producción/Testing |

---

## ✅ Confirmación de Funcionalidad

Una vez instalado el build, confirma que funciona:

1. **Posts y Encuestas**
   - ✅ Crear post sin error
   - ✅ Crear encuesta sin error
   - ✅ Eliminar post sin error

2. **Navegación**
   - ✅ Settings → SupportTicket
   - ✅ Settings → CartolaExtractor
   - ✅ Cualquier pantalla → Iri

3. **Voz de Iri**
   - ✅ Iri responde con voz automáticamente
   - ✅ Cambiar voz ♀/♂ funciona
   - ✅ Tap en mensaje reproduce voz
   - ✅ No hay error 401 de ElevenLabs

4. **UI**
   - ✅ Colores rosa pastel (#F9A8D4)
   - ✅ Ícono Send (➤) en enviar mensaje
   - ✅ Selector de voz ♀/♂ visible

---

## 🎉 ¡Listo para Producción!

Si todos los checks están ✅, puedes hacer el build de producción:

```bash
eas build --platform android --profile production
```

Luego sube el AAB a Google Play Console.
