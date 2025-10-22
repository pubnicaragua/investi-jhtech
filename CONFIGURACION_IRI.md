# 🤖 CONFIGURACIÓN DE IRI CHAT (GROK API)

## ✅ **PASOS PARA ACTIVAR EL CHAT CON IRI:**

### 1. **Crear archivo `.env` en la raíz del proyecto**

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
copy .env.example .env
```

### 2. **Agregar tu API Key de Grok**

Abre el archivo `.env` y agrega tu API key:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://paoliakwfoczcallnecf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Grok API Configuration (para Chat con IRI)
EXPO_PUBLIC_GROK_API_KEY=tu-grok-api-key-aqui
```

### 3. **Reiniciar el servidor de desarrollo**

```bash
npm start
```

---

## 🎯 **CARACTERÍSTICAS DEL CHAT IRI:**

✅ **Contexto completo de Investi** - IRI conoce todas las funcionalidades de la app
✅ **Respuestas en tiempo real** - Powered by Grok API (llama-3.3-70b-versatile)
✅ **Educación financiera** - Consejos sobre finanzas, inversiones y ahorro
✅ **Interfaz moderna** - Burbujas de chat con diseño limpio
✅ **Historial de conversación** - Mantiene el contexto de la conversación

---

## 📝 **CONTEXTO QUE IRI CONOCE:**

- **Herramientas financieras:** Planificador Financiero, Caza Hormigas, Generador de Reportes
- **Comunidades:** Públicas, Privadas y de Colegio
- **Metas de ahorro grupales** para giras de estudios
- **Cursos y videos educativos** sobre finanzas
- **Noticias** sobre criptomonedas, inversiones y startups

---

## 🔒 **SEGURIDAD:**

⚠️ **IMPORTANTE:** El archivo `.env` está en `.gitignore` y NO se subirá a GitHub
✅ Cada desarrollador debe tener su propia copia del `.env` con su API key
✅ NUNCA subas el archivo `.env` al repositorio

---

## 🚀 **ACCESO AL CHAT:**

Desde la app, ve a:
**HomeFeed → Botón "Chat con IRI" → IRIChatScreen**

---

## 📞 **SOPORTE:**

Si tienes problemas con la configuración, verifica:
1. ✅ Archivo `.env` existe en la raíz del proyecto
2. ✅ La API key está correctamente copiada (sin espacios)
3. ✅ Reiniciaste el servidor después de crear el `.env`
