# 🧪 GUÍA RÁPIDA DE TESTING - INVESTÍ

## ⚡ Testing en 5 Minutos

### 1️⃣ OAuth - Google & LinkedIn (2 min)

**Probar Google OAuth:**
```bash
1. Abrir app en dispositivo/emulador
2. Ir a pantalla de Login
3. Hacer clic en botón de Google
4. ✅ Verificar: Aparece mensaje "Conectando con Google..."
5. ✅ Verificar: Se abre navegador con login de Google
6. Autorizar la aplicación
7. ✅ Verificar: Redirección exitosa a Onboarding/HomeFeed
```

**Probar LinkedIn OAuth:**
```bash
1. En pantalla de Login
2. Hacer clic en botón de LinkedIn
3. ✅ Verificar: Aparece mensaje "Conectando con LinkedIn..."
4. ✅ Verificar: Se abre navegador con login de LinkedIn
5. Autorizar la aplicación
6. ✅ Verificar: Redirección exitosa
```

**Indicadores de Éxito:**
- ✅ Mensaje de carga visible con fondo azul claro
- ✅ Texto: "Conectando con [Proveedor]..."
- ✅ Subtexto: "Por favor espera, esto puede tardar unos segundos"
- ✅ Spinner de carga animado
- ✅ Navegador se abre correctamente
- ✅ Callback procesa sin errores

---

### 2️⃣ Cursos con IA (2 min)

**Probar Generación Automática:**
```bash
1. Ir a pantalla de Educación
2. Seleccionar tab "Cursos"
3. Hacer clic en cualquier curso
4. Hacer clic en una lección
5. ✅ Verificar: Aparece "🤖 IRI está generando el contenido..."
6. Esperar 3-5 segundos
7. ✅ Verificar: Contenido se genera y muestra
```

**Probar Generación Manual (Opcional):**
```typescript
// En consola de desarrollo o en código temporal
import { generateCourseContent } from './src/services/courseAutomationService'

// Obtener ID de un curso desde Supabase
const courseId = 'tu-course-id-aqui'
const result = await generateCourseContent(courseId)

console.log('✅ Generadas:', result.generated)
console.log('❌ Fallidas:', result.failed)
```

**Indicadores de Éxito:**
- ✅ Mensaje "IRI está generando..." visible
- ✅ Spinner de carga mostrado
- ✅ Contenido se genera en 3-10 segundos
- ✅ Contenido tiene estructura (emojis, secciones)
- ✅ Contenido se guarda en BD
- ✅ Si falla, muestra contenido de respaldo

---

### 3️⃣ MarketInfo (1 min)

**Probar Carga de Datos:**
```bash
1. Ir a pantalla MarketInfo
2. Pull-to-refresh (deslizar hacia abajo)
3. ✅ Verificar: Aparece "Cargando datos del mercado..."
4. Esperar carga (puede tardar si es primera vez)
5. ✅ Verificar: Se muestran acciones con precios
6. ✅ Verificar: Contador muestra "📊 X acciones cargadas"
```

**Probar Filtros:**
```bash
1. Hacer clic en filtro "Chile"
2. ✅ Verificar: Solo aparecen acciones chilenas (SQM, COPEC, etc.)
3. Hacer clic en filtro "Tecnología"
4. ✅ Verificar: Solo aparecen tech stocks (AAPL, GOOGL, etc.)
```

**Probar Búsqueda:**
```bash
1. Escribir "AAPL" en barra de búsqueda
2. ✅ Verificar: Solo aparece Apple
3. Escribir "Google"
4. ✅ Verificar: Aparece GOOGL
```

**Indicadores de Éxito:**
- ✅ Al menos 100+ acciones cargadas (ideal 200+)
- ✅ Precios se muestran correctamente
- ✅ Cambios porcentuales con colores (verde/rojo)
- ✅ Logos de empresas visibles
- ✅ Filtros funcionan correctamente
- ✅ Búsqueda es instantánea

---

## 🔍 Health Checks Automáticos

### Verificar MarketInfo
```typescript
import { checkMarketInfoHealth, generateHealthReport } from './src/services/marketHealthCheck'

const health = await checkMarketInfoHealth()
console.log(generateHealthReport(health))

// Salida esperada:
// ✅ Estado de MarketInfo: HEALTHY
// 🔑 API Key: Configurada ✅, Válida ✅
// 🌐 Conectividad: Alcanzable ✅, 245ms
// 📊 Calidad de Datos: 215 acciones disponibles
```

### Verificar Estado de Curso
```typescript
import { checkCourseContentStatus } from './src/services/courseAutomationService'

const status = await checkCourseContentStatus('course-id')
console.log(`${status.withContent}/${status.totalLessons} lecciones (${status.percentage}%)`)

// Salida esperada:
// 10/10 lecciones (100%)
```

---

## 🚨 Troubleshooting Rápido

### OAuth no funciona
```bash
❌ Problema: Botón no hace nada
✅ Solución: Verificar logs en consola, revisar configuración de Supabase

❌ Problema: Error "No se recibió URL"
✅ Solución: Verificar que el provider esté habilitado en Supabase Auth

❌ Problema: Callback falla
✅ Solución: Verificar URL de callback en configuración del provider
```

### Lecciones no se generan
```bash
❌ Problema: Mensaje de error "API key no configurada"
✅ Solución: Agregar EXPO_PUBLIC_GROK_API_KEY en .env

❌ Problema: Timeout o error 429
✅ Solución: Esperar 1 minuto (rate limit), el sistema reintentará

❌ Problema: Contenido vacío
✅ Solución: Sistema usa contenido de respaldo automáticamente
```

### MarketInfo no carga
```bash
❌ Problema: "No se pudieron cargar los datos"
✅ Solución: Ejecutar health check, verificar API key

❌ Problema: Solo 0-50 acciones
✅ Solución: Rate limit alcanzado, esperar 1 minuto y refrescar

❌ Problema: Caché vacío
✅ Solución: Primera carga tarda ~5-10 min (200+ acciones)
```

---

## ✅ Checklist de Producción

### Antes de Lanzar
- [ ] Variables de entorno configuradas (.env)
  - [ ] EXPO_PUBLIC_SUPABASE_URL
  - [ ] EXPO_PUBLIC_SUPABASE_ANON_KEY
  - [ ] EXPO_PUBLIC_GROK_API_KEY
  - [ ] EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY

- [ ] OAuth configurado en Supabase
  - [ ] Google OAuth habilitado
  - [ ] LinkedIn OAuth habilitado
  - [ ] URLs de callback configuradas

- [ ] Cursos con contenido
  - [ ] Al menos 3 cursos con lecciones generadas
  - [ ] Verificar que generación automática funciona
  - [ ] Probar contenido de respaldo

- [ ] MarketInfo operacional
  - [ ] Health check pasa (status: healthy/degraded)
  - [ ] Al menos 100+ acciones disponibles
  - [ ] Cache funciona correctamente

### Testing en Dispositivo Real
- [ ] OAuth funciona en iOS
- [ ] OAuth funciona en Android
- [ ] Generación de lecciones funciona
- [ ] MarketInfo carga datos
- [ ] Navegación fluida
- [ ] Sin crashes

---

## 📊 Métricas de Éxito

### OAuth
- **Tasa de éxito esperada:** 95%+
- **Tiempo de autenticación:** 3-10 segundos
- **Errores aceptables:** <5%

### Cursos con IA
- **Tasa de generación exitosa:** 90%+ (con reintentos)
- **Tiempo de generación:** 3-10 segundos por lección
- **Uso de fallback:** <10%

### MarketInfo
- **Acciones disponibles:** 100-250
- **Tiempo de carga inicial:** 5-15 minutos (primera vez)
- **Tiempo de carga con cache:** <2 segundos
- **Tasa de actualización exitosa:** 85%+

---

## 🎯 Testing Completo (30 min)

### Fase 1: Setup (5 min)
1. Verificar .env tiene todas las keys
2. Ejecutar `npm install` si es necesario
3. Limpiar cache: `npx expo start -c`
4. Abrir app en emulador/dispositivo

### Fase 2: OAuth (10 min)
1. Probar Google OAuth (3 intentos)
2. Probar LinkedIn OAuth (3 intentos)
3. Verificar creación de perfil en Supabase
4. Probar logout y re-login
5. Verificar estados de carga

### Fase 3: Cursos (10 min)
1. Abrir 5 lecciones diferentes
2. Verificar generación automática
3. Verificar guardado en BD
4. Probar con/sin conexión
5. Verificar contenido de respaldo

### Fase 4: MarketInfo (5 min)
1. Ejecutar health check
2. Cargar datos (pull-to-refresh)
3. Probar todos los filtros
4. Probar búsqueda
5. Verificar navegación a simulador

---

## 📝 Reporte de Testing

```
FECHA: _______________
TESTER: _______________

OAUTH:
[ ] Google funciona correctamente
[ ] LinkedIn funciona correctamente
[ ] Estados de carga visibles
[ ] Errores manejados correctamente

CURSOS:
[ ] Generación automática funciona
[ ] Contenido se guarda en BD
[ ] Reintentos funcionan
[ ] Fallback disponible

MARKETINFO:
[ ] Datos se cargan correctamente
[ ] Filtros operacionales
[ ] Búsqueda funcional
[ ] Health check pasa

NOTAS:
_________________________________
_________________________________
_________________________________

ESTADO FINAL: [ ] APROBADO [ ] RECHAZADO
```

---

**Última actualización:** 30 de Diciembre, 2024  
**Versión:** 1.0.0
