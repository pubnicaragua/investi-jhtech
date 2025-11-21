import React, { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native'

interface OAuthLoadingScreenProps {
  provider: 'google' | 'facebook' | 'linkedin'
}

export default function OAuthLoadingScreen({ provider }: OAuthLoadingScreenProps) {
  const [dots, setDots] = useState('')
  const fadeAnim = new Animated.Value(0)

  useEffect(() => {
    // Animación de fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    // Animación de puntos
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const getProviderName = () => {
    switch (provider) {
      case 'google': return 'Google'
      case 'facebook': return 'Facebook'
      case 'linkedin': return 'LinkedIn'
      default: return 'el proveedor'
    }
  }

  const getProviderColor = () => {
    switch (provider) {
      case 'google': return '#4285F4'
      case 'facebook': return '#1877F2'
      case 'linkedin': return '#0A66C2'
      default: return '#2673f3'
    }
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ActivityIndicator size="large" color={getProviderColor()} />
      <Text style={styles.title}>
        Conectando con {getProviderName()}{dots}
      </Text>
      <Text style={styles.subtitle}>
        Esto puede tardar unos segundos
      </Text>
      <Text style={styles.hint}>
        Por favor, no cierres la aplicación
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
