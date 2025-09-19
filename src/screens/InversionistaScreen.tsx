import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Calendar,
  Rocket,
  TrendingUp
} from 'lucide-react-native';

const InversionistaScreen = () => {
  const navigation = useNavigation();

  const handleNotifyMe = () => {
    Alert.alert(
      'Notificación activada',
      'Te notificaremos cuando la función de Inversionista Ángel esté disponible el 4 de Octubre.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inversionista Ángel</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Rocket size={80} color="#2673f3" />
        </View>
        
        <Text style={styles.title}>¡Próximamente!</Text>
        <Text style={styles.subtitle}>Startups y Emprendimientos</Text>
        
        <Text style={styles.description}>
          Estamos trabajando en una experiencia increíble para conectar inversionistas ángeles con startups prometedoras.
        </Text>
        
        <View style={styles.dateContainer}>
          <Calendar size={20} color="#2673f3" />
          <Text style={styles.dateText}>Disponible el 4 de Octubre</Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>¿Qué podrás hacer?</Text>
          
          <View style={styles.feature}>
            <TrendingUp size={16} color="#28a745" />
            <Text style={styles.featureText}>Descubrir startups con alto potencial</Text>
          </View>
          
          <View style={styles.feature}>
            <TrendingUp size={16} color="#28a745" />
            <Text style={styles.featureText}>Invertir desde $1,000 USD</Text>
          </View>
          
          <View style={styles.feature}>
            <TrendingUp size={16} color="#28a745" />
            <Text style={styles.featureText}>Seguimiento de tu portafolio</Text>
          </View>
          
          <View style={styles.feature}>
            <TrendingUp size={16} color="#28a745" />
            <Text style={styles.featureText}>Conectar con emprendedores</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.notifyButton} onPress={handleNotifyMe}>
          <Text style={styles.notifyButtonText}>Notificarme cuando esté listo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  headerRight: {
    width: 34,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2673f3',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 32,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2673f3',
    marginLeft: 8,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 15,
    color: '#444',
    marginLeft: 12,
  },
  notifyButton: {
    backgroundColor: '#2673f3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#2673f3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  notifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InversionistaScreen;
