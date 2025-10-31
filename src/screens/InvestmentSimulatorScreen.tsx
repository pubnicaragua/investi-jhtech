/**
 * InvestmentSimulatorScreen.tsx
 * Pantalla para simular inversiones con diferentes escenarios
 * Usa datos reales del mercado combinados con escenarios predefinidos
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, DollarSign, PieChart, TrendingUp } from 'lucide-react-native';
import { getMarketStocks, MarketStock } from '../services/searchApiService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';

// Escenarios de inversión predefinidos
const INVESTMENT_SCENARIOS = [
  {
    id: 'conservative',
    name: 'Conservador',
    description: 'Bajo riesgo, retornos estables',
    annualReturn: 5,
    volatility: 3,
    color: '#10B981',
    icon: '🛡️',
  },
  {
    id: 'moderate',
    name: 'Moderado',
    description: 'Riesgo medio, balance entre seguridad y crecimiento',
    annualReturn: 8,
    volatility: 8,
    color: '#3B82F6',
    icon: '⚖️',
  },
  {
    id: 'aggressive',
    name: 'Agresivo',
    description: 'Alto riesgo, potencial de altos retornos',
    annualReturn: 12,
    volatility: 15,
    color: '#EF4444',
    icon: '🚀',
  },
  {
    id: 'crypto',
    name: 'Criptomonedas',
    description: 'Muy alto riesgo, volatilidad extrema',
    annualReturn: 20,
    volatility: 40,
    color: '#F59E0B',
    icon: '₿',
  },
];

export function InvestmentSimulatorScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'InvestmentSimulator'>>();
  const insets = useSafeAreaInsets();
  const stockFromRoute = route.params?.stock as MarketStock;

  const [initialAmount, setInitialAmount] = useState('10000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [years, setYears] = useState('10');
  const [selectedScenario, setSelectedScenario] = useState(INVESTMENT_SCENARIOS[1]);
  const [showResults, setShowResults] = useState(false);
  const [stock, setStock] = useState<MarketStock | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del mercado si no vienen en la ruta
  useEffect(() => {
    async function loadStockData() {
      try {
        if (stockFromRoute) {
          setStock(stockFromRoute);
          // Ajustar escenario basado en volatilidad histórica
          adjustScenarioForStock(stockFromRoute);
          setLoading(false);
          return;
        }

        // Si no hay stock en la ruta, cargar AAPL como default
        const stocks = await getMarketStocks(['AAPL']);
        if (stocks && stocks.length > 0) {
          setStock(stocks[0]);
          adjustScenarioForStock(stocks[0]);
        }
      } catch (error) {
        console.error('Error loading stock data:', error);
        // Usar datos dummy si falla la carga
        setStock({
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 150,
          change: 2.5,
          changePercent: 1.67,
          currency: 'USD',
          exchange: 'NASDAQ'
        });
      } finally {
        setLoading(false);
      }
    }

    loadStockData();
  }, [stockFromRoute]);

  // Ajustar escenario basado en el stock
  const adjustScenarioForStock = (stock: MarketStock) => {
    // Usar valores por defecto si changePercent es undefined
    const changePercent = stock.changePercent || 0;
    const volatilityAdjustment = Math.abs(changePercent) * 1.5;
    const scenarios = [...INVESTMENT_SCENARIOS];
    
    scenarios.forEach(scenario => {
      if (scenario.id === 'conservative') {
        scenario.annualReturn = Math.max(3, changePercent);
        scenario.volatility = Math.max(2, volatilityAdjustment * 0.5);
      } else if (scenario.id === 'moderate') {
        scenario.annualReturn = Math.max(6, changePercent * 1.2);
        scenario.volatility = Math.max(5, volatilityAdjustment);
      } else if (scenario.id === 'aggressive') {
        scenario.annualReturn = Math.max(10, changePercent * 1.5);
        scenario.volatility = Math.max(10, volatilityAdjustment * 1.5);
      }
    });

    setSelectedScenario(scenarios[1]); // Mantener escenario moderado como default
  };

  // Calcular proyección de inversión
  const calculateInvestment = () => {
    const initial = parseFloat(initialAmount) || 0;
    const monthly = parseFloat(monthlyContribution) || 0;
    const period = parseInt(years) || 0;
    const annualRate = selectedScenario.annualReturn / 100;
    const monthlyRate = annualRate / 12;
    const months = period * 12;

    if (initial <= 0 || period <= 0) {
      Alert.alert('Error', 'Por favor ingresa valores válidos');
      return null;
    }

    // Calcular valor futuro de la inversión inicial
    const futureValueInitial = initial * Math.pow(1 + monthlyRate, months);
    
    // Calcular valor futuro de las contribuciones mensuales
    let futureValueContributions = 0;
    if (monthly > 0 && monthlyRate > 0) {
      futureValueContributions = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    } else if (monthly > 0) {
      // Si monthlyRate es 0, simplemente sumar las contribuciones
      futureValueContributions = monthly * months;
    }

    const futureValue = futureValueInitial + futureValueContributions;
    const totalContributed = initial + (monthly * months);
    const totalEarnings = futureValue - totalContributed;
    const roi = totalContributed > 0 ? ((totalEarnings / totalContributed) * 100) : 0;

    return {
      futureValue: Math.round(futureValue),
      totalContributed: Math.round(totalContributed),
      totalEarnings: Math.round(totalEarnings),
      roi: roi.toFixed(2),
    };
  };

  const handleSimulate = () => {
    setShowResults(true);
  };

  const results = showResults ? calculateInvestment() : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Simulador de Inversiones</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Descripción */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>📊 Simula tu Inversión</Text>
          <Text style={styles.descriptionText}>
            Proyecta el crecimiento de tu inversión con diferentes escenarios de riesgo y retorno.
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de Inversión</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>💰 Inversión Inicial</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={initialAmount}
                onChangeText={setInitialAmount}
                keyboardType="numeric"
                placeholder="10000"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📅 Aporte Mensual</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={monthlyContribution}
                onChangeText={setMonthlyContribution}
                keyboardType="numeric"
                placeholder="500"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>⏱️ Período (años)</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color="#666" />
              <TextInput
                style={styles.input}
                value={years}
                onChangeText={setYears}
                keyboardType="numeric"
                placeholder="10"
              />
            </View>
          </View>
        </View>

        {/* Escenarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escenario de Inversión</Text>
          {INVESTMENT_SCENARIOS.map((scenario) => (
            <TouchableOpacity
              key={scenario.id}
              style={[
                styles.scenarioCard,
                selectedScenario.id === scenario.id && {
                  borderColor: scenario.color,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedScenario(scenario)}
              activeOpacity={0.7}
            >
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioIcon}>{scenario.icon}</Text>
                <View style={styles.scenarioInfo}>
                  <Text style={styles.scenarioName}>{scenario.name}</Text>
                  <Text style={styles.scenarioDescription}>{scenario.description}</Text>
                </View>
                {selectedScenario.id === scenario.id && (
                  <View style={[styles.selectedBadge, { backgroundColor: scenario.color }]}>
                    <Text style={styles.selectedText}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.scenarioStats}>
                <View style={styles.stat}>
                  <DollarSign size={14} color={scenario.color} />
                  <Text style={styles.statLabel}>Retorno Anual</Text>
                  <Text style={[styles.statValue, { color: scenario.color }]}>
                    {scenario.annualReturn}%
                  </Text>
                </View>
                <View style={styles.stat}>
                  <TrendingUp size={14} color="#666" />
                  <Text style={styles.statLabel}>Volatilidad</Text>
                  <Text style={styles.statValue}>{scenario.volatility}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón Simular */}
        <TouchableOpacity style={styles.simulateButton} onPress={handleSimulate}>
          <PieChart size={20} color="#fff" />
          <Text style={styles.simulateButtonText}>Simular Inversión</Text>
        </TouchableOpacity>

        {/* Resultados */}
        {showResults && results && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Resultados de la Simulación</Text>

            {stock && (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Stock Simulado</Text>
                <Text style={styles.resultValue}>{stock.symbol}</Text>
                <Text style={[styles.resultLabel, { marginTop: 8 }]}>
                  {stock.name} - ${stock.price || 0} ({(stock.changePercent || 0) > 0 ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%)
                </Text>
              </View>
            )}

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Valor Final</Text>
              <Text style={styles.resultValue}>
                ${results.futureValue.toLocaleString()}
              </Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Total Invertido</Text>
              <Text style={styles.resultValueSecondary}>
                ${results.totalContributed.toLocaleString()}
              </Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Ganancias</Text>
              <Text style={[styles.resultValue, { color: '#10B981' }]}>
                +${results.totalEarnings.toLocaleString()}
              </Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>ROI (Retorno de Inversión)</Text>
              <Text style={[styles.resultValue, { color: '#10B981' }]}>
                {results.roi}%
              </Text>
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                ⚠️ <Text style={styles.disclaimerBold}>Importante:</Text> Esta es una simulación
                educativa. Los resultados reales pueden variar significativamente debido a la
                volatilidad del mercado, comisiones, impuestos y otros factores.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  content: {
    flex: 1,
  },
  descriptionCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111',
  },
  scenarioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scenarioIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 13,
    color: '#666',
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scenarioStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2673f3',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  simulateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  resultValueSecondary: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginTop: 16,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: '700',
  },
  stockInfo: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  stockSymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C4A6E',
    marginBottom: 4,
  },
  stockPrice: {
    fontSize: 16,
    color: '#0369A1',
    fontWeight: '600',
  },
  stockChange: {
    fontSize: 14,
    marginTop: 4,
    color: '#0EA5E9',
  },
});
