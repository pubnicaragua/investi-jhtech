import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native'
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

interface InvestiVideoPlayerProps {
  uri: string
  style?: any
}

export function InvestiVideoPlayer({ uri, style }: InvestiVideoPlayerProps) {
  const videoRef = useRef<Video>(null)
  const [status, setStatus] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [hasError, setHasError] = useState(false)
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current)
      }
    }
  }, [])

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync()
      } else {
        await videoRef.current.playAsync()
        startHideControlsTimer()
      }
    }
  }

  const handleMuteToggle = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  const handleVideoPress = () => {
    setShowControls(true)
    startHideControlsTimer()
  }

  const startHideControlsTimer = () => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current)
    }
    hideControlsTimer.current = setTimeout(() => {
      if (status.isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    if (playbackStatus.isLoaded) {
      setStatus(playbackStatus)
      setIsLoading(false)
      setHasError(false)
    } else if ('error' in playbackStatus) {
      console.error('Video playback error:', playbackStatus.error)
      setIsLoading(false)
      setHasError(true)
    }
  }

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={handleVideoPress}
        style={styles.videoContainer}
      >
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay={false}
          isMuted={isMuted}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          onLoadStart={() => {
            console.log('Video loading started:', uri)
            setIsLoading(true)
            setHasError(false)
          }}
          onLoad={() => {
            console.log('Video loaded successfully')
            setIsLoading(false)
          }}
          onError={(error) => {
            console.error('Video error:', error)
            setHasError(true)
            setIsLoading(false)
          }}
          useNativeControls={hasError}
        />

        {/* Investi Watermark - Siempre visible */}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent']}
          style={styles.watermarkContainer}
        >
          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>investi</Text>
            <View style={styles.watermarkDot} />
          </View>
        </LinearGradient>

        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Cargando video...</Text>
          </View>
        )}

        {/* Error Message */}
        {hasError && !isLoading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>No se pudo cargar el video</Text>
            <Text style={styles.errorSubtext}>Verifica tu conexión</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && !isLoading && (
          <>
            {/* Center Play/Pause */}
            <TouchableOpacity 
              style={styles.centerPlayButton}
              onPress={handlePlayPause}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.95)', 'rgba(37, 99, 235, 0.95)']}
                style={styles.centerPlayGradient}
              >
                {status.isPlaying ? (
                  <Pause size={40} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Play size={40} color="#FFFFFF" fill="#FFFFFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Bottom Controls */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.bottomControls}
            >
              <View style={styles.controlsRow}>
                {/* Play/Pause Button */}
                <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
                  {status.isPlaying ? (
                    <Pause size={24} color="#FFFFFF" />
                  ) : (
                    <Play size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                {/* Time Display */}
                <Text style={styles.timeText}>
                  {status.positionMillis ? formatTime(status.positionMillis) : '0:00'} / {status.durationMillis ? formatTime(status.durationMillis) : '0:00'}
                </Text>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* Mute Button */}
                <TouchableOpacity onPress={handleMuteToggle} style={styles.controlButton}>
                  {isMuted ? (
                    <VolumeX size={24} color="#FFFFFF" />
                  ) : (
                    <Volume2 size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          status.durationMillis
                            ? (status.positionMillis / status.durationMillis) * 100
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </LinearGradient>
          </>
        )}
      </TouchableOpacity>

      {/* Powered by Investi Badge */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.brandBadge}
      >
        <Text style={styles.brandBadgeText}>Creado con Investi</Text>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  watermark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  watermarkText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: -0.5,
  },
  watermarkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -50,
    marginLeft: -50,
    zIndex: 10,
  },
  centerPlayGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlButton: {
    padding: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  brandBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  brandBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
})
