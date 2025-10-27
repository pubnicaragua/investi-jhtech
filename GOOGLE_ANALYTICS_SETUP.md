# 🔥 Configuración de Firebase Analytics (Google Analytics)

## ✅ Por qué Firebase Analytics

- ✅ **Gratis e ilimitado**
- ✅ **Integración nativa con React Native**
- ✅ **Dashboard completo en tiempo real**
- ✅ **Exportación a BigQuery** (para análisis avanzado)
- ✅ **Mejor que Supabase Analytics** (más completo y robusto)

---

## 📋 Paso 1: Crear Proyecto en Firebase

### 1.1 Ir a Firebase Console
```
https://console.firebase.google.com
```

### 1.2 Crear Nuevo Proyecto
1. Click en "Agregar proyecto"
2. Nombre: **Investi App**
3. Habilitar Google Analytics: **SÍ**
4. Cuenta de Analytics: Crear nueva o usar existente
5. Click en "Crear proyecto"

### 1.3 Agregar App Android
1. En el proyecto, click en el ícono de Android
2. Nombre del paquete: `com.jhtech.investi` (verificar en app.config.js)
3. Apodo de la app: **Investi**
4. Click en "Registrar app"

### 1.4 Descargar google-services.json
1. Descargar el archivo `google-services.json`
2. Guardar en la raíz del proyecto:
   ```
   c:\Users\Probook 450 G7\CascadeProjects\investi-jhtech\google-services.json
   ```

---

## 📦 Paso 2: Instalar Dependencias

```bash
# Instalar Firebase
npm install @react-native-firebase/app @react-native-firebase/analytics

# O con yarn
yarn add @react-native-firebase/app @react-native-firebase/analytics
```

---

## ⚙️ Paso 3: Configurar app.config.js

```javascript
export default {
  expo: {
    name: "Investi",
    slug: "investi-jhtech",
    // ... resto de configuración existente
    
    plugins: [
      // Agregar estos plugins
      "@react-native-firebase/app",
      "@react-native-firebase/analytics",
    ],
    
    android: {
      // Agregar esta línea
      googleServicesFile: "./google-services.json",
      
      // ... resto de configuración Android existente
      package: "com.jhtech.investi",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    }
  }
}
```

---

## 🔧 Paso 4: Actualizar analytics.ts

Abrir `src/utils/analytics.ts` y descomentar las líneas de Firebase:

```typescript
// ANTES (comentado):
// import analytics from '@react-native-firebase/analytics';

// DESPUÉS (descomentado):
import analytics from '@react-native-firebase/analytics';

// Y en cada función, descomentar:
// await analytics().logEvent(eventName, params);
```

**Buscar y reemplazar en el archivo**:
```typescript
// Buscar:
// await analytics().logEvent(eventName, params);

// Reemplazar con:
await analytics().logEvent(eventName, params);
```

---

## 🚀 Paso 5: Implementar en Navegación

### 5.1 Encontrar tu Navigator principal

Buscar el archivo donde está `NavigationContainer`, probablemente:
- `src/navigation/AppNavigator.tsx`
- `App.tsx`
- `src/navigation/index.tsx`

### 5.2 Agregar tracking automático

```typescript
import { Analytics } from '../utils/analytics';
import { useNavigationContainerRef } from '@react-navigation/native';

function AppNavigator() {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string>();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.getCurrentRoute()?.name;

        if (previousRouteName !== currentRouteName && currentRouteName) {
          // Track screen view
          await Analytics.logScreenView(currentRouteName);
        }

        // Save the current route name for later comparison
        routeNameRef.current = currentRouteName;
      }}
    >
      {/* Tu navegación aquí */}
    </NavigationContainer>
  );
}
```

---

## 📊 Paso 6: Agregar Eventos en Pantallas Clave

### Ejemplo 1: CourseDetailScreen (Lecciones con IA)

```typescript
import { Analytics } from '../utils/analytics';

const handleStartLesson = async () => {
  if (!selectedLesson) return;

  // Track inicio de lección
  await Analytics.logLessonStart(
    selectedLesson.id, 
    selectedLesson.titulo
  );

  setGeneratingLesson(true);
  try {
    const content = await generateLessonWithAI(
      selectedLesson.titulo,
      selectedLesson.descripcion
    );
    
    // Track generación exitosa
    await Analytics.logLessonAIGenerate(selectedLesson.titulo, true);
    
    setGeneratedContent(content);
  } catch (error) {
    // Track error
    await Analytics.logLessonAIGenerate(selectedLesson.titulo, false);
    await Analytics.logError('Error generando lección', 'AI_GENERATION_ERROR');
  } finally {
    setGeneratingLesson(false);
  }
};
```

### Ejemplo 2: VideoPlayerScreen

```typescript
import { Analytics } from '../utils/analytics';

useEffect(() => {
  // Track cuando se abre el video
  if (videoData) {
    Analytics.logVideoView(videoId, videoData.title);
  }
}, [videoData]);

const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
  if (!status.isLoaded) return;

  const progress = Math.floor((status.positionMillis / status.durationMillis) * 100);
  
  // Track progreso en hitos
  Analytics.logVideoProgress(videoId, progress);

  if (status.didJustFinish) {
    Analytics.logVideoComplete(videoId, Math.floor(status.durationMillis / 1000));
  }
};

const handleLike = async () => {
  await Analytics.logVideoLike(videoId, !isLiked);
  // ... resto del código
};
```

### Ejemplo 3: CreatePostScreen

```typescript
import { Analytics } from '../utils/analytics';

const handlePublish = async () => {
  try {
    // ... código de publicación
    
    await Analytics.logPostCreate(
      postType, 
      hasMedia, 
      communityId
    );
    
    navigation.goBack();
  } catch (error) {
    await Analytics.logError('Error creando post', 'POST_CREATE_ERROR');
  }
};
```

### Ejemplo 4: CommunityDetailScreen

```typescript
import { Analytics } from '../utils/analytics';

const handleJoinCommunity = async () => {
  try {
    await joinCommunity(communityId);
    
    await Analytics.logCommunityJoin(
      communityId, 
      communityName
    );
  } catch (error) {
    await Analytics.logError('Error uniéndose a comunidad');
  }
};
```

### Ejemplo 5: Calculadoras

```typescript
import { Analytics } from '../utils/analytics';

// En AnalizadorRatiosScreen
const calcularRatios = async () => {
  // ... cálculos
  
  await Analytics.logCalculatorUse('ratios', {
    ingresos: parseFloat(ingresos),
    utilidad_neta: utilidadNeta,
  });
};

// En SimuladorJubilacionScreen
const calcularJubilacion = async () => {
  // ... cálculos
  
  await Analytics.logSimulatorUse('jubilacion', {
    edad_actual: edadActual,
    edad_retiro: edadRetiro,
    ahorro_mensual: ahorroMensual,
  });
};
```

---

## 🔐 Paso 7: Configurar User ID al Login

```typescript
// En SignInScreen.tsx o donde manejes el login
import { Analytics } from '../utils/analytics';

const handleLogin = async () => {
  try {
    const { user } = await signIn(email, password);
    
    // Configurar user ID en Analytics
    await Analytics.setUserId(user.id);
    
    // Configurar propiedades del usuario
    await Analytics.setUserProperties({
      age_range: user.age_range,
      country: 'Nicaragua', // o user.country
      investment_experience: user.experience_level,
    });
    
    // Track login
    await Analytics.logLogin('email');
    
    navigation.navigate('Home');
  } catch (error) {
    await Analytics.logError('Error en login', 'LOGIN_ERROR');
  }
};
```

---

## 🏗️ Paso 8: Rebuild de la App

```bash
# Limpiar cache
npx expo start -c

# Build de producción
eas build --platform android --profile production

# O build local
eas build --platform android --profile production --local
```

---

## 📊 Paso 9: Verificar en Firebase Console

### 9.1 Ver Eventos en Tiempo Real
1. Ir a Firebase Console
2. Analytics → DebugView
3. Habilitar modo debug en tu dispositivo:
   ```bash
   adb shell setprop debug.firebase.analytics.app com.jhtech.investi
   ```
4. Abrir la app y realizar acciones
5. Ver eventos aparecer en tiempo real

### 9.2 Dashboard Principal
- **Analytics → Dashboard**: Vista general
- **Analytics → Events**: Todos los eventos
- **Analytics → Conversions**: Eventos clave
- **Analytics → Audiences**: Segmentos de usuarios

---

## 📈 Paso 10: Configurar Reportes para Inversores

### 10.1 Eventos Clave a Monitorear

**Engagement**:
- `screen_view` - Pantallas más visitadas
- `session_start` - Sesiones iniciadas
- `post_create` - Posts creados
- `post_like` - Likes dados
- `post_comment` - Comentarios

**Educación**:
- `lesson_start` - Lecciones iniciadas
- `lesson_complete` - Lecciones completadas
- `lesson_ai_generate` - Lecciones generadas con IA
- `video_start` - Videos iniciados
- `video_complete` - Videos completados

**Comunidades**:
- `join_group` - Uniones a comunidades
- `community_create` - Comunidades creadas

**Herramientas**:
- `calculator_use` - Uso de calculadoras
- `simulator_use` - Uso de simuladores

**Retención**:
- `login` - Logins
- `sign_up` - Registros

### 10.2 Crear Dashboard Personalizado

1. En Firebase Console → Analytics → Custom Dashboards
2. Crear nuevo dashboard: "Investi - Métricas para Inversores"
3. Agregar widgets:
   - **DAU/MAU** - Usuarios activos
   - **Retention Cohorts** - Retención
   - **Top Events** - Eventos más frecuentes
   - **User Engagement** - Tiempo en app
   - **Conversion Funnels** - Flujos de conversión

### 10.3 Exportar a BigQuery (Opcional)

Para análisis avanzado:
1. Firebase Console → Project Settings
2. Integrations → BigQuery
3. Link to BigQuery
4. Seleccionar eventos a exportar
5. Usar SQL para queries personalizadas

---

## 🎯 Eventos Más Importantes para Inversores

### KPIs Principales:

```typescript
// 1. DAU/MAU (Usuarios activos)
// Automático con screen_view

// 2. Retención
await Analytics.logLogin('email'); // Cada login

// 3. Engagement
await Analytics.logPostCreate('text', false);
await Analytics.logPostLike(postId, true);
await Analytics.logPostComment(postId);

// 4. Educación (valor único de Investi)
await Analytics.logLessonComplete(lessonId, duration);
await Analytics.logVideoComplete(videoId, watchTime);

// 5. Crecimiento de comunidades
await Analytics.logCommunityJoin(communityId, communityName);
await Analytics.logCommunityCreate(communityName, 'public');

// 6. Uso de herramientas (diferenciador)
await Analytics.logCalculatorUse('dividendos', { amount: 1000 });
await Analytics.logSimulatorUse('jubilacion', { years: 30 });
```

---

## ✅ Checklist de Implementación

- [ ] Crear proyecto en Firebase Console
- [ ] Descargar `google-services.json`
- [ ] Instalar dependencias (`@react-native-firebase/app` y `analytics`)
- [ ] Configurar `app.config.js`
- [ ] Actualizar `src/utils/analytics.ts` (descomentar Firebase)
- [ ] Agregar tracking en Navigator
- [ ] Agregar eventos en pantallas clave:
  - [ ] CourseDetailScreen (lecciones)
  - [ ] VideoPlayerScreen (videos)
  - [ ] CreatePostScreen (posts)
  - [ ] CommunityDetailScreen (comunidades)
  - [ ] Calculadoras (ratios, dividendos, etc.)
  - [ ] Simuladores (jubilación, portafolio)
- [ ] Configurar User ID en login
- [ ] Rebuild de la app
- [ ] Verificar en DebugView
- [ ] Crear dashboard para inversores
- [ ] Configurar exportación a BigQuery (opcional)

---

## 🆚 Firebase Analytics vs Supabase Analytics

| Característica | Firebase Analytics | Supabase Analytics |
|----------------|-------------------|-------------------|
| **Precio** | Gratis ilimitado | Limitado en plan free |
| **Eventos personalizados** | ✅ Ilimitados | ⚠️ Limitados |
| **Tiempo real** | ✅ Sí | ❌ No |
| **Retención** | ✅ Automática | ⚠️ Manual |
| **Funnels** | ✅ Sí | ❌ No |
| **Exportación** | ✅ BigQuery | ⚠️ CSV |
| **Dashboard** | ✅ Completo | ⚠️ Básico |
| **Integración móvil** | ✅ Nativa | ⚠️ Requiere código |

**Recomendación**: ✅ **Firebase Analytics** es superior para apps móviles.

---

## 📞 Soporte

Si tienes problemas:
1. Verificar que `google-services.json` esté en la raíz
2. Verificar que el package name coincida
3. Limpiar cache: `npx expo start -c`
4. Rebuild completo
5. Verificar logs: `adb logcat | grep Firebase`

---

## 🎓 Recursos

- **Firebase Docs**: https://firebase.google.com/docs/analytics
- **React Native Firebase**: https://rnfirebase.io/analytics/usage
- **BigQuery Export**: https://firebase.google.com/docs/analytics/bigquery-export
- **Dashboard Guide**: https://firebase.google.com/docs/analytics/dashboards

---

## 🚀 Resultado Final

Con Firebase Analytics tendrás:
- ✅ Tracking automático de todas las pantallas
- ✅ Eventos personalizados para cada acción
- ✅ Dashboard en tiempo real
- ✅ Métricas para inversores (DAU, retención, engagement)
- ✅ Exportación a BigQuery para análisis avanzado
- ✅ Todo gratis e ilimitado

**Tiempo de implementación**: 2-3 horas
**Valor para inversores**: ALTO (data completa de usuarios)
