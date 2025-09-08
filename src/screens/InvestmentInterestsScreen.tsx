import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Briefcase, Cpu, HeartPulse, Leaf, Lightbulb, Wind, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const INTERESTS = [
  { id: '1', name: 'Tecnología', icon: 'cpu' },
  { id: '2', name: 'Salud', icon: 'health' },
  { id: '3', name: 'Energía', icon: 'zap' },
  { id: '4', name: 'Sostenibilidad', icon: 'leaf' },
  { id: '5', name: 'Bienes raíces', icon: 'briefcase' },
  { id: '6', name: 'Energía renovable', icon: 'wind' },
  { id: '7', name: 'Inteligencia artificial', icon: 'lightbulb' },
  { id: '8', name: 'Otro', icon: 'plus' },
];

export function InvestmentInterestsScreen() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const navigation = useNavigation();

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'cpu': return <Cpu size={24} color="#4A6CF7" />;
      case 'health': return <HeartPulse size={24} color="#4A6CF7" />;
      case 'zap': return <Zap size={24} color="#4A6CF7" />;
      case 'leaf': return <Leaf size={24} color="#4A6CF7" />;
      case 'briefcase': return <Briefcase size={24} color="#4A6CF7" />;
      case 'wind': return <Wind size={24} color="#4A6CF7" />;
      case 'lightbulb': return <Lightbulb size={24} color="#4A6CF7" />;
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
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>¿Cuáles son tus intereses?</Text>
        <Text style={styles.subtitle}>Selecciona tus intereses de inversión</Text>
        
        <View style={styles.grid}>
          {INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest.id}
              style={[
                styles.interestCard,
                selectedInterests.includes(interest.id) && styles.selectedInterestCard
              ]}
              onPress={() => toggleInterest(interest.id)}
            >
              <View style={[
                styles.iconContainer,
                selectedInterests.includes(interest.id) && styles.selectedIconContainer
              ]}>
                {renderIcon(interest.icon)}
              </View>
              <Text style={styles.interestText}>{interest.name}</Text>
              {selectedInterests.includes(interest.id) && (
                <View style={styles.checkmarkContainer}>
                  <View style={styles.checkmark} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, selectedInterests.length === 0 && styles.buttonDisabled]}
          disabled={selectedInterests.length === 0}
          onPress={() => navigation.navigate('InvestmentKnowledge' as never)}
        >
          <Text style={styles.buttonText}>Continuar</Text>
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
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
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
  interestCard: {
    width: (width - 64) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  selectedInterestCard: {
    backgroundColor: '#F0F4FF',
    borderColor: '#4A6CF7',
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
  interestText: {
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
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4A6CF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 10,
    height: 6,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '-45deg' }],
    marginBottom: 2,
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
