import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Target,
  Calendar,
  PieChart,
  BarChart3,
  Crown,
  Zap,
  Sparkles,
  X,
  Info,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingMicrophone } from '../components/FloatingMicrophone';
import { VoiceInstructionsModal } from '../components/VoiceInstructionsModal';
import { IriAlert } from '../components/IriAlert';
import { getCurrentUserId } from '../rest/api';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStats,
  getTransactions,
  createTransaction,
  type Budget as BudgetType,
  type Transaction as TransactionType,
} from '../rest/toolsApi';
import {
  analyzeBudgets,
  predictFutureExpenses,
  chatWithTool,
} from '../services/grokToolsService';

const { width } = Dimensions.get('window');

// Tipos ahora vienen de toolsApi.ts

export function PlanificadorFinancieroScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Estados principales
  const [userId, setUserId] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);

  // Estados de UI
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetType | null>(null);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newBudgetCategory, setNewBudgetCategory] = useState('food');
  const [showMicrophone, setShowMicrophone] = useState(true);
  const [showVoiceInstructions, setShowVoiceInstructions] = useState(false);
  const [iriAlertVisible, setIriAlertVisible] = useState(false);
  const [iriAlertMessage, setIriAlertMessage] = useState('');
  const [iriAlertType, setIriAlertType] = useState<'success' | 'error' | 'info'>('info');

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const uid = await getCurrentUserId();
      if (!uid) {
        Alert.alert('Error', 'No se pudo obtener el usuario');
        return;
      }
      
      setUserId(uid);
      
      await Promise.all([
        loadBudgets(uid),
        loadTransactions(uid),
        loadStats(uid),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadBudgets = async (uid: string) => {
    try {
      const budgetsData = await getBudgets(uid);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  const loadTransactions = async (uid: string) => {
    try {
      const transactionsData = await getTransactions(uid, 20);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadStats = async (uid: string) => {
    try {
      const statistics = await getBudgetStats(uid);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await Promise.all([
        loadBudgets(userId),
        loadTransactions(userId),
        loadStats(userId),
      ]);
    }
    setRefreshing(false);
  };

  // Análisis con IA
  const analyzeWithAI = async () => {
    if (!userId || budgets.length === 0) return;
    
    setAnalyzingWithAI(true);
    try {
      const analysis = await analyzeBudgets(budgets);
      setAiInsights(analysis.insights);
      setAiWarnings(analysis.warnings);
      setAiSuggestions(analysis.suggestions);
      
      Alert.alert(
        '💡 Análisis Completado',
        `Se generaron ${analysis.insights.length} insights y ${analysis.suggestions.length} sugerencias`,
        [{ text: 'Ver Resultados', style: 'default' }]
      );
    } catch (error) {
      console.error('Error analyzing with AI:', error);
      Alert.alert('Error', 'No se pudo completar el análisis con IA');
    } finally {
      setAnalyzingWithAI(false);
    }
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  const addOrUpdateBudget = async () => {
    if (!userId) return;
    
    if (!newBudgetName.trim() || !newBudgetAmount.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const amount = parseFloat(newBudgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'El monto debe ser un número válido');
      return;
    }

    try {
      const budgetData = {
        name: newBudgetName.trim(),
        amount,
        spent: editingBudget?.spent || 0,
        category: newBudgetCategory,
        color: getCategoryColor(newBudgetCategory),
        period: 'monthly' as const,
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData);
        Alert.alert('¡Éxito!', 'Presupuesto actualizado');
      } else {
        await createBudget(userId, budgetData);
        Alert.alert('¡Éxito!', 'Presupuesto creado');
      }

      await loadBudgets(userId);
      await loadStats(userId);
      setModalVisible(false);
      setEditingBudget(null);
      setNewBudgetName('');
      setNewBudgetAmount('');
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'No se pudo guardar el presupuesto');
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      food: '#FF6B6B',
      transport: '#4ECDC4',
      entertainment: '#45B7D1',
      education: '#96CEB4',
      shopping: '#FF9800',
      health: '#9C27B0',
      general: '#2673f3',
    };
    return colors[category] || '#2673f3';
  };

  const deleteBudgetItem = (budget: BudgetType) => {
    Alert.alert(
      'Eliminar Presupuesto',
      '¿Estás seguro de que quieres eliminar este presupuesto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteBudget(budget.id);
              if (userId) {
                await loadBudgets(userId);
                await loadStats(userId);
              }
              Alert.alert('Eliminado', 'Presupuesto eliminado correctamente');
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'No se pudo eliminar el presupuesto');
            }
          }
        }
      ]
    );
  };

  const renderBudgetCard = (budget: BudgetType) => {
    const percentage = (budget.spent / budget.amount) * 100;
    const isOverBudget = percentage > 100;

    return (
      <View key={budget.id} style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetInfo}>
            <View style={[styles.categoryDot, { backgroundColor: budget.color }]} />
            <Text style={styles.budgetName}>{budget.name}</Text>
          </View>
          <View style={styles.budgetActions}>
            <TouchableOpacity
              onPress={() => {
                setEditingBudget(budget);
                setNewBudgetName(budget.name);
                setNewBudgetAmount(budget.amount.toString());
                setNewBudgetCategory(budget.category);
                setModalVisible(true);
              }}
            >
              <Edit3 size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteBudgetItem(budget)}>
              <Trash2 size={16} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.budgetAmounts}>
          <Text style={styles.spentAmount}>${budget.spent}</Text>
          <Text style={styles.totalAmount}>de ${budget.amount}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: isOverBudget ? '#FF6B6B' : budget.color 
                }
              ]} 
            />
          </View>
          <Text style={[styles.percentageText, isOverBudget && styles.overBudgetText]}>
            {isNaN(percentage) ? '0' : percentage.toFixed(0)}%
          </Text>
        </View>
        
        {isOverBudget && (
          <Text style={styles.warningText}>
            ¡Excediste tu presupuesto por ${(budget.spent - budget.amount).toFixed(2)}!
          </Text>
        )}
      </View>
    );
  };

  // Micrófono flotante
  const handleMicrophoneTranscript = async (transcript: string) => {
    if (!userId) return;
    
    try {
      const response = await chatWithTool('planificador', transcript, {
        budgets,
        stats,
      });
      
      setIriAlertMessage(response);
      setIriAlertType('success');
      setIriAlertVisible(true);
    } catch (error: any) {
      console.error('Error processing voice:', error);
      const errorMessage = error?.message || 'No pude procesar tu solicitud';
      setIriAlertMessage(errorMessage);
      setIriAlertType('error');
      setIriAlertVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2673f3" />
        <Text style={{ marginTop: 16, color: '#666' }}>Cargando presupuestos...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Planificador Financiero</Text>
          <View style={styles.aiPoweredBadge}>
            <Sparkles size={12} color="#FFD700" />
            <Text style={styles.aiPoweredText}>IA</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => setShowVoiceInstructions(true)}
          style={styles.infoButton}
        >
          <Info size={24} color="#2673f3" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumen del Mes</Text>
            <TouchableOpacity 
              style={styles.aiAnalyzeButton}
              onPress={analyzeWithAI}
              disabled={analyzingWithAI}
            >
              <Sparkles size={16} color="#FFD700" />
              <Text style={styles.aiAnalyzeText}>
                {analyzingWithAI ? 'Analizando...' : 'Analizar con IA'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Presupuesto Total</Text>
              <Text style={styles.statValue}>${totalBudget}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Gastado</Text>
              <Text style={[styles.statValue, styles.spentValue]}>${totalSpent}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Restante</Text>
              <Text style={[styles.statValue, remainingBudget >= 0 ? styles.positiveValue : styles.negativeValue]}>
                ${remainingBudget}
              </Text>
            </View>
          </View>
          
          <View style={styles.overallProgress}>
            <View style={styles.overallProgressBar}>
              <View 
                style={[
                  styles.overallProgressFill, 
                  { 
                    width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                    backgroundColor: remainingBudget >= 0 ? '#2673f3' : '#FF6B6B'
                  }
                ]} 
              />
            </View>
            <Text style={styles.overallPercentage}>
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : '0'}% utilizado
            </Text>
          </View>
        </View>

        {/* AI Insights */}
        {(aiInsights.length > 0 || aiWarnings.length > 0 || aiSuggestions.length > 0) && (
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Sparkles size={20} color="#FFD700" />
              <Text style={styles.insightsTitle}>Análisis de Irï</Text>
            </View>
            
            {aiInsights.length > 0 && (
              <View style={styles.insightsSection}>
                <Text style={styles.insightsSectionTitle}>💡 Insights</Text>
                {aiInsights.map((insight, index) => (
                  <Text key={index} style={styles.insightText}>{insight}</Text>
                ))}
              </View>
            )}
            
            {aiWarnings.length > 0 && (
              <View style={styles.insightsSection}>
                <Text style={styles.insightsSectionTitle}>⚠️ Advertencias</Text>
                {aiWarnings.map((warning, index) => (
                  <Text key={index} style={styles.warningText}>{warning}</Text>
                ))}
              </View>
            )}
            
            {aiSuggestions.length > 0 && (
              <View style={styles.insightsSection}>
                <Text style={styles.insightsSectionTitle}>🎯 Sugerencias</Text>
                {aiSuggestions.map((suggestion, index) => (
                  <Text key={index} style={styles.suggestionText}>{suggestion}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Budgets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Presupuestos</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {budgets.length > 0 ? (
            budgets.map(renderBudgetCard)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hay presupuestos aún</Text>
              <Text style={styles.emptyStateSubtext}>Crea tu primer presupuesto para comenzar</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}>
            <PieChart size={24} color="#2673f3" />
            <Text style={styles.actionText}>Ver Gráficos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => (navigation as any).navigate('ReportesAvanzados')}>
            <BarChart3 size={24} color="#2673f3" />
            <Text style={styles.actionText}>Reportes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}>
            <Target size={24} color="#2673f3" />
            <Text style={styles.actionText}>Metas</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Micrófono Flotante */}
      {showMicrophone && (
        <FloatingMicrophone
          onTranscript={handleMicrophoneTranscript}
          onClose={() => setShowMicrophone(false)}
          toolName="planificador"
          isVisible={showMicrophone}
        />
      )}

      {/* Modal de Instrucciones de Voz */}
      <VoiceInstructionsModal
        visible={showVoiceInstructions}
        onClose={() => setShowVoiceInstructions(false)}
        toolName="planificador"
      />

      {/* Alert de Irï */}
      <IriAlert
        visible={iriAlertVisible}
        title="Irï"
        message={iriAlertMessage}
        onClose={() => setIriAlertVisible(false)}
        type={iriAlertType}
      />

      {/* Add/Edit Budget Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre del presupuesto"
              value={newBudgetName}
              onChangeText={setNewBudgetName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Monto"
              value={newBudgetAmount}
              onChangeText={setNewBudgetAmount}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setEditingBudget(null);
                  setNewBudgetName('');
                  setNewBudgetAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addOrUpdateBudget}
              >
                <Text style={styles.saveButtonText}>
                  {editingBudget ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 4,
  },
  aiPoweredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiPoweredText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  infoButton: {
    padding: 8,
    marginLeft: 8,
  },
  aiAnalyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  aiAnalyzeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  spentValue: {
    color: '#FF6B6B',
  },
  positiveValue: {
    color: '#2673f3',
  },
  negativeValue: {
    color: '#FF6B6B',
  },
  overallProgress: {
    alignItems: 'center',
  },
  overallProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  overallProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  overallPercentage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  insightsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  insightsSection: {
    marginBottom: 12,
  },
  insightsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#2673f3',
    marginBottom: 8,
    lineHeight: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2673f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  budgetActions: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  spentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  overBudgetText: {
    color: '#FF6B6B',
  },
  warningText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 8,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width - 40,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2673f3',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
