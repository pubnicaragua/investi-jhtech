import { useState, useEffect, useCallback } from "react"  
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, RefreshControl, Image, Platform, Alert, Modal } from "react-native"  
import { useTranslation } from "react-i18next"  
import { Search, TrendingUp, TrendingDown, Home, Users, MessageCircle, Bell, User } from "lucide-react-native"
import { Ionicons } from '@expo/vector-icons'
import { useRoute } from '@react-navigation/native'  
import { LanguageToggle } from "../components/LanguageToggle"  
import { useAuthGuard } from "../hooks/useAuthGuard"  
import { getMarketData, getFeaturedStocks } from "../rest/api"  
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getMarketStocks, getLatinAmericanStocks, searchStocks, MarketStock, getTechStocks, getEnergyStocks, getFinanceStocks } from '../services/searchApiService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../supabase'  
  
interface Stock {  
  id: string  
  symbol: string  
  company_name: string  
  current_price: number  
  price_change: number  
  price_change_percent: number  
  color: string  
  is_featured: boolean  
  logo_url?: string
}  
  
export function MarketInfoScreen({ navigation }: any) {  
  const { t } = useTranslation()  
  const insets = useSafeAreaInsets()  
  const route = useRoute()
  const currentRoute = route.name
  const [searchQuery, setSearchQuery] = useState("")  
  const [stocks, setStocks] = useState<Stock[]>([])  
  const [featuredStocks, setFeaturedStocks] = useState<Stock[]>([])  
  const [loading, setLoading] = useState(true)  
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 })
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [showStockModal, setShowStockModal] = useState(false)  
  
  useAuthGuard()  
  
  const handleNavigation = (screen: string) => navigation.navigate(screen)

  const loadMarketData = useCallback(async () => {  
    try {  
      console.log('📊 [MarketInfo] Iniciando carga de datos...');
      
      // Cargar datos del caché primero para mostrar inmediatamente
      const cachedData = await AsyncStorage.getItem('market_stocks_cache');
      if (cachedData) {
        console.log('✅ [MarketInfo] Datos en caché encontrados');
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        const cacheMaxAge = 5 * 60 * 1000; // 5 minutos
        
        if (cacheAge < cacheMaxAge) {
          setStocks(parsed.stocks);
          setFeaturedStocks(parsed.featured);
          setLoading(false);
          console.log(`📈 [MarketInfo] Mostrando ${parsed.stocks.length} stocks del caché`);
          return; // Usar caché si es reciente
        }
      }
      
      setLoading(true);
      
      // Cargar solo stocks principales (más rápido)
      console.log('📊 [MarketInfo] Cargando stocks principales...');
      const realStocks = await getMarketStocks();
      
      console.log(`📊 [MarketInfo] API response: ${realStocks.length} stocks`);
      
      if (realStocks.length > 0) {
        const allRealStocks = realStocks.map((stock, index) => ({
          id: `${stock.symbol}-${index}`,
          symbol: stock.symbol,
          company_name: stock.name,
          current_price: stock.price,
          price_change: stock.change,
          price_change_percent: stock.changePercent,
          color: stock.changePercent >= 0 ? '#10B981' : '#EF4444',
          is_featured: index < 4,
          logo_url: stock.logo,
        }));
        
        setStocks(allRealStocks);
        setFeaturedStocks(allRealStocks.filter(s => s.is_featured));
        
        // Guardar en caché
        await AsyncStorage.setItem('market_stocks_cache', JSON.stringify({
          stocks: allRealStocks,
          featured: allRealStocks.filter(s => s.is_featured),
          timestamp: Date.now()
        }));
        
        console.log(`✅ [MarketInfo] ${allRealStocks.length} stocks cargados y guardados en caché`);
      } else {
        // Si no hay datos de API, usar datos de fallback
        console.log('⚠️ [MarketInfo] No hay datos de API, usando fallback');
        const fallbackStocks = [
          { id: '1', symbol: 'AAPL', company_name: 'Apple Inc.', current_price: 150.25, price_change: 2.5, price_change_percent: 1.69, color: '#10B981', is_featured: true },
          { id: '2', symbol: 'GOOGL', company_name: 'Alphabet Inc.', current_price: 2800.50, price_change: -15.25, price_change_percent: -0.54, color: '#EF4444', is_featured: true },
          { id: '3', symbol: 'MSFT', company_name: 'Microsoft Corp.', current_price: 310.75, price_change: 5.10, price_change_percent: 1.67, color: '#10B981', is_featured: true },
          { id: '4', symbol: 'AMZN', company_name: 'Amazon.com Inc.', current_price: 3200.00, price_change: 25.50, price_change_percent: 0.80, color: '#10B981', is_featured: true },
        ];
        setStocks(fallbackStocks);
        setFeaturedStocks(fallbackStocks);
      }
    } catch (error) {  
      console.error('❌ [MarketInfo] Error al cargar datos:', error);
      // Usar datos de fallback en caso de error
      const fallbackStocks = [
        { id: '1', symbol: 'AAPL', company_name: 'Apple Inc.', current_price: 150.25, price_change: 2.5, price_change_percent: 1.69, color: '#10B981', is_featured: true },
        { id: '2', symbol: 'GOOGL', company_name: 'Alphabet Inc.', current_price: 2800.50, price_change: -15.25, price_change_percent: -0.54, color: '#EF4444', is_featured: true },
        { id: '3', symbol: 'MSFT', company_name: 'Microsoft Corp.', current_price: 310.75, price_change: 5.10, price_change_percent: 1.67, color: '#10B981', is_featured: true },
        { id: '4', symbol: 'AMZN', company_name: 'Amazon.com Inc.', current_price: 3200.00, price_change: 25.50, price_change_percent: 0.80, color: '#10B981', is_featured: true },
      ];
      setStocks(fallbackStocks);
      setFeaturedStocks(fallbackStocks);
    } finally {  
      setLoading(false)  
      setRefreshing(false)  
    }  
  }, [])  
  
  useEffect(() => {  
    loadMarketData()  
  }, [loadMarketData])  
  
  const onRefresh = useCallback(() => {  
    setRefreshing(true)  
    loadMarketData()  
  }, [loadMarketData]) 
  
  const filters = ['Todos', 'Chile', 'USA', 'Tecnología', 'Energía', 'Finanzas']

  const handleAddToPortfolio = async (stock: Stock) => {
    try {
      console.log('📊 Agregar a portafolio:', stock.symbol)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión')
        return
      }
      
      const { error } = await supabase
        .from('user_portfolio')
        .insert({
          user_id: user.id,
          stock_symbol: stock.symbol,
          stock_name: stock.company_name,
          purchase_price: stock.current_price,
          quantity: 1,
        })
      
      if (!error) {
        Alert.alert('✓ Agregado', `${stock.symbol} agregado a tu portafolio`)
      } else {
        console.error('Error al agregar:', error)
        Alert.alert('Info', 'Ya tienes esta acción en tu portafolio')
      }
    } catch (error) {
      console.error('Error adding to portfolio:', error)
      Alert.alert('Error', 'No se pudo agregar al portafolio')
    }
  }

  const handleSimulateInvestment = (stock: Stock) => {
    console.log('🎯 Simular inversión:', stock.symbol)
    
    try {
      const stockData = {
        symbol: stock.symbol,
        name: stock.company_name,
        price: stock.current_price,
        change: stock.price_change_percent
      };
      
      // Navegar al Stack Navigator padre
      console.log('✅ [MarketInfo] Navegando a InvestmentSimulator con:', stockData);
      const parentNav = navigation.getParent();
      if (parentNav) {
        parentNav.navigate('InvestmentSimulator', { stock: stockData });
      } else {
        navigation.navigate('InvestmentSimulator' as never, { stock: stockData } as never);
      }
    } catch (error) {
      console.error('❌ Error navigating to simulator:', error);
      Alert.alert('Error', 'No se pudo abrir el simulador');
    }
  }

  // Definir símbolos por categoría
  const chileStocks = ['SQM', 'COPEC', 'BCI', 'BSAC', 'ENIC', 'CCU', 'COLO', 'COLG', 'CONCHA', 'CUPRUM', 'ECL', 'FALABELLA', 'FORUS', 'ITAUCORP', 'ITAU'];
  const techStocksList = ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD', 'INTC', 'QCOM', 'AVGO', 'MU', 'MCHP', 'NXPI', 'LRCX', 'ASML', 'ARM', 'ADBE', 'CRM', 'NFLX', 'SNOW', 'CRWD', 'OKTA', 'DDOG', 'NET', 'WDAY', 'VEEV', 'ORCL', 'IBM', 'HPQ', 'DELL', 'KEYS', 'SWKS', 'XLNX', 'INTU', 'RBLX', 'ROKU', 'PALO', 'ZS', 'FTNT', 'CHKP', 'TENB', 'VRNS', 'PANW', 'SPLK', 'SMAR', 'CYBL', 'PLTR', 'AI', 'UPST', 'COIN', 'MSTR', 'MARA', 'RIOT', 'CLSK', 'CIFR', 'GEVO', 'VZ', 'T', 'CMCSA', 'CHTR', 'TMUS', 'S', 'DISH', 'LUMN', 'ATVI', 'EA', 'TTWO', 'TAKE', 'ZNGA', 'UACL', 'BILI', 'BGCP', 'JOYY', 'IQ'];
  const energyStocksList = ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'HES', 'OXY', 'APA', 'FANG', 'DVN', 'MRO', 'CDEV', 'VTLE', 'PARR', 'CHRD', 'DINO', 'CROX', 'NEE', 'DUK', 'SO', 'EXC', 'AEP', 'XEL', 'AWK', 'CMS', 'AES', 'PEG', 'ED', 'WEC', 'PPL', 'DTE', 'FE', 'ETR', 'NRG', 'EIX', 'EVRG', 'LNT', 'KMI', 'MMP', 'WMB', 'TRGP', 'OKE', 'LNG', 'PAGP', 'MPLX', 'EPD', 'VICI', 'RUN', 'PLUG', 'FCEL', 'CLNE', 'ICLN', 'TAN', 'QCLN', 'ACES', 'DRIP', 'SHYF'];
  const financeStocksList = ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'SCHW', 'TROW', 'BK', 'STT', 'USB', 'PNC', 'TFC', 'FITB', 'HBAN', 'KEY', 'CFG', 'ZION', 'WTFC', 'WAFD', 'BRK.B', 'AXP', 'PRU', 'MET', 'AFL', 'LPL', 'HIG', 'ALL', 'TRV', 'CB', 'AMG', 'ESGR', 'VOYA', 'IVZ', 'SSNC', 'SS', 'NWLI', 'MORN', 'CFRA', 'LSCC', 'V', 'MA', 'DFS', 'SQ', 'PYPL', 'COIN', 'SOFI', 'AFRM', 'DLR', 'EQIX', 'PLD', 'PSA', 'AMT', 'CCI', 'WELL', 'STAG', 'REXR', 'RKT', 'UWMC', 'NEW', 'CADE', 'CODI', 'RESI', 'MGIC', 'MTG', 'NRZ', 'INVH'];

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
      stock.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedFilter === 'Todos') return matchesSearch
    if (selectedFilter === 'Chile') return matchesSearch && chileStocks.includes(stock.symbol)
    if (selectedFilter === 'USA') return matchesSearch && !chileStocks.includes(stock.symbol)
    if (selectedFilter === 'Tecnología') return matchesSearch && techStocksList.includes(stock.symbol)
    if (selectedFilter === 'Energía') return matchesSearch && energyStocksList.includes(stock.symbol)
    if (selectedFilter === 'Finanzas') return matchesSearch && financeStocksList.includes(stock.symbol)
    return matchesSearch
  })  
  
  return (  
    <SafeAreaView style={styles.container}>  
      {/* Header con título y búsqueda */}  
      <View style={styles.header}>  
        <View style={styles.headerContent}>  
          <Text style={styles.headerTitle}>Información de la Bolsa</Text>  
          <LanguageToggle />  
        </View>  
  
        <View style={styles.searchContainer}>  
          <Search size={20} color="#667" />  
          <TextInput  
            style={styles.searchInput}  
            placeholder="Buscar acciones..."  
            placeholderTextColor="#999"  
            value={searchQuery}  
            onChangeText={setSearchQuery}  
          />  
        </View>  
      </View>  
  
      <ScrollView   
        style={styles.scrollView}   
        showsVerticalScrollIndicator={false}  
        refreshControl={  
          <RefreshControl  
            refreshing={refreshing}  
            onRefresh={onRefresh}  
            colors={['#2673f3']}  
            tintColor="#2673f3"  
          />  
        }  
      >  
        {/* Filtros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerIcon}>⚠️</Text>
          <Text style={styles.disclaimerText}>
            <Text style={styles.disclaimerBold}>Ojo:</Text> esta es solo una simulación. No garantiza resultados reales ni constituye asesoría financiera. Invertir siempre conlleva riesgos. Te recomendamos informarte y, si es necesario, buscar orientación profesional antes de invertir.
          </Text>
        </View>
  
        {/* Sección de acciones destacadas */}  
        <View style={styles.section}>  
          <View style={styles.sectionHeader}>  
            <Text style={styles.sectionTitle}>Actualizaciones Relevantes</Text>  
            <TouchableOpacity>  
              <Text style={styles.seeAllText}>Ver todo</Text>  
            </TouchableOpacity>  
          </View>  
  
          <View style={styles.featuredStocks}>  
            {featuredStocks.slice(0, 2).map((stock, index) => (  
              <View key={stock.id} style={[styles.featuredStock, { backgroundColor: '#fff' }]}>  
                <View style={styles.featuredInline}>  
                  <View style={[styles.stockIcon, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6e6e6' }]}>  
                    {stock.logo_url ? (
                      <Image source={{ uri: stock.logo_url }} style={styles.stockLogo} resizeMode="contain" />
                    ) : (
                      <Text style={[styles.stockIconText, { color: '#111' }]}>{stock.symbol.charAt(0)}</Text>
                    )}
                  </View >
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.featuredSymbolLight}>{stock.symbol}</Text>
                    <Text style={styles.featuredCompanyLight}>{stock.company_name}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                <Text style={styles.featuredPriceLight}>${Number(stock.current_price).toFixed(2)}</Text>  
                <Text style={[styles.featuredChangeLight, { color: stock.price_change_percent > 0 ? '#10B981' : '#EF4444' }]}>  
                  {stock.price_change_percent > 0 ? '+' : ''}{Number(stock.price_change_percent).toFixed(2)}%  
                </Text>  
                </View>
              </View>  
            ))}  
          </View>  
        </View>  
  
        {/* Sección del mercado actual */}  
        <View style={styles.section}>  
          <View style={styles.sectionHeader}>  
            <View>
              <Text style={styles.sectionTitle}>Mercado Actual</Text>
              <Text style={styles.dataCountText}>📊 {filteredStocks.length} acciones cargadas</Text>
            </View>
            <TouchableOpacity>  
              <TrendingUp size={20} color="#667" />  
            </TouchableOpacity>  
          </View>  
  
          <View style={styles.stocksList}>  
            {loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {loadingProgress.total > 0 
                    ? `Cargando ${loadingProgress.current}/${loadingProgress.total} acciones...`
                    : 'Cargando datos del mercado...'}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {loadingProgress.total > 0 
                    ? `${Math.round((loadingProgress.current / loadingProgress.total) * 100)}% completado`
                    : 'Por favor espera un momento'}
                </Text>
              </View>
            ) : filteredStocks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No hay datos disponibles</Text>
                <Text style={styles.emptyStateSubtext}>Desliza hacia abajo para recargar</Text>
              </View>
            ) : null}
            {filteredStocks.map((stock) => (  
              <View key={stock.id} style={styles.stockItemWrapper}>
              <TouchableOpacity style={styles.stockItem} onPress={() => handleSimulateInvestment(stock)}>  
                <View style={[styles.stockIcon, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6e6e6' }]}>  
                  {stock.logo_url ? (
                    <Image source={{ uri: stock.logo_url }} style={styles.stockLogo} resizeMode="contain" />
                  ) : (
                    <Text style={styles.stockIconText}>{stock.symbol.charAt(0)}</Text>
                  )}
                </View>  
  
                <View style={styles.stockInfo}>  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                    {(stock.symbol.includes('.SN') || ['SQM', 'COPEC'].includes(stock.symbol)) && (
                      <Text style={{ fontSize: 16 }}>🇨🇱</Text>
                    )}
                  </View>
                  <Text style={styles.stockCompany}>{stock.company_name}</Text>  
                </View>  
  
                <View style={styles.stockPrice}>  
                  <Text style={styles.stockPriceText}>${Number(stock.current_price).toFixed(2)}</Text>  
                  <View style={styles.stockChange}>  
                    {stock.price_change_percent > 0 ? (  
                      <TrendingUp size={16} color="#10B981" />  
                    ) : (  
                      <TrendingDown size={16} color="#EF4444" />  
                    )}  
                    <Text style={[  
                      styles.stockChangeText,   
                      { color: stock.price_change_percent > 0 ? "#10B981" : "#EF4444" }  
                    ]}>  
                      {stock.price_change_percent > 0 ? '+' : ''}{Number(stock.price_change_percent).toFixed(2)}%  
                    </Text>  
                  </View>  
                </View>  
              </TouchableOpacity>
              <View style={styles.stockActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAddToPortfolio(stock)}
                >
                  <Ionicons name="briefcase-outline" size={18} color="#2673f3" />
                  <Text style={styles.actionButtonText}>Portafolio</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSimulateInvestment(stock)}
                >
                  <Ionicons name="calculator-outline" size={18} color="#10B981" />
                  <Text style={styles.actionButtonText}>Simular</Text>
                </TouchableOpacity>
              </View>
              </View>  
            ))}  
          </View>  
  
          {filteredStocks.length === 0 && searchQuery.trim() && (  
            <View style={styles.emptyState}>  
              <Text style={styles.emptyStateText}>No se encontraron resultados</Text>  
              <Text style={styles.emptyStateSubtext}>Intenta con otros términos de búsqueda</Text>  
            </View>  
          )}  
        </View>  
      </ScrollView>  
  
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("HomeFeed")} 
        >
          <Ionicons 
            name={currentRoute === "HomeFeed" ? "home" : "home-outline"}
            size={26} 
            color={currentRoute === "HomeFeed" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("MarketInfo")} 
        >
          <Ionicons 
            name={currentRoute === "MarketInfo" ? "trending-up" : "trending-up-outline"}
            size={26} 
            color={currentRoute === "MarketInfo" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.fabContainer} 
          onPress={() => handleNavigation("CreatePost")} 
        >
          <View style={styles.fabButton}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("News")} 
        >
          <Ionicons 
            name={currentRoute === "News" ? "newspaper" : "newspaper-outline"}
            size={26} 
            color={currentRoute === "News" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("Educacion")} 
        >
          <Ionicons 
            name={currentRoute === "Educacion" ? "school" : "school-outline"}
            size={26} 
            color={currentRoute === "Educacion" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>
      </View>  
    </SafeAreaView>  
  )  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: "#f7f8fa",  
  },
  scrollView: {
    flex: 1,
    ...(Platform.OS === 'web' ? { overflow: 'auto' as any, height: '100vh' as any } : {}),
  },  
  header: {  
    backgroundColor: "white",  
    paddingHorizontal: 16,  
    paddingVertical: 12,  
    borderBottomWidth: 1,  
    borderBottomColor: "#e5e5e5",  
  },  
  headerContent: {  
    flexDirection: "row",  
    alignItems: "center",  
    justifyContent: "space-between",  
    marginBottom: 16,  
  },  
  headerTitle: {  
    fontSize: 20,  
    fontWeight: "bold",  
    color: "#111",  
  },  
  searchContainer: {  
    flexDirection: "row",  
    alignItems: "center",  
    backgroundColor: "#f0f0f0",  
    borderRadius: 20,  
    paddingHorizontal: 16,  
    paddingVertical: 8,  
  },  
  searchInput: {  
    flex: 1,  
    marginLeft: 8,  
    fontSize: 16,  
    color: "#111",  
  },  
  section: {  
    paddingHorizontal: 16,  
    paddingVertical: 16,  
  },  
  sectionHeader: {  
    flexDirection: "row",  
    alignItems: "center",  
    justifyContent: "space-between",  
    marginBottom: 16,  
  },  
  sectionTitle: {  
    fontSize: 18,  
    fontWeight: "600",  
    color: "#111",  
  },  
  seeAllText: {  
    color: "#2673f3",  
    fontSize: 16,  
    fontWeight: "500",  
  },  
  featuredStocks: {  
    flexDirection: "row",  
    gap: 16,  
  },  
  featuredStock: {  
    flex: 1,  
    borderRadius: 12,  
    padding: 16,  
  },  
  featuredInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  featuredSymbol: {  
    color: "white",  
    fontSize: 16,  
    fontWeight: "bold",  
    marginBottom: 4,  
  },  
  featuredCompany: {  
    color: "rgba(255, 255, 255, 0.8)",  
    fontSize: 14,  
    marginBottom: 8,  
  },  
  featuredPrice: {  
    color: "white",  
    fontSize: 20,  
    fontWeight: "bold",  
    marginBottom: 4,  
  },  
  featuredChange: {  
    color: "#10B981",  
    fontSize: 14,  
    fontWeight: "500",  
  },  
  featuredSymbolLight: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700'
  },
  featuredCompanyLight: {
    color: '#666',
    fontSize: 14
  },
  featuredPriceLight: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700'
  },
  featuredChangeLight: {
    fontSize: 14,
    fontWeight: '600',
    paddingLeft: 14,
  },
  stocksList: {  
    gap: 12,  
  },  
  stockItem: {  
    flexDirection: "row",  
    alignItems: "center",  
    paddingVertical: 12,  
    borderBottomWidth: 1,  
    borderBottomColor: "#f0f0f0",  
  },  
  stockIcon: {  
    width: 40,  
    height: 40,  
    borderRadius: 999,  
    alignItems: "center",  
    justifyContent: "center",  
    marginRight: 16,  
  },  
  stockIconText: {  
    color: "white",  
    fontSize: 16,  
    fontWeight: "bold",  
  },  
  stockLogo: {
    width: 32,
    height: 32,
    borderRadius: 999,
  },
  stockInfo: {  
    flex: 1,  
  },  
  stockSymbol: {  
    fontSize: 16,  
    fontWeight: "600",  
    color: "#111",  
  },  
  stockCompany: {  
    fontSize: 14,  
    color: "#667",  
  },  
  stockPrice: {  
    alignItems: "flex-end",  
  },  
  stockPriceText: {  
    fontSize: 16,  
    fontWeight: "600",  
    color: "#111",  
  },  
  stockChange: {  
    flexDirection: "row",  
    alignItems: "center",  
  },  
  stockChangeText: {  
    fontSize: 14,  
    fontWeight: "500",  
    marginLeft: 4,  
  },  
  emptyState: {  
    alignItems: "center",  
    paddingVertical: 40,  
  },  
  emptyStateText: {  
    fontSize: 16,  
    fontWeight: "600",  
    color: "#666",  
    marginBottom: 8,  
  },  
  emptyStateSubtext: {  
    fontSize: 14,  
    color: "#999",  
    textAlign: "center",  
  },  
    
  // Navbar styles (igual al HomeFeed)  
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  navItem: {
    padding: 12,
  },
  fabContainer: {
    marginTop: -16,
    padding: 8,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2673f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2673f3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    gap: 10,
  },
  disclaimerIcon: {
    fontSize: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: '700',
  },
  filtersContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#2673f3',
    borderColor: '#2673f3',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  stockItemWrapper: {
    marginBottom: 12,
  },
  stockActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    paddingLeft: 56,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  dataCountText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
})