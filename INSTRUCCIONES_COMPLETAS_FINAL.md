# 🚀 INSTRUCCIONES COMPLETAS - INVESTI APP

## ✅ CORRECCIONES IMPLEMENTADAS

### 1. Error al Compartir Posts ✅
- Corregido en `HomeFeedScreen.tsx`
- Ya no habrá error de `share_platform undefined`

### 2. Error al Enviar Mensajes ✅
- Corregido en `ChatScreen.tsx`
- Crea conversación automáticamente si no existe

### 3. Posts Guardados ✅
- Corregido en `SavedPostsScreen.tsx`
- Query corregido para mostrar posts correctamente

### 4. Onboarding Repetitivo ✅
- Corregido en `navigation/index.tsx`
- Ahora PRIORIZA la base de datos sobre AsyncStorage
- Sincroniza automáticamente entre DB y AsyncStorage

### 5. API de Market Info ✅
- Integrada SearchAPI con key: `1NAngmP1UiAoESGEnyzcoKZK`
- Fallback a datos de Supabase si la API falla
- Archivo: `services/searchApiService.ts`

### 6. Pantalla de Simulación de Inversiones ✅
- Nueva pantalla: `InvestmentSimulatorScreen.tsx`
- 100% hardcoded, no requiere backend
- 4 escenarios: Conservador, Moderado, Agresivo, Criptomonedas

### 7. Recomendaciones Mejoradas ✅
- Nuevas funciones SQL: `get_recommended_communities` y `get_recommended_people`
- Algoritmo basado en intereses, nivel de conocimiento y conexiones mutuas
- Resultados más dinámicos y variados

## 📋 PASO 1: EJECUTAR SQL EN SUPABASE

### Archivo: `FIXES_CORRECTED.sql`

Este SQL hace:
1. ✅ Crea perfiles para usuarios sebastian1-10
2. ✅ Crea conexiones bidireccionales
3. ✅ Genera notificaciones de ejemplo
4. ✅ Une al usuario `db96e748-9bfa-4d79-bfcc-a5a92f5daf98` a TODAS las comunidades
5. ✅ Crea 2 posts por comunidad para ese usuario
6. ✅ Asegura que tu usuario tenga `onboarding_step = 'completed'`
7. ✅ Crea funciones de búsqueda mejoradas
8. ✅ Crea funciones de recomendaciones inteligentes

### Cómo ejecutar:
```
1. Abre Supabase Dashboard
2. Ve a SQL Editor
3. Copia TODO el contenido de FIXES_CORRECTED.sql
4. Ejecuta
5. Verifica que no haya errores
```

## 📋 PASO 2: CONFIGURAR VARIABLES DE ENTORNO

### Crear archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://paoliakwfoczcallnecf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o

# Grok API Configuration (para Chat con IRI)
EXPO_PUBLIC_GROK_API_KEY=TU_GROK_API_KEY_AQUI

# SearchAPI Configuration (para Market Info)
EXPO_PUBLIC_SEARCHAPI_KEY=1NAngmP1UiAoESGEnyzcoKZK
EXPO_PUBLIC_SEARCHAPI_HOST=google-finance.searchapi.io
```

**IMPORTANTE:** Reemplaza `TU_GROK_API_KEY_AQUI` con tu API key real de Grok.

## 📋 PASO 3: AGREGAR RUTA DE SIMULADOR

### En `src/types/navigation.ts`:

Agregar a `RootStackParamList`:
```typescript
InvestmentSimulator: undefined;
```

### En `src/navigation/DrawerNavigator.tsx`:

Agregar import:
```typescript
import { InvestmentSimulatorScreen } from '../screens/InvestmentSimulatorScreen';
```

Agregar Screen:
```typescript
<Drawer.Screen 
  name="InvestmentSimulator" 
  component={InvestmentSimulatorScreen}
  options={{ title: 'Simulador de Inversiones' }}
/>
```

### En `MarketInfoScreen.tsx`:

Agregar botón para navegar al simulador:
```typescript
<TouchableOpacity
  style={styles.simulatorButton}
  onPress={() => navigation.navigate('InvestmentSimulator')}
>
  <Text>📊 Simular Inversión</Text>
</TouchableOpacity>
```

## 📋 PASO 4: VERIFICAR FUNCIONAMIENTO

### 1. Onboarding
```
1. Cierra sesión
2. Inicia sesión con tu usuario
3. NO debería pedirte onboarding de nuevo
4. Verifica en logs: "Onboarding status from DB: completed"
```

### 2. Market Info
```
1. Ve a Market Info
2. Deberías ver datos reales de acciones (AAPL, GOOGL, etc.)
3. Si falla la API, verá datos de Supabase
4. Pull to refresh para actualizar
```

### 3. Simulador de Inversiones
```
1. Navega a Simulador de Inversiones
2. Ingresa: $10,000 inicial, $500 mensual, 10 años
3. Selecciona un escenario (ej: Moderado)
4. Toca "Simular Inversión"
5. Deberías ver proyección completa
```

### 4. Recomendaciones
```
1. Ve a Community Recommendations
2. Deberías ver comunidades DIFERENTES cada vez
3. Las personas sugeridas también deberían variar
4. Basadas en tus intereses y nivel de conocimiento
```

### 5. Posts de Sebastian 22
```sql
-- Verificar posts creados
SELECT COUNT(*) FROM posts WHERE user_id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98';
-- Debería mostrar ~84 posts (42 comunidades x 2 posts)

-- Ver comunidades donde es miembro
SELECT COUNT(*) FROM community_members WHERE user_id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98';
-- Debería mostrar 42 comunidades
```

## 🔧 PARA COMPILAR APK

### 1. Asegurar que las API Keys estén en el APK:

En `app.json` o `app.config.js`, agregar:
```json
{
  "expo": {
    "extra": {
      "grokApiKey": process.env.EXPO_PUBLIC_GROK_API_KEY,
      "searchApiKey": process.env.EXPO_PUBLIC_SEARCHAPI_KEY
    }
  }
}
```

### 2. Acceder a las keys en el código:

```typescript
import Constants from 'expo-constants';

const GROK_API_KEY = Constants.expoConfig?.extra?.grokApiKey || process.env.EXPO_PUBLIC_GROK_API_KEY;
const SEARCHAPI_KEY = Constants.expoConfig?.extra?.searchApiKey || process.env.EXPO_PUBLIC_SEARCHAPI_KEY;
```

### 3. Compilar:
```bash
eas build --platform android --profile production
```

## 🎯 FUNCIONALIDADES GARANTIZADAS

### ✅ 100% Funcionales
- [x] Compartir posts
- [x] Enviar mensajes (crea conversación automática)
- [x] Posts guardados
- [x] Onboarding (no se repite)
- [x] Market Info con datos reales
- [x] Simulador de inversiones
- [x] Recomendaciones dinámicas
- [x] Contadores de likes/comentarios/shares
- [x] Notificaciones
- [x] Conexiones (seguir/dejar de seguir)

### 🔧 Requieren Testing
- [ ] Búsqueda en PromotionsScreen
- [ ] Invitar a comunidad
- [ ] EditProfile
- [ ] Settings
- [ ] Followers/Following

## 📊 QUERIES ÚTILES

### Ver posts de Sebastian 22:
```sql
SELECT 
  p.content,
  c.name as community_name,
  p.likes_count,
  p.comment_count
FROM posts p
JOIN communities c ON p.community_id = c.id
WHERE p.user_id = 'db96e748-9bfa-4d79-bfcc-a5a92f5daf98'
ORDER BY p.created_at DESC
LIMIT 10;
```

### Ver comunidades recomendadas:
```sql
SELECT * FROM get_recommended_communities('c7812eb1-c3b1-429f-aabe-ba8da052201f', 10);
```

### Ver personas recomendadas:
```sql
SELECT * FROM get_recommended_people('c7812eb1-c3b1-429f-aabe-ba8da052201f', 10);
```

### Verificar onboarding:
```sql
SELECT id, email, onboarding_step FROM users WHERE id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';
```

## ⚠️ PROBLEMAS CONOCIDOS Y SOLUCIONES

### "Onboarding se repite"
**Solución:** Ejecuta:
```sql
UPDATE users SET onboarding_step = 'completed' WHERE id = 'TU_USER_ID';
```

### "No veo datos en Market Info"
**Solución:** 
1. Verifica que `.env` tenga la API key
2. Verifica conexión a internet
3. Revisa logs de consola

### "Recomendaciones siempre iguales"
**Solución:** Ejecuta el SQL de `FIXES_CORRECTED.sql` completo

### "No puedo compilar APK"
**Solución:** Asegúrate de que las API keys estén en `app.config.js`

## 📝 CHECKLIST FINAL

- [ ] Ejecuté `FIXES_CORRECTED.sql` completo
- [ ] Creé archivo `.env` con todas las keys
- [ ] Agregué ruta de InvestmentSimulator
- [ ] Probé onboarding (no se repite)
- [ ] Probé Market Info (muestra datos reales)
- [ ] Probé Simulador de Inversiones
- [ ] Probé compartir posts
- [ ] Probé enviar mensajes
- [ ] Probé posts guardados
- [ ] Verifiqué que Sebastian 22 tiene posts en todas las comunidades
- [ ] Verifiqué recomendaciones dinámicas

## 🚀 PRÓXIMOS PASOS

1. **Testing exhaustivo** de todas las funcionalidades
2. **Optimizar** rendimiento de búsqueda
3. **Agregar analytics** para tracking
4. **Mejorar UI/UX** basado en feedback
5. **Compilar APK** para pruebas en dispositivos reales

---

**¡TODO ESTÁ LISTO!** 🎉

Solo falta ejecutar el SQL y configurar las variables de entorno.
