# 🚀 INSTRUCCIONES PARA CONSTRUIR APK

**Última actualización:** 25 de Octubre de 2025
**Estado:** ✅ LISTO PARA BUILD

---

## 📋 REQUISITOS PREVIOS

### Software Necesario
- [ ] Node.js v16+ instalado
- [ ] npm o yarn instalado
- [ ] Android SDK instalado
- [ ] Android Studio instalado (opcional pero recomendado)
- [ ] Java JDK 11+ instalado

### Variables de Entorno
```bash
# Verificar que ANDROID_HOME está configurado
echo $ANDROID_HOME

# Si no está configurado, agregar a .bashrc o .zshrc:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

## 🔧 PASO 1: PREPARAR EL PROYECTO

### 1.1 Limpiar Dependencias
```bash
# Ir a la carpeta del proyecto
cd c:\Users\Probook\ 450\ G7\CascadeProjects\investi-jhtech

# Eliminar node_modules
rm -rf node_modules

# Eliminar package-lock.json
rm -f package-lock.json

# Reinstalar dependencias
npm install
```

### 1.2 Limpiar Caché de Metro
```bash
# Limpiar caché
npx react-native start --reset-cache

# O si usas Expo
expo start --clear
```

### 1.3 Limpiar Build de Android
```bash
# Ir a la carpeta de Android
cd android

# Limpiar build
./gradlew clean

# Volver a la carpeta raíz
cd ..
```

---

## 🏗️ PASO 2: VERIFICAR COMPILACIÓN

### 2.1 Compilar en Modo Debug (Prueba)
```bash
# Compilar para Android en modo debug
npx react-native run-android

# O si usas Expo
eas build --platform android --profile preview
```

### 2.2 Verificar que Compila Sin Errores
- [ ] No hay errores de compilación
- [ ] No hay errores de TypeScript
- [ ] No hay errores de dependencias
- [ ] La aplicación se instala en el dispositivo

---

## 📦 PASO 3: GENERAR APK DE RELEASE

### 3.1 Opción A: Usando Gradle (Recomendado)

```bash
# Ir a la carpeta de Android
cd android

# Generar APK de release
./gradlew assembleRelease

# El APK estará en:
# android/app/build/outputs/apk/release/app-release.apk
```

### 3.2 Opción B: Usando Expo (Si usas Expo)

```bash
# Generar APK usando Expo
eas build --platform android --profile production

# Descargar el APK cuando esté listo
```

### 3.3 Opción C: Usando Android Studio

1. Abrir Android Studio
2. Ir a Build → Generate Signed Bundle / APK
3. Seleccionar APK
4. Seleccionar keystore (crear uno si no existe)
5. Seleccionar release
6. Generar

---

## 🔐 PASO 4: CREAR KEYSTORE (Si no existe)

### 4.1 Generar Keystore
```bash
# Generar keystore
keytool -genkey -v -keystore investi.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias investi

# Responder las preguntas:
# - Contraseña del keystore: [crear una fuerte]
# - Nombre: [tu nombre]
# - Organización: [tu empresa]
# - Ciudad: [tu ciudad]
# - Estado: [tu estado]
# - País: [tu país]
# - Contraseña de la clave: [misma que el keystore]
```

### 4.2 Guardar Keystore
```bash
# Copiar keystore a la carpeta de Android
cp investi.keystore android/app/

# Guardar contraseña en lugar seguro
# IMPORTANTE: No compartir esta contraseña
```

### 4.3 Configurar Gradle
```bash
# Editar android/gradle.properties y agregar:
MYAPP_RELEASE_STORE_FILE=investi.keystore
MYAPP_RELEASE_STORE_PASSWORD=[contraseña]
MYAPP_RELEASE_KEY_ALIAS=investi
MYAPP_RELEASE_KEY_PASSWORD=[contraseña]
```

---

## ✅ PASO 5: VERIFICAR APK

### 5.1 Instalar en Dispositivo de Prueba
```bash
# Conectar dispositivo Android
adb devices

# Instalar APK
adb install -r android/app/build/outputs/apk/release/app-release.apk

# O si usas Expo
eas build:run --platform android
```

### 5.2 Probar Funcionalidades
- [ ] Iniciar sesión
- [ ] Onboarding completo
- [ ] Ver HomeFeed
- [ ] Ver MarketInfo
- [ ] Usar CalculadoraDividendos
- [ ] Usar AnalizadorRatios
- [ ] Usar SimuladorPortafolio
- [ ] Enviar mensajes
- [ ] Ver notificaciones
- [ ] No hay crashes

---

## 📤 PASO 6: PUBLICAR EN PLAY STORE

### 6.1 Crear Cuenta de Desarrollador
1. Ir a https://play.google.com/console
2. Crear cuenta de desarrollador
3. Pagar tarifa de registro ($25)
4. Completar información de perfil

### 6.2 Crear Aplicación
1. Ir a "Crear aplicación"
2. Ingresar nombre de la aplicación: "Investí"
3. Seleccionar categoría: Finanzas
4. Aceptar términos

### 6.3 Subir APK
1. Ir a "Versiones" → "Producción"
2. Crear versión
3. Subir APK
4. Ingresar número de versión (ej: 1.0.0)
5. Ingresar cambios en esta versión

### 6.4 Completar Información
1. Ir a "Información de la aplicación"
2. Ingresar descripción
3. Ingresar categoría
4. Ingresar edad recomendada
5. Ingresar URL de privacidad
6. Ingresar URL de términos de servicio

### 6.5 Agregar Screenshots
1. Ir a "Información de la aplicación" → "Screenshots"
2. Agregar 2-8 screenshots
3. Agregar descripción de cada screenshot

### 6.6 Revisar y Publicar
1. Ir a "Revisión de la aplicación"
2. Verificar que todo está correcto
3. Hacer clic en "Publicar"

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: "No se puede encontrar ANDROID_HOME"
**Solución:**
```bash
# Configurar ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Problema: "Error: Could not find gradle"
**Solución:**
```bash
# Ir a la carpeta de Android
cd android

# Limpiar y regenerar
./gradlew clean
./gradlew build
```

### Problema: "Error: Compilation failed"
**Solución:**
```bash
# Limpiar todo
rm -rf node_modules
rm -f package-lock.json
npm install

# Limpiar Android
cd android
./gradlew clean
cd ..

# Intentar de nuevo
npx react-native run-android
```

### Problema: "Error: Keystore not found"
**Solución:**
```bash
# Crear keystore
keytool -genkey -v -keystore investi.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias investi

# Copiar a carpeta de Android
cp investi.keystore android/app/
```

---

## 📊 INFORMACIÓN DEL APK

### Tamaño Esperado
- APK Release: ~50-100 MB
- APK Debug: ~150-200 MB

### Versión Mínima de Android
- Mínimo: Android 6.0 (API 23)
- Recomendado: Android 8.0+ (API 26+)

### Permisos Necesarios
- INTERNET
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION

---

## ✨ CHECKLIST FINAL

Antes de publicar en Play Store:

- [ ] APK compila sin errores
- [ ] APK se instala en dispositivo
- [ ] Todas las pantallas funcionan
- [ ] No hay crashes
- [ ] Notificaciones funcionan
- [ ] Chat funciona
- [ ] Herramientas financieras funcionan
- [ ] Supabase conecta correctamente
- [ ] API de búsqueda funciona
- [ ] Imágenes se cargan correctamente
- [ ] Videos se reproducen correctamente
- [ ] Versión de app está actualizada
- [ ] Descripción está completa
- [ ] Screenshots están agregados
- [ ] Política de privacidad está disponible
- [ ] Términos de servicio están disponibles

---

## 🎉 ¡LISTO!

Cuando todo esté verificado y publicado en Play Store:

1. Compartir link de descarga
2. Promocionar en redes sociales
3. Recopilar feedback de usuarios
4. Hacer actualizaciones según feedback

---

**¡Éxito con tu aplicación! 🚀**
