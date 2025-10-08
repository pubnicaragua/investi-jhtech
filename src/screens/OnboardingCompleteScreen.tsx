import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CheckCircle, TrendingUp, Target, Award, User, BookOpen, Users } from 'lucide-react-native';
import { getCurrentUser } from '../rest/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type OnboardingCompleteScreenProps = {
  onComplete?: () => void;
};

interface UserData {
  id: string;
  name: string;
  photo_url?: string;
  avatar_url?: string;
  nivel_finanzas?: string;
  intereses?: string[];
  metas?: string[];
}

const { width } = Dimensions.get('window');

export function OnboardingCompleteScreen({ onComplete }: OnboardingCompleteScreenProps) {
  const navigation = useNavigation();
  const route = useRoute();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get onComplete from route params if not passed directly
  const completeOnboarding = onComplete || (route.params as any)?.onComplete;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserData(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    // Call the onComplete callback if it exists
    if (completeOnboarding) {
      completeOnboarding();
    } else {
      // Navigate to HomeFeed
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeFeed' as never }],
      });
    }
  };

  const getKnowledgeLevelText = (level?: string) => {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return 'No especificado';
    }
  };

  const getGoalText = (goal: string) => {
    const goalMap: { [key: string]: string } = {
      'save_money': 'Ahorrar dinero',
      'invest_stocks': 'Invertir en acciones',
      'learn_investing': 'Aprender sobre inversiones',
      'build_portfolio': 'Construir un portafolio',
      'retirement': 'Planificar jubilación',
      'passive_income': 'Generar ingresos pasivos'
    };
    return goalMap[goal] || goal;
  };

  const getInterestText = (interest: string) => {
    const interestMap: { [key: string]: string } = {
      'stocks': 'Acciones',
      'crypto': 'Criptomonedas',
      'real_estate': 'Bienes raíces',
      'bonds': 'Bonos',
      'etfs': 'ETFs',
      'forex': 'Forex',
      'commodities': 'Materias primas',
      'dividends': 'Dividendos'
    };
    return interestMap[interest] || interest;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6CF7" />
        <Text style={styles.loadingText}>Cargando tu perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <View style={styles.checkmarkContainer}>
          <CheckCircle size={80} color="#4A6CF7" fill="#4A6CF7" />
        </View>

        <Text style={styles.title}>¡Perfil completado!</Text>

        <Text style={styles.subtitle}>
          Hemos configurado tu perfil de inversión según tus preferencias.
          Aquí tienes un resumen de lo que configuraste:
        </Text>

        {/* User Avatar */}
        {userData && (userData.photo_url || userData.avatar_url) && (
          <View style={styles.avatarSection}>
            <Image
              source={{ uri: userData.photo_url || userData.avatar_url }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <Text style={styles.avatarLabel}>Tu avatar</Text>
          </View>
        )}

        {/* Knowledge Level */}
        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <BookOpen size={24} color="#4A6CF7" />
            <Text style={styles.sectionTitle}>Nivel de conocimiento</Text>
          </View>
          <Text style={styles.sectionValue}>
            {getKnowledgeLevelText(userData?.nivel_finanzas)}
          </Text>
        </View>

        {/* Interests */}
        {userData?.intereses && userData.intereses.length > 0 && (
          <View style={styles.summarySection}>
            <View style={styles.sectionHeader}>
              <Users size={24} color="#4A6CF7" />
              <Text style={styles.sectionTitle}>Intereses de inversión</Text>
            </View>
            <View style={styles.tagsContainer}>
              {userData.intereses.map((interest, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{getInterestText(interest)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Goals */}
        {userData?.metas && userData.metas.length > 0 && (
          <View style={styles.summarySection}>
            <View style={styles.sectionHeader}>
              <Target size={24} color="#4A6CF7" />
              <Text style={styles.sectionTitle}>Metas de inversión</Text>
            </View>
            <View style={styles.tagsContainer}>
              {userData.metas.map((goal, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{getGoalText(goal)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.illustrationContainer}>
          <View style={styles.iconRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E8' }]}>
              <Target size={32} color="#22C55E" />
            </View>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <TrendingUp size={32} color="#2673f3" />
            </View>
          </View>
          <View style={styles.iconRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Award size={32} color="#F59E0B" />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Comenzar a invertir</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    paddingTop: 80,
  },
  checkmarkContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  avatarLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  summarySection: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
    fontFamily: 'Inter-SemiBold',
  },
  sectionValue: {
    fontSize: 16,
    color: '#4A6CF7',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    marginLeft: 36,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 36,
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 20,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 120,
    marginTop: 20,
  },
  footer: {
    padding: 24,
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});
