# INVESTI APP - APK BUILD GUIDE FOR WINDOWS

## ❌ PROBLEMA
EAS Build local requiere macOS/Linux. Windows no es compatible.

## ✅ SOLUCIONES PARA WINDOWS

### OPCIÓN 1: EAS BUILD EN LA NUBE (RECOMENDADO)
```bash
# Crear cuenta en Expo y configurar EAS
npx eas login
npx eas build:configure

# Build en la nube (GRATIS para proyectos open source)
npx eas build --platform android
```

### OPCIÓN 2: EXPO DEVELOPMENT BUILD
```bash
# Instalar Expo Dev Client
npx expo install expo-dev-client

# Crear development build
npx expo run:android --variant release
```

### OPCIÓN 3: REACT NATIVE CLI (MANUAL)
```bash
# Prebuild para generar carpetas nativas
npx expo prebuild --clean

# Build con React Native CLI
cd android
./gradlew assembleRelease
```

## 🚀 PASOS DETALLADOS

### OPCIÓN 1 - EAS CLOUD BUILD (MÁS FÁCIL)

1. **Configurar EAS:**
```bash
npm install -g @expo/cli
npx eas login
```

2. **Configurar proyecto:**
```bash
npx eas build:configure
```

3. **Build APK:**
```bash
npx eas build --platform android --profile preview
```

4. **Descargar APK:**
- Ve a https://expo.dev/accounts/[tu-usuario]/projects/investi-app/builds
- Descarga el APK cuando esté listo

### OPCIÓN 2 - DEVELOPMENT BUILD

1. **Instalar Android Studio y SDK**
2. **Configurar variables de entorno:**
```
ANDROID_HOME=C:\Users\[usuario]\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\platform-tools
```

3. **Build development:**
```bash
npx expo run:android --variant release
```

### OPCIÓN 3 - REACT NATIVE CLI

1. **Prebuild:**
```bash
npx expo prebuild --clean
```

2. **Build APK:**
```bash
cd android
gradlew assembleRelease
```

3. **APK ubicado en:**
```
android/app/build/outputs/apk/release/app-release.apk
```

## 📋 RECOMENDACIÓN

**Para Windows, usa OPCIÓN 1 (EAS Cloud Build):**
- Es gratis para proyectos open source
- No requiere configuración compleja
- Funciona desde cualquier OS
- APK optimizado automáticamente

## 🔧 COMANDOS RÁPIDOS

```bash
# Setup EAS (una sola vez)
npx eas login
npx eas build:configure

# Build APK
npx eas build --platform android --profile preview

# Ver builds
npx eas build:list
```
