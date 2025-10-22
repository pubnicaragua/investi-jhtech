# 🤖 INSTRUCCIONES PARA ACTIVAR CHAT IRI CON GROK

## ⚡ **MÉTODO RÁPIDO (RECOMENDADO):**

### **Opción 1: Ejecutar script PowerShell**

```powershell
.\crear-env.ps1
```

Esto creará automáticamente el archivo `.env` con la API key configurada.

---

### **Opción 2: Manual**

1. **Copia el archivo `.env.example` y renómbralo a `.env`**

2. **Abre el archivo `.env` y agrega tu API key:**

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://paoliakwfoczcallnecf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Grok API Configuration (para Chat con IRI)
EXPO_PUBLIC_GROK_API_KEY=tu-grok-api-key-aqui
```

3. **Guarda el archivo**

4. **Reinicia el servidor:**

```bash
npm start
```

---

## 🔒 **SEGURIDAD - MUY IMPORTANTE:**

✅ **El archivo `.env` está en `.gitignore`**  
✅ **NO se subirá a GitHub automáticamente**  
✅ **Es seguro tener la API key en `.env`**

### **Verificar que .env NO se suba:**

```bash
git status
```

Si ves `.env` en la lista, ejecuta:

```bash
git rm --cached .env
```

---

## 🎯 **CÓMO USAR EL CHAT IRI:**

1. Abre la app Investi
2. Ve a **HomeFeed**
3. Toca el botón **"Chat con IRI"**
4. ¡Empieza a chatear!

---

## 🐛 **SOLUCIÓN DE PROBLEMAS:**

### **Error: "La API key de Grok no está configurada"**

**Solución:**
1. Verifica que el archivo `.env` existe en la raíz del proyecto
2. Verifica que la línea `GROK_API_KEY=...` está presente
3. Reinicia el servidor: `npm start`

### **El chat no responde**

**Solución:**
1. Verifica tu conexión a internet
2. Verifica que la API key es correcta
3. Revisa los logs en la consola

---

## 📝 **NOTAS:**

- La API key se obtiene en: https://console.groq.com
- Modelo usado: `llama-3.3-70b-versatile`
- IRI tiene contexto completo de la app Investi
- Responde preguntas sobre finanzas, inversiones y la app
