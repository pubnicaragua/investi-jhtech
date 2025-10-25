import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native'
import { ArrowLeft, BarChart3 } from 'lucide-react-native'

export function ComparadorInversionesScreen({ navigation }: any) {
  const [inversion1, setInversion1] = useState('')
  const [tasa1, setTasa1] = useState('')
  const [inversion2, setInversion2] = useState('')
  const [tasa2, setTasa2] = useState('')
  const [tiempo, setTiempo] = useState('')
  const [resultado1, setResultado1] = useState<number | null>(null)
  const [resultado2, setResultado2] = useState<number | null>(null)

  const calcular = () => {
    const inv1 = parseFloat(inversion1)
    const t1 = parseFloat(tasa1) / 100
    const inv2 = parseFloat(inversion2)
    const t2 = parseFloat(tasa2) / 100
    const años = parseFloat(tiempo)
    
    if (!isNaN(inv1) && !isNaN(t1) && !isNaN(inv2) && !isNaN(t2) && !isNaN(años)) {
      const res1 = inv1 * ((1 + t1) ** años)
      const res2 = inv2 * ((1 + t2) ** años)
      setResultado1(res1)
      setResultado2(res2)
    }
  }

  const getMejor = () => {
    if (resultado1 !== null && resultado2 !== null) {
      return resultado1 > resultado2 ? 'Inversión 1' : 'Inversión 2'
    }
    return null
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Comparador de Inversiones</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.iconContainer}>
          <BarChart3 size={48} color="#f59e0b" />
        </View>

        <Text style={styles.sectionTitle}>Inversión 1</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monto inicial ($)</Text>
          <TextInput
            style={styles.input}
            value={inversion1}
            onChangeText={setInversion1}
            keyboardType="numeric"
            placeholder="10000"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tasa de retorno anual (%)</Text>
          <TextInput
            style={styles.input}
            value={tasa1}
            onChangeText={setTasa1}
            keyboardType="numeric"
            placeholder="7"
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Inversión 2</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monto inicial ($)</Text>
          <TextInput
            style={styles.input}
            value={inversion2}
            onChangeText={setInversion2}
            keyboardType="numeric"
            placeholder="10000"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tasa de retorno anual (%)</Text>
          <TextInput
            style={styles.input}
            value={tasa2}
            onChangeText={setTasa2}
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
          <Text style={styles.buttonText}>Comparar</Text>
        </TouchableOpacity>

        {resultado1 !== null && resultado2 !== null && (
          <View style={styles.resultsContainer}>
            <View style={[styles.resultCard, getMejor() === 'Inversión 1' && styles.bestCard]}>
              <Text style={styles.resultLabel}>Inversión 1</Text>
              <Text style={styles.resultValue}>${resultado1.toFixed(2)}</Text>
              {getMejor() === 'Inversión 1' && <Text style={styles.bestBadge}>✓ Mejor opción</Text>}
            </View>

            <View style={[styles.resultCard, getMejor() === 'Inversión 2' && styles.bestCard]}>
              <Text style={styles.resultLabel}>Inversión 2</Text>
              <Text style={styles.resultValue}>${resultado2.toFixed(2)}</Text>
              {getMejor() === 'Inversión 2' && <Text style={styles.bestBadge}>✓ Mejor opción</Text>}
            </View>

            <View style={styles.differenceCard}>
              <Text style={styles.differenceLabel}>Diferencia</Text>
              <Text style={styles.differenceValue}>
                ${Math.abs(resultado1 - resultado2).toFixed(2)}
              </Text>
            </View>
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: '#f59e0b', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultsContainer: { marginTop: 20 },
  resultCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e5e5e5' },
  bestCard: { borderWidth: 2, borderColor: '#10b981', backgroundColor: '#f0fdf4' },
  resultLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  resultValue: { fontSize: 28, fontWeight: '700', color: '#333' },
  bestBadge: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#10b981' },
  differenceCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f59e0b' },
  differenceLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  differenceValue: { fontSize: 24, fontWeight: '700', color: '#f59e0b' },
})
