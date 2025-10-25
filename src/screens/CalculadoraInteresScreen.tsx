import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native'
import { ArrowLeft, Calculator } from 'lucide-react-native'

export function CalculadoraInteresScreen({ navigation }: any) {
  const [capital, setCapital] = useState('')
  const [tasa, setTasa] = useState('')
  const [tiempo, setTiempo] = useState('')
  const [resultado, setResultado] = useState<number | null>(null)

  const calcular = () => {
    const c = parseFloat(capital)
    const t = parseFloat(tasa) / 100
    const n = parseFloat(tiempo)
    
    if (!isNaN(c) && !isNaN(t) && !isNaN(n)) {
      const interes = c * t * n
      const total = c + interes
      setResultado(total)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Calculadora de Interés</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.iconContainer}>
          <Calculator size={48} color="#4A90E2" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Capital inicial ($)</Text>
          <TextInput
            style={styles.input}
            value={capital}
            onChangeText={setCapital}
            keyboardType="numeric"
            placeholder="10000"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tasa de interés anual (%)</Text>
          <TextInput
            style={styles.input}
            value={tasa}
            onChangeText={setTasa}
            keyboardType="numeric"
            placeholder="5"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tiempo (años)</Text>
          <TextInput
            style={styles.input}
            value={tiempo}
            onChangeText={setTiempo}
            keyboardType="numeric"
            placeholder="10"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={calcular}>
          <Text style={styles.buttonText}>Calcular</Text>
        </TouchableOpacity>

        {resultado !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Monto total</Text>
            <Text style={styles.resultValue}>${resultado.toFixed(2)}</Text>
            <Text style={styles.resultSubtext}>
              Interés ganado: ${(resultado - parseFloat(capital)).toFixed(2)}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e5e5' },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  content: { flex: 1, padding: 16 },
  iconContainer: { alignItems: 'center', marginVertical: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginTop: 20, alignItems: 'center', borderWidth: 2, borderColor: '#4A90E2' },
  resultLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  resultValue: { fontSize: 32, fontWeight: '700', color: '#4A90E2', marginBottom: 8 },
  resultSubtext: { fontSize: 14, color: '#10b981' },
})
