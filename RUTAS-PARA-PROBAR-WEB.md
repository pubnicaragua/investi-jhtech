# 🌐 RUTAS PARA PROBAR EN WEB - ORDEN LÓGICO

## 📋 FLUJO COMPLETO DE LA APP

### 🔗 BASE URL: http://localhost:8081

---

## 1️⃣ **FLUJO DE AUTENTICACIÓN**
```
http://localhost:8081/language-selection
http://localhost:8081/welcome
http://localhost:8081/signin
http://localhost:8081/signup
```

## 2️⃣ **ONBOARDING (Después de registro)**
```
http://localhost:8081/upload-avatar
http://localhost:8081/pick-goals
http://localhost:8081/pick-interests
http://localhost:8081/pick-knowledge
http://localhost:8081/community-recommendations
```

## 3️⃣ **PANTALLAS PRINCIPALES**
```
http://localhost:8081/home
http://localhost:8081/create-post
http://localhost:8081/communities
http://localhost:8081/chats
http://localhost:8081/notifications
http://localhost:8081/settings
```

## 4️⃣ **PERFILES Y POSTS**
```
http://localhost:8081/profile
http://localhost:8081/profile/123
http://localhost:8081/post/b0150eb7-8d24-4486-8447-e91937ce38fd
http://localhost:8081/saved-posts
```

## 5️⃣ **COMUNIDADES**
```
http://localhost:8081/communities
http://localhost:8081/community/1
```

## 6️⃣ **EDUCACIÓN E INVERSIONES**
```
http://localhost:8081/educacion
http://localhost:8081/inversiones
http://localhost:8081/inversionista
http://localhost:8081/market-info
http://localhost:8081/learning-paths
http://localhost:8081/course/1
```

## 7️⃣ **PROMOCIONES Y NOTICIAS**
```
http://localhost:8081/promotions
http://localhost:8081/promotion/1
http://localhost:8081/news
http://localhost:8081/news/1
```

## 8️⃣ **HERRAMIENTAS FINANCIERAS**
```
http://localhost:8081/planificador-financiero
http://localhost:8081/caza-hormigas
```

## 9️⃣ **CHAT Y MENSAJES**
```
http://localhost:8081/messages
http://localhost:8081/chat
http://localhost:8081/chat/1
```

## 🔟 **DESARROLLO (Solo en dev)**
```
http://localhost:8081/dev-menu
```

---

## 🎯 **ORDEN RECOMENDADO PARA PROBAR:**

### **PASO 1: Flujo básico**
1. `/language-selection` - Selección de idioma
2. `/welcome` - Pantalla de bienvenida
3. `/signin` - Iniciar sesión
4. `/home` - Pantalla principal

### **PASO 2: Funcionalidades principales**
5. `/create-post` - Crear publicación
6. `/communities` - Ver comunidades
7. `/chats` - Lista de chats
8. `/notifications` - Notificaciones

### **PASO 3: Contenido específico**
9. `/post/b0150eb7-8d24-4486-8447-e91937ce38fd` - Detalle de post
10. `/community/1` - Detalle de comunidad
11. `/profile` - Perfil de usuario

### **PASO 4: Educación e inversiones**
12. `/educacion` - Sección educativa
13. `/inversiones` - Inversiones
14. `/market-info` - Info del mercado

### **PASO 5: Herramientas avanzadas**
15. `/planificador-financiero` - Planificador
16. `/caza-hormigas` - Caza hormigas
17. `/promotions` - Promociones

---

## ✅ **QUÉ VALIDAR EN CADA RUTA:**

- ✅ **Carga correctamente** (sin errores 404)
- ✅ **UI se ve bien** (no rota)
- ✅ **Navegación funciona** (botones responden)
- ✅ **No hay errores en consola** (F12)
- ✅ **Responsive** (se adapta al tamaño)

---

## 🚨 **SI UNA RUTA NO FUNCIONA:**

1. **Error 404**: La ruta no está configurada
2. **Pantalla blanca**: Error en el componente
3. **Error en consola**: Problema de código
4. **No responde**: Problema de navegación

---

## 📱 **DESPUÉS DE VALIDAR WEB:**

Una vez que todas las rutas funcionen en web:
1. El problema estará identificado
2. Podremos corregir lo que falle
3. Después probar en móvil
4. Build final funcionará al 100%
