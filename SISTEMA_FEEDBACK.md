# 📝 Sistema de Feedback de Usuario

## 🎯 Objetivo
Capturar feedback de los usuarios en dos momentos clave:
1. **Cada 10 minutos** durante el uso de la app (feedback periódico)
2. **Al cerrar sesión** (feedback de salida)

## 🔗 Google Form
**URL del formulario:** https://docs.google.com/forms/d/1aP_FWu1pqx_f9644p701kW_uuPKq4lz13v4hjuHXFOc/edit

**URL embebida:** https://docs.google.com/forms/d/e/1FAIpQLSfaP_FWu1pqx_f9644p701kW_uuPKq4lz13v4hjuHXFOc/viewform?embedded=true

## 📦 Componentes Implementados

### 1. FeedbackModal Component
**Archivo:** `src/components/FeedbackModal.tsx`

**Características:**
- Modal responsive que muestra el Google Form embebido
- Soporte para web (iframe) y mobile (WebView)
- Dos tipos de mensajes según contexto:
  - **Periódico:** "¿Cómo va tu experiencia? 🚀"
  - **Logout:** "¡Gracias por usar Investí! 💙"
- Botones:
  - "Ahora no" / "Cerrar sesión sin feedback"
  - "Abrir en navegador" (solo mobile)

**Props:**
```typescript
interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'periodic' | 'logout';
}
```

### 2. AuthContext Integration
**Archivo:** `src/contexts/AuthContext.tsx`

**Cambios:**
- Agregado estado `feedbackModalVisible` y `feedbackType`
- Función `showFeedbackModal(type)` exportada en el contexto
- Timer que dispara el modal cada 10 minutos cuando el usuario está autenticado
- Modal renderizado globalmente en el Provider

**Código del timer:**
```typescript
useEffect(() => {
  if (!isAuthenticated) return;

  const FEEDBACK_INTERVAL = 10 * 60 * 1000; // 10 minutos
  const timer = setInterval(() => {
    console.log('[AuthContext] 📝 Mostrando feedback periódico');
    showFeedbackModal('periodic');
  }, FEEDBACK_INTERVAL);

  return () => clearInterval(timer);
}, [isAuthenticated, showFeedbackModal]);
```

### 3. Sidebar Integration
**Archivo:** `src/components/Sidebar.tsx`

**Cambios:**
- Importado `showFeedbackModal` desde `useAuth()`
- Al hacer logout, se muestra el modal de feedback
- Delay de 2 segundos para que el usuario vea el modal antes de cerrar sesión

**Flujo de logout:**
1. Usuario confirma cerrar sesión
2. Se cierra el sidebar
3. Se muestra modal de feedback tipo 'logout'
4. Después de 2 segundos, se ejecuta el logout completo

## 🎨 Diseño del Modal

### Colores
- Overlay: `rgba(0, 0, 0, 0.5)`
- Fondo: `#fff`
- Botón primario: `#2673f3`
- Botón secundario: `#f3f4f6`
- Texto principal: `#111`
- Texto secundario: `#666`

### Dimensiones
- Max width: 600px
- Max height: 90% de la pantalla
- Min height del contenido: 400px
- Border radius: 16px
- Padding: 20px (header), 16px (footer)

## 🔄 Flujo de Usuario

### Feedback Periódico (cada 10 minutos)
```
Usuario usa la app
    ↓
Timer de 10 min se cumple
    ↓
Modal aparece con mensaje: "¿Cómo va tu experiencia? 🚀"
    ↓
Usuario puede:
  - Llenar el formulario
  - Hacer clic en "Ahora no" (cierra modal)
  - Abrir en navegador (solo mobile)
```

### Feedback en Logout
```
Usuario hace clic en "Cerrar Sesión"
    ↓
Confirmación: "¿Estás seguro?"
    ↓
Usuario confirma
    ↓
Modal aparece con mensaje: "¡Gracias por usar Investí! 💙"
    ↓
Usuario puede:
  - Llenar el formulario
  - Hacer clic en "Cerrar sesión sin feedback"
  - Abrir en navegador (solo mobile)
    ↓
Después de 2 segundos → Logout completo
```

## 🧪 Testing

### Web
1. Iniciar sesión
2. Esperar 10 minutos → Debe aparecer modal
3. Verificar que el iframe carga correctamente
4. Cerrar sesión → Debe aparecer modal de logout

### Mobile
1. Iniciar sesión
2. Esperar 10 minutos → Debe aparecer modal
3. Verificar que WebView carga correctamente
4. Probar botón "Abrir en navegador"
5. Cerrar sesión → Debe aparecer modal de logout

## 📊 Métricas a Capturar

El formulario de Google puede capturar:
- Satisfacción general
- Qué les gustó
- Qué mejorarían
- Problemas encontrados
- Sugerencias de features
- Contexto de uso (periódico vs logout)

## 🚀 Despliegue

### Variables de Entorno
No se requieren variables adicionales. El URL del formulario está hardcodeado en `FeedbackModal.tsx`.

### Dependencias
- `react-native-webview`: Ya instalado (v13.13.5)
- `lucide-react-native`: Ya instalado

### Build
```bash
# No se requieren pasos adicionales
npm run build
# o
npx expo export:web
```

## 🔧 Configuración

### Cambiar Intervalo del Timer
Editar en `src/contexts/AuthContext.tsx`:
```typescript
const FEEDBACK_INTERVAL = 10 * 60 * 1000; // Cambiar aquí (en milisegundos)
```

### Cambiar URL del Formulario
Editar en `src/components/FeedbackModal.tsx`:
```typescript
const FEEDBACK_FORM_URL = 'TU_NUEVA_URL_AQUI';
```

### Deshabilitar Feedback Periódico
Comentar el useEffect del timer en `AuthContext.tsx`:
```typescript
// useEffect(() => {
//   if (!isAuthenticated) return;
//   const FEEDBACK_INTERVAL = 10 * 60 * 1000;
//   const timer = setInterval(() => {
//     showFeedbackModal('periodic');
//   }, FEEDBACK_INTERVAL);
//   return () => clearInterval(timer);
// }, [isAuthenticated, showFeedbackModal]);
```

### Deshabilitar Feedback en Logout
Remover la llamada en `Sidebar.tsx`:
```typescript
// Comentar esta línea:
// showFeedbackModal('logout');
```

## 📝 Notas Importantes

1. **Timer se reinicia:** Cada vez que el usuario cierra sesión y vuelve a iniciar, el timer de 10 minutos se reinicia.

2. **No es intrusivo:** El usuario siempre puede cerrar el modal con "Ahora no" o el botón X.

3. **Delay en logout:** Hay un delay de 2 segundos para dar tiempo al usuario de ver el modal antes del logout completo.

4. **Responsive:** El modal se adapta automáticamente a diferentes tamaños de pantalla.

5. **Plataforma específica:** En web usa iframe, en mobile usa WebView para mejor rendimiento.

## 🐛 Troubleshooting

### El modal no aparece
- Verificar que el usuario esté autenticado (`isAuthenticated === true`)
- Revisar console logs: `[AuthContext] 📝 Mostrando feedback periódico`
- Verificar que `feedbackModalVisible` sea `true` en el estado

### El formulario no carga
- Verificar la URL del formulario en Google Forms
- Asegurarse que el formulario esté en modo "público"
- Revisar permisos de compartir del formulario

### El timer no funciona
- Verificar que el useEffect no esté comentado
- Revisar que `isAuthenticated` sea `true`
- Confirmar que no hay errores en console

## ✅ Checklist de Implementación

- [x] Crear componente FeedbackModal
- [x] Integrar en AuthContext
- [x] Agregar timer de 10 minutos
- [x] Integrar en Sidebar para logout
- [x] Soporte para web (iframe)
- [x] Soporte para mobile (WebView)
- [x] Botón "Abrir en navegador" para mobile
- [x] Mensajes contextuales (periódico vs logout)
- [x] Delay en logout para mostrar modal
- [x] Documentación completa

## 🎉 Resultado Final

Los usuarios ahora recibirán solicitudes de feedback:
- **Automáticamente cada 10 minutos** mientras usan la app
- **Al cerrar sesión** para capturar impresiones finales

Esto permitirá recopilar feedback continuo y mejorar la experiencia de usuario basándose en datos reales.
