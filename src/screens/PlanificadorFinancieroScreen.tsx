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
  Zap
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  color: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

export function PlanificadorFinancieroScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [budgets, setBudgets] = useState<Budget[]>([
    { id: '1', name: 'Alimentación', amount: 500, spent: 320, category: 'food', color: '#FF6B6B' },
    { id: '2', name: 'Transporte', amount: 200, spent: 150, category: 'transport', color: '#4ECDC4' },
    { id: '3', name: 'Entretenimiento', amount: 150, spent: 80, category: 'entertainment', color: '#45B7D1' },
    { id: '4', name: 'Universidad', amount: 300, spent: 300, category: 'education', color: '#96CEB4' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', description: 'Supermercado', amount: -45, category: 'food', date: '2024-01-15', type: 'expense' },
    { id: '2', description: 'Salario', amount: 2000, category: 'salary', date: '2024-01-01', type: 'income' },
    { id: '3', description: 'Gasolina', amount: -60, category: 'transport', date: '2024-01-14', type: 'expense' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  const addOrUpdateBudget = () => {
    if (!newBudgetName.trim() || !newBudgetAmount.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const amount = parseFloat(newBudgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'El monto debe ser un número válido');
      return;
    }

    const remainingBudget = totalBudget - totalSpent;

    if (editingBudget) {
      setBudgets(budgets.map(budget => 
        budget.id === editingBudget.id 
          ? { ...budget, name: newBudgetName, amount }
          : budget
      ));
    } else {
      const newBudget: Budget = {
        id: Date.now().toString(),
        name: newBudgetName,
        amount,
        spent: 0,
        category: 'other',
        color: '#2673f3',
      };
      setBudgets([...budgets, newBudget]);
    }

    setModalVisible(false);
    setEditingBudget(null);
    setNewBudgetName('');
    setNewBudgetAmount('');
  };

  const deleteBudget = (id: string) => {
    Alert.alert(
      'Eliminar Presupuesto',
      '¿Estás seguro de que quieres eliminar este presupuesto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          setBudgets(budgets.filter(budget => budget.id !== id));
        }},
      ]
    );
  };

  const renderBudgetCard = (budget: Budget) => {
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
                setModalVisible(true);
              }}
            >
              <Edit3 size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteBudget(budget.id)}>
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
            {percentage.toFixed(0)}%
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Planificador Financiero</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumen del Mes</Text>
            <View style={styles.aiIcon}>
              <Zap size={16} color="#FFD700" />
            </View>
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
              {((totalSpent / totalBudget) * 100).toFixed(0)}% utilizado
            </Text>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <Zap size={20} color="#FFD700" />
            <Text style={styles.insightsTitle}>Análisis Inteligente</Text>
          </View>
          <Text style={styles.insightText}>
            📊 Estás gastando 15% más en alimentación este mes. Considera reducir comidas fuera.
          </Text>
          <Text style={styles.insightText}>
            💡 Podrías ahorrar $80 optimizando tus gastos de entretenimiento.
          </Text>
          <Text style={styles.insightText}>
            🎯 ¡Excelente! Mantienes el transporte dentro del presupuesto.
          </Text>
        </View>

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
          
          {budgets.map(renderBudgetCard)}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <PieChart size={24} color="#2673f3" />
            <Text style={styles.actionText}>Ver Gráficos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <BarChart3 size={24} color="#2673f3" />
            <Text style={styles.actionText}>Reportes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Target size={24} color="#2673f3" />
            <Text style={styles.actionText}>Metas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
