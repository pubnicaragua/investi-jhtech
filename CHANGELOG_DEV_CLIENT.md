# 🔄 Migración a Expo Dev Client

## Cambios Realizados

### ✅ Dependencias Actualizadas

- ✨ **Agregado**: `expo-dev-client@~5.0.7`
- 🔄 **Actualizadas**: Todas las dependencias a versiones compatibles con Expo SDK 53
- ❌ **Removido**: `@types/react-native` (ya incluido en react-native)

### 📝 Configuración

#### `package.json`
- Scripts actualizados para usar `--dev-client` flag
- Nuevos scripts:
  - `npm run build:dev` - Construir APK de desarrollo
  - `npm run build:preview` - Construir APK de preview

#### `app.config.js`
- Agregado plugin `expo-dev-client`

#### `.gitignore`
- Agregado `.env` para proteger credenciales

### 📚 Documentación Nueva

1. **README.md** - Guía rápida de inicio
2. **DESARROLLO.md** - Guía completa de desarrollo
3. **.env.example** - Template de variables de entorno
4. **setup-dev.bat** - Script de instalación automática para Windows

## ⚠️ IMPORTANTE: Cambios de Workflow

### Antes (NO funciona más)
```bash
npm start
# Escanear QR con Expo Go ❌
```

### Ahora (Correcto)
```bash
# 1. Primera vez: Construir Development Build
npm run build:dev
# Instalar APK en teléfono

# 2. Desarrollo diario
npm start
# Escanear QR - se abre en Development Build ✅
```

## 🚀 Instrucciones para Desarrolladores

### Setup Inicial (Una sola vez)

1. **Clonar repo y instalar**:
   ```bash
   git pull origin main
   yarn install
   ```

2. **Configurar .env**:
   ```bash
   cp .env.example .env
   # Editar .env con credenciales de Supabase
   ```

3. **Construir Development Build**:
   ```bash
   # Instalar EAS CLI
   npm install -g eas-cli
   
   # Login a Expo
   eas login
   
   # Construir APK
   npm run build:dev
   ```

4. **Instalar APK**: Descargar e instalar el APK en tu teléfono Android

### Desarrollo Diario

```bash
npm start
# Escanear QR con tu teléfono
# La app se abrirá en el Development Build
```

## 🐛 Solución de Problemas

### Error: "PlatformConstants could not be found"
**Causa**: Estás usando Expo Go
**Solución**: Usa el Development Build instalado

### Botones no funcionan
**Causa**: Development Build desactualizado
**Solución**: Reconstruir con `npm run build:dev`

### "ANDROID_HOME not found"
**Causa**: Intentando usar `npm run android` sin Android Studio
**Solución**: Usa `npm run build:dev` (EAS Build) en su lugar

## 📦 Cuándo Reconstruir el Development Build

Debes reconstruir cuando:
- ✅ Agregas una nueva dependencia **nativa** (ej: expo-camera, react-native-*)
- ✅ Cambias configuración en `app.config.js`
- ✅ Actualizas versión de Expo SDK

NO necesitas reconstruir cuando:
- ❌ Cambias código JavaScript/TypeScript
- ❌ Agregas dependencias **JavaScript puras** (ej: lodash, date-fns)
- ❌ Cambias estilos o componentes

## 🎯 Beneficios de Dev Client

1. ✅ Soporta todas las dependencias nativas
2. ✅ Debugging completo (React DevTools, Network Inspector)
3. ✅ Hot reload funciona perfectamente
4. ✅ Mismo workflow que producción
5. ✅ No necesita Android Studio instalado (con EAS Build)

## 📖 Recursos

- [Expo Dev Client Docs](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- Ver `DESARROLLO.md` para guía completa

---

**Fecha**: 2025-09-30
**Versión**: 1.0.0
