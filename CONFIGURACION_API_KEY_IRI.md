# 🔑 Configuración del API Key para IRI Chat

## ⚠️ Error Común: "API Key Inválida"

Si ves el error **"Invalid API Key - Error 401"**, sigue estos pasos:

---

## 📋 Pasos para Configurar Correctamente

### 1. **Verificar que el archivo `.env` existe**

El archivo `.env` debe estar en la **raíz del proyecto** (mismo nivel que `package.json`):

```
investi-jhtech/
├── .env          ← AQUÍ debe estar
├── package.json
├── src/
└── ...
```

### 2. **Contenido del archivo `.env`**

El archivo `.env` debe tener exactamente este formato:

```env
# Groq API (para IRI Chat)
EXPO_PUBLIC_GROK_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**⚠️ IMPORTANTE:**
- La variable debe llamarse **exactamente** `EXPO_PUBLIC_GROK_API_KEY`
- **NO debe tener espacios** antes o después del `=`
- **NO debe tener comillas** alrededor del valor
- La API key debe empezar con `gsk_`

### 3. **Obtener tu API Key de Groq**

1. Ve a: https://console.groq.com/keys
2. Inicia sesión o crea una cuenta (es **GRATIS**)
3. Haz clic en **"Create API Key"**
4. Copia la key que empieza con `gsk_`
5. Pégala en tu archivo `.env`

### 4. **Reiniciar el servidor**

Después de crear o modificar el `.env`, **DEBES reiniciar el servidor**:

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
npm start
```

O si usas el script de desarrollo:

```bash
npm run dev
```

---

## 🔍 Verificar que la API Key se Cargó

Cuando inicies el servidor, deberías ver en la consola:

```
✅ GROK_API_KEY loaded: gsk_XXXXXX...
✅ GROK_API_URL: https://api.groq.com/openai/v1/chat/completions
```

Si ves `NOT FOUND`, significa que el `.env` no se cargó correctamente.

---

## 🐛 Solución de Problemas

### Problema 1: "API Key Inválida" después de configurar

**Solución:**
1. Verifica que la API key sea válida en: https://console.groq.com/keys
2. Asegúrate de que la key empiece con `gsk_`
3. Verifica que no haya espacios o caracteres extraños
4. Reinicia el servidor completamente

### Problema 2: La variable no se carga

**Solución:**
1. Verifica que el archivo se llame exactamente `.env` (sin extensión adicional)
2. Verifica que esté en la raíz del proyecto
3. En Windows, asegúrate de que no se llame `.env.txt`
4. Reinicia el servidor

### Problema 3: Error en Expo Go

**Nota:** Las variables `EXPO_PUBLIC_*` funcionan en:
- ✅ Expo Dev Client (recomendado)
- ✅ Build de desarrollo
- ❌ Expo Go (limitado)

Si usas Expo Go, considera usar Expo Dev Client:

```bash
npx expo install expo-dev-client
npx expo run:android
```

---

## 📱 Verificación en la App

1. Abre el chat de IRI
2. Envía un mensaje de prueba: "Hola"
3. Si funciona correctamente:
   - ✅ El mensaje se envía
   - ✅ IRI responde
   - ✅ La respuesta se reproduce con voz

4. Si ves el error "API Key Inválida":
   - ❌ Revisa los pasos anteriores
   - ❌ Verifica la consola del servidor
   - ❌ Asegúrate de haber reiniciado

---

## 🎤 Funcionalidad de Voz

### Reconocimiento de Voz (Speech-to-Text)

El botón del micrófono ahora funciona completamente:

1. **Toca el botón del micrófono** (icono rosado)
2. **Habla en español** - el texto aparecerá automáticamente
3. **Toca de nuevo** para detener
4. **Envía el mensaje** con el botón morado

**Permisos necesarios:**
- Micrófono (se solicita automáticamente)

### Reproducción de Voz (Text-to-Speech)

- Las respuestas de IRI se reproducen automáticamente con voz
- **Doble tap** en cualquier mensaje de IRI para reproducirlo de nuevo
- Usa el botón de **pausa** (arriba a la derecha) para detener

---

## 💰 Costos

### Groq API (Chat IA)
- **GRATIS** hasta 14,400 requests/día
- Modelo: `llama-3.1-8b-instant`
- Velocidad: ~300 tokens/segundo

### Reconocimiento de Voz
- **GRATIS** - Usa `@react-native-voice/voice` (nativo del dispositivo)

### Text-to-Speech
- **GRATIS** - Usa `expo-speech` (nativo del dispositivo)

**Total: $0/mes** 🎉

---

## 📞 Soporte

Si sigues teniendo problemas:

1. Revisa la consola del servidor para errores
2. Verifica que todas las dependencias estén instaladas:
   ```bash
   npm install
   ```
3. Limpia la caché:
   ```bash
   npm run dev
   ```

---

## ✅ Checklist Final

- [ ] Archivo `.env` creado en la raíz
- [ ] Variable `EXPO_PUBLIC_GROK_API_KEY` configurada
- [ ] API key obtenida de https://console.groq.com/keys
- [ ] Servidor reiniciado después de configurar
- [ ] Consola muestra "GROK_API_KEY loaded"
- [ ] Chat de IRI funciona correctamente
- [ ] Micrófono funciona (reconocimiento de voz)
- [ ] Voz de IRI funciona (text-to-speech)

---

**Última actualización:** Noviembre 2025
