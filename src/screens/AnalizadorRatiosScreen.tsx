import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native'
import { ArrowLeft, BarChart3, TrendingUp, AlertCircle } from 'lucide-react-native'

const { width } = Dimensions.get('window')

interface Ratio {
  id: string
  nombre: string
  valor: number
  interpretacion: string
  color: string
  rango: string
}

export function AnalizadorRatiosScreen({ navigation }: any) {
  // Inputs - Estado de Resultados
  const [ingresos, setIngresos] = useState('100000')
  const [costoVentas, setCostoVentas] = useState('60000')
  const [gastosOperativos, setGastosOperativos] = useState('20000')
  const [intereses, setIntereses] = useState('5000')
  const [impuestos, setImpuestos] = useState('5000')

  // Inputs - Balance General
  const [activosCorrientes, setActivosCorrientes] = useState('50000')
  const [activosNoC, setActivosNoC] = useState('150000')
  const [pasivosCorrientes, setPasivosCorrientes] = useState('30000')
  const [pasivosNoC, setPasivosNoC] = useState('70000')
  const [patrimonio, setPatrimonio] = useState('100000')

  // Inputs - Flujo de Caja
  const [flujoOperativo, setFlujoOperativo] = useState('15000')
  const [flujoInversion, setFlujoInversion] = useState('-8000')

  const [ratios, setRatios] = useState<Ratio[]>([])

  const calcularRatios = () => {
    const ing = parseFloat(ingresos)
    const cv = parseFloat(costoVentas)
    const go = parseFloat(gastosOperativos)
    const int = parseFloat(intereses)
    const imp = parseFloat(impuestos)

    const ac = parseFloat(activosCorrientes)
    const anc = parseFloat(activosNoC)
    const pc = parseFloat(pasivosCorrientes)
    const pnc = parseFloat(pasivosNoC)
    const pat = parseFloat(patrimonio)

    const fo = parseFloat(flujoOperativo)
    const fi = parseFloat(flujoInversion)

    if (isNaN(ing) || isNaN(cv) || isNaN(ac) || isNaN(pc) || isNaN(pat)) return

    // Cálculos
    const utilidadBruta = ing - cv
    const utilidadOperativa = utilidadBruta - go
    const utilidadNeta = utilidadOperativa - int - imp

    const activoTotal = ac + anc
    const pasivoTotal = pc + pnc

    // Ratios de Rentabilidad
    const margenBruto = (utilidadBruta / ing) * 100
    const margenOperativo = (utilidadOperativa / ing) * 100
    const margenNeto = (utilidadNeta / ing) * 100
    const roa = (utilidadNeta / activoTotal) * 100
    const roe = (utilidadNeta / pat) * 100

    // Ratios de Liquidez
    const razonCorriente = ac / pc
    const pruebAcida = (ac - (cv * 0.3)) / pc
    const razonCaja = (ac * 0.2) / pc

    // Ratios de Solvencia
    const deudaTotal = pasivoTotal / activoTotal
    const deudaPatrimonio = pasivoTotal / pat
    const coberturaPagos = utilidadOperativa / int

    // Ratios de Eficiencia
    const rotacionActivos = ing / activoTotal
    const rotacionInventario = cv / (cv * 0.2)
    const cicloOperativo = 365 / rotacionInventario

    // Ratios de Flujo de Caja
    const margenFlujoOperativo = (fo / ing) * 100
    const flujoLibre = fo + fi

    const nuevosRatios: Ratio[] = [
      {
        id: 'margenBruto',
        nombre: 'Margen Bruto',
        valor: margenBruto,
        interpretacion: margenBruto > 40 ? 'Excelente' : margenBruto > 25 ? 'Bueno' : 'Bajo',
        color: margenBruto > 40 ? '#10B981' : margenBruto > 25 ? '#F59E0B' : '#EF4444',
        rango: '> 40% es excelente',
      },
      {
        id: 'margenOperativo',
        nombre: 'Margen Operativo',
        valor: margenOperativo,
        interpretacion: margenOperativo > 15 ? 'Excelente' : margenOperativo > 10 ? 'Bueno' : 'Bajo',
        color: margenOperativo > 15 ? '#10B981' : margenOperativo > 10 ? '#F59E0B' : '#EF4444',
        rango: '> 15% es excelente',
      },
      {
        id: 'margenNeto',
        nombre: 'Margen Neto',
        valor: margenNeto,
        interpretacion: margenNeto > 10 ? 'Excelente' : margenNeto > 5 ? 'Bueno' : 'Bajo',
        color: margenNeto > 10 ? '#10B981' : margenNeto > 5 ? '#F59E0B' : '#EF4444',
        rango: '> 10% es excelente',
      },
      {
        id: 'roa',
        nombre: 'ROA (Retorno sobre Activos)',
        valor: roa,
        interpretacion: roa > 10 ? 'Excelente' : roa > 5 ? 'Bueno' : 'Bajo',
        color: roa > 10 ? '#10B981' : roa > 5 ? '#F59E0B' : '#EF4444',
        rango: '> 10% es excelente',
      },
      {
        id: 'roe',
        nombre: 'ROE (Retorno sobre Patrimonio)',
        valor: roe,
        interpretacion: roe > 15 ? 'Excelente' : roe > 10 ? 'Bueno' : 'Bajo',
        color: roe > 15 ? '#10B981' : roe > 10 ? '#F59E0B' : '#EF4444',
        rango: '> 15% es excelente',
      },
      {
        id: 'razonCorriente',
        nombre: 'Razón Corriente',
        valor: razonCorriente,
        interpretacion: razonCorriente > 1.5 ? 'Excelente' : razonCorriente > 1 ? 'Bueno' : 'Bajo',
        color: razonCorriente > 1.5 ? '#10B981' : razonCorriente > 1 ? '#F59E0B' : '#EF4444',
        rango: '> 1.5 es excelente',
      },
      {
        id: 'pruebAcida',
        nombre: 'Prueba Ácida',
        valor: pruebAcida,
        interpretacion: pruebAcida > 1 ? 'Excelente' : pruebAcida > 0.7 ? 'Bueno' : 'Bajo',
        color: pruebAcida > 1 ? '#10B981' : pruebAcida > 0.7 ? '#F59E0B' : '#EF4444',
        rango: '> 1 es excelente',
      },
      {
        id: 'deudaTotal',
        nombre: 'Deuda / Activos',
        valor: deudaTotal * 100,
        interpretacion: deudaTotal < 0.5 ? 'Excelente' : deudaTotal < 0.7 ? 'Bueno' : 'Alto',
        color: deudaTotal < 0.5 ? '#10B981' : deudaTotal < 0.7 ? '#F59E0B' : '#EF4444',
        rango: '< 50% es excelente',
      },
      {
        id: 'deudaPatrimonio',
        nombre: 'Deuda / Patrimonio',
        valor: deudaPatrimonio,
        interpretacion: deudaPatrimonio < 1 ? 'Excelente' : deudaPatrimonio < 1.5 ? 'Bueno' : 'Alto',
        color: deudaPatrimonio < 1 ? '#10B981' : deudaPatrimonio < 1.5 ? '#F59E0B' : '#EF4444',
        rango: '< 1 es excelente',
      },
      {
        id: 'rotacionActivos',
        nombre: 'Rotación de Activos',
        valor: rotacionActivos,
        interpretacion: rotacionActivos > 1 ? 'Bueno' : 'Bajo',
        color: rotacionActivos > 1 ? '#10B981' : '#F59E0B',
        rango: '> 1 es bueno',
      },
      {
        id: 'margenFlujoOperativo',
        nombre: 'Margen de Flujo Operativo',
        valor: margenFlujoOperativo,
        interpretacion: margenFlujoOperativo > 15 ? 'Excelente' : margenFlujoOperativo > 10 ? 'Bueno' : 'Bajo',
        color: margenFlujoOperativo > 15 ? '#10B981' : margenFlujoOperativo > 10 ? '#F59E0B' : '#EF4444',
        rango: '> 15% es excelente',
      },
      {
        id: 'flujoLibre',
        nombre: 'Flujo de Caja Libre',
        valor: flujoLibre,
        interpretacion: flujoLibre > 0 ? 'Positivo' : 'Negativo',
        color: flujoLibre > 0 ? '#10B981' : '#EF4444',
        rango: '> 0 es positivo',
      },
    ]

    setRatios(nuevosRatios)
  }

  const renderRatioItem = ({ item }: { item: Ratio }) => (
    <View style={styles.ratioCard}>
      <View style={styles.ratioHeader}>
        <View style={styles.ratioTitleContainer}>
          <Text style={styles.ratioNombre}>{item.nombre}</Text>
          <Text style={[styles.ratioInterpretacion, { color: item.color }]}>{item.interpretacion}</Text>
        </View>
        <View style={[styles.ratioBadge, { backgroundColor: item.color }]}>
          <Text style={styles.ratioBadgeText}>{item.valor.toFixed(2)}</Text>
        </View>
      </View>
      <Text style={styles.ratioRango}>{item.rango}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Analizador de Ratios</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado de Resultados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de Resultados</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ingresos Totales ($)</Text>
            <TextInput
              style={styles.input}
              value={ingresos}
              onChangeText={setIngresos}
              keyboardType="decimal-pad"
              placeholder="100000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Costo de Ventas ($)</Text>
            <TextInput
              style={styles.input}
              value={costoVentas}
              onChangeText={setCostoVentas}
              keyboardType="decimal-pad"
              placeholder="60000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gastos Operativos ($)</Text>
            <TextInput
              style={styles.input}
              value={gastosOperativos}
              onChangeText={setGastosOperativos}
              keyboardType="decimal-pad"
              placeholder="20000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Intereses ($)</Text>
            <TextInput
              style={styles.input}
              value={intereses}
              onChangeText={setIntereses}
              keyboardType="decimal-pad"
              placeholder="5000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Impuestos ($)</Text>
            <TextInput
              style={styles.input}
              value={impuestos}
              onChangeText={setImpuestos}
              keyboardType="decimal-pad"
              placeholder="5000"
            />
          </View>
        </View>

        {/* Balance General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balance General</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Activos Corrientes ($)</Text>
            <TextInput
              style={styles.input}
              value={activosCorrientes}
              onChangeText={setActivosCorrientes}
              keyboardType="decimal-pad"
              placeholder="50000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Activos No Corrientes ($)</Text>
            <TextInput
              style={styles.input}
              value={activosNoC}
              onChangeText={setActivosNoC}
              keyboardType="decimal-pad"
              placeholder="150000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pasivos Corrientes ($)</Text>
            <TextInput
              style={styles.input}
              value={pasivosCorrientes}
              onChangeText={setPasivosCorrientes}
              keyboardType="decimal-pad"
              placeholder="30000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pasivos No Corrientes ($)</Text>
            <TextInput
              style={styles.input}
              value={pasivosNoC}
              onChangeText={setPasivosNoC}
              keyboardType="decimal-pad"
              placeholder="70000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Patrimonio ($)</Text>
            <TextInput
              style={styles.input}
              value={patrimonio}
              onChangeText={setPatrimonio}
              keyboardType="decimal-pad"
              placeholder="100000"
            />
          </View>
        </View>

        {/* Flujo de Caja */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flujo de Caja</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Flujo Operativo ($)</Text>
            <TextInput
              style={styles.input}
              value={flujoOperativo}
              onChangeText={setFlujoOperativo}
              keyboardType="decimal-pad"
              placeholder="15000"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Flujo de Inversión ($)</Text>
            <TextInput
              style={styles.input}
              value={flujoInversion}
              onChangeText={setFlujoInversion}
              keyboardType="decimal-pad"
              placeholder="-8000"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={calcularRatios}>
            <BarChart3 size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Analizar Ratios</Text>
          </TouchableOpacity>
        </View>

        {/* Resultados */}
        {ratios.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análisis de Ratios</Text>
            <FlatList
              data={ratios}
              renderItem={renderRatioItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
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
  ratioCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1382EF',
  },
  ratioHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  ratioTitleContainer: { flex: 1 },
  ratioNombre: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  ratioInterpretacion: { fontSize: 12, fontWeight: '600' },
  ratioBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  ratioBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  ratioRango: { fontSize: 11, color: '#6B7280' },
})
