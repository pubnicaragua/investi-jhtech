import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CheckCircle } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type OnboardingCompleteScreenProps = {
  onComplete?: () => void;
};

const { width } = Dimensions.get('window');

export function OnboardingCompleteScreen({ onComplete }: OnboardingCompleteScreenProps) {
  const navigation = useNavigation();
  const route = useRoute();

  // Get onComplete from route params if not passed directly
  const completeOnboarding = onComplete || (route.params as any)?.onComplete;

  const handleGetStarted = () => {
    // Call the onComplete callback if it exists
    if (completeOnboarding) {
      completeOnboarding();
    } else {
      // Fallback navigation if onComplete is not provided
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkmarkContainer}>
          <CheckCircle size={80} color="#4A6CF7" fill="#4A6CF7" />
        </View>
        
        <Text style={styles.title}>¡Listo para empezar!</Text>
        
        <Text style={styles.subtitle}>
          Hemos configurado tu perfil de inversión según tus preferencias. 
          Ahora podrás descubrir oportunidades que se ajusten a tus intereses.
        </Text>
        
        <Image
          source={require('../../assets/images/onboarding-complete.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Comenzar a invertir</Text>
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
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  image: {
    width: width * 0.8,
    height: width * 0.6,
    marginBottom: 40,
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
