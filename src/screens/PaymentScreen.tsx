import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CreditCard, ArrowLeft } from 'lucide-react-native';

export default function PaymentScreen() {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handlePayment = () => {
    if (!cardNumber || !cardName || !expiry || !cvv) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    Alert.alert('Pago exitoso', 'Tu pago se ha procesado correctamente');
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Método de Pago</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.cardPreview}>
          <View style={styles.cardLogo}>
            <CreditCard size={32} color="#fff" />
          </View>
          <Text style={styles.cardNumber}>
            {cardNumber.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim()}
          </Text>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>Titular de la tarjeta</Text>
              <Text style={styles.cardName}>
                {cardName || 'NOMBRE DEL TITULAR'}
              </Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>Vencimiento</Text>
              <Text style={styles.cardExpiry}>{expiry || 'MM/AA'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Número de tarjeta</Text>
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
            maxLength={16}
            value={cardNumber}
            onChangeText={setCardNumber}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre del titular</Text>
          <TextInput
            style={styles.input}
            placeholder="Como aparece en la tarjeta"
            value={cardName}
            onChangeText={setCardName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Vencimiento</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/AA"
              value={expiry}
              onChangeText={setExpiry}
              maxLength={5}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              keyboardType="numeric"
              maxLength={3}
              value={cvv}
              onChangeText={setCvv}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.payButtonText}>Pagar $99.99</Text>
        </TouchableOpacity>

        <View style={styles.securityInfo}>
          <Text style={styles.securityText}>
            <Text style={{ color: '#4CAF50' }}>🔒</Text> Tus datos están protegidos con encriptación de 256-bit
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  cardPreview: {
    backgroundColor: '#4A6BFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    height: 200,
    justifyContent: 'space-between',
  },
  cardLogo: {
    alignSelf: 'flex-end',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 20,
    letterSpacing: 1,
    marginVertical: 10,
    fontFamily: 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginBottom: 4,
  },
  cardName: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  cardExpiry: {
    color: '#fff',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  securityInfo: {
    marginTop: 24,
    alignItems: 'center',
  },
  securityText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});