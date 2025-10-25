import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native'
import { ArrowLeft, TrendingUp } from 'lucide-react-native'

export function SimuladorJubilacionScreen({ navigation }: any) {
  const [edadActual, setEdadActual] = useState('')
  const [edadJubilacion, setEdadJubilacion] = useState('')
  const [ahorroMensual, setAhorroMensual] = useState('')
  const [rendimiento, setRendimiento] = useState('')
  const [resultado, setResultado] = useState<number | null>(null)

  const calcular = () => {
    const actual = parseFloat(edadActual)
    const jubilacion = parseFloat(edadJubilacion)
    const ahorro = parseFloat(ahorroMensual)
    const tasa = parseFloat(rendimiento) / 100 / 12
    
    if (!isNaN(actual) && !isNaN(jubilacion) && !isNaN(ahorro) && !isNaN(tasa)) {
      const meses = (jubilacion - actual) * 12
      const total = ahorro * (((1 + tasa) ** meses - 1) / tasa)
      setResultado(total)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Simulador de Jubilación</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.iconContainer}>
          <TrendingUp size={48} color="#10b981" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Edad actual</Text>
          <TextInput
            style={styles.input}
            value={edadActual}
            onChangeText={setEdadActual}
            keyboardType="numeric"
            placeholder="30"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Edad de jubilación</Text>
          <TextInput
            style={styles.input}
            value={edadJubilacion}
            onChangeText={setEdadJubilacion}
            keyboardType="numeric"
            placeholder="65"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ahorro mensual ($)</Text>
          <TextInput
            style={styles.input}
            value={ahorroMensual}
            onChangeText={setAhorroMensual}
            keyboardType="numeric"
            placeholder="500"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rendimiento anual esperado (%)</Text>
          <TextInput
            style={styles.input}
            value={rendimiento}
            onChangeText={setRendimiento}
            keyboardType="numeric"
            placeholder="7"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={calcular}>
          <Text style={styles.buttonText}>Calcular</Text>
        </TouchableOpacity>

        {resultado !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Monto estimado al jubilar</Text>
            <Text style={styles.resultValue}>${resultado.toFixed(2)}</Text>
            <Text style={styles.resultSubtext}>
              En {parseFloat(edadJubilacion) - parseFloat(edadActual)} años
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
  button: { backgroundColor: '#10b981', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginTop: 20, alignItems: 'center', borderWidth: 2, borderColor: '#10b981' },
  resultLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  resultValue: { fontSize: 32, fontWeight: '700', color: '#10b981', marginBottom: 8 },
  resultSubtext: { fontSize: 14, color: '#666' },
})
