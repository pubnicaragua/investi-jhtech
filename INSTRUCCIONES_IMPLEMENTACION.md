# 🚀 INSTRUCCIONES DE IMPLEMENTACIÓN - INVESTI APP

## 📋 ORDEN DE EJECUCIÓN RECOMENDADO

### **PASO 1: CORREGIR BASE DE DATOS** ⚡ CRÍTICO
```bash
# 1. Abrir Supabase Dashboard
# 2. Ir a SQL Editor
# 3. Ejecutar el archivo: CORRECION_CRITICA_BD.sql
```

**⚠️ IMPORTANTE**: Este paso es OBLIGATORIO antes de continuar. Corrige:
- Estructura de mensajes (conversation_id, content)
- Tabla message_reads
- Columnas faltantes en courses y lessons
- Tablas de finanzas (user_budgets, user_transactions)
- Funciones RPC críticas

### **PASO 2: VERIFICAR CORRECCIONES**
```bash
# Ejecutar el script de testing
node TEST_ENDPOINTS_COMPLETO.js
```

**Resultado esperado**: Al menos 80% de tests deben pasar.

### **PASO 3: ACTUALIZAR PANTALLAS CRÍTICAS**

#### 3.1 **ChatScreen** - PRIORIDAD ALTA
```typescript
// En ChatScreen.tsx, reemplazar:
import { 
  getUserConversationsFixed,
  getConversationMessagesFixed,
  sendMessageFixed 
} from '../rest/api'

// Usar las funciones "Fixed" en lugar de las originales
```

#### 3.2 **PlanificadorFinancieroScreen** - PRIORIDAD ALTA
```typescript
// En PlanificadorFinancieroScreen.tsx, reemplazar datos mock:
import { 
  getUserBudgets,
  createBudget,
  getUserTransactions,
  createTransaction 
} from '../rest/api'

// Implementar carga real de datos
useEffect(() => {
  loadUserBudgets()
  loadUserTransactions()
}, [])
```

#### 3.3 **CreatePostScreen** - PRIORIDAD MEDIA
```typescript
// En CreatePostScreen.tsx, usar:
import { uploadPostMedia } from '../rest/api'

// Para subir imágenes correctamente
const handleImageUpload = async (file) => {
  const url = await uploadPostMedia(userId, file)
  setMediaUrls([...mediaUrls, url])
}
```

#### 3.4 **PromotionsScreen** - PRIORIDAD MEDIA
```typescript
// En PromotionsScreen.tsx, agregar:
import { 
  claimPromotion,
  trackPromotionView,
  getPromotionsByCategory 
} from '../rest/api'

// Implementar funcionalidades de promociones
```

### **PASO 4: CORREGIR ERRORES DE NAVEGACIÓN**

#### 4.1 **CommunityDetailScreen**
```typescript
// Verificar que se pase correctamente el parámetro communityId
// En la navegación:
navigation.navigate('CommunityDetail', { communityId: community.id })

// En CommunityDetailScreen.tsx:
const route = useRoute()
const { communityId } = route.params
```

#### 4.2 **LanguageSelectionScreen**
```typescript
// Cambiar SecureStore por AsyncStorage:
import AsyncStorage from '@react-native-async-storage/async-storage'

const handleLanguageSelect = async (language) => {
  await AsyncStorage.setItem('user_language', language)
}
```

### **PASO 5: REEMPLAZAR URLs ROTAS**

#### 5.1 **Reemplazar via.placeholder.com**
```typescript
// En todos los archivos, buscar y reemplazar:
// ANTES: https://via.placeholder.com/100x100/27ae60/ffffff?text=Fin
// DESPUÉS: https://picsum.photos/100/100?random=1

// O usar iconos de Lucide React Native:
import { TrendingUp, DollarSign, Bitcoin } from 'lucide-react-native'
```

### **PASO 6: IMPLEMENTAR NOTIFICACIONES REALES**

#### 6.1 **NotificationsScreen**
```typescript
// En NotificationsScreen.tsx, reemplazar datos mock:
import { getUserNotifications, markNotificationRead } from '../rest/api'

useEffect(() => {
  loadNotifications()
}, [])

const loadNotifications = async () => {
  const notifications = await getUserNotifications(userId)
  setNotifications(notifications)
}
```

### **PASO 7: CONFIGURAR STORAGE BUCKETS**

#### 7.1 **En Supabase Dashboard**
```sql
-- Crear buckets si no existen
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('post-media', 'post-media', true),
  ('avatars', 'avatars', true),
  ('community-media', 'community-media', true);

-- Configurar políticas de storage
CREATE POLICY "Users can upload their own media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id IN ('post-media', 'avatars', 'community-media'));
```

### **PASO 8: TESTING Y VALIDACIÓN**

#### 8.1 **Testing Manual por Pantalla**
```bash
# Usar el sistema de testing existente:
# En src/utils/screenTesting.ts

export const TESTING_CONFIG = {
  ENABLED: true,
  SCREEN: 'ChatScreen', // Cambiar por la pantalla a probar
}
```

#### 8.2 **Checklist de Validación**
- [ ] ✅ Autenticación funciona
- [ ] ✅ Feed de posts carga
- [ ] ✅ Crear posts funciona
- [ ] ✅ Chat envía y recibe mensajes
- [ ] ✅ Comunidades cargan sin errores
- [ ] ✅ Planificador muestra datos reales
- [ ] ✅ Promociones son interactivas
- [ ] ✅ Notificaciones funcionan
- [ ] ✅ Perfil de usuario completo
- [ ] ✅ Educación carga cursos

---

## 🚨 PROBLEMAS CRÍTICOS A RESOLVER

### **1. Sistema de Chat** - URGENTE
**Problema**: Columnas faltantes, tabla message_reads inexistente
**Solución**: ✅ Incluida en CORRECION_CRITICA_BD.sql
**Impacto**: Chat completamente roto sin esto

### **2. Planificador Financiero** - URGENTE
**Problema**: Datos completamente falsos
**Solución**: ✅ Tablas creadas en script SQL
**Riesgo**: Usuarios toman decisiones basadas en datos falsos

### **3. Upload de Imágenes** - IMPORTANTE
**Problema**: Error 400 en storage
**Solución**: ✅ Función uploadPostMedia corregida
**Impacto**: No se pueden subir fotos en posts

### **4. Errores de Navegación** - IMPORTANTE
**Problema**: Route object no encontrado
**Solución**: Verificar parámetros de navegación
**Impacto**: App se rompe al navegar

---

## 📊 MÉTRICAS DE ÉXITO

### **Antes de las Correcciones**
- ✅ Funcionando: 15 pantallas (31%)
- ❌ Con errores: 20 pantallas (42%)
- ⚠️ Placeholder: 8 pantallas (17%)
- 🔄 Duplicadas: 5 pantallas (10%)

### **Después de las Correcciones (Objetivo)**
- ✅ Funcionando: 35+ pantallas (75%+)
- ❌ Con errores: <5 pantallas (10%)
- ⚠️ Placeholder: <3 pantallas (5%)
- 🔄 Duplicadas: 0 pantallas (0%)

---

## 🔧 COMANDOS ÚTILES

### **Para Desarrollo**
```bash
# Instalar dependencias faltantes
npm install @react-native-async-storage/async-storage

# Limpiar cache
npx expo start --clear

# Ver logs en tiempo real
npx expo logs
```

### **Para Testing**
```bash
# Ejecutar tests de endpoints
node TEST_ENDPOINTS_COMPLETO.js

# Verificar estructura de BD
npm run test:database

# Testing de pantallas individual
# Cambiar SCREEN en screenTesting.ts y ejecutar app
```

### **Para Debugging**
```bash
# Ver errores de Supabase
# En browser console cuando uses la app web

# Verificar políticas RLS
# En Supabase Dashboard > Authentication > Policies

# Revisar logs de funciones
# En Supabase Dashboard > Edge Functions > Logs
```

---

## 📝 NOTAS IMPORTANTES

1. **Orden de Ejecución**: Seguir el orden exacto de los pasos
2. **Backup**: Hacer backup de la BD antes de ejecutar correcciones
3. **Testing**: Probar cada pantalla después de cada corrección
4. **Rollback**: Tener plan de rollback si algo falla
5. **Documentación**: Actualizar documentación después de cambios

## 🎯 RESULTADO ESPERADO

Después de seguir estas instrucciones:
- ✅ Sistema de chat completamente funcional
- ✅ Planificador financiero con datos reales
- ✅ Upload de imágenes funcionando
- ✅ Todas las pantallas navegables
- ✅ Notificaciones en tiempo real
- ✅ 0 errores críticos en consola
- ✅ App lista para producción

---

## 🆘 SOPORTE

Si encuentras problemas:
1. Verificar que el script SQL se ejecutó completamente
2. Revisar logs de Supabase
3. Verificar que todas las funciones RPC existen
4. Comprobar políticas RLS
5. Validar estructura de tablas

**¡El objetivo es tener una app 100% funcional con datos reales!** 🚀
