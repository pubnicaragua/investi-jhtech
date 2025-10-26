import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Dimensions,
  FlatList,
} from 'react-native'
import { ArrowLeft, TrendingUp, DollarSign, Calendar } from 'lucide-react-native'

const { width } = Dimensions.get('window')

interface DividendData {
  year: number
  dividend: number
  totalValue: number
  reinvested: number
}

export function CalculadoraDividendosScreen({ navigation }: any) {
  // Inputs
  const [capitalInicial, setCapitalInicial] = useState('10000')
  const [tasaDividendo, setTasaDividendo] = useState('4')
  const [tasaCrecimiento, setTasaCrecimiento] = useState('7')
  const [anos, setAnos] = useState('10')
  const [reinvertir, setReinvertir] = useState(true)
  const [frecuencia, setFrecuencia] = useState<'anual' | 'trimestral' | 'mensual'>('anual')

  // Resultados
  const [resultados, setResultados] = useState<DividendData[]>([])
  const [totalDividendos, setTotalDividendos] = useState(0)
  const [valorFinal, setValorFinal] = useState(0)

  const calcular = () => {
    const capital = parseFloat(capitalInicial)
    const tasa = parseFloat(tasaDividendo) / 100
    const crecimiento = parseFloat(tasaCrecimiento) / 100
    const periodos = parseInt(anos)
    const frecuenciaDivisor = frecuencia === 'anual' ? 1 : frecuencia === 'trimestral' ? 4 : 12

    if (isNaN(capital) || isNaN(tasa) || isNaN(crecimiento) || isNaN(periodos)) return

    const datos: DividendData[] = []
    let saldo = capital
    let dividendosTotales = 0

    for (let i = 1; i <= periodos; i++) {
      const dividendoAnual = saldo * tasa
      const dividendoPeriodo = dividendoAnual / frecuenciaDivisor

      if (reinvertir) {
        saldo += dividendoPeriodo
      }

      dividendosTotales += dividendoAnual
      saldo = saldo * (1 + crecimiento / frecuenciaDivisor)

      datos.push({
        year: i,
        dividend: dividendoAnual,
        totalValue: saldo,
        reinvested: reinvertir ? dividendoPeriodo : 0,
      })
    }

    setResultados(datos)
    setTotalDividendos(dividendosTotales)
    setValorFinal(saldo)
  }

  const maxValor = useMemo(() => {
    if (resultados.length === 0) return 0
    return Math.max(...resultados.map(r => r.totalValue))
  }, [resultados])

  const renderResultItem = ({ item }: { item: DividendData }) => (
    <View style={styles.resultRow}>
      <Text style={styles.resultRowLabel}>Año {item.year}</Text>
      <View style={styles.resultRowValues}>
        <View style={styles.resultRowValue}>
          <Text style={styles.resultRowValueLabel}>Dividendo</Text>
          <Text style={styles.resultRowValueText}>${item.dividend.toFixed(2)}</Text>
        </View>
        <View style={styles.resultRowValue}>
          <Text style={styles.resultRowValueLabel}>Valor Total</Text>
          <Text style={styles.resultRowValueText}>${item.totalValue.toFixed(2)}</Text>
        </View>
        {reinvertir && (
          <View style={styles.resultRowValue}>
            <Text style={styles.resultRowValueLabel}>Reinvertido</Text>
            <Text style={styles.resultRowValueText}>${item.reinvested.toFixed(2)}</Text>
          </View>
        )}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Calculadora de Dividendos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parámetros de Inversión</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Capital Inicial ($)</Text>
            <TextInput
              style={styles.input}
              value={capitalInicial}
              onChangeText={setCapitalInicial}
              keyboardType="decimal-pad"
              placeholder="10000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tasa de Dividendo Anual (%)</Text>
            <TextInput
              style={styles.input}
              value={tasaDividendo}
              onChangeText={setTasaDividendo}
              keyboardType="decimal-pad"
              placeholder="4"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tasa de Crecimiento Anual (%)</Text>
            <TextInput
              style={styles.input}
              value={tasaCrecimiento}
              onChangeText={setTasaCrecimiento}
              keyboardType="decimal-pad"
              placeholder="7"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Período (años)</Text>
            <TextInput
              style={styles.input}
              value={anos}
              onChangeText={setAnos}
              keyboardType="number-pad"
              placeholder="10"
            />
          </View>

          <View style={styles.frequencyContainer}>
            <Text style={styles.label}>Frecuencia de Dividendos</Text>
            <View style={styles.frequencyButtons}>
              {(['anual', 'trimestral', 'mensual'] as const).map(freq => (
                <TouchableOpacity
                  key={freq}
                  style={[styles.frequencyBtn, frecuencia === freq && styles.frequencyBtnActive]}
                  onPress={() => setFrecuencia(freq)}
                >
                  <Text style={[styles.frequencyBtnText, frecuencia === freq && styles.frequencyBtnTextActive]}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Reinvertir Dividendos</Text>
            <Switch
              value={reinvertir}
              onValueChange={setReinvertir}
              trackColor={{ false: '#D1D5DB', true: '#1382EF' }}
              thumbColor={reinvertir ? '#1382EF' : '#F3F4F6'}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={calcular}>
            <TrendingUp size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Calcular Proyección</Text>
          </TouchableOpacity>
        </View>

        {/* Resultados */}
        {resultados.length > 0 && (
          <>
            {/* Gráfico de barras simple */}
            {resultados.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Proyección de Valor</Text>
                <View style={styles.chartContainer}>
                  {resultados.map((item) => (
                    <View key={item.year} style={styles.barItem}>
                      <View style={styles.barWrapper}>
                        <View
                          style={[
                            styles.bar,
                            { height: (item.totalValue / maxValor) * 150 },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel}>Año {item.year}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Resumen */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumen de Resultados</Text>

              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIcon}>
                    <DollarSign size={24} color="#1382EF" />
                  </View>
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Dividendos Totales</Text>
                    <Text style={styles.summaryValue}>${totalDividendos.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.summaryItem}>
                  <View style={styles.summaryIcon}>
                    <TrendingUp size={24} color="#10B981" />
                  </View>
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Valor Final</Text>
                    <Text style={styles.summaryValue}>${valorFinal.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.summaryItem}>
                  <View style={styles.summaryIcon}>
                    <Calendar size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Ganancia Total</Text>
                    <Text style={styles.summaryValue}>
                      ${(valorFinal - parseFloat(capitalInicial)).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Detalles año a año */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalles Año a Año</Text>
              <FlatList
                data={resultados}
                renderItem={renderResultItem}
                keyExtractor={(item) => item.year.toString()}
                scrollEnabled={false}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  frequencyContainer: { marginBottom: 16 },
  frequencyButtons: { flexDirection: 'row', gap: 8 },
  frequencyBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  frequencyBtnActive: { backgroundColor: '#1382EF', borderColor: '#1382EF' },
  frequencyBtnText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  frequencyBtnTextActive: { color: '#FFFFFF' },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1382EF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  chart: { marginVertical: 16, borderRadius: 16 },
  summaryCard: { gap: 12 },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 12,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContent: { flex: 1 },
  summaryLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  resultRow: { marginBottom: 12, backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8 },
  resultRowLabel: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  resultRowValues: { flexDirection: 'row', gap: 8 },
  resultRowValue: { flex: 1 },
  resultRowValueLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  resultRowValueText: { fontSize: 13, fontWeight: '700', color: '#1382EF' },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 200, paddingVertical: 16, backgroundColor: '#F9FAFB', borderRadius: 8 },
  barItem: { alignItems: 'center', flex: 1 },
  barWrapper: { height: 150, justifyContent: 'flex-end', marginBottom: 8 },
  bar: { width: 30, backgroundColor: '#1382EF', borderRadius: 4 },
  barLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
})
