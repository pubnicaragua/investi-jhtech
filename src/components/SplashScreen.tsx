import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Video, ResizeMode } from 'expo-av'

const { width, height } = Dimensions.get('window')

interface SplashScreenProps {
  onFinish: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [videoRef, setVideoRef] = useState<Video | null>(null)
  const [hasFinished, setHasFinished] = useState(false)

  useEffect(() => {
    // Auto-finish después de 5 segundos como backup
    const timer = setTimeout(() => {
      if (!hasFinished) {
        setHasFinished(true)
        onFinish()
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [onFinish, hasFinished])

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && status.didJustFinish && !hasFinished) {
      setHasFinished(true)
      // Pequeño delay para que se vea completo
      setTimeout(() => {
        onFinish()
      }, 300)
    }
  }

  return (
    <View style={styles.container}>
      <Video
        ref={(ref) => setVideoRef(ref)}
        source={require('../../assets/gif.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={(error) => {
          console.error('Video error:', error)
          // Si hay error, mostrar por 3 segundos y continuar
          setTimeout(() => {
            if (!hasFinished) {
              setHasFinished(true)
              onFinish()
            }
          }, 3000)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width * 0.7,
    height: height * 0.4,
  },
})
