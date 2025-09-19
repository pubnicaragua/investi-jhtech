import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const KNOWLEDGE_LEVELS = [
  {
    id: '1',
    level: 'Básico',
    description: 'Tengo poco o ningún conocimiento sobre inversiones',
  },
  {
    id: '2',
    level: 'Intermedio',
    description: 'Conozco los conceptos básicos pero quiero aprender más',
  },
  {
    id: '3',
    level: 'Avanzado',
    description: 'Tengo experiencia invirtiendo y conozco los mercados',
  },
];

export function InvestmentKnowledgeScreen() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressStep, styles.completedStep]} />
          <View style={[styles.progressStep, styles.activeStep]} />
          <View style={styles.progressStep} />
          <View style={styles.progressStep} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>¿Cuál es tu conocimiento en inversiones?</Text>
        <Text style={styles.subtitle}>Selecciona tu nivel de experiencia</Text>
        
        <View style={styles.levelsContainer}>
          {KNOWLEDGE_LEVELS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.levelCard,
                selectedLevel === item.id && styles.selectedLevelCard
              ]}
              onPress={() => setSelectedLevel(item.id)}
            >
              <View style={styles.radioOuter}>
                {selectedLevel === item.id && <View style={styles.radioInner} />}
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>{item.level}</Text>
                <Text style={styles.levelDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, !selectedLevel && styles.buttonDisabled]}
          disabled={!selectedLevel}
          onPress={() => navigation.navigate('CommunityRecommendations' as never)}
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
  completedStep: {
    backgroundColor: '#4A6CF7',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
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
  levelsContainer: {
    marginBottom: 20,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedLevelCard: {
    backgroundColor: '#F0F4FF',
    borderColor: '#4A6CF7',
    shadowColor: '#4A6CF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A6CF7',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  levelDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
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
