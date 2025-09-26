"use client"  
  
import { useState, useEffect } from "react"  
import {  
  View,  
  Text,  
  TouchableOpacity,  
  StyleSheet,  
  SafeAreaView,  
  Image,  
  ScrollView,  
  ActivityIndicator,  
  FlatList,  
  Animated,
} from "react-native"  
import { useTranslation } from "react-i18next"  
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import {   
  Users,   
  ArrowRight,   
  CreditCard,   
  BookOpen,   
  Layers,   
  MessageSquare,   
  Share2,   
  Bookmark,  
  Settings,  
  TrendingUp,   
  Gift,  
  Building,  
  UserCheck,  
  Newspaper,  
  Bell,  
  Mail,
  Globe  
} from "lucide-react-native"  
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLanguage } from "../contexts/LanguageContext"  
  
const screens = [  
  {  
    id: '1',  
    number: '01',  
    title: 'Inicio',  
    description: 'Pantalla principal con feed personalizado',  
    icon: <Layers size={24} color="#007AFF" />,  
    screen: 'HomeFeed'  
  },  
  {  
    id: '2',  
    number: '02',  
    title: 'Crear Publicación',  
    description: 'Crea y comparte contenido',  
    icon: <Share2 size={24} color="#007AFF" />,  
    screen: 'CreatePost'  
  },  
  {  
    id: '3',  
    number: '03',  
    title: 'Detalle de Publicación',  
    description: 'Vista detallada de publicaciones',  
    icon: <BookOpen size={24} color="#007AFF" />,  
    screen: 'PostDetail'  
  },  
  {  
    id: '4',  
    number: '04',  
    title: 'Comunidades',  
    description: 'Explora y únete a comunidades',  
    icon: <Users size={24} color="#007AFF" />,  
    screen: 'Communities'  
  },  
  {  
    id: '5',  
    number: '05',  
    title: 'Detalle de Comunidad',  
    description: 'Información detallada de comunidades',  
    icon: <Users size={24} color="#007AFF" />,  
    screen: 'CommunityDetail'  
  },  
  {  
    id: '6',  
    number: '06',  
    title: 'Perfil',  
    description: 'Tu perfil personal',  
    icon: <UserCheck size={24} color="#007AFF" />,  
    screen: 'Profile'  
  },  
  {  
    id: '7',  
    number: '07',  
    title: 'Configuración',  
    description: 'Ajustes de la aplicación',  
    icon: <Settings size={24} color="#007AFF" />,  
    screen: 'Settings'  
  },  
  {  
    id: '8',  
    number: '08',  
    title: 'Información del Mercado',  
    description: 'Datos financieros en tiempo real',  
    icon: <TrendingUp size={24} color="#007AFF" />,  
    screen: 'MarketInfo'  
  },  
  {  
    id: '9',  
    number: '09',  
    title: 'Educación',  
    description: 'Contenido educativo financiero',  
    icon: <BookOpen size={24} color="#007AFF" />,  
    screen: 'Educacion'  
  },  
  {  
    id: '10',  
    number: '10',  
    title: 'Promociones',  
    description: 'Ofertas y promociones especiales',  
    icon: <Gift size={24} color="#007AFF" />,  
    screen: 'Promotions'  
  },  
  {  
    id: '11',  
    number: '11',  
    title: 'Detalle de Promoción',  
    description: 'Información detallada de promociones',  
    icon: <Gift size={24} color="#007AFF" />,  
    screen: 'PromotionDetail'  
  },  
  {  
    id: '12',  
    number: '12',  
    title: 'Inversiones',  
    description: 'Oportunidades de inversión',  
    icon: <Building size={24} color="#007AFF" />,  
    screen: 'Inversiones'  
  },  
  {  
    id: '13',  
    number: '13',  
    title: 'Perfil Inversionista',  
    description: 'Perfil de inversionistas',  
    icon: <Building size={24} color="#007AFF" />,  
    screen: 'Inversionista'  
  },  
  {  
    id: '14',  
    number: '14',  
    title: 'Noticias',  
    description: 'Últimas noticias financieras',  
    icon: <Newspaper size={24} color="#007AFF" />,  
    screen: 'News'  
  },  
  {  
    id: '15',  
    number: '15',  
    title: 'Detalle de Noticia',  
    description: 'Vista detallada de noticias',  
    icon: <Newspaper size={24} color="#007AFF" />,  
    screen: 'NewsDetail'  
  },  
  {  
    id: '16',  
    number: '16',  
    title: 'Lista de Chats',  
    description: 'Tus conversaciones',  
    icon: <MessageSquare size={24} color="#007AFF" />,  
    screen: 'ChatList'  
  },  
  {  
    id: '17',  
    number: '17',  
    title: 'Chat Individual',  
    description: 'Conversaciones privadas',  
    icon: <MessageSquare size={24} color="#007AFF" />,  
    screen: 'ChatScreen'  
  },  
  {  
    id: '18',  
    number: '18',  
    title: 'Mensajes',  
    description: 'Sistema de mensajería',  
    icon: <Mail size={24} color="#007AFF" />,  
    screen: 'Messages'  
  },  
  {  
    id: '19',  
    number: '19',  
    title: 'Notificaciones',  
    description: 'Centro de notificaciones',  
    icon: <Bell size={24} color="#007AFF" />,  
    screen: 'Notifications'  
  },  
  {  
    id: '20',  
    number: '20',  
    title: 'Pagos',  
    description: 'Gestión de pagos y transacciones',  
    icon: <CreditCard size={24} color="#007AFF" />,  
    screen: 'Payment'  
  },  
  {  
    id: '21',  
    number: '21',  
    title: 'Detalle de Curso',  
    description: 'Información detallada del curso',  
    icon: <BookOpen size={24} color="#007AFF" />,  
    screen: 'CourseDetail'  
  },  
  {  
    id: '22',  
    number: '22',  
    title: 'Rutas de Aprendizaje',  
    description: 'Caminos educativos estructurados',  
    icon: <Layers size={24} color="#007AFF" />,  
    screen: 'LearningPaths'  
  },  
  {  
    id: '23',  
    number: '23',  
    title: 'Chat Grupal',  
    description: 'Conversaciones grupales',  
    icon: <MessageSquare size={24} color="#007AFF" />,  
    screen: 'GroupChat'  
  },  
  {  
    id: '24',  
    number: '24',  
    title: 'Compartir Publicación',  
    description: 'Comparte contenido externo',  
    icon: <Share2 size={24} color="#007AFF" />,  
    screen: 'SharePost'  
  },  
  {  
    id: '25',  
    number: '25',  
    title: 'Publicaciones Guardadas',  
    description: 'Contenido que has guardado', 
    icon: <Bookmark size={24} color="#007AFF" />,
    screen: 'SavedPosts'
  }  
];

interface WelcomeScreenProps {
  navigation?: any;
}

export const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {  
  const { t } = useTranslation()  
  const { isLanguageSelected } = useLanguage()
  const [loading, setLoading] = useState(false)  
  const [loadingScreen, setLoadingScreen] = useState('')  
  const insets = useSafeAreaInsets()
  
  // Usar el hook de navegación si no se proporciona por props
  const nav = navigation || useNavigation<StackNavigationProp<any>>()
  
  const handleSignIn = () => {
    nav.navigate('SignIn')
  }
  
  const handleSignUp = () => {
    nav.navigate('SignUp')
  }

  // Redirect to language selection if no language has been chosen
  useEffect(() => {
    // Language selection is now handled by the navigation flow
    // No se necesita navegación aquí ya que se maneja en el flujo principal
  }, [])

  const renderScreenItem = ({ item }: { item: typeof screens[0] }) => (  
    <TouchableOpacity  
      style={styles.screenItem}  
      onPress={() => {  
        setLoading(true)  
        setLoadingScreen(item.title)  
        setTimeout(() => {  
          try {  
            // Navegación a través de los handlers
            if (item.screen === 'SignIn') {
              handleSignIn();
            } else if (item.screen === 'SignUp') {
              handleSignUp();
            }  
          } catch (error) {  
            console.error(`Error navegando a ${item.screen}:`, error)  
          } finally {  
            setLoading(false)  
            setLoadingScreen('')  
          }  
        }, 500)  
      }}  
    >  
      <View style={styles.numberContainer}>  
        <Text style={styles.numberText}>{item.number}</Text>  
      </View>  
      <View style={styles.screenIconContainer}>  
        {item.icon}  
      </View>  
      <View style={styles.screenTextContainer}>  
        <Text style={styles.screenTitle}>{item.title}</Text>  
        <Text style={styles.screenDescription}>{item.description}</Text>  
      </View>  
      <ArrowRight size={20} color="#666" />  
    </TouchableOpacity>  
  )  
  
  return (  
    <View style={[styles.container, { paddingTop: insets.top }]}>  
      <ScrollView  
        style={styles.scrollView}  
        contentContainerStyle={styles.content}  
        showsVerticalScrollIndicator={false}  
      >  
        <View style={styles.heroContainer}>  
          <Image  
            source={require("../../assets/Frame1.png")}  
            style={styles.heroImage}  
            resizeMode="contain"  
          />  
        </View>  

        <View style={styles.logoContainer}>  
          <Image  
            source={require("../../assets/investi-logo.png")}  
            style={styles.logo}  
            resizeMode="contain"  
          />  
        </View>  

        <Text style={styles.description}>  
          {t('welcome.description', '¡Únete a la primera red social de educación financiera y de inversionistas en el mundo!')}
        </Text>

        <View style={styles.statsContainer}>  
          <View style={styles.brandingContainer}>
            <View style={styles.brandingItem}>
              <Users size={20} color="#2673f3" />
              <Text style={styles.brandingText}>Conecta</Text>
            </View>
            <View style={styles.brandingItem}>
              <BookOpen size={20} color="#2673f3" />
              <Text style={styles.brandingText}>Aprende</Text>
            </View>
            <View style={styles.brandingItem}>
              <TrendingUp size={20} color="#2673f3" />
              <Text style={styles.brandingText}>Crece</Text>
            </View>
          </View>
        </View>  
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading && loadingScreen === 'signup' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Empezar</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading && loadingScreen === 'signin' ? (
              <ActivityIndicator color="#2673f3" />
            ) : (
              <Text style={styles.secondaryButtonText}>Ya tengo una cuenta</Text>
            )}
          </TouchableOpacity>
        </View>  
  
        {loading && (  
          <View style={styles.loadingOverlay}>  
            <View style={styles.loadingContainer}>  
              <ActivityIndicator size="large" color="#007AFF" />  
              <Text style={styles.loadingText}>Cargando {loadingScreen}...</Text>  
            </View>  
          </View>  
        )}  
      </ScrollView>  
    </View>  
  )  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: "#f7f8fa",  
  },  
  scrollView: {  
    flex: 1,  
  },  
  content: {  
    flexGrow: 1,  
    paddingHorizontal: 20,  
    paddingVertical: 20,  
  },  
  heroContainer: {  
    alignItems: "center",  
    marginBottom: 32,  
  },  
  heroImage: {  
    width: 300,  
    height: 200,  
  },  
  logoContainer: {  
    alignItems: "center",  
    marginBottom: 24,  
  },  
  logo: {  
    width: 180,  
    height: 50,  
    maxWidth: '80%',
  },  
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 30,
    marginTop: 40,
    gap: 16,
  },  
  iconContainer: {  
    width: 36,  
    height: 36,  
    backgroundColor: "#007AFF",  
    borderRadius: 8,  
    alignItems: "center",  
    justifyContent: "center",  
    marginRight: 12,  
  },  
  iconText: {  
    color: "white",  
    fontSize: 20,  
    fontWeight: "bold",  
  },  
  title: {  
    fontSize: 28,  
    fontWeight: "bold",  
    color: "#111",  
    marginRight: 8,  
  },  
  subtitle: {  
    fontSize: 28,  
    fontWeight: "300",  
    color: "#007AFF",  
  },  
  description: {  
    fontSize: 16,  
    color: "#666",  
    textAlign: "center",  
    marginHorizontal: 30,  
    marginBottom: 30,  
    lineHeight: 24,  
  },  
  statsContainer: {  
    alignItems: "center",  
    marginBottom: 10,  
  },  
  statsText: {  
    fontSize: 14,  
    color: "#2673f3",  
    fontWeight: "500",  
  },  
  screensList: {  
    marginBottom: 24,  
  },  
  screenItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    backgroundColor: 'white',  
    borderRadius: 12,  
    padding: 16,  
    marginBottom: 12,  
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.1,  
    shadowRadius: 4,  
    elevation: 3,  
  },  
  numberContainer: {  
    width: 32,  
    height: 32,  
    borderRadius: 16,  
    backgroundColor: '#007AFF',  
    justifyContent: 'center',  
    alignItems: 'center',  
    marginRight: 12,  
  },  
  numberText: {  
    color: 'white',  
    fontSize: 14,  
    fontWeight: 'bold',  
  },  
  screenIconContainer: {  
    width: 40,  
    height: 40,  
    borderRadius: 20,  
    backgroundColor: 'rgba(0, 122, 255, 0.1)',  
    justifyContent: 'center',  
    alignItems: 'center',  
    marginRight: 16,  
  },  
  screenTextContainer: {  
    flex: 1,  
  },  
  screenTitle: {  
    fontSize: 16,  
    fontWeight: '600',  
    color: '#111',  
    marginBottom: 4,  
  },  
  screenDescription: {  
    fontSize: 13,  
    color: '#666',  
  },  
  primaryButton: {  
    backgroundColor: "#2673f3",  
    paddingVertical: 18,  
    borderRadius: 12,  
    alignItems: "center",  
    width: '100%',
  },  
  primaryButtonText: {  
    color: "white",  
    fontSize: 16,  
    fontWeight: "600",  
  },  
  secondaryButton: {  
    backgroundColor: "transparent",  
    borderWidth: 1,  
    borderColor: "#2673f3",  
    paddingVertical: 18,  
    borderRadius: 12,  
    alignItems: "center",  
    width: '100%',
  },  
  secondaryButtonText: {  
    color: "#2673f3",  
    fontSize: 16,  
    fontWeight: "600",  
  },  
  brandingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  brandingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2673f3',
  },
  loadingOverlay: {  
    position: 'absolute',  
    top: 0,  
    left: 0,  
    right: 0,  
    bottom: 0,  
    backgroundColor: 'rgba(0,0,0,0.5)',  
    justifyContent: 'center',  
    alignItems: 'center',  
  },  
  loadingContainer: {  
    backgroundColor: 'white',  
    borderRadius: 12,  
    padding: 20,  
    alignItems: 'center',  
  },  
  loadingText: {  
    color: '#111',  
    marginTop: 10,  
    fontSize: 16,  
  },  
})