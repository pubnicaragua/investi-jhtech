# 🔧 CÓDIGO COMPLETO DE CORRECCIONES

## 1. CREAR ARCHIVO .env EN LA RAÍZ

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://paoliakwfoczcallnecf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o

# Financial Modeling Prep API
EXPO_PUBLIC_FMP_API_KEY=igaze6ph1NawrHgRDjsWwuFq

# Grok API
EXPO_PUBLIC_GROK_API_KEY=tu-grok-api-key-aqui
```

## 2. AGREGAR CONSTANTES AL INICIO DE MarketInfoScreen.tsx

Después de los imports, agregar:

```typescript
const MARKET_FILTERS = [
  { id: 'all', label: 'Todas', icon: '🌐' },
  { id: 'chile', label: 'Chile', icon: '🇨🇱' },
  { id: 'usa', label: 'USA', icon: '🇺🇸' },
  { id: 'tech', label: 'Tech', icon: '💻' },
  { id: 'finance', label: 'Finanzas', icon: '💰' },
];
```

## 3. AGREGAR FUNCIONES EN MarketInfoScreen.tsx

Después de `loadMarketData`, agregar:

```typescript
const handleStockPress = (stock: Stock) => {
  setSelectedStock(stock);
  setShowStockModal(true);
};

const handleAddToPortfolio = async () => {
  if (!selectedStock) return;
  
  Alert.alert(
    '⚠️ Aviso Importante',
    'Esta es solo una simulación. No garantiza resultados reales ni constituye asesoría financiera. Invertir siempre conlleva riesgos.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Agregar',
        onPress: async () => {
          // TODO: Guardar en portafolio simulado
          setShowStockModal(false);
          Alert.alert('✓', `${selectedStock.symbol} agregado a tu portafolio simulado`);
        }
      }
    ]
  );
};

const handleSimulateInvestment = () => {
  if (!selectedStock) return;
  
  Alert.alert(
    '⚠️ Aviso Importante',
    'Esta es solo una simulación. No garantiza resultados reales ni constituye asesoría financiera. Invertir siempre conlleva riesgos. Te recomendamos informarte y, si es necesario, buscar orientación profesional antes de invertir.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Continuar',
        onPress: () => {
          setShowStockModal(false);
          navigation.navigate('InvestmentSimulator', { stock: selectedStock });
        }
      }
    ]
  );
};

const getFilteredStocks = () => {
  if (selectedFilter === 'all') return filteredStocks;
  if (selectedFilter === 'chile') return filteredStocks.filter(s => ['SQM', 'COPEC.SN'].includes(s.symbol));
  if (selectedFilter === 'usa') return filteredStocks.filter(s => ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD'].includes(s.symbol));
  if (selectedFilter === 'tech') return filteredStocks.filter(s => ['AAPL', 'GOOGL', 'MSFT', 'META', 'NVDA', 'AMD'].includes(s.symbol));
  if (selectedFilter === 'finance') return filteredStocks.filter(s => ['VALE', 'PBR', 'GGAL', 'BBAR'].includes(s.symbol));
  return filteredStocks;
};
```

## 4. AGREGAR FILTROS EN EL RENDER

Después del searchContainer, agregar:

```typescript
{/* Filtros */}
<ScrollView 
  horizontal 
  showsHorizontalScrollIndicator={false}
  style={styles.filtersContainer}
  contentContainerStyle={styles.filtersContent}
>
  {MARKET_FILTERS.map(filter => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterChip,
        selectedFilter === filter.id && styles.filterChipActive
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text style={styles.filterIcon}>{filter.icon}</Text>
      <Text style={[
        styles.filterLabel,
        selectedFilter === filter.id && styles.filterLabelActive
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  ))}
</ScrollView>
```

## 5. CAMBIAR EL RENDER DE STOCKS

Cambiar `filteredStocks.map` por `getFilteredStocks().map` y agregar onPress:

```typescript
{getFilteredStocks().map((stock) => (
  <TouchableOpacity 
    key={stock.id} 
    style={styles.stockItem}
    onPress={() => handleStockPress(stock)}
  >
    {/* ... resto del código ... */}
  </TouchableOpacity>
))}
```

## 6. AGREGAR MODAL AL FINAL DEL RETURN

Antes del último `</View>`:

```typescript
{/* Modal de Opciones */}
<Modal
  visible={showStockModal}
  transparent
  animationType="slide"
  onRequestClose={() => setShowStockModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>{selectedStock?.symbol}</Text>
      <Text style={styles.modalSubtitle}>{selectedStock?.company_name}</Text>
      <Text style={styles.modalPrice}>${selectedStock?.current_price.toFixed(2)}</Text>
      
      <TouchableOpacity 
        style={styles.modalButton}
        onPress={handleAddToPortfolio}
      >
        <Text style={styles.modalButtonText}>📊 Agregar a Portafolio</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.modalButton, styles.modalButtonSecondary]}
        onPress={handleSimulateInvestment}
      >
        <Text style={styles.modalButtonText}>💰 Simular Inversión</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.modalButtonCancel}
        onPress={() => setShowStockModal(false)}
      >
        <Text style={styles.modalButtonCancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
```

## 7. AGREGAR ESTILOS

Al final de StyleSheet.create, agregar:

```typescript
filtersContainer: {
  backgroundColor: '#fff',
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#e5e7eb',
},
filtersContent: {
  paddingHorizontal: 16,
  gap: 8,
},
filterChip: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: '#f3f4f6',
  gap: 6,
},
filterChipActive: {
  backgroundColor: '#3b82f6',
},
filterIcon: {
  fontSize: 16,
},
filterLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#6b7280',
},
filterLabelActive: {
  color: '#fff',
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'flex-end',
},
modalContent: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 24,
  paddingBottom: 40,
},
modalTitle: {
  fontSize: 24,
  fontWeight: '700',
  color: '#111',
  textAlign: 'center',
},
modalSubtitle: {
  fontSize: 14,
  color: '#6b7280',
  textAlign: 'center',
  marginTop: 4,
},
modalPrice: {
  fontSize: 32,
  fontWeight: '700',
  color: '#3b82f6',
  textAlign: 'center',
  marginVertical: 16,
},
modalButton: {
  backgroundColor: '#3b82f6',
  paddingVertical: 16,
  borderRadius: 12,
  marginBottom: 12,
},
modalButtonSecondary: {
  backgroundColor: '#10b981',
},
modalButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
  textAlign: 'center',
},
modalButtonCancel: {
  paddingVertical: 12,
},
modalButtonCancelText: {
  color: '#6b7280',
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
},
```

## 8. EJECUTAR COMANDOS

```bash
# Limpiar caché
expo start -c

# O reiniciar
npm start -- --reset-cache
```

## 9. VERIFICAR .env

Asegúrate de que el archivo `.env` existe en la raíz del proyecto con la API key correcta.

Si sigue dando error 401, la API key puede haber expirado. Puedes obtener una nueva gratis en:
https://site.financialmodelingprep.com/developer/docs/

---

**IMPORTANTE:** Después de crear el `.env`, DEBES reiniciar el servidor de Expo completamente.
