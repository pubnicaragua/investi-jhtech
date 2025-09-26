# 🔥 PASOS EXACTOS PARA PROBAR NAVEGACIÓN DE IDIOMA

## 📋 PREPARACIÓN

### 1. Ejecutar script de limpieza:
```bash
.\clean-all-and-test.bat
```

### 2. O ejecutar manualmente:
```bash
# Detener Metro si está corriendo
Ctrl+C

# Limpiar cache
rm -rf .expo .metro node_modules/.cache

# Iniciar limpio
npx expo start --dev-client --clear --reset-cache
```

## 📱 TESTING EN EL MÓVIL

### 1. Abrir la app
- Escanea el QR con tu development build
- Deberías ver "Choose your language"

### 2. Preparar la consola
- Ten la consola visible en tu PC
- Los logs aparecerán aquí inmediatamente

### 3. Tocar botón ESPAÑOL
- Toca el botón con la bandera 🇪🇸
- Observa la consola INMEDIATAMENTE

## 🔍 LOGS ESPERADOS (EN ORDEN)

```
🔥 BOTÓN PRESIONADO! Idioma: es
🌍 LanguageSelectionScreen: Iniciando selección de idioma: es
🌍 LanguageContext: Guardando idioma: es
✅ LanguageContext: Idioma guardado exitosamente
✅ LanguageSelectionScreen: Idioma guardado exitosamente
🔍 LanguageSelectionScreen: Verificación - idioma guardado: es
🔍 LanguageSelectionScreen: Verificación - flag seleccionado: true
🧭 LanguageSelectionScreen: Iniciando navegación a Welcome...
🚀 Método 1: navigation.replace("Welcome")
```

## 🚨 DIAGNÓSTICO DE PROBLEMAS

### ❌ NO VES "🔥 BOTÓN PRESIONADO!"
**PROBLEMA:** El botón no responde al touch
**SOLUCIÓN:**
1. Descomenta la línea `alert` en LanguageSelectionScreen.tsx línea 31
2. Reinicia la app
3. Si no sale alert, hay problema de touch

### ✅ VES "🔥 BOTÓN PRESIONADO!" PERO NO NAVEGA
**PROBLEMA:** Error en navegación
**SOLUCIÓN:**
1. Busca errores después de "🧭 Iniciando navegación"
2. Verifica que existe WelcomeScreen
3. Revisa Stack Navigator

### ⚠️ VES LOGS PERO SE QUEDA EN LANGUAGE SCREEN
**PROBLEMA:** Navegación no funciona
**SOLUCIÓN:**
1. Presiona 'r' en la consola para reload
2. O cierra/abre la app manualmente
3. Usa DevMenu → Debug Storage

## 🛠️ HERRAMIENTAS DE DEBUG

### Si nada funciona:
1. **DevMenu:** Accesible desde la app
2. **Debug Storage:** Para limpiar AsyncStorage
3. **Reload:** Presiona 'r' en consola
4. **Restart:** Cierra/abre la app

### Scripts disponibles:
- `.\clean-all-and-test.bat` - Limpieza completa
- `.\test-language-buttons.bat` - Test específico
- `.\test-navigation-complete.bat` - Test completo

## 📞 REPORTE DE RESULTADOS

Por favor reporta exactamente:
1. ¿Ves "🔥 BOTÓN PRESIONADO!"? SÍ/NO
2. ¿Ves "🚀 Método X: navigation..."? SÍ/NO  
3. ¿La app navega a Welcome? SÍ/NO
4. ¿Hay algún error en rojo? Copia el error

Con esta información podremos identificar exactamente dónde está el problema.
