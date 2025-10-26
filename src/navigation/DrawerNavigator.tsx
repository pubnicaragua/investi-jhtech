import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HomeFeedScreen } from '../screens/HomeFeedScreen';
import { MarketInfoScreen } from '../screens/MarketInfoScreen';
import { InvestmentSimulatorScreen } from '../screens/InvestmentSimulatorScreen';
import { CalculadoraDividendosScreen } from '../screens/CalculadoraDividendosScreen';
import { AnalizadorRatiosScreen } from '../screens/AnalizadorRatiosScreen';
import { SimuladorPortafolioScreen } from '../screens/SimuladorPortafolioScreen';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { User, Settings, HelpCircle, LogOut, Home, TrendingUp, BarChart3, PieChart } from 'lucide-react-native';
import { authSignOut } from '../rest/api'

const Drawer = createDrawerNavigator();

// Componente personalizado para el contenido del drawer
function CustomDrawerContent(props: any) {
  const navigation = useNavigation();
  
  return (
    <View style={styles.drawerContainer}>
      {/* Header con foto de perfil */}
      <View style={styles.profileContainer}>
        <Image 
          source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} 
          style={styles.profileImage}
        />
        <Text style={styles.userName}>Juan Pérez</Text>
        <Text style={styles.userEmail}>juan.perez@example.com</Text>
      </View>

      {/* Opciones del menú */}
      <DrawerContentScrollView {...props}>
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Principal</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <User size={20} color="#4A6CF7" />
            </View>
            <Text style={styles.menuItemText}>Mi perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Settings size={20} color="#4A6CF7" />
            </View>
            <Text style={styles.menuItemText}>Configuración</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <HelpCircle size={20} color="#4A6CF7" />
            </View>
            <Text style={styles.menuItemText}>Ayuda y soporte</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
      
      {/* Pie de página con botón de cierre de sesión */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await authSignOut()
            } catch (err) {
              console.warn('Drawer logout error:', err)
            }
            // Reset navigation to public welcome screen
            // @ts-ignore
            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })
          }}
        >
          <LogOut size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: '80%',
          backgroundColor: '#fff',
        },
        headerShown: false,
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeFeedScreen} 
        options={{
          title: 'Inicio',
          headerShown: false,
          drawerLabel: 'Inicio',
          drawerIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="MarketInfo" 
        component={MarketInfoScreen} 
        options={{
          title: 'Market Info',
          headerShown: false,
          drawerItemStyle: { display: 'none' } // Ocultar del drawer
        }}
      />
      <Drawer.Screen 
        name="InvestmentSimulator" 
        component={InvestmentSimulatorScreen} 
        options={{
          title: 'Simulador de Inversión',
          headerShown: true,
          drawerItemStyle: { display: 'none' } // Ocultar del drawer
        }}
      />
      <Drawer.Screen 
        name="CalculadoraDividendos" 
        component={CalculadoraDividendosScreen} 
        options={{
          title: 'Calculadora de Dividendos',
          headerShown: false,
          drawerLabel: 'Calculadora de Dividendos',
          drawerIcon: ({ color, size }) => (
            <TrendingUp size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="AnalizadorRatios" 
        component={AnalizadorRatiosScreen} 
        options={{
          title: 'Analizador de Ratios',
          headerShown: false,
          drawerLabel: 'Analizador de Ratios',
          drawerIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="SimuladorPortafolio" 
        component={SimuladorPortafolioScreen} 
        options={{
          title: 'Simulador de Portafolio',
          headerShown: false,
          drawerLabel: 'Simulador de Portafolio',
          drawerIcon: ({ color, size }) => (
            <PieChart size={size} color={color} />
          )
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuSection: {
    paddingVertical: 8,
  },
  menuSectionTitle: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 16,
  },
});
