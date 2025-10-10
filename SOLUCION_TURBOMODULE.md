# 🔧 Solución: TurboModuleRegistry Error

## ❌ Error
```
TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found.
Verify that a module by this name is registered in the native binary.
```

## 🎯 Causa Raíz
Este error ocurre cuando React Native no puede inicializar correctamente sus módulos nativos. Las causas más comunes:

1. **Build de Android desactualizado** - El bundle JS no coincide con el código nativo
2. **Cache corrupto de Metro** - Referencias obsoletas a módulos
3. **Módulos nativos no vinculados** - Después de instalar/actualizar dependencias

## ✅ Solución Paso a Paso

### Opción 1: Solución Rápida (Recomendada)

1. **Cierra completamente la app** en tu dispositivo Android:
   - Ve a Configuración → Apps → Investi
   - Presiona "Forzar detención"

2. **Ejecuta estos comandos en orden:**
   ```bash
   # Limpia todo
   npx expo start --clear
   
   # En otra terminal, reconstruye y ejecuta
   npx expo run:android
   ```

3. **Espera la reconstrucción completa** (3-5 minutos)

### Opción 2: Solución Completa (Si la Opción 1 no funciona)

1. **Cierra la app** en el dispositivo

2. **Ejecuta el script de limpieza:**
   ```bash
   .\fix-turbomodule-error.bat
   ```

3. **Reconstruye desde cero:**
   ```bash
   npx expo run:android
   ```

### Opción 3: Reset Total (Último recurso)

Si ninguna de las anteriores funciona:

```bash
# 1. Desinstala la app del dispositivo completamente

# 2. Limpia TODO
rmdir /s /q node_modules
rmdir /s /q android\app\build
rmdir /s /q android\build
rmdir /s /q .expo

# 3. Reinstala
npm install

# 4. Reconstruye
npx expo prebuild --clean
npx expo run:android
```

## 🚨 Importante

- **NO uses `npm start`** - Usa `npx expo start` o `npx expo run:android`
- **NO recargues con R** - Debes reconstruir completamente
- **Cierra la app** antes de reconstruir
- **Espera la reconstrucción completa** - No interrumpas el proceso

## 🔍 Verificación

Después de reconstruir, deberías ver:
```
✓ Built successfully
✓ Installing app on device
✓ App launched successfully
```

Si el error persiste después de la Opción 3, puede haber un problema con:
- Tu instalación de Android SDK
- Tu dispositivo/emulador
- Versión incompatible de React Native

## 📝 Notas Técnicas

El módulo `PlatformConstants` es parte del core de React Native y proporciona información sobre la plataforma (OS, versión, etc.). Si no se encuentra, significa que:

1. El código nativo no se compiló correctamente
2. El bridge entre JS y Native no se inicializó
3. Hay un mismatch entre el bundle JS y el código nativo

La única solución real es **reconstruir completamente la app nativa**.
