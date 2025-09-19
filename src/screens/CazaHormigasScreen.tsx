import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
  TextInput,
  Dimensions,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Zap, 
  AlertTriangle, 
  TrendingDown,
  Coffee,
  ShoppingBag,
  Car,
  Crown,
  Target,
  Calendar,
  DollarSign,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  BarChart3,
  PieChart,
  Settings,
  Filter,
  Search
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface AntExpense {
  id: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  icon: string;
  color: string;
  yearlyImpact: number;
  eliminated: boolean;
  notes?: string;
  dateAdded: string;
  goal?: number; // Meta mensual máxima
  currentMonthSpent?: number; // Gasto actual del mes
  detected: boolean;
}

interface ProjectionPeriod {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export function CazaHormigasScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [antExpenses, setAntExpenses] = useState<AntExpense[]>([
    {
      id: '1',
      description: 'Café diario en Starbucks',
      amount: 5.50,
      frequency: 'daily',
      category: 'food',
      icon: 'coffee',
      color: '#8B4513',
      yearlyImpact: 2007.50,
      detected: true,
      dateAdded: '2024-01-01',
      eliminated: false,
      notes: 'Podría hacer café en casa'
    },
    {
      id: '2',
      description: 'Suscripción Netflix no usada',
      amount: 15.99,
      frequency: 'monthly',
      category: 'entertainment',
      icon: 'tv',
      color: '#E50914',
      yearlyImpact: 191.88,
      detected: true,
      dateAdded: '2024-01-02',
      eliminated: false,
      notes: 'No he visto nada en 3 meses'
    },
    {
      id: '3',
      description: 'Snacks en gasolinera',
      amount: 8.00,
      frequency: 'weekly',
      category: 'food',
      icon: 'shopping-bag',
      color: '#FF6B6B',
      yearlyImpact: 416.00,
      detected: false,
      dateAdded: '2024-01-03',
      eliminated: false
    },
    {
      id: '4',
      description: 'Apps premium no utilizadas',
      amount: 4.99,
      frequency: 'monthly',
      category: 'tech',
      icon: 'smartphone',
      color: '#4ECDC4',
      yearlyImpact: 59.88,
      detected: true,
      dateAdded: '2024-01-04',
      eliminated: false
    }
  ]);

  const [categories] = useState<Category[]>([
    { id: 'food', name: 'Alimentación', icon: 'coffee', color: '#FF6B6B' },
    { id: 'entertainment', name: 'Entretenimiento', icon: 'tv', color: '#9C27B0' },
    { id: 'transport', name: 'Transporte', icon: 'car', color: '#2196F3' },
    { id: 'tech', name: 'Tecnología', icon: 'smartphone', color: '#4CAF50' },
    { id: 'shopping', name: 'Compras', icon: 'shopping-bag', color: '#FF9800' },
    { id: 'subscriptions', name: 'Suscripciones', icon: 'credit-card', color: '#795548' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<AntExpense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly',
    category: '',
    notes: '',
    goal: '',
  });
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEliminated, setShowEliminated] = useState(false);

  const [scanAnimation] = useState(new Animated.Value(0));
  const [isScanning, setIsScanning] = useState(false);

  const totalYearlyWaste = antExpenses.reduce((sum, expense) => sum + expense.yearlyImpact, 0);
  const detectedExpenses = antExpenses.filter(expense => expense.detected);

  const startScan = () => {
    setIsScanning(true);
    Animated.loop(
      Animated.timing(scanAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    setTimeout(() => {
      setIsScanning(false);
      scanAnimation.stopAnimation();
      scanAnimation.setValue(0);
      
      // Simulate detecting new ant expenses
      setAntExpenses(prev => prev.map(expense => ({
        ...expense,
        detected: true
      })));
      
      Alert.alert(
        '🐜 ¡Hormigas Detectadas!',
        `Encontré ${antExpenses.length} gastos hormiga que podrían ahorrarte $${totalYearlyWaste.toFixed(2)} al año`,
        [{ text: 'Ver Detalles', style: 'default' }]
      );
    }, 3000);
  };

  const calculateYearlyImpact = (amount: number, frequency: 'daily' | 'weekly' | 'monthly') => {
    switch (frequency) {
      case 'daily': return amount * 365;
      case 'weekly': return amount * 52;
      case 'monthly': return amount * 12;
      default: return 0;
    }
  };

  const calculateProjections = (amount: number, frequency: 'daily' | 'weekly' | 'monthly'): ProjectionPeriod => {
    let dailyAmount = 0;
    
    switch (frequency) {
      case 'daily': 
        dailyAmount = amount;
        break;
      case 'weekly': 
        dailyAmount = amount / 7;
        break;
      case 'monthly': 
        dailyAmount = amount / 30;
        break;
    }
    
    return {
      daily: dailyAmount,
      weekly: dailyAmount * 7,
      monthly: dailyAmount * 30,
      annual: dailyAmount * 365,
    };
  };

  const getGoalStatus = (expense: AntExpense) => {
    if (!expense.goal) return null;
    
    const currentSpent = expense.currentMonthSpent || 0;
    const goalAmount = expense.goal;
    const percentage = (currentSpent / goalAmount) * 100;
    
    return {
      percentage: Math.min(percentage, 100),
      isOverGoal: currentSpent > goalAmount,
      remaining: Math.max(goalAmount - currentSpent, 0),
      overage: Math.max(currentSpent - goalAmount, 0),
    };
  };

  const addOrUpdateExpense = () => {
    if (!formData.description.trim() || !formData.amount.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return;
    }

    const goal = formData.goal.trim() ? parseFloat(formData.goal) : undefined;

    if (editingExpense) {
      const category = categories.find(c => c.id === formData.category);
      const yearlyImpact = calculateYearlyImpact(amount, formData.frequency);
      
      setAntExpenses(prev => prev.map(expense => 
        expense.id === editingExpense.id 
          ? {
              ...expense,
              description: formData.description,
              amount,
              frequency: formData.frequency,
              category: formData.category,
              notes: formData.notes,
              yearlyImpact,
              color: category?.color || '#666',
              icon: category?.icon || 'dollar-sign',
              goal,
              currentMonthSpent: expense.currentMonthSpent || (Math.random() * (goal || amount) * 0.8),
            }
          : expense
      ));
    } else {
      const newExpense: AntExpense = {
        id: Date.now().toString(),
        description: formData.description.trim(),
        amount,
        frequency: formData.frequency,
        category: formData.category,
        color: categories.find(c => c.id === formData.category)?.color || '#666',
        icon: categories.find(c => c.id === formData.category)?.icon || 'dollar-sign',
        yearlyImpact: calculateYearlyImpact(amount, formData.frequency),
        eliminated: false,
        notes: formData.notes.trim() || undefined,
        dateAdded: new Date().toLocaleDateString(),
        detected: true,
        goal,
        currentMonthSpent: Math.random() * (goal || amount) * 0.8, // Simular gasto actual
      };
      setAntExpenses(prev => [...prev, newExpense]);
    }

    closeModal();
    Alert.alert('¡Éxito!', editingExpense ? 'Gasto hormiga actualizado' : 'Nuevo gasto hormiga agregado');
  };

  const deleteExpense = (id: string) => {
    Alert.alert(
      'Eliminar Gasto Hormiga',
      '¿Estás seguro de que quieres eliminar este gasto permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => {
            setAntExpenses(prev => prev.filter(expense => expense.id !== id));
            Alert.alert('Eliminado', 'Gasto hormiga eliminado correctamente');
          }
        }
      ]
    );
  };

  const toggleEliminated = (id: string) => {
    setAntExpenses(prev => prev.map(expense => 
      expense.id === id 
        ? { ...expense, eliminated: !expense.eliminated }
        : expense
    ));
  };

  const openModal = (expense?: AntExpense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        frequency: expense.frequency,
        category: expense.category,
        notes: expense.notes || '',
        goal: expense.goal?.toString() || '',
      });
    } else {
      setEditingExpense(null);
      setFormData({
        description: '',
        amount: '',
        frequency: 'monthly',
        category: '',
        notes: '',
        goal: '',
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: '',
      frequency: 'monthly',
      category: '',
      notes: '',
      goal: '',
    });
  };

  const filteredExpenses = antExpenses.filter(expense => {
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEliminated = showEliminated ? expense.eliminated : !expense.eliminated;
    return matchesCategory && matchesSearch && matchesEliminated;
  });

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'coffee': return <Coffee size={24} color="#8B4513" />;
      case 'shopping-bag': return <ShoppingBag size={24} color="#FF6B6B" />;
      case 'car': return <Car size={24} color="#4ECDC4" />;
      default: return <DollarSign size={24} color="#666" />;
    }
  };

  const renderAntExpense = (expense: AntExpense) => (
    <View key={expense.id} style={[
      styles.antCard, 
      expense.eliminated && styles.eliminatedAnt
    ]}>
      <View style={styles.antHeader}>
        <View style={styles.antInfo}>
          <View style={[styles.antIcon, { backgroundColor: expense.color + '20' }]}>
            {getIcon(expense.icon)}
          </View>
          <View style={styles.antDetails}>
            <Text style={[styles.antDescription, expense.eliminated && styles.eliminatedText]}>
              {expense.description}
            </Text>
            <Text style={styles.antFrequency}>
              ${expense.amount} • {expense.frequency === 'daily' ? 'Diario' : 
                                  expense.frequency === 'weekly' ? 'Semanal' : 'Mensual'}
            </Text>
            {expense.notes && (
              <Text style={styles.antNotes}>📝 {expense.notes}</Text>
            )}
          </View>
        </View>
        <View style={styles.antActions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => openModal(expense)}
          >
            <Edit3 size={16} color="#2673f3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, expense.eliminated ? styles.restoreBtn : styles.eliminateBtn]}
            onPress={() => toggleEliminated(expense.id)}
          >
            {expense.eliminated ? (
              <Save size={16} color="#2673f3" />
            ) : (
              <X size={16} color="#fff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => deleteExpense(expense.id)}
          >
            <Trash2 size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Goal Progress */}
      {expense.goal && (
        <View style={styles.goalSection}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalLabel}>Meta Mensual: ${expense.goal}</Text>
            <Text style={[
              styles.goalStatus,
              getGoalStatus(expense)?.isOverGoal ? styles.overGoal : styles.onTrack
            ]}>
              {getGoalStatus(expense)?.isOverGoal ? '⚠️ Excedida' : '✅ En meta'}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${getGoalStatus(expense)?.percentage || 0}%`,
                  backgroundColor: getGoalStatus(expense)?.isOverGoal ? '#FF6B6B' : '#2673f3'
                }
              ]} 
            />
          </View>
          <Text style={styles.goalDetails}>
            Gastado: ${expense.currentMonthSpent?.toFixed(2) || '0.00'} | 
            {getGoalStatus(expense)?.isOverGoal 
              ? ` Exceso: $${getGoalStatus(expense)?.overage.toFixed(2)}`
              : ` Restante: $${getGoalStatus(expense)?.remaining.toFixed(2)}`
            }
          </Text>
        </View>
      )}

      {/* Multiple Projections */}
      <View style={styles.projectionsSection}>
        <Text style={styles.projectionsTitle}>📊 Proyecciones de Impacto</Text>
        <View style={styles.projectionsGrid}>
          {(() => {
            const projections = calculateProjections(expense.amount, expense.frequency);
            return [
              { label: 'Diario', value: projections.daily, icon: '📅' },
              { label: 'Semanal', value: projections.weekly, icon: '📆' },
              { label: 'Mensual', value: projections.monthly, icon: '🗓️' },
              { label: 'Anual', value: projections.annual, icon: '📊' },
            ].map(proj => (
              <View key={proj.label} style={styles.projectionItem}>
                <Text style={styles.projectionIcon}>{proj.icon}</Text>
                <Text style={styles.projectionLabel}>{proj.label}</Text>
                <Text style={[styles.projectionValue, expense.eliminated && styles.eliminatedAmount]}>
                  ${proj.value.toFixed(2)}
                </Text>
              </View>
            ));
          })()}
        </View>
      </View>

      <View style={styles.impactSection}>
        <View style={styles.savingsProjection}>
          <Text style={styles.savingsText}>
            💡 {expense.eliminated ? 'Ahorro logrado' : 'Podrías ahorrar'}: ${(expense.yearlyImpact / 12).toFixed(2)} mensuales
          </Text>
        </View>
        <Text style={styles.dateAdded}>Agregado: {expense.dateAdded}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>El CazaHormigas</Text>
          <View style={styles.premiumBadge}>
            <Crown size={12} color="#FFD700" />
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Text style={styles.antEmoji}>🐜</Text>
          </View>
          <Text style={styles.heroTitle}>Detector de Gastos Hormiga</Text>
          <Text style={styles.heroDescription}>
            Identifica pequeños gastos recurrentes que suman grandes cantidades al año
          </Text>
          
          <TouchableOpacity 
            style={[styles.scanButton, isScanning && styles.scanningButton]}
            onPress={startScan}
            disabled={isScanning}
          >
            <Animated.View style={{
              transform: [{
                rotate: scanAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }]
            }}>
              <Zap size={20} color="#fff" />
            </Animated.View>
            <Text style={styles.scanButtonText}>
              {isScanning ? 'Analizando...' : 'Iniciar Análisis IA'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <AlertTriangle size={20} color="#FF6B6B" />
            <Text style={styles.statNumber}>{detectedExpenses.length}</Text>
            <Text style={styles.statLabel}>Hormigas Detectadas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <TrendingDown size={20} color="#2673f3" />
            <Text style={styles.statNumber}>${totalYearlyWaste.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Ahorro Anual Potencial</Text>
          </View>
        </View>

        {/* AI Recommendations */}
        <View style={styles.recommendationsCard}>
          <View style={styles.recommendationsHeader}>
            <Zap size={20} color="#FFD700" />
            <Text style={styles.recommendationsTitle}>Recomendaciones IA</Text>
          </View>
          <View style={styles.recommendation}>
            <Text style={styles.recommendationText}>
              🎯 Prioridad Alta: Elimina el café diario, ahorra $2,007 anuales
            </Text>
          </View>
          <View style={styles.recommendation}>
            <Text style={styles.recommendationText}>
              💡 Alternativa: Café casero te ahorraría $1,500 al año
            </Text>
          </View>
          <View style={styles.recommendation}>
            <Text style={styles.recommendationText}>
              📱 Revisa suscripciones: 3 apps no usadas en 30 días
            </Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar gastos hormiga..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
            <TouchableOpacity
              style={[styles.filterChip, filterCategory === 'all' && styles.activeFilterChip]}
              onPress={() => setFilterCategory('all')}
            >
              <Text style={[styles.filterText, filterCategory === 'all' && styles.activeFilterText]}>
                Todos
              </Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.filterChip, filterCategory === category.id && styles.activeFilterChip]}
                onPress={() => setFilterCategory(category.id)}
              >
                <Text style={[styles.filterText, filterCategory === category.id && styles.activeFilterText]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, !showEliminated && styles.activeToggle]}
              onPress={() => setShowEliminated(false)}
            >
              <Text style={[styles.toggleText, !showEliminated && styles.activeToggleText]}>
                Activos ({antExpenses.filter(e => !e.eliminated).length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, showEliminated && styles.activeToggle]}
              onPress={() => setShowEliminated(true)}
            >
              <Text style={[styles.toggleText, showEliminated && styles.activeToggleText]}>
                Eliminados ({antExpenses.filter(e => e.eliminated).length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ant Expenses List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {showEliminated ? 'Gastos Eliminados' : 'Gastos Hormiga Activos'}
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => openModal()}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map(renderAntExpense)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No se encontraron gastos con ese término' : 
                 showEliminated ? 'No hay gastos eliminados' : 'No hay gastos hormiga activos'}
              </Text>
            </View>
          )}
        </View>

        {/* Potential Savings */}
        <View style={styles.savingsCard}>
          <View style={styles.savingsHeader}>
            <Target size={24} color="#2673f3" />
            <Text style={styles.savingsTitle}>Proyección de Ahorro</Text>
          </View>
          <View style={styles.savingsBreakdown}>
            <View style={styles.savingsRow}>
              <Text style={styles.savingsLabel}>Ahorro Mensual</Text>
              <Text style={styles.savingsAmount}>${(totalYearlyWaste / 12).toFixed(2)}</Text>
            </View>
            <View style={styles.savingsRow}>
              <Text style={styles.savingsLabel}>Ahorro Anual</Text>
              <Text style={styles.savingsAmount}>${totalYearlyWaste.toFixed(2)}</Text>
            </View>
            <View style={styles.savingsRow}>
              <Text style={styles.savingsLabel}>En 5 años</Text>
              <Text style={[styles.savingsAmount, styles.bigSavings]}>
                ${(totalYearlyWaste * 5).toFixed(2)}
              </Text>
            </View>
          </View>
          <Text style={styles.motivationalText}>
            💪 ¡Con estos ahorros podrías invertir en tu futuro financiero!
          </Text>
        </View>

        {/* Action Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips para Eliminar Hormigas</Text>
          <Text style={styles.tipText}>• Prepara café en casa</Text>
          <Text style={styles.tipText}>• Cancela suscripciones no usadas</Text>
          <Text style={styles.tipText}>• Planifica compras semanales</Text>
          <Text style={styles.tipText}>• Usa apps de presupuesto</Text>
          <Text style={styles.tipText}>• Revisa gastos cada 15 días</Text>
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingExpense ? 'Editar Gasto Hormiga' : 'Nuevo Gasto Hormiga'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <Text style={styles.fieldLabel}>Descripción *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Café diario en Starbucks"
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
              />
              
              <Text style={styles.fieldLabel}>Monto *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.amount}
                onChangeText={(text) => setFormData({...formData, amount: text})}
                keyboardType="numeric"
              />
              
              <Text style={styles.fieldLabel}>Frecuencia *</Text>
              <View style={styles.frequencyContainer}>
                {[
                  { key: 'daily', label: 'Diario' },
                  { key: 'weekly', label: 'Semanal' },
                  { key: 'monthly', label: 'Mensual' }
                ].map(freq => (
                  <TouchableOpacity
                    key={freq.key}
                    style={[
                      styles.frequencyBtn,
                      formData.frequency === freq.key && styles.activeFrequencyBtn
                    ]}
                    onPress={() => setFormData({...formData, frequency: freq.key as any})}
                  >
                    <Text style={[
                      styles.frequencyText,
                      formData.frequency === freq.key && styles.activeFrequencyText
                    ]}>
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.fieldLabel}>Categoría *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryBtn,
                        formData.category === category.id && styles.activeCategoryBtn,
                        { borderColor: category.color }
                      ]}
                      onPress={() => setFormData({...formData, category: category.id})}
                    >
                      <Text style={styles.categoryEmoji}>{category.icon === 'coffee' ? '☕' : 
                                                         category.icon === 'tv' ? '📺' : 
                                                         category.icon === 'car' ? '🚗' : 
                                                         category.icon === 'smartphone' ? '📱' : 
                                                         category.icon === 'shopping-bag' ? '🛍️' : '💳'}</Text>
                      <Text style={[
                        styles.categoryText,
                        formData.category === category.id && styles.activeCategoryText
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              <Text style={styles.fieldLabel}>Meta Mensual (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 50.00 - Límite máximo mensual"
                value={formData.goal}
                onChangeText={(text) => setFormData({...formData, goal: text})}
                keyboardType="numeric"
              />
              
              <Text style={styles.fieldLabel}>Notas</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Notas adicionales..."
                value={formData.notes}
                onChangeText={(text) => setFormData({...formData, notes: text})}
                multiline
                numberOfLines={3}
              />
              
              {formData.amount && (
                <View style={styles.impactPreview}>
                  <Text style={styles.impactPreviewTitle}>💡 Impacto Proyectado</Text>
                  <Text style={styles.impactPreviewText}>
                    Ahorro anual: ${calculateYearlyImpact(parseFloat(formData.amount) || 0, formData.frequency).toFixed(2)}
                  </Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addOrUpdateExpense}
              >
                <Text style={styles.saveButtonText}>
                  {editingExpense ? 'Actualizar' : 'Agregar'}
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
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE4E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  antEmoji: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  scanningButton: {
    backgroundColor: '#FF8A80',
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsCard: {
    flexDirection: 'row',
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: 20,
  },
  recommendationsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  recommendation: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  antCard: {
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
  hiddenAnt: {
    opacity: 0.5,
  },
  antHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  antInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  antIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  antDetails: {
    flex: 1,
  },
  antDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  antFrequency: {
    fontSize: 14,
    color: '#666',
  },
  eliminateButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eliminateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  impactSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  impactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactLabel: {
    fontSize: 14,
    color: '#666',
  },
  impactAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  savingsProjection: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 12,
    color: '#2673f3',
    fontWeight: '500',
  },
  savingsCard: {
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
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  savingsBreakdown: {
    marginBottom: 16,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  savingsLabel: {
    fontSize: 14,
    color: '#666',
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2673f3',
  },
  bigSavings: {
    fontSize: 20,
    color: '#1565C0',
  },
  motivationalText: {
    fontSize: 14,
    color: '#2673f3',
    textAlign: 'center',
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  
  // New styles for enhanced CRUD functionality
  filtersSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  categoryFilters: {
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#2673f3',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#2673f3',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2673f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eliminatedAnt: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  eliminatedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  eliminatedAmount: {
    color: '#2673f3',
  },
  antActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eliminateBtn: {
    backgroundColor: '#FF6B6B',
  },
  restoreBtn: {
    backgroundColor: '#E3F2FD',
  },
  deleteBtn: {
    backgroundColor: '#FFE5E5',
  },
  antNotes: {
    fontSize: 12,
    color: '#2673f3',
    fontStyle: 'italic',
    marginTop: 4,
  },
  dateAdded: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalForm: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  activeFrequencyBtn: {
    backgroundColor: '#2673f3',
  },
  frequencyText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFrequencyText: {
    color: '#fff',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryBtn: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    backgroundColor: '#fff',
    minWidth: 80,
  },
  activeCategoryBtn: {
    backgroundColor: '#E3F2FD',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeCategoryText: {
    color: '#2673f3',
    fontWeight: '600',
  },
  impactPreview: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  impactPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2673f3',
    marginBottom: 4,
  },
  impactPreviewText: {
    fontSize: 14,
    color: '#1565C0',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
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
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2673f3',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  
  // Goal tracking styles
  goalSection: {
    backgroundColor: '#f8f9ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2673f3',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  goalStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  onTrack: {
    color: '#4CAF50',
  },
  overGoal: {
    color: '#FF6B6B',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalDetails: {
    fontSize: 11,
    color: '#666',
  },
  
  // Projections styles
  projectionsSection: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  projectionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  projectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  projectionItem: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  projectionIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  projectionLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  projectionValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2673f3',
  },
});
