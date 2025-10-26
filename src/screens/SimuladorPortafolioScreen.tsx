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
  Modal,
  Alert,
} from 'react-native'
import { ArrowLeft, Plus, Trash2, PieChart as PieChartIcon, TrendingUp } from 'lucide-react-native'

interface Activo {
  id: string
  nombre: string
  cantidad: number
  precioActual: number
  rendimientoAnual: number
}

interface ResultadoSimulacion {
  ano: number
  valorTotal: number
  ganancia: number
  rendimiento: number
}

export function SimuladorPortafolioScreen({ navigation }: any) {
  const [activos, setActivos] = useState<Activo[]>([
    { id: '1', nombre: 'Acciones Tech', cantidad: 100, precioActual: 150, rendimientoAnual: 12 },
    { id: '2', nombre: 'Bonos Gobierno', cantidad: 50, precioActual: 1000, rendimientoAnual: 4 },
  ])

  const [periodos, setPeriodos] = useState('10')
  const [showModal, setShowModal] = useState(false)
  const [nuevoActivo, setNuevoActivo] = useState({ nombre: '', cantidad: '', precio: '', rendimiento: '' })
  const [resultados, setResultados] = useState<ResultadoSimulacion[]>([])

  const valorInicial = useMemo(() => {
    return activos.reduce((sum, a) => sum + a.cantidad * a.precioActual, 0)
  }, [activos])

  const agregarActivo = () => {
    if (!nuevoActivo.nombre || !nuevoActivo.cantidad || !nuevoActivo.precio || !nuevoActivo.rendimiento) {
      Alert.alert('Error', 'Completa todos los campos')
      return
    }

    const newActivo: Activo = {
      id: Date.now().toString(),
      nombre: nuevoActivo.nombre,
      cantidad: parseFloat(nuevoActivo.cantidad),
      precioActual: parseFloat(nuevoActivo.precio),
      rendimientoAnual: parseFloat(nuevoActivo.rendimiento),
    }

    setActivos([...activos, newActivo])
    setNuevoActivo({ nombre: '', cantidad: '', precio: '', rendimiento: '' })
    setShowModal(false)
  }

  const eliminarActivo = (id: string) => {
    setActivos(activos.filter(a => a.id !== id))
  }

  const simular = () => {
    const anos = parseInt(periodos)
    if (isNaN(anos) || anos <= 0) {
      Alert.alert('Error', 'Ingresa un período válido')
      return
    }

    const nuevosResultados: ResultadoSimulacion[] = []
    let valoresActuales = activos.map(a => a.cantidad * a.precioActual)

    for (let ano = 1; ano <= anos; ano++) {
      let valorTotal = 0

      activos.forEach((activo, index) => {
        const rendimiento = activo.rendimientoAnual / 100
        valoresActuales[index] = valoresActuales[index] * (1 + rendimiento)
        valorTotal += valoresActuales[index]
      })

      nuevosResultados.push({
        ano,
        valorTotal,
        ganancia: valorTotal - valorInicial,
        rendimiento: ((valorTotal - valorInicial) / valorInicial) * 100,
      })
    }

    setResultados(nuevosResultados)
  }

  const renderActivoItem = ({ item }: { item: Activo }) => (
    <View style={styles.activoCard}>
      <View style={styles.activoInfo}>
        <Text style={styles.activoNombre}>{item.nombre}</Text>
        <View style={styles.activoDetails}>
          <Text style={styles.activoDetail}>
            {item.cantidad} × ${item.precioActual.toFixed(2)} = ${(item.cantidad * item.precioActual).toFixed(2)}
          </Text>
          <Text style={[styles.activoDetail, { color: '#10B981' }]}>
            Rendimiento: {item.rendimientoAnual}%
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => eliminarActivo(item.id)}>
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  )

  const renderResultadoItem = ({ item }: { item: ResultadoSimulacion }) => (
    <View style={styles.resultadoCard}>
      <View style={styles.resultadoRow}>
        <Text style={styles.resultadoLabel}>Año {item.ano}</Text>
        <Text style={styles.resultadoValue}>${item.valorTotal.toFixed(2)}</Text>
      </View>
      <View style={styles.resultadoRow}>
        <Text style={styles.resultadoLabel}>Ganancia</Text>
        <Text style={[styles.resultadoValue, { color: item.ganancia >= 0 ? '#10B981' : '#EF4444' }]}>
          ${item.ganancia.toFixed(2)}
        </Text>
      </View>
      <View style={styles.resultadoRow}>
        <Text style={styles.resultadoLabel}>Rendimiento</Text>
        <Text style={[styles.resultadoValue, { color: item.rendimiento >= 0 ? '#10B981' : '#EF4444' }]}>
          {item.rendimiento.toFixed(2)}%
        </Text>
      </View>
    </View>
  )

  const distribucionActivos = useMemo(() => {
    return activos.map(a => ({
      nombre: a.nombre,
      valor: a.cantidad * a.precioActual,
      porcentaje: ((a.cantidad * a.precioActual) / valorInicial) * 100,
    }))
  }, [activos, valorInicial])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Simulador de Portafolio</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Portafolio</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Valor Total</Text>
              <Text style={styles.summaryValue}>${valorInicial.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Activos</Text>
              <Text style={styles.summaryValue}>{activos.length}</Text>
            </View>
          </View>
        </View>

        {/* Distribución */}
        {activos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distribución de Activos</Text>
            {distribucionActivos.map((dist, index) => (
              <View key={index} style={styles.distribucionItem}>
                <View style={styles.distribucionLabel}>
                  <Text style={styles.distribucionNombre}>{dist.nombre}</Text>
                  <Text style={styles.distribucionValor}>${dist.valor.toFixed(2)}</Text>
                </View>
                <View style={styles.distribucionBar}>
                  <View
                    style={[
                      styles.distribucionBarFill,
                      { width: `${dist.porcentaje}%` },
                    ]}
                  />
                </View>
                <Text style={styles.distribucionPorcentaje}>{dist.porcentaje.toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Activos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activos del Portafolio</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowModal(true)}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {activos.length === 0 ? (
            <Text style={styles.emptyText}>No hay activos. Agrega uno para comenzar.</Text>
          ) : (
            <FlatList
              data={activos}
              renderItem={renderActivoItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Simulación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parámetros de Simulación</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Período (años)</Text>
            <TextInput
              style={styles.input}
              value={periodos}
              onChangeText={setPeriodos}
              keyboardType="number-pad"
              placeholder="10"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={simular}
            disabled={activos.length === 0}
          >
            <TrendingUp size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Simular Portafolio</Text>
          </TouchableOpacity>
        </View>

        {/* Resultados */}
        {resultados.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proyección de Valor</Text>
            <FlatList
              data={resultados}
              renderItem={renderResultadoItem}
              keyExtractor={(item) => item.ano.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal para agregar activo */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Activo</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del Activo</Text>
                <TextInput
                  style={styles.input}
                  value={nuevoActivo.nombre}
                  onChangeText={(text) => setNuevoActivo({ ...nuevoActivo, nombre: text })}
                  placeholder="Ej: Acciones Apple"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cantidad</Text>
                <TextInput
                  style={styles.input}
                  value={nuevoActivo.cantidad}
                  onChangeText={(text) => setNuevoActivo({ ...nuevoActivo, cantidad: text })}
                  keyboardType="decimal-pad"
                  placeholder="100"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Precio Actual ($)</Text>
                <TextInput
                  style={styles.input}
                  value={nuevoActivo.precio}
                  onChangeText={(text) => setNuevoActivo({ ...nuevoActivo, precio: text })}
                  keyboardType="decimal-pad"
                  placeholder="150"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rendimiento Anual (%)</Text>
                <TextInput
                  style={styles.input}
                  value={nuevoActivo.rendimiento}
                  onChangeText={(text) => setNuevoActivo({ ...nuevoActivo, rendimiento: text })}
                  keyboardType="decimal-pad"
                  placeholder="10"
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={agregarActivo}>
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Agregar Activo</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  summaryCard: { flexDirection: 'row', gap: 12 },
  summaryItem: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 16, borderRadius: 8 },
  summaryLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700', color: '#1382EF' },
  distribucionItem: { marginBottom: 12 },
  distribucionLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  distribucionNombre: { fontSize: 13, fontWeight: '600', color: '#111827' },
  distribucionValor: { fontSize: 13, fontWeight: '700', color: '#1382EF' },
  distribucionBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  distribucionBarFill: { height: '100%', backgroundColor: '#1382EF' },
  distribucionPorcentaje: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  activoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activoInfo: { flex: 1 },
  activoNombre: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  activoDetails: { gap: 2 },
  activoDetail: { fontSize: 12, color: '#6B7280' },
  addButton: {
    backgroundColor: '#1382EF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingVertical: 20 },
  resultadoCard: { backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8, marginBottom: 8 },
  resultadoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resultadoLabel: { fontSize: 13, color: '#6B7280' },
  resultadoValue: { fontSize: 13, fontWeight: '700', color: '#1382EF' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalClose: { fontSize: 24, color: '#6B7280' },
  modalBody: { paddingHorizontal: 16, paddingVertical: 16 },
})
