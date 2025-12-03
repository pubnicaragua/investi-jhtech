import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Dimensions, Animated } from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { Asset } from 'expo-asset'

const { width, height } = Dimensions.get('window')

interface SplashScreenProps {
  onFinish: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [videoRef, setVideoRef] = useState<Video | null>(null)
  const [hasFinished, setHasFinished] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoUri, setVideoUri] = useState<string | null>(null)
  const fadeAnim = useState(new Animated.Value(0))[0]

  // Precargar el asset del video para producción
  useEffect(() => {
    const loadVideoAsset = async () => {
      try {
        console.log('📦 [SplashScreen] Precargando video asset...');
        const asset = Asset.fromModule(require('../../assets/gif.mp4'));
        await asset.downloadAsync();
        console.log('✅ [SplashScreen] Video asset precargado:', asset.localUri);
        setVideoUri(asset.localUri || asset.uri);
      } catch (error) {
        console.error('❌ [SplashScreen] Error precargando video:', error);
        // Si falla la carga, usar require directo como fallback
        setVideoUri('fallback');
      }
    };

    loadVideoAsset();
  }, []);

  useEffect(() => {
    console.log('🎬 [SplashScreen] Iniciando...');
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      console.log('✅ [SplashScreen] Fade in completado');
    })

    // Auto-finish después de 5 segundos
    const timer = setTimeout(() => {
      if (!hasFinished) {
        console.log('⏱️ [SplashScreen] Timeout alcanzado, finalizando...');
        setHasFinished(true)
        // Fade out antes de terminar
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          console.log('✅ [SplashScreen] Fade out completado, llamando onFinish');
          onFinish()
        })
      }
    }, 5000)

    return () => {
      console.log('🧹 [SplashScreen] Cleanup');
      clearTimeout(timer)
    }
  }, [onFinish, hasFinished, fadeAnim])

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && !videoLoaded) {
      console.log('🎥 [SplashScreen] Video cargado');
      setVideoLoaded(true)
    }
    if (status.isLoaded && status.didJustFinish && !hasFinished) {
      console.log('🎬 [SplashScreen] Video terminó, finalizando...');
      setHasFinished(true)
      // Fade out y terminar
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        console.log('✅ [SplashScreen] Video terminado, llamando onFinish');
        onFinish()
      })
    }
  }

  // No renderizar hasta que el video esté listo
  if (!videoUri) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.videoContainer, { opacity: fadeAnim }]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.videoContainer, { opacity: fadeAnim }]}>
        <Video
          ref={(ref) => setVideoRef(ref)}
          source={videoUri === 'fallback' ? require('../../assets/gif.mp4') : { uri: videoUri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onLoad={() => {
            console.log('✅ [SplashScreen] Video onLoad callback');
            setVideoLoaded(true)
          }}
          onError={(error) => {
            console.error('❌ [SplashScreen] Video error:', error)
            // Si hay error, terminar después de 2 segundos
            setTimeout(() => {
              if (!hasFinished) {
                console.log('⚠️ [SplashScreen] Error en video, finalizando...');
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
