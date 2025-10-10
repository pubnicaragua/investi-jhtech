# 📱 Guía: Instalar Android SDK

## ❌ Error Actual
```
Failed to resolve the Android SDK path. ANDROID_HOME is set to a non-existing path: C:\Users\invit\AppData\Local\Android\Sdk
Error: 'adb' is not recognized as an internal or external command
```

**Causa:** Android SDK no está instalado o la ruta es incorrecta.

---

## ✅ Solución 1: Instalar Android Studio (Recomendado)

### Paso 1: Descargar Android Studio
1. Ve a: https://developer.android.com/studio
2. Descarga Android Studio
3. Instala siguiendo el wizard (acepta todas las opciones por defecto)

### Paso 2: Configurar SDK
1. Abre Android Studio
2. En la pantalla de bienvenida, click en **"More Actions" → "SDK Manager"**
3. En la pestaña **"SDK Platforms"**, marca:
   - ✅ Android 14.0 (API 34)
   - ✅ Android 13.0 (API 33)
4. En la pestaña **"SDK Tools"**, marca:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator
   - ✅ Intel x86 Emulator Accelerator (HAXM)
5. Click **"Apply"** y espera la descarga (5-10 minutos)

### Paso 3: Configurar Variables de Entorno

#### Opción A: Automático (Script)
Ejecuta este comando en PowerShell como Administrador:

```powershell
# Detectar ruta del SDK
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $sdkPath) {
    [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $sdkPath, 'User')
    [System.Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', $sdkPath, 'User')
    
    $currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
    $newPath = "$currentPath;$sdkPath\platform-tools;$sdkPath\tools;$sdkPath\tools\bin"
    [System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
    
    Write-Host "✅ Variables de entorno configuradas"
    Write-Host "⚠️ REINICIA tu terminal para aplicar cambios"
} else {
    Write-Host "❌ SDK no encontrado en: $sdkPath"
    Write-Host "Verifica la instalación de Android Studio"
}
```

#### Opción B: Manual
1. Presiona **Windows + R**, escribe `sysdm.cpl` y presiona Enter
2. Ve a la pestaña **"Opciones avanzadas"**
3. Click en **"Variables de entorno"**
4. En **"Variables de usuario"**, click **"Nueva"**:
   - **Nombre:** `ANDROID_HOME`
   - **Valor:** `C:\Users\invit\AppData\Local\Android\Sdk`
5. Click **"Nueva"** otra vez:
   - **Nombre:** `ANDROID_SDK_ROOT`
   - **Valor:** `C:\Users\invit\AppData\Local\Android\Sdk`
6. Edita la variable **"Path"**, click **"Nuevo"** y agrega:
   - `C:\Users\invit\AppData\Local\Android\Sdk\platform-tools`
   - `C:\Users\invit\AppData\Local\Android\Sdk\tools`
   - `C:\Users\invit\AppData\Local\Android\Sdk\tools\bin`
7. Click **"Aceptar"** en todas las ventanas
8. **REINICIA tu terminal**

### Paso 4: Verificar Instalación
Abre una **nueva terminal** y ejecuta:

```bash
adb version
# Debería mostrar: Android Debug Bridge version X.X.X
```

Si funciona, ya puedes compilar localmente:
```bash
npx expo run:android
```

---

## ✅ Solución 2: Instalar Solo Command Line Tools (Más Ligero)

### Paso 1: Descargar
1. Ve a: https://developer.android.com/studio#command-line-tools-only
2. Descarga "Command line tools only" para Windows
3. Extrae el ZIP a: `C:\Android\cmdline-tools`

### Paso 2: Instalar SDK
```bash
cd C:\Android\cmdline-tools\bin
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### Paso 3: Configurar Variables
Igual que en la Solución 1, pero usa la ruta: `C:\Android`

---

## ✅ Solución 3: Usar EAS Build (Sin SDK Local)

**La más fácil si solo quieres probar la app:**

```bash
# Instala EAS CLI
npm install -g eas-cli

# Login
npx eas login

# Compila en la nube
npx eas build --profile development --platform android
```

**Ventajas:**
- ✅ No necesitas Android SDK
- ✅ No necesitas configurar nada
- ✅ Compila en servidores de Expo
- ✅ Descarga el APK y lo instalas

**Desventajas:**
- ❌ Toma 10-15 minutos por build
- ❌ Necesitas cuenta de Expo
- ❌ No puedes hacer hot reload

---

## 🎯 Recomendación

### Para Desarrollo Activo:
**Instala Android Studio** (Solución 1)
- Mejor experiencia de desarrollo
- Hot reload instantáneo
- Debugging completo

### Para Pruebas Rápidas:
**Usa EAS Build** (Solución 3)
- No necesitas configurar nada
- Perfecto para testing
- Compila en la nube

---

## 🔍 Verificar Estado Actual

Ejecuta estos comandos para ver qué tienes instalado:

```bash
# Verificar ADB
adb version

# Verificar ANDROID_HOME
echo %ANDROID_HOME%

# Verificar Java
java -version

# Verificar Node
node -v
```

---

## ⚠️ Problemas Comunes

### "adb is not recognized"
**Solución:** Reinicia tu terminal después de configurar variables de entorno

### "Failed to install the following Android SDK packages"
**Solución:** Ejecuta Android Studio como Administrador

### "ANDROID_HOME is set to a non-existing path"
**Solución:** Verifica que la ruta existe:
```bash
dir C:\Users\invit\AppData\Local\Android\Sdk
```

Si no existe, instala Android Studio primero.

---

## 📞 Siguiente Paso

**Después de instalar Android SDK:**

1. **Reinicia tu terminal**
2. Verifica: `adb version`
3. Ejecuta: `npx expo run:android`

**O usa EAS Build:**

1. Ejecuta: `.\build-eas.bat`
2. Espera 10-15 minutos
3. Descarga e instala el APK
