# 📊 Análisis de Pantallas y Configuración de Analytics

## 🔍 Análisis de Pantallas

### 1. **AnalizadorRatiosScreen** ✅ MANTENER
**Propósito**: Calculadora financiera profesional
- Calcula ratios financieros (liquidez, rentabilidad, endeudamiento)
- Inputs: Estado de resultados, balance general, flujo de caja
- Output: Ratios con interpretación y colores
- **Uso**: Herramienta educativa para análisis financiero
- **Decisión**: ✅ **MANTENER** - Es útil para educación financiera

---

### 2. **CalculadoraDividendosScreen** ✅ MANTENER
**Propósito**: Calculadora de dividendos
- Calcula rendimiento de dividendos
- Proyecciones de ingresos pasivos
- **Uso**: Herramienta para inversores
- **Decisión**: ✅ **MANTENER** - Relevante para el app

---

### 3. **CalculadoraInteresesScreen** ✅ MANTENER (VERIFICAR)
**Propósito**: Calculadora de interés compuesto
- Calcula crecimiento de inversiones
- Interés simple vs compuesto
- **Uso**: Educación financiera
- **Decisión**: ✅ **MANTENER** - Útil para planificación

---

### 4. **ComparadorInversionScreen** ✅ MANTENER (VERIFICAR)
**Propósito**: Compara diferentes opciones de inversión
- Compara ROI de distintas inversiones
- Análisis comparativo
- **Uso**: Toma de decisiones de inversión
- **Decisión**: ✅ **MANTENER** - Herramienta valiosa

---

### 5. **LearningPadScreen** ❓ VERIFICAR
**Propósito**: NO ENCONTRADO en el proyecto
- Posiblemente eliminado o renombrado
- **Decisión**: ❓ **VERIFICAR** si existe en el Navigator

---

### 6. **ManageModeratorScreen** ❓ VERIFICAR
**Propósito**: NO ENCONTRADO en el proyecto
- Gestión de moderadores de comunidades
- **Decisión**: ❓ **VERIFICAR** si está implementado

---

### 7. **NewsDetailScreen** ✅ MANTENER
**Propósito**: Detalle de noticias financieras
- Muestra contenido completo de noticias
- Navegación desde feed de noticias
- **Uso**: Educación e información financiera
- **Decisión**: ✅ **MANTENER** - Importante para contenido

---

### 8. **NotificationSettingScreen vs NotificationScreen**
**NotificationSettingScreen**: ❓ NO ENCONTRADO
**NotificationScreen**: ✅ EXISTE
- **NotificationScreen**: Lista de notificaciones del usuario
- **NotificationSettingScreen**: Configuración de notificaciones (no encontrado)
- **Decisión**: ✅ **MANTENER NotificationScreen**, verificar si falta settings

---

### 9. **PaymentScreen** ❌ REMOVER
**Propósito**: Pantalla de pagos/suscripciones
- **Estado**: No implementado completamente
- **Decisión**: ❌ **REMOVER del Navigator** si no hay monetización aún

---

### 10. **PendingRequestScreen** ❓ NO ENCONTRADO
**Propósito**: Solicitudes pendientes (conexiones, comunidades)
- **Decisión**: ❓ **VERIFICAR** si existe

---

### 11. **SimuladorJubilacionScreen** ✅ MANTENER
**Propósito**: Simulador de jubilación/retiro
- Calcula cuánto necesitas ahorrar para el retiro
- Proyecciones a largo plazo
- **Uso**: Planificación financiera a largo plazo
- **Decisión**: ✅ **MANTENER** - Muy relevante para Nicaragua

---

### 12. **SimuladorPortafolioScreen** ✅ MANTENER
**Propósito**: Simulador de portafolio de inversiones
- Diversificación de activos
- Análisis de riesgo/retorno
- **Uso**: Educación sobre portafolios
- **Decisión**: ✅ **MANTENER** - Herramienta educativa valiosa

---

## 📊 Integración de Analytics

### Opción 1: Google Analytics 4 (GA4) ✅ RECOMENDADO

#### Instalación:
```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
npx expo install expo-firebase-analytics
```

#### Configuración:

**1. Crear proyecto en Firebase:**
- Ir a https://console.firebase.google.com
- Crear nuevo proyecto
- Agregar app Android
- Descargar `google-services.json`

**2. Configurar en el proyecto:**

```javascript
// app.config.js
export default {
  expo: {
    // ... configuración existente
    plugins: [
      '@react-native-firebase/app',
      '@react-native-firebase/analytics',
    ],
    android: {
      googleServicesFile: './google-services.json',
      // ... resto de config
    }
  }
}
```

**3. Crear wrapper de Analytics:**

```typescript
// src/utils/analytics.ts
import analytics from '@react-native-firebase/analytics';

export const Analytics = {
  // Eventos de navegación
  logScreenView: async (screenName: string, screenClass?: string) => {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  },

  // Eventos de usuario
  logLogin: async (method: string) => {
    await analytics().logLogin({ method });
  },

  logSignUp: async (method: string) => {
    await analytics().logSignUp({ method });
  },

  // Eventos personalizados
  logEvent: async (eventName: string, params?: Record<string, any>) => {
    await analytics().logEvent(eventName, params);
  },

  // Eventos de contenido
  logSelectContent: async (contentType: string, itemId: string) => {
    await analytics().logSelectContent({
      content_type: contentType,
      item_id: itemId,
    });
  },

  // Eventos de comunidad
  logJoinCommunity: async (communityId: string, communityName: string) => {
    await analytics().logEvent('join_community', {
      community_id: communityId,
      community_name: communityName,
    });
  },

  // Eventos de inversión
  logInvestmentSimulation: async (type: string, amount: number) => {
    await analytics().logEvent('investment_simulation', {
      simulation_type: type,
      amount: amount,
    });
  },

  // Eventos de lecciones
  logLessonStart: async (lessonId: string, lessonTitle: string) => {
    await analytics().logEvent('lesson_start', {
      lesson_id: lessonId,
      lesson_title: lessonTitle,
    });
  },

  logLessonComplete: async (lessonId: string, duration: number) => {
    await analytics().logEvent('lesson_complete', {
      lesson_id: lessonId,
      duration_seconds: duration,
    });
  },

  // Eventos de video
  logVideoStart: async (videoId: string, videoTitle: string) => {
    await analytics().logEvent('video_start', {
      video_id: videoId,
      video_title: videoTitle,
    });
  },

  logVideoComplete: async (videoId: string, watchTime: number) => {
    await analytics().logEvent('video_complete', {
      video_id: videoId,
      watch_time_seconds: watchTime,
    });
  },

  // Eventos de posts
  logPostCreate: async (postType: string, hasMedia: boolean) => {
    await analytics().logEvent('post_create', {
      post_type: postType,
      has_media: hasMedia,
    });
  },

  logPostLike: async (postId: string) => {
    await analytics().logEvent('post_like', { post_id: postId });
  },

  logPostComment: async (postId: string) => {
    await analytics().logEvent('post_comment', { post_id: postId });
  },

  // Eventos de calculadoras
  logCalculatorUse: async (calculatorType: string, result: number) => {
    await analytics().logEvent('calculator_use', {
      calculator_type: calculatorType,
      result_value: result,
    });
  },

  // Propiedades de usuario
  setUserId: async (userId: string) => {
    await analytics().setUserId(userId);
  },

  setUserProperties: async (properties: Record<string, any>) => {
    await analytics().setUserProperties(properties);
  },
};
```

**4. Implementar en navegación:**

```typescript
// src/navigation/AppNavigator.tsx
import { Analytics } from '../utils/analytics';

function AppNavigator() {
  const navigationRef = useNavigationContainerRef();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        // Track initial screen
        const currentRoute = navigationRef.getCurrentRoute();
        if (currentRoute) {
          Analytics.logScreenView(currentRoute.name);
        }
      }}
      onStateChange={async () => {
        const currentRoute = navigationRef.getCurrentRoute();
        if (currentRoute) {
          await Analytics.logScreenView(currentRoute.name);
        }
      }}
    >
      {/* ... tus screens */}
    </NavigationContainer>
  );
}
```

**5. Usar en componentes:**

```typescript
// Ejemplo en CourseDetailScreen.tsx
import { Analytics } from '../utils/analytics';

const handleStartLesson = async () => {
  // Track evento
  await Analytics.logLessonStart(selectedLesson.id, selectedLesson.titulo);
  
  // ... resto del código
};
```

---

### Opción 2: Microsoft Clarity ✅ RECOMENDADO ADICIONAL

**¿Se puede usar Clarity en React Native?**
- ❌ **NO directamente** - Clarity es para web
- ✅ **SÍ con WebView** - Si tienes secciones web en tu app
- ✅ **ALTERNATIVA**: Usar para el sitio web de marketing de Investi

**Mejor opción para móvil nativo:**
- **Mixpanel** - Analytics avanzado con funnels
- **Amplitude** - Analytics de producto
- **Firebase Analytics** - Gratis e integrado con Google

---

### Opción 3: Mixpanel (Alternativa Premium)

```bash
npm install mixpanel-react-native
```

**Ventajas:**
- ✅ Funnels de conversión
- ✅ Cohort analysis
- ✅ A/B testing
- ✅ Retención de usuarios
- ✅ Dashboard en tiempo real

**Desventajas:**
- ❌ Pago después de 100k eventos/mes

---

## 🎯 Recomendación Final

### Para Investi App:

**1. Google Analytics 4 (Firebase)** - PRINCIPAL
- ✅ Gratis
- ✅ Integración nativa con React Native
- ✅ Dashboard completo
- ✅ Exportación a BigQuery
- ✅ Integración con Google Ads

**2. Mixpanel** - COMPLEMENTARIO (opcional)
- ✅ Para análisis avanzado de producto
- ✅ Funnels de conversión
- ✅ Retención de usuarios

**3. Microsoft Clarity** - PARA WEB
- ✅ Usar en el sitio web de marketing
- ✅ Heatmaps y session recordings
- ✅ Gratis ilimitado

---

## 📈 Eventos Clave para Trackear

### Onboarding:
- `app_open` - Primera vez que abre la app
- `signup_start` - Inicia registro
- `signup_complete` - Completa registro
- `onboarding_complete` - Completa onboarding

### Engagement:
- `screen_view` - Vista de pantalla
- `post_create` - Crea publicación
- `post_like` - Da like
- `post_comment` - Comenta
- `community_join` - Se une a comunidad
- `user_follow` - Sigue a usuario

### Educación:
- `lesson_start` - Inicia lección
- `lesson_complete` - Completa lección
- `video_start` - Inicia video
- `video_complete` - Completa video
- `calculator_use` - Usa calculadora

### Inversión:
- `simulation_start` - Inicia simulación
- `simulation_complete` - Completa simulación
- `investment_interest` - Muestra interés en inversión

### Retención:
- `daily_active_user` - Usuario activo diario
- `session_start` - Inicia sesión
- `session_end` - Termina sesión

---

## 🚀 Plan de Implementación

### Fase 1: Setup (1-2 horas)
1. Crear proyecto en Firebase
2. Instalar dependencias
3. Configurar `google-services.json`
4. Crear wrapper de Analytics

### Fase 2: Eventos Básicos (2-3 horas)
1. Tracking de navegación
2. Eventos de autenticación
3. Eventos de contenido

### Fase 3: Eventos Avanzados (3-4 horas)
1. Eventos de comunidades
2. Eventos de lecciones/videos
3. Eventos de calculadoras
4. Eventos de simuladores

### Fase 4: Dashboard (1 hora)
1. Configurar eventos personalizados en Firebase
2. Crear reportes en Analytics
3. Configurar alertas

---

## 📊 Métricas para Inversores

### KPIs Principales:
1. **DAU/MAU** - Usuarios activos diarios/mensuales
2. **Retention Rate** - Tasa de retención (D1, D7, D30)
3. **Session Duration** - Duración promedio de sesión
4. **Engagement Rate** - Posts, likes, comentarios por usuario
5. **Lesson Completion Rate** - % de lecciones completadas
6. **Community Growth** - Crecimiento de comunidades
7. **User Growth Rate** - Tasa de crecimiento de usuarios
8. **Feature Adoption** - Uso de calculadoras, simuladores

### Reportes para Inversores:
```
📊 Reporte Mensual:
- Usuarios nuevos: X
- Usuarios activos: Y
- Retención D30: Z%
- Engagement rate: W%
- Lecciones completadas: N
- Posts creados: M
- Tiempo promedio en app: T minutos
```

---

## ✅ Checklist de Implementación

- [ ] Crear proyecto en Firebase Console
- [ ] Descargar `google-services.json`
- [ ] Instalar dependencias de Firebase
- [ ] Configurar `app.config.js`
- [ ] Crear `src/utils/analytics.ts`
- [ ] Implementar tracking de navegación
- [ ] Agregar eventos en pantallas clave
- [ ] Probar en desarrollo
- [ ] Verificar eventos en Firebase Console
- [ ] Configurar dashboard para inversores
- [ ] Documentar eventos personalizados
