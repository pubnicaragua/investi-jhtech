import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native'
import { Video, ResizeMode } from 'expo-av'

const { width, height } = Dimensions.get('window')

interface SplashScreenProps {
  onFinish: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [videoRef, setVideoRef] = useState<Video | null>(null)
  const [hasFinished, setHasFinished] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const fadeAnim = useState(new Animated.Value(0))[0]

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()

    // Auto-finish después de 5 segundos
    const timer = setTimeout(() => {
      if (!hasFinished) {
        setHasFinished(true)
        // Fade out antes de terminar
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onFinish()
        })
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [onFinish, hasFinished, fadeAnim])

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && !videoLoaded) {
      setVideoLoaded(true)
    }
    if (status.isLoaded && status.didJustFinish && !hasFinished) {
      setHasFinished(true)
      // Fade out y terminar
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onFinish()
      })
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.videoContainer, { opacity: fadeAnim }]}>
        <Video
          ref={(ref) => setVideoRef(ref)}
          source={require('../../assets/gif.mp4')}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onLoad={() => setVideoLoaded(true)}
          onError={(error) => {
            console.error('Video error:', error)
            // Si hay error, terminar después de 2 segundos
            setTimeout(() => {
              if (!hasFinished) {
                setHasFinished(true)
                onFinish()
              }
            }, 2000)
          }}
        />
      </Animated.View>
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
  videoContainer: {
    width: width * 0.7,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
})
