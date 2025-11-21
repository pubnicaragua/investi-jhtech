# 🚀 BUILD RÁPIDO PARA PLAY STORE

## COMANDOS SUPER RÁPIDOS

### 1. Configurar Secrets (Solo primera vez)
```bash
eas secret:create --scope project --name ELEVENLABS_API_KEY --value sk_1f761cf886d39ceccf5774358d5d5609dc298acc5d994a66 --type string

eas secret:create --scope project --name ELEVENLABS_VOICE_ID_FEMALE --value GJid0jgRsqjUy21Avuex --type string

eas secret:create --scope project --name ELEVENLABS_VOICE_ID_MALE --value 93nuHbke4dTER9x2pDwE --type string
```

### 2. Build AAB para Play Store
```bash
eas build --platform android --profile production
```

### 3. Build APK para Testing (más rápido)
```bash
eas build --platform android --profile preview
```

---

## ⚡ COMANDO TODO EN UNO

```bash
# Login (si no lo has hecho)
eas login

# Build directo para Play Store
eas build --platform android --profile production --non-interactive
```

---

## 📱 DESPUÉS DEL BUILD

1. **Descargar AAB**
   - Ve a: https://expo.dev/accounts/[tu-usuario]/projects/investi-jhtech/builds
   - Descarga el archivo `.aab`

2. **Subir a Play Store**
   - Google Play Console → Tu App → Producción
   - Crear nueva versión
   - Subir el `.aab`
   - Completar información de la versión
   - Enviar a revisión

---

## 🔍 VER ESTADO DEL BUILD

```bash
# Ver builds recientes
eas build:list

# Ver detalles de un build específico
eas build:view [BUILD_ID]
```

---

## ⏱️ TIEMPOS ESTIMADOS

- **Build en la nube:** 15-20 minutos
- **Build local:** 5-10 minutos (requiere Android Studio)

---

## 🚨 ANTES DE HACER EL BUILD

**IMPORTANTE:** Ejecuta este SQL en Supabase primero:

```sql
DROP TRIGGER IF EXISTS on_post_creation ON posts CASCADE;
DROP FUNCTION IF EXISTS trigger_post_creation() CASCADE;
```

Si no lo haces, el error de eliminar posts persistirá en producción.
