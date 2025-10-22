import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Video, ResizeMode } from 'expo-av'

const { width, height } = Dimensions.get('window')

interface SplashScreenProps {
  onFinish: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [videoRef, setVideoRef] = useState<Video | null>(null)

  useEffect(() => {
    // Auto-finish después de 6 segundos como backup
    const timer = setTimeout(() => {
      onFinish()
    }, 6000)

    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <View style={styles.container}>
      <Video
        ref={(ref) => setVideoRef(ref)}
        source={require('../../assets/gif.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.didJustFinish) {
            onFinish()
          }
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
