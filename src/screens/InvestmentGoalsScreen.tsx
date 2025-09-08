import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, BookOpen, Home, TrendingUp, Target, Gift, GraduationCap, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const GOALS = [
  { id: '1', title: 'Ahorrar para el futuro', icon: 'book' },
  { id: '2', title: 'Comprar una casa', icon: 'home' },
  { id: '3', title: 'Generar ingresos pasivos', icon: 'trending' },
  { id: '4', title: 'Jubilación', icon: 'target' },
  { id: '5', title: 'Educación', icon: 'graduation' },
  { id: '6', title: 'Viajes', icon: 'gift' },
  { id: '7', title: 'Salud', icon: 'heart' },
  { id: '8', title: 'Otro', icon: 'plus' },
];

export function InvestmentGoalsScreen() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const navigation = useNavigation();

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'book': return <BookOpen size={24} color="#4A6CF7" />;
      case 'home': return <Home size={24} color="#4A6CF7" />;
      case 'trending': return <TrendingUp size={24} color="#4A6CF7" />;
      case 'target': return <Target size={24} color="#4A6CF7" />;
      case 'graduation': return <GraduationCap size={24} color="#4A6CF7" />;
      case 'gift': return <Gift size={24} color="#4A6CF7" />;
      case 'heart': return <Heart size={24} color="#4A6CF7" />;
      default: return <View style={styles.plusIcon}><Text style={styles.plusText}>+</Text></View>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressStep, styles.activeStep]} />
          <View style={styles.progressStep} />
          <View style={styles.progressStep} />
          <View style={styles.progressStep} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>¿Cuáles son tus metas al invertir?</Text>
        <Text style={styles.subtitle}>Selecciona todas las que apliquen</Text>
        
        <View style={styles.grid}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoals.includes(goal.id) && styles.selectedGoalCard
              ]}
              onPress={() => toggleGoal(goal.id)}
            >
              <View style={[
                styles.iconContainer,
                selectedGoals.includes(goal.id) && styles.selectedIconContainer
              ]}>
                {renderIcon(goal.icon)}
              </View>
              <Text style={styles.goalText}>{goal.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, selectedGoals.length === 0 && styles.buttonDisabled]}
          disabled={selectedGoals.length === 0}
          onPress={() => navigation.navigate('InvestmentInterests' as never)}
        >
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressStep: {
    height: '100%',
    backgroundColor: '#E5E7EB',
    flex: 1,
    marginHorizontal: 1,
  },
  activeStep: {
    backgroundColor: '#4A6CF7',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  goalCard: {
    width: (width - 64) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedGoalCard: {
    backgroundColor: '#F0F4FF',
    borderColor: '#4A6CF7',
    shadowColor: '#4A6CF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedIconContainer: {
    backgroundColor: '#D7E1FF',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
  },
  plusIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    fontSize: 24,
    color: '#4A6CF7',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4A6CF7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});
