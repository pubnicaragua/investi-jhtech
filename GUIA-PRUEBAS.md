# 🧪 Guía Completa de Pruebas Automatizadas - Investi App

## 📋 Scripts de Prueba Disponibles

He creado varios scripts de prueba para validar tu aplicación:

### 1. **test-api.js** - Verificación básica del proyecto
```bash
node test-api.js
```
**Qué hace:**
- Verifica estructura de archivos
- Confirma configuración de variables de entorno
- Lista pantallas disponibles (44 encontradas)
- Valida dependencias críticas

### 2. **test-supabase-real.js** - Pruebas completas de base de datos
```bash
node test-supabase-real.js
```
**Qué hace:**
- ✅ Conexión a Supabase
- ✅ Verificación de esquema de BD
- ✅ Creación y gestión de usuarios
- ✅ Operaciones CRUD de posts
- ✅ Sistema de likes y comentarios
- ✅ Consulta de comunidades, noticias, cursos
- ✅ Limpieza automática de datos de prueba

### 3. **quick-test.js** - Prueba rápida de conectividad
```bash
node quick-test.js
```
**Qué hace:**
- Verificación rápida de conexión a Supabase
- Ideal para diagnóstico rápido

## 🚀 Cómo Ejecutar las Pruebas

### Opción 1: Desde la terminal
```bash
# Navegar al directorio del proyecto
cd "c:\Users\invit\Downloads\investi-app"

# Ejecutar prueba básica
node test-api.js

# Ejecutar pruebas completas de Supabase
node test-supabase-real.js

# Prueba rápida
node quick-test.js
```

### Opción 2: Usando el script batch (Windows)
```bash
# Doble clic en el archivo o desde cmd:
run-tests.bat
```

### Opción 3: Desde PowerShell
```powershell
# Abrir PowerShell en el directorio del proyecto
Set-Location "c:\Users\invit\Downloads\investi-app"
node test-supabase-real.js
```

## 📊 Interpretando los Resultados

### ✅ Resultado Exitoso
```
[timestamp] ✅ PASÓ: Conexión a Supabase
[timestamp] ✅ PASÓ: Creación de usuario
📊 RESUMEN FINAL DE PRUEBAS:
✅ Pruebas exitosas: 12
❌ Pruebas fallidas: 0
📈 Porcentaje de éxito: 100.0%
🎉 ¡Todas las pruebas pasaron! Tu aplicación está 100% funcional.
```

### ❌ Resultado con Errores
```
[timestamp] ❌ FALLÓ: Conexión a Supabase - Error message
📊 RESUMEN FINAL DE PRUEBAS:
✅ Pruebas exitosas: 8
❌ Pruebas fallidas: 4
📈 Porcentaje de éxito: 66.7%
⚠️ Algunas pruebas fallaron. Revisa los detalles arriba.
```

## 🔧 Configuración Verificada

### Variables de Entorno (.env)
```
EXPO_PUBLIC_SUPABASE_URL=https://paoliakwfoczcallnecf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Pantallas Detectadas (44 total)
- ChatListScreen.tsx
- CommunityDetailScreen.tsx
- CommunityRecommendationsScreen.tsx
- CourseDetailScreen.tsx
- CreatePostScreen.tsx
- DevMenuScreen.tsx
- EducacionScreen.tsx
- HomeFeedScreen.tsx
- InversionesScreen.tsx
- MarketInfoScreen.tsx
- NewsScreen.tsx
- PaymentScreen.tsx
- ProfileScreen.tsx
- PromotionsScreen.tsx
- SettingsScreen.tsx
- SignInScreen.tsx
- SignUpScreen.tsx
- WelcomeScreen.tsx
- Y 26 pantallas más...

## 🎯 Cobertura de Pruebas

### Funcionalidades Probadas
1. **Autenticación**
   - Registro de usuarios
   - Inicio de sesión
   - Gestión de perfiles

2. **Contenido**
   - Creación de posts
   - Sistema de likes
   - Comentarios
   - Feed de publicaciones

3. **Comunidades**
   - Listado de comunidades
   - Unión a comunidades

4. **Educación**
   - Cursos disponibles
   - Lecciones por curso

5. **Noticias y Promociones**
   - Listado de noticias
   - Promociones activas

6. **Base de Datos**
   - Conectividad
   - Operaciones CRUD
   - Integridad de datos

## 🛠️ Solución de Problemas

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Error: "Connection failed"
- Verificar variables de entorno en .env
- Confirmar conectividad a internet
- Validar credenciales de Supabase

### Error: "Table doesn't exist"
- Verificar que las tablas estén creadas en Supabase
- Confirmar permisos de la API key

## 📈 Métricas de Rendimiento

### Tiempo Estimado de Ejecución
- **test-api.js**: ~5 segundos
- **quick-test.js**: ~2 segundos  
- **test-supabase-real.js**: ~30-60 segundos

### Recursos Utilizados
- Crea usuarios de prueba temporales
- Genera posts de prueba
- Limpia automáticamente los datos

## 🔄 Automatización Continua

Para ejecutar pruebas regularmente:

### Script Diario
```bash
# Crear un archivo daily-tests.bat
@echo off
echo Ejecutando pruebas diarias...
cd "c:\Users\invit\Downloads\investi-app"
node test-supabase-real.js
echo Pruebas completadas: %date% %time% >> test-log.txt
```

### Integración con CI/CD
Los scripts están listos para integrarse con:
- GitHub Actions
- Azure DevOps
- Jenkins
- Cualquier sistema de CI/CD

## 📞 Soporte

Si encuentras problemas:
1. Ejecuta `node quick-test.js` para diagnóstico rápido
2. Verifica que todas las dependencias estén instaladas
3. Confirma que el servidor de desarrollo esté corriendo
4. Revisa los logs detallados en la consola

---

**¡Tu aplicación Investi está lista para pruebas automatizadas completas!** 🚀
