# 🚀 Guía de Desarrollo - Investi App

## ⚠️ IMPORTANTE: NO usar Expo Go

Esta app **NO funciona con Expo Go** porque usa módulos nativos como:
- `react-native-reanimated`
- `react-native-gesture-handler`
- `expo-secure-store`
- Otras dependencias nativas

## 📱 Configuración Inicial (Una sola vez)

### Paso 1: Instalar Dependencias

```bash
# Usar yarn (recomendado)
yarn install

# O npm
npm install
```

### Paso 2: Crear Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_key_de_supabase
```

### Paso 3: Construir el Development Build (Una sola vez)

Tienes 2 opciones:

#### Opción A: EAS Build (Recomendado - Sin Android Studio)

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Login a tu cuenta de Expo
eas login

# Construir APK de desarrollo
npm run build:dev
# O directamente:
eas build --profile development --platform android
```

Esto compilará en la nube y te dará un link para descargar el APK.
**Instala este APK en tu teléfono Android** (solo una vez).

#### Opción B: Build Local (Requiere Android Studio)

Si tienes Android Studio instalado y configurado:

```bash
npm run android
```

## 🔄 Desarrollo Diario

Una vez que tengas el Development Build instalado en tu teléfono:

### 1. Iniciar el Metro Bundler

```bash
npm start
# O
yarn start
# O
npm run dev  # Con cache limpio
```

### 2. Conectar tu Teléfono

- Escanea el QR que aparece en la terminal
- O presiona `a` para abrir en Android
- La app se abrirá en el **Development Build** (NO en Expo Go)

### 3. Hot Reload

Los cambios se reflejarán automáticamente. Si algo no funciona:
- Presiona `r` en la terminal para reload
- O sacude el teléfono y presiona "Reload"

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm start              # Inicia con dev client
npm run dev            # Inicia con cache limpio
npm run start:fast     # Alias de dev

# Builds
npm run build:dev      # Build de desarrollo (APK con dev tools)
npm run build:preview  # Build de preview (APK optimizado)

# Utilidades
npm run lint           # Ejecutar linter
npm run test           # Ejecutar tests
npm run clean          # Limpiar cache
```

## 🐛 Solución de Problemas

### Error: "PlatformConstants could not be found"
- Estás usando Expo Go ❌
- Debes usar el Development Build ✅

### Botones no funcionan
- Asegúrate de tener `react-native-gesture-handler` instalado
- Verifica que el Development Build esté actualizado
- Reconstruye el APK si agregaste nuevas dependencias nativas

### "ANDROID_HOME not found"
- Solo necesario si usas `npm run android`
- Usa EAS Build en su lugar: `npm run build:dev`

### Cambios no se reflejan
```bash
npm run dev  # Limpia cache y reinicia
```

## 📦 Agregar Nuevas Dependencias

### Dependencias JavaScript (sin código nativo)
```bash
yarn add nombre-paquete
# Reinicia metro bundler (Ctrl+C y npm start)
```

### Dependencias Nativas (con código nativo)
```bash
yarn add nombre-paquete
# IMPORTANTE: Debes reconstruir el Development Build
npm run build:dev
# Instala el nuevo APK en tu teléfono
```

## 🔐 Configuración de Supabase

Las credenciales están en `.env`:
- `EXPO_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Anon key pública

## 📚 Recursos

- [Expo Dev Client Docs](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)

## 🎯 Workflow Recomendado

1. **Primera vez**: Construir Development Build con EAS
2. **Desarrollo diario**: Solo `npm start` y escanear QR
3. **Nueva dependencia nativa**: Reconstruir Development Build
4. **Nueva dependencia JS**: Solo reiniciar metro bundler

---

**¿Dudas?** Contacta al equipo de desarrollo.
