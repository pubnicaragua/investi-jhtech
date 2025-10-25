# 📋 TODAS LAS CORRECCIONES PENDIENTES - INVESTI

## ✅ YA COMPLETADO

### 1. SQL Corregido V2 ✅
- **Archivo:** `FIXES_CORRECTED_V2.sql`
- **Incluye:**
  - ✅ Notificaciones sin columna `message`
  - ✅ 3 posts profesionales por comunidad para Sebastian 22
  - ✅ Tablas `community_interests`, `user_interests`, `user_knowledge`
  - ✅ Funciones de recomendaciones corregidas
  - ✅ 10 noticias profesionales con imágenes

### 2. Onboarding Corregido ✅
- Prioriza base de datos sobre AsyncStorage

### 3. SearchAPI Integrada ✅
- Servicio creado en `services/searchApiService.ts`

## 🔧 CORRECCIONES PENDIENTES

### 1. ProfileScreen - 100% Backend Driven
**Problema:** No muestra posts propios, biografía no se actualiza, UI necesita mejora

**Solución:**
```typescript
// Cargar datos completos del usuario desde Supabase
const loadUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      posts:posts(count),
      followers:user_follows!following_id(count),
      following:user_follows!follower_id(count)
    `)
    .eq('id', userId)
    .single();
    
  // Cargar posts del usuario
  const { data: userPosts } = await supabase
    .from('posts')
    .select(`
      *,
      user:users(full_name, avatar_url),
      community:communities(name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}
```

**UI Mejorada:**
- Banner con gradiente
- Avatar con borde
- Stats en cards
- Posts en grid
- Biografía completa
- Botones de acción mejorados

### 2. MarketInfoScreen - API y Filtros
**Problema:** Network request failed, falta filtros

**Solución:**
```typescript
// Verificar CORS y usar proxy si es necesario
const fetchStockData = async (symbol: string) => {
  try {
    // Opción 1: Usar proxy CORS
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = `https://${SEARCHAPI_HOST}/api/v1/search?engine=google_finance&q=${symbol}&api_key=${SEARCHAPI_KEY}`;
    
    const response = await fetch(proxyUrl + apiUrl);
    
    // Opción 2: Usar datos de Supabase como fallback
    if (!response.ok) {
      return await fetchFromSupabase(symbol);
    }
  } catch (error) {
    return await fetchFromSupabase(symbol);
  }
};

// Agregar filtros
const MARKET_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'chile', label: 'Chile' },
  { id: 'usa', label: 'USA' },
  { id: 'tech', label: 'Tecnología' },
  { id: 'finance', label: 'Finanzas' },
];
```

**Funcionalidades:**
- Botón "Agregar a Portafolio"
- Botón "Simular Inversión"
- Filtros horizontales
- Traducción ES/EN funcional

### 3. SettingsScreen - UI del Figma
**Problema:** UI no coincide con diseño, falta logo Angel Investor

**Solución:**
```typescript
// Estructura según Figma
<View style={styles.container}>
  {/* Header */}
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <ArrowLeft size={24} color="#111" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Configuración</Text>
    <TouchableOpacity>
      <HelpCircle size={24} color="#111" />
    </TouchableOpacity>
  </View>

  {/* Secciones con iconos */}
  <ScrollView>
    <SettingItem
      icon={<Lock size={20} color="#111" />}
      title="Inicio de sesión y seguridad"
      onPress={() => navigation.navigate('SecuritySettings')}
    />
    
    <SettingItem
      icon={<Shield size={20} color="#111" />}
      title="Privacidad de datos"
      onPress={() => navigation.navigate('PrivacySettings')}
    />
    
    <SettingItem
      icon={<Bell size={20} color="#111" />}
      title="Notificaciones"
      onPress={() => navigation.navigate('NotificationSettings')}
    />
    
    <SettingItem
      icon={<Image source={require('../../assets/LogoAngelInvestors.png')} style={styles.angelIcon} />}
      title="Inversionista Ángel"
      onPress={() => navigation.navigate('AngelInvestor')}
    />
  </ScrollView>
</View>
```

### 4. Herramientas Financieras - Mejor UI
**Problema:** Organización confusa, faltan herramientas

**Solución:**
```typescript
const FINANCIAL_TOOLS = [
  {
    id: 'planner',
    name: 'Planificador Financiero',
    description: 'Organiza tus ingresos, gastos y metas',
    icon: '📊',
    color: '#3B82F6',
  },
  {
    id: 'ant-hunter',
    name: 'El Caza Hormigas',
    description: 'Detecta gastos pequeños innecesarios',
    icon: '🐜',
    color: '#EF4444',
  },
  {
    id: 'report-generator',
    name: 'Generador de Reporte',
    description: 'Análisis financiero profesional',
    icon: '📈',
    color: '#10B981',
  },
  {
    id: 'roi-calculator',
    name: 'Calculadora de ROI',
    description: 'Calcula retorno de inversión',
    icon: '💰',
    color: '#F59E0B',
  },
  {
    id: 'budget-tracker',
    name: 'Seguimiento de Presupuesto',
    description: 'Monitorea tu presupuesto mensual',
    icon: '📝',
    color: '#8B5CF6',
  },
  {
    id: 'debt-calculator',
    name: 'Calculadora de Deudas',
    description: 'Planifica pago de deudas',
    icon: '💳',
    color: '#EC4899',
  },
];

// UI en Grid
<View style={styles.toolsGrid}>
  {FINANCIAL_TOOLS.map(tool => (
    <TouchableOpacity key={tool.id} style={styles.toolCard}>
      <View style={[styles.toolIcon, { backgroundColor: tool.color }]}>
        <Text style={styles.toolEmoji}>{tool.icon}</Text>
      </View>
      <Text style={styles.toolName}>{tool.name}</Text>
      <Text style={styles.toolDescription}>{tool.description}</Text>
    </TouchableOpacity>
  ))}
</View>
```

### 5. Crear Comunidad - Dropdown de Intereses
**Problema:** Mucho scroll, poco eficiente

**Solución:**
```typescript
import { Picker } from '@react-native-picker/picker';

const INTERESTS = [
  { id: 'tech', label: 'Tecnología', icon: '💻' },
  { id: 'finance', label: 'Finanzas', icon: '💰' },
  { id: 'entrepreneurship', label: 'Emprendimiento', icon: '🚀' },
  { id: 'sports', label: 'Deportes', icon: '⚽' },
  { id: 'art', label: 'Arte', icon: '🎨' },
  { id: 'music', label: 'Música', icon: '🎵' },
  { id: 'education', label: 'Educación', icon: '📚' },
  { id: 'health', label: 'Salud', icon: '❤️' },
  { id: 'travel', label: 'Viajes', icon: '✈️' },
  { id: 'science', label: 'Ciencia', icon: '🔬' },
];

// Dropdown en lugar de botones
<View style={styles.dropdownContainer}>
  <Text style={styles.label}>Intereses</Text>
  <Picker
    selectedValue={selectedInterests}
    onValueChange={(itemValue) => setSelectedInterests(itemValue)}
    mode="dropdown"
  >
    {INTERESTS.map(interest => (
      <Picker.Item 
        key={interest.id} 
        label={`${interest.icon} ${interest.label}`} 
        value={interest.id} 
      />
    ))}
  </Picker>
</View>
```

### 6. Filtros en Cursos, Noticias y Videos
**Problema:** No hay filtros por categoría

**Solución:**
```typescript
// Componente de filtro horizontal
const CategoryFilter = ({ categories, selected, onSelect }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {categories.map(cat => (
      <TouchableOpacity
        key={cat.id}
        style={[
          styles.filterChip,
          selected === cat.id && styles.filterChipActive
        ]}
        onPress={() => onSelect(cat.id)}
      >
        <Text style={styles.filterText}>{cat.label}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// Categorías para Noticias
const NEWS_CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'regulaciones', label: 'Regulaciones' },
  { id: 'criptomonedas', label: 'Criptomonedas' },
  { id: 'tecnologia', label: 'Tecnología' },
  { id: 'inversiones', label: 'Inversiones' },
  { id: 'startups', label: 'Startups' },
];

// Categorías para Cursos
const COURSE_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'finanzas', label: 'Finanzas' },
  { id: 'inversiones', label: 'Inversiones' },
  { id: 'criptomonedas', label: 'Criptomonedas' },
  { id: 'emprendimiento', label: 'Emprendimiento' },
];

// Categorías para Videos
const VIDEO_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'tutoriales', label: 'Tutoriales' },
  { id: 'analisis', label: 'Análisis' },
  { id: 'entrevistas', label: 'Entrevistas' },
  { id: 'webinars', label: 'Webinars' },
];
```

### 7. Notificaciones Push con Expo
**Problema:** No hay notificaciones de prueba

**Solución:**
```typescript
// Instalar dependencias
// expo install expo-notifications expo-device expo-constants

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Registrar para notificaciones push
const registerForPushNotificationsAsync = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    
    // Guardar token en Supabase
    await supabase
      .from('users')
      .update({ push_token: token })
      .eq('id', userId);
  }
};

// Enviar notificación de prueba
const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "¡Nueva notificación! 🎉",
      body: 'Esta es una notificación de prueba de Investi',
      data: { type: 'test' },
    },
    trigger: { seconds: 2 },
  });
};
```

### 8. Scroll Infinito en HomeFeed
**Problema:** No hay scroll infinito

**Solución:**
```typescript
const [posts, setPosts] = useState([]);
const [page, setPage] = useState(0);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);

const loadMorePosts = async () => {
  if (loading || !hasMore) return;
  
  setLoading(true);
  const POSTS_PER_PAGE = 10;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1);
  
  if (data) {
    if (data.length < POSTS_PER_PAGE) {
      setHasMore(false);
    }
    setPosts([...posts, ...data]);
    setPage(page + 1);
  }
  
  setLoading(false);
};

// En FlatList
<FlatList
  data={posts}
  onEndReached={loadMorePosts}
  onEndReachedThreshold={0.5}
  ListFooterComponent={loading ? <ActivityIndicator /> : null}
/>
```

### 9. Portafolio Simulado
**Problema:** No existe funcionalidad

**Solución:**
```sql
-- Crear tabla de portafolio
CREATE TABLE IF NOT EXISTS user_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  stock_name TEXT,
  quantity DECIMAL(10, 2),
  purchase_price DECIMAL(10, 2),
  current_price DECIMAL(10, 2),
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

```typescript
// Agregar a portafolio
const addToPortfolio = async (stock: Stock) => {
  const { data, error } = await supabase
    .from('user_portfolio')
    .insert({
      user_id: userId,
      stock_symbol: stock.symbol,
      stock_name: stock.name,
      quantity: 1,
      purchase_price: stock.price,
      current_price: stock.price,
    });
  
  if (!error) {
    Alert.alert('✓', `${stock.symbol} agregado a tu portafolio`);
  }
};
```

## 📝 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **Ejecutar SQL** - `FIXES_CORRECTED_V2.sql`
2. **ProfileScreen** - Mejorar UI y backend
3. **MarketInfoScreen** - Corregir API y agregar filtros
4. **SettingsScreen** - UI del Figma
5. **Herramientas Financieras** - Reorganizar
6. **Filtros** - Cursos, Noticias, Videos
7. **Notificaciones Push** - Implementar
8. **Scroll Infinito** - HomeFeed
9. **Portafolio** - Crear funcionalidad
10. **Crear Comunidad** - Dropdown

## ⏱️ TIEMPO ESTIMADO

- SQL: 5 minutos
- ProfileScreen: 2 horas
- MarketInfoScreen: 1 hora
- SettingsScreen: 1 hora
- Herramientas: 1 hora
- Filtros: 1 hora
- Notificaciones: 30 minutos
- Scroll Infinito: 30 minutos
- Portafolio: 1 hora
- Crear Comunidad: 30 minutos

**TOTAL: ~9 horas de desarrollo**
