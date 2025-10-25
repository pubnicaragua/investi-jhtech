# 🚀 EJECUTAR AHORA - PRIORIDAD MÁXIMA

## 1️⃣ EJECUTAR SQL INMEDIATAMENTE

### Archivo: `FIXES_CORRECTED_V2.sql`

**Este SQL resuelve:**
- ✅ Error de columna `message` en notifications
- ✅ Error de columna `contenido` en posts
- ✅ Crea 3 posts profesionales por comunidad para Sebastian 22 (db96e748-9bfa-4d79-bfcc-a5a92f5daf98)
- ✅ Crea tablas faltantes: `community_interests`, `user_interests`, `user_knowledge`
- ✅ Corrige funciones de recomendaciones
- ✅ Agrega 10 noticias con imágenes

**Pasos:**
```
1. Abre Supabase Dashboard
2. Ve a SQL Editor
3. Copia TODO el contenido de FIXES_CORRECTED_V2.sql
4. Ejecuta (Run)
5. Verifica que no haya errores
```

**Resultado esperado:**
```
Posts creados para Sebastian 22: 126 (42 comunidades x 3 posts)
Comunidades donde es miembro: 42
Conexiones del usuario test: 3
Notificaciones para usuario test: 10
Noticias totales: 10
```

## 2️⃣ PROBLEMAS IDENTIFICADOS Y SOLUCIONES

### ❌ Problema 1: MarketInfo - Network Request Failed
**Causa:** CORS bloqueado por el navegador/app

**Solución Inmediata:**
```typescript
// En searchApiService.ts, cambiar a usar datos de Supabase como principal
export async function getMarketStocks() {
  try {
    // Primero intentar desde Supabase
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data && data.length > 0) {
      return data.map(stock => ({
        symbol: stock.symbol,
        name: stock.company_name,
        price: stock.current_price,
        change: stock.price_change,
        changePercent: stock.price_change_percent,
        currency: 'USD',
        exchange: stock.exchange || 'NASDAQ',
        logo: stock.logo_url,
      }));
    }
    
    // Si no hay datos en Supabase, usar mock data
    return MOCK_STOCKS;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return MOCK_STOCKS;
  }
}
```

### ❌ Problema 2: ProfileScreen - No muestra posts propios
**Causa:** No está cargando posts del usuario

**Solución:** Agregar carga de posts en `loadProfile`:
```typescript
// Después de cargar userData
const { data: userPosts, error: postsError } = await supabase
  .from('posts')
  .select(`
    *,
    user:users!posts_user_id_fkey(id, full_name, avatar_url),
    community:communities(id, name)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

if (userPosts) {
  setFeed(userPosts);
}
```

### ❌ Problema 3: Personas que podrías conocer - Solo 2 usuarios
**Causa:** Pocos usuarios en la base de datos

**Solución:** El SQL ya crea usuarios sebastian1-10, pero necesitas:
```sql
-- Asegurarse de que tengan onboarding_step = 'completed'
UPDATE users 
SET onboarding_step = 'completed' 
WHERE email LIKE 'sebastian%@gmail.com';
```

### ❌ Problema 4: Posts guardados no se almacenan
**Causa:** Falta trigger o lógica en el botón de guardar

**Verificar:**
```sql
-- Ver si existen registros
SELECT * FROM post_saves WHERE user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';
```

**Si no hay registros, el botón de guardar no está funcionando.**

### ❌ Problema 5: Biografía no se actualiza en sidebar
**Causa:** El sidebar no está recargando datos del usuario

**Solución:** Forzar recarga después de editar perfil:
```typescript
// En EditProfileScreen, después de guardar
await AsyncStorage.setItem('profile_updated', 'true');
navigation.goBack();

// En DrawerNavigator, escuchar cambios
useEffect(() => {
  const checkProfileUpdate = async () => {
    const updated = await AsyncStorage.getItem('profile_updated');
    if (updated === 'true') {
      await loadUserData();
      await AsyncStorage.removeItem('profile_updated');
    }
  };
  
  checkProfileUpdate();
}, []);
```

## 3️⃣ ARCHIVOS QUE NECESITAN MODIFICACIÓN

### Alta Prioridad (Hacer YA):

1. **searchApiService.ts**
   - Cambiar a usar Supabase como fuente principal
   - Agregar mock data como fallback

2. **ProfileScreen.tsx**
   - Agregar carga de posts del usuario
   - Mejorar UI con stats cards
   - Mostrar biografía completa

3. **SavedPostsScreen.tsx**
   - Verificar que el botón de guardar funcione
   - Agregar logs para debugging

4. **DrawerNavigator.tsx**
   - Recargar datos del usuario al abrir
   - Mostrar biografía actualizada

### Media Prioridad (Hacer después):

5. **MarketInfoScreen.tsx**
   - Agregar filtros (Chile, USA, Tech, etc.)
   - Botón "Agregar a Portafolio"
   - Botón "Simular Inversión"

6. **SettingsScreen.tsx**
   - Actualizar UI según Figma
   - Agregar logo Angel Investor

7. **FinancialToolsScreen.tsx**
   - Reorganizar en grid
   - Agregar 3 herramientas más

8. **NewsScreen.tsx, CoursesScreen.tsx, VideosScreen.tsx**
   - Agregar filtros por categoría

## 4️⃣ QUERIES PARA DEBUGGING

### Ver posts del usuario:
```sql
SELECT 
  p.id,
  p.content,
  p.contenido,
  p.created_at,
  u.full_name
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f'
ORDER BY p.created_at DESC;
```

### Ver posts guardados:
```sql
SELECT 
  ps.*,
  p.content,
  u.full_name as author
FROM post_saves ps
JOIN posts p ON ps.post_id = p.id
JOIN users u ON p.user_id = u.id
WHERE ps.user_id = 'c7812eb1-c3b1-429f-aabe-ba8da052201f';
```

### Ver comunidades recomendadas:
```sql
SELECT * FROM get_recommended_communities('c7812eb1-c3b1-429f-aabe-ba8da052201f', 10);
```

### Ver personas recomendadas:
```sql
SELECT * FROM get_recommended_people('c7812eb1-c3b1-429f-aabe-ba8da052201f', 10);
```

### Ver usuarios completados:
```sql
SELECT id, email, full_name, onboarding_step 
FROM users 
WHERE onboarding_step = 'completed'
ORDER BY created_at DESC;
```

## 5️⃣ CHECKLIST INMEDIATO

- [ ] Ejecutar `FIXES_CORRECTED_V2.sql` completo
- [ ] Verificar que se crearon 126 posts para Sebastian 22
- [ ] Verificar que hay 10 noticias nuevas
- [ ] Actualizar `onboarding_step` de usuarios sebastian
- [ ] Modificar `searchApiService.ts` para usar Supabase
- [ ] Agregar carga de posts en `ProfileScreen.tsx`
- [ ] Verificar funcionamiento de guardar posts
- [ ] Probar recomendaciones de comunidades
- [ ] Probar recomendaciones de personas

## 6️⃣ MOCK DATA PARA MARKETINFO

```typescript
const MOCK_STOCKS = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 178.50,
    change: 2.35,
    changePercent: 1.33,
    currency: 'USD',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.80,
    change: -0.95,
    changePercent: -0.66,
    currency: 'USD',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.90,
    change: 5.20,
    changePercent: 1.39,
    currency: 'USD',
    exchange: 'NASDAQ',
  },
  // ... más stocks
];
```

## 📞 SI ALGO FALLA

1. **Revisa logs de consola** - Busca errores específicos
2. **Verifica Supabase** - Asegúrate de que las tablas existan
3. **Ejecuta queries de debugging** - Verifica datos en la DB
4. **Limpia caché** - `expo start -c`
5. **Reinstala dependencias** - `npm install`

---

**¡EMPIEZA POR EL SQL!** Todo lo demás depende de que la base de datos esté correcta.
