import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Download,
  Calculator,
  TrendingUp,
  PieChart,
  BarChart3,
  FileSpreadsheet,
  Filter,
  Settings,
  Zap,
  Brain,
  Target,
  Plus,
  X,
  Save,
  Play,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Formula {
  id: string;
  name: string;
  description: string;
  formula: string;
  category: 'basic' | 'intermediate' | 'advanced';
  variables: string[];
  example: string;
  result?: number;
}

interface UserLevel {
  id: 'beginner' | 'intermediate' | 'advanced';
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface ReportData {
  ingresos: number;
  gastos: number;
  ahorros: number;
  inversiones: number;
  deudas: number;
  gastosHormiga: number;
  metaAhorro: number;
  meses: number;
}

export function ReportesAvanzadosScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    ingresos: 5000,
    gastos: 3500,
    ahorros: 1000,
    inversiones: 500,
    deudas: 2000,
    gastosHormiga: 300,
    metaAhorro: 1500,
    meses: 12,
  });

  const userLevels: UserLevel[] = [
    {
      id: 'beginner',
      name: 'Aprendiz',
      description: 'Fórmulas básicas para empezar',
      color: '#4CAF50',
      icon: '🌱',
    },
    {
      id: 'intermediate',
      name: 'Intermedio',
      description: 'Análisis financiero avanzado',
      color: '#FF9800',
      icon: '📊',
    },
    {
      id: 'advanced',
      name: 'Avanzado',
      description: 'Modelado financiero complejo',
      color: '#9C27B0',
      icon: '🚀',
    },
  ];

  const formulas: Formula[] = [
    // Fórmulas Básicas (Aprendiz)
    {
      id: 'ahorro_neto',
      name: 'Ahorro Neto',
      description: 'Calcula tu capacidad de ahorro mensual',
      formula: 'ingresos - gastos',
      category: 'basic',
      variables: ['ingresos', 'gastos'],
      example: '5000 - 3500 = 1500',
    },
    {
      id: 'porcentaje_ahorro',
      name: 'Porcentaje de Ahorro',
      description: 'Qué porcentaje de tus ingresos ahorras',
      formula: '(ahorros / ingresos) * 100',
      category: 'basic',
      variables: ['ahorros', 'ingresos'],
      example: '(1000 / 5000) * 100 = 20%',
    },
    {
      id: 'tiempo_meta',
      name: 'Tiempo para Meta',
      description: 'Meses necesarios para alcanzar tu meta de ahorro',
      formula: 'metaAhorro / (ingresos - gastos)',
      category: 'basic',
      variables: ['metaAhorro', 'ingresos', 'gastos'],
      example: '15000 / (5000 - 3500) = 10 meses',
    },
    {
      id: 'impacto_hormigas',
      name: 'Impacto Gastos Hormiga',
      description: 'Porcentaje que representan los gastos hormiga',
      formula: '(gastosHormiga / gastos) * 100',
      category: 'basic',
      variables: ['gastosHormiga', 'gastos'],
      example: '(300 / 3500) * 100 = 8.57%',
    },

    // Fórmulas Intermedias
    {
      id: 'ratio_deuda',
      name: 'Ratio de Endeudamiento',
      description: 'Evalúa tu nivel de endeudamiento',
      formula: '(deudas / ingresos) * 100',
      category: 'intermediate',
      variables: ['deudas', 'ingresos'],
      example: '(2000 / 5000) * 100 = 40%',
    },
    {
      id: 'flujo_libre',
      name: 'Flujo de Caja Libre',
      description: 'Dinero disponible después de gastos e inversiones',
      formula: 'ingresos - gastos - inversiones',
      category: 'intermediate',
      variables: ['ingresos', 'gastos', 'inversiones'],
      example: '5000 - 3500 - 500 = 1000',
    },
    {
      id: 'eficiencia_ahorro',
      name: 'Eficiencia de Ahorro',
      description: 'Qué tan eficiente eres ahorrando vs tu potencial',
      formula: '(ahorros / (ingresos - gastos)) * 100',
      category: 'intermediate',
      variables: ['ahorros', 'ingresos', 'gastos'],
      example: '(1000 / (5000 - 3500)) * 100 = 66.67%',
    },
    {
      id: 'proyeccion_anual',
      name: 'Proyección Anual',
      description: 'Proyección de ahorros en 12 meses',
      formula: '(ingresos - gastos) * meses',
      category: 'intermediate',
      variables: ['ingresos', 'gastos', 'meses'],
      example: '(5000 - 3500) * 12 = 18000',
    },

    // Fórmulas Avanzadas
    {
      id: 'valor_futuro',
      name: 'Valor Futuro con Interés',
      description: 'Valor futuro de tus ahorros con interés compuesto',
      formula: 'ahorros * Math.pow(1.07, meses/12)',
      category: 'advanced',
      variables: ['ahorros', 'meses'],
      example: '1000 * (1.07^1) = 1070 (7% anual)',
    },
    {
      id: 'optimizacion_gastos',
      name: 'Optimización de Gastos',
      description: 'Potencial de ahorro eliminando gastos hormiga',
      formula: '((gastos - gastosHormiga) / gastos) * 100',
      category: 'advanced',
      variables: ['gastos', 'gastosHormiga'],
      example: '((3500 - 300) / 3500) * 100 = 91.43%',
    },
    {
      id: 'indice_libertad',
      name: 'Índice de Libertad Financiera',
      description: 'Qué tan cerca estás de la libertad financiera',
      formula: '((ahorros + inversiones) / (gastos * 12)) * 100',
      category: 'advanced',
      variables: ['ahorros', 'inversiones', 'gastos'],
      example: '((1000 + 500) / (3500 * 12)) * 100 = 3.57%',
    },
    {
      id: 'roi_eliminacion_hormigas',
      name: 'ROI Eliminación Hormigas',
      description: 'Retorno de inversión al eliminar gastos hormiga',
      formula: '(gastosHormiga * 12) / gastosHormiga * 100',
      category: 'advanced',
      variables: ['gastosHormiga'],
      example: '(300 * 12) / 300 * 100 = 1200%',
    },
  ];

  const calculateFormula = (formula: Formula): number => {
    try {
      const { ingresos, gastos, ahorros, inversiones, deudas, gastosHormiga, metaAhorro, meses } = reportData;
      
      // Reemplazar variables en la fórmula
      let calculatedFormula = formula.formula
        .replace(/ingresos/g, ingresos.toString())
        .replace(/gastos/g, gastos.toString())
        .replace(/ahorros/g, ahorros.toString())
        .replace(/inversiones/g, inversiones.toString())
        .replace(/deudas/g, deudas.toString())
        .replace(/gastosHormiga/g, gastosHormiga.toString())
        .replace(/metaAhorro/g, metaAhorro.toString())
        .replace(/meses/g, meses.toString());

      // Evaluar la fórmula
      return eval(calculatedFormula);
    } catch (error) {
      return 0;
    }
  };

  const getFilteredFormulas = () => {
    return formulas.filter(formula => {
      if (userLevel === 'beginner') return formula.category === 'basic';
      if (userLevel === 'intermediate') return ['basic', 'intermediate'].includes(formula.category);
      return true; // advanced shows all
    });
  };

  const exportReport = () => {
    const results = getFilteredFormulas().map(formula => ({
      name: formula.name,
      result: calculateFormula(formula),
      formula: formula.formula,
    }));

    Alert.alert(
      '📊 Reporte Generado',
      `Se han calculado ${results.length} fórmulas. En una implementación completa, esto se exportaría a Excel/PDF.`,
      [
        { text: 'Ver Resumen', onPress: () => setModalVisible(true) },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const renderFormulaCard = (formula: Formula) => {
    const result = calculateFormula(formula);
    const isPercentage = formula.formula.includes('* 100');
    
    return (
      <TouchableOpacity
        key={formula.id}
        style={styles.formulaCard}
        onPress={() => {
          setSelectedFormula(formula);
          setCalculatorVisible(true);
        }}
      >
        <View style={styles.formulaHeader}>
          <View style={styles.formulaInfo}>
            <Text style={styles.formulaName}>{formula.name}</Text>
            <Text style={styles.formulaDescription}>{formula.description}</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(formula.category) }]}>
            <Text style={styles.categoryText}>{getCategoryName(formula.category)}</Text>
          </View>
        </View>
        
        <View style={styles.formulaContent}>
          <Text style={styles.formulaText}>📐 {formula.formula}</Text>
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Resultado:</Text>
            <Text style={styles.resultValue}>
              {isPercentage ? `${result.toFixed(2)}%` : `$${result.toFixed(2)}`}
            </Text>
          </View>
        </View>
        
        <Text style={styles.exampleText}>💡 Ejemplo: {formula.example}</Text>
      </TouchableOpacity>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#9C27B0';
      default: return '#666';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'basic': return 'Básico';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return '';
    }
  };

  const renderDataInput = (key: keyof ReportData, label: string, icon: string) => (
    <View key={key} style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{icon} {label}</Text>
      <TextInput
        style={styles.input}
        value={reportData[key].toString()}
        onChangeText={(text) => setReportData(prev => ({
          ...prev,
          [key]: parseFloat(text) || 0
        }))}
        keyboardType="numeric"
        placeholder="0"
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportes Avanzados</Text>
        <TouchableOpacity onPress={exportReport}>
          <Download size={24} color="#2673f3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Level Selection */}
        <View style={styles.levelSection}>
          <Text style={styles.sectionTitle}>🎯 Selecciona tu Nivel</Text>
          <View style={styles.levelContainer}>
            {userLevels.map(level => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  userLevel === level.id && styles.activeLevelCard,
                  { borderColor: level.color }
                ]}
                onPress={() => setUserLevel(level.id)}
              >
                <Text style={styles.levelIcon}>{level.icon}</Text>
                <Text style={[styles.levelName, { color: level.color }]}>{level.name}</Text>
                <Text style={styles.levelDescription}>{level.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data Input Section */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>📊 Datos Financieros</Text>
          <View style={styles.inputGrid}>
            {renderDataInput('ingresos', 'Ingresos Mensuales', '💰')}
            {renderDataInput('gastos', 'Gastos Mensuales', '💸')}
            {renderDataInput('ahorros', 'Ahorros Actuales', '🏦')}
            {renderDataInput('inversiones', 'Inversiones', '📈')}
            {renderDataInput('deudas', 'Deudas Totales', '💳')}
            {renderDataInput('gastosHormiga', 'Gastos Hormiga', '🐜')}
            {renderDataInput('metaAhorro', 'Meta de Ahorro', '🎯')}
            {renderDataInput('meses', 'Período (meses)', '📅')}
          </View>
        </View>

        {/* Formulas Section */}
        <View style={styles.formulasSection}>
          <View style={styles.formulasHeader}>
            <Text style={styles.sectionTitle}>🧮 Fórmulas Disponibles</Text>
            <Text style={styles.formulasCount}>
              {getFilteredFormulas().length} fórmulas
            </Text>
          </View>
          
          {getFilteredFormulas().map(renderFormulaCard)}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={exportReport}>
              <FileSpreadsheet size={24} color="#2673f3" />
              <Text style={styles.actionText}>Exportar a Excel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <PieChart size={24} color="#4CAF50" />
              <Text style={styles.actionText}>Gráficos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <TrendingUp size={24} color="#FF9800" />
              <Text style={styles.actionText}>Tendencias</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Brain size={24} color="#9C27B0" />
              <Text style={styles.actionText}>IA Insights</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Calculator Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={calculatorVisible}
        onRequestClose={() => setCalculatorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calculatorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                🧮 {selectedFormula?.name}
              </Text>
              <TouchableOpacity onPress={() => setCalculatorVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedFormula && (
              <ScrollView style={styles.calculatorContent}>
                <Text style={styles.formulaDetailDescription}>
                  {selectedFormula.description}
                </Text>
                
                <View style={styles.formulaDisplay}>
                  <Text style={styles.formulaDisplayTitle}>Fórmula:</Text>
                  <Text style={styles.formulaDisplayText}>{selectedFormula.formula}</Text>
                </View>
                
                <View style={styles.variablesSection}>
                  <Text style={styles.variablesTitle}>Variables utilizadas:</Text>
                  {selectedFormula.variables.map(variable => (
                    <Text key={variable} style={styles.variableItem}>
                      • {variable}: ${reportData[variable as keyof ReportData]}
                    </Text>
                  ))}
                </View>
                
                <View style={styles.resultDisplay}>
                  <Text style={styles.resultDisplayTitle}>Resultado:</Text>
                  <Text style={styles.resultDisplayValue}>
                    {selectedFormula.formula.includes('* 100') 
                      ? `${calculateFormula(selectedFormula).toFixed(2)}%`
                      : `$${calculateFormula(selectedFormula).toFixed(2)}`
                    }
                  </Text>
                </View>
                
                <View style={styles.interpretationSection}>
                  <Text style={styles.interpretationTitle}>💡 Interpretación:</Text>
                  <Text style={styles.interpretationText}>
                    {getInterpretation(selectedFormula, calculateFormula(selectedFormula))}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getInterpretation = (formula: Formula, result: number): string => {
  switch (formula.id) {
    case 'ahorro_neto':
      return result > 0 
        ? `Excelente! Tienes $${result.toFixed(2)} disponibles para ahorrar cada mes.`
        : `Atención: Estás gastando $${Math.abs(result).toFixed(2)} más de lo que ingresas.`;
    
    case 'porcentaje_ahorro':
      if (result >= 20) return `¡Excelente! Ahorras el ${result.toFixed(1)}% de tus ingresos. Estás por encima del 20% recomendado.`;
      if (result >= 10) return `Bien. Ahorras el ${result.toFixed(1)}% de tus ingresos. Intenta llegar al 20%.`;
      return `Necesitas mejorar. Solo ahorras el ${result.toFixed(1)}% de tus ingresos. El mínimo recomendado es 10%.`;
    
    case 'ratio_deuda':
      if (result <= 30) return `Saludable. Tu ratio de deuda es ${result.toFixed(1)}%, por debajo del 30% recomendado.`;
      if (result <= 50) return `Moderado. Tu ratio de deuda es ${result.toFixed(1)}%. Considera reducir deudas.`;
      return `Alto riesgo. Tu ratio de deuda es ${result.toFixed(1)}%. Urgente reducir deudas.`;
    
    default:
      return `El resultado de ${result.toFixed(2)} te ayuda a entender mejor tu situación financiera.`;
  }
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  
  // Level Selection
  levelSection: {
    marginBottom: 24,
  },
  levelContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  levelCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  activeLevelCard: {
    borderWidth: 2,
    backgroundColor: '#f8f9ff',
  },
  levelIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Data Input
  dataSection: {
    marginBottom: 24,
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inputContainer: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
  },
  
  // Formulas
  formulasSection: {
    marginBottom: 24,
  },
  formulasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formulasCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formulaCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2673f3',
  },
  formulaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  formulaInfo: {
    flex: 1,
  },
  formulaName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  formulaDescription: {
    fontSize: 14,
    color: '#666',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  formulaContent: {
    marginBottom: 8,
  },
  formulaText: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2673f3',
  },
  exampleText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  
  // Actions
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculatorModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  calculatorContent: {
    padding: 20,
  },
  formulaDetailDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  formulaDisplay: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  formulaDisplayTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formulaDisplayText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#2673f3',
  },
  variablesSection: {
    marginBottom: 16,
  },
  variablesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  variableItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultDisplay: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  resultDisplayTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resultDisplayValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2673f3',
  },
  interpretationSection: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 8,
  },
  interpretationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
