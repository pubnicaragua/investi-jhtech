# 📊 ANÁLISIS DE MÓDULOS NATIVOS - INVESTI JHTECH

## 🔴 MÓDULOS NATIVOS CRÍTICOS (Requieren Dev Client)

### 1. **expo-dev-client** (~5.0.4)
- **Uso**: Permite desarrollo con módulos nativos personalizados
- **Impacto**: CRÍTICO - Sin esto no puedes usar Expo Go
- **Recomendación**: ✅ MANTENER - Es necesario para desarrollo
- **Archivos afectados**: Configuración global

### 2. **expo-image-picker** (~16.0.3)
- **Uso**: Seleccionar imágenes de galería/cámara
- **Impacto**: ALTO - Usado en 2 pantallas
- **Archivos afectados**:
  - `src/screens/UploadAvatarScreen.tsx`
  - `src/screens/CreatePostScreen.tsx`
- **Recomendación**: ✅ MANTENER - Funcionalidad esencial
- **Alternativa**: Usar input file HTML (solo web, pierde funcionalidad móvil)

### 3. **expo-secure-store** (~14.0.0)
- **Uso**: Almacenamiento seguro de tokens/credenciales
- **Impacto**: CRÍTICO - Sistema de autenticación
- **Archivos afectados**:
  - `src/rest/api.ts`
  - `src/utils/storage.ts`
- **Recomendación**: ✅ MANTENER - Seguridad esencial
- **Alternativa**: AsyncStorage (menos seguro) o localStorage (solo web)

### 4. **expo-localization** (~16.0.0)
- **Uso**: Detectar idioma del dispositivo
- **Impacto**: MEDIO - Internacionalización
- **Archivos afectados**:
  - `src/i18n.ts`
  - `src/i18n/i18n.ts`
- **Recomendación**: ⚠️ EVALUAR - Puede reemplazarse
- **Alternativa**: Usar `navigator.language` (web) o configuración manual

---

## 🟡 MÓDULOS NATIVOS OPCIONALES (Pueden removerse)

### 5. **expo-router** (~4.0.9)
- **Uso**: Sistema de navegación basado en archivos
- **Impacto**: BAJO - No se usa activamente (usas React Navigation)
- **Recomendación**: ❌ REMOVER - No se está usando
- **Beneficio**: Reduce tamaño del bundle

### 6. **expo-build-properties** (~0.14.1)
- **Uso**: Configurar propiedades de compilación Android/iOS
- **Impacto**: MEDIO - Configuración de Gradle/Kotlin
- **Recomendación**: ✅ MANTENER - Necesario para compilación correcta
- **Archivos afectados**: `app.config.js`

---

## 🟢 MÓDULOS ESTÁNDAR (No requieren Dev Client especial)

### 7. **expo-asset** (~11.0.1)
- **Uso**: Gestión de assets (imágenes, fuentes)
- **Recomendación**: ✅ MANTENER

### 8. **expo-constants** (~17.0.3)
- **Uso**: Variables de entorno y configuración
- **Recomendación**: ✅ MANTENER

### 9. **expo-font** (~13.0.1)
- **Uso**: Cargar fuentes personalizadas
- **Recomendación**: ✅ MANTENER

### 10. **expo-linking** (~7.0.3)
- **Uso**: Deep linking
- **Recomendación**: ✅ MANTENER

### 11. **expo-splash-screen** (~0.28.5)
- **Uso**: Pantalla de carga
- **Recomendación**: ✅ MANTENER

### 12. **expo-status-bar** (~2.0.0)
- **Uso**: Controlar barra de estado
- **Recomendación**: ✅ MANTENER

---

## 📦 OTROS MÓDULOS NATIVOS (React Native Core)

### 13. **react-native-gesture-handler** (^2.20.0)
- **Uso**: Gestos táctiles (React Navigation)
- **Recomendación**: ✅ MANTENER - Requerido por navegación

### 14. **react-native-reanimated** (^3.17.4)
- **Uso**: Animaciones de alto rendimiento
- **Recomendación**: ✅ MANTENER - Usado en navegación

### 15. **react-native-safe-area-context** (4.12.0)
- **Uso**: Áreas seguras (notch, etc)
- **Recomendación**: ✅ MANTENER - Requerido por navegación

### 16. **react-native-screens** (4.1.0)
- **Uso**: Optimización de pantallas nativas
- **Recomendación**: ✅ MANTENER - Requerido por navegación

### 17. **react-native-svg** (15.8.0)
- **Uso**: Renderizar SVG (lucide-react-native)
- **Recomendación**: ✅ MANTENER - Usado por iconos

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### Opción A: MANTENER TODO (Proyecto Completo)
```bash
# Ventajas:
- ✅ Todas las funcionalidades disponibles
- ✅ Mejor experiencia de usuario
- ✅ Seguridad con SecureStore

# Desventajas:
- ❌ Requiere compilar Dev Client
- ❌ No funciona con Expo Go
- ❌ Builds más pesados
```

### Opción B: VERSIÓN LIGERA (Solo Web/Expo Go)
```bash
# Módulos a REMOVER:
- expo-dev-client
- expo-image-picker (reemplazar con input file)
- expo-secure-store (reemplazar con AsyncStorage)
- expo-localization (usar navigator.language)
- expo-router (ya no se usa)

# Ventajas:
- ✅ Funciona con Expo Go
- ✅ Builds más rápidos
- ✅ Desarrollo más simple

# Desventajas:
- ❌ Pierde funcionalidad de cámara/galería nativa
- ❌ Menos seguro (sin SecureStore)
- ❌ Experiencia de usuario reducida
```

---

## 🔧 SCRIPTS DE MIGRACIÓN

### Para REMOVER módulos nativos y usar Expo Go:

```json
// package.json - Remover estas líneas:
"expo-dev-client": "~5.0.4",
"expo-image-picker": "~16.0.3",
"expo-secure-store": "~14.0.0",
"expo-localization": "~16.0.0",
"expo-router": "~4.0.9",
```

### Cambios en código necesarios:

1. **Reemplazar expo-secure-store**:
```typescript
// Antes:
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('token', value);

// Después:
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('token', value);
```

2. **Reemplazar expo-image-picker**:
```typescript
// Antes:
import * as ImagePicker from 'expo-image-picker';
const result = await ImagePicker.launchImageLibraryAsync();

// Después (solo web):
<input type="file" accept="image/*" />
```

3. **Reemplazar expo-localization**:
```typescript
// Antes:
import * as Localization from 'expo-localization';
const locale = Localization.locale;

// Después:
const locale = navigator.language || 'es';
```

---

## 💡 RECOMENDACIÓN FINAL

**MANTENER TODOS LOS MÓDULOS NATIVOS** porque:

1. ✅ La app necesita funcionalidad de cámara/galería (avatar, posts)
2. ✅ SecureStore es crítico para seguridad de tokens
3. ✅ Ya tienes el proyecto configurado correctamente
4. ✅ Solo necesitas compilar el Dev Client UNA VEZ

**Pasos siguientes:**
```bash
# 1. Terminar instalación
npm install

# 2. Compilar Dev Client (solo primera vez)
npx expo run:android

# 3. Desarrollo normal
npm start
```

El error "PlatformConstants" se resuelve compilando el Dev Client, no removiendo módulos.
