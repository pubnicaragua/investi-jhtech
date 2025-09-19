import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Image,
  Alert
} from 'react-native'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  MoreVertical,
  ThumbsUp,
  MessageCircle,
  Share2,
  Download,
  Settings,
  SkipBack,
  SkipForward,
  Bookmark,
  BookmarkCheck
} from 'lucide-react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useAuthGuard } from '../hooks/useAuthGuard'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface VideoData {
  id: string
  title: string
  description: string
  duration: string
  instructor: {
    name: string
    avatar: string
    title: string
  }
  course: {
    name: string
    progress: number
  }
  videoUrl: string
  thumbnail: string
  likes: number
  comments: number
  isLiked: boolean
  isBookmarked: boolean
  nextVideo?: {
    id: string
    title: string
    thumbnail: string
  }
}

interface VideoPlayerScreenProps {
  route?: {
    params?: {
      videoId?: string
    }
  }
}

export function VideoPlayerScreen({ route }: VideoPlayerScreenProps) {
  const navigation = useNavigation()
  const videoId = route?.params?.videoId || '1'
  
  useAuthGuard()

  // Estados del reproductor
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(300) // 5 minutos por defecto
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Datos del video (mock data profesional)
  const [videoData] = useState<VideoData>({
    id: videoId,
    title: 'Fundamentos de Inversión en Bolsa de Valores',
    description: 'En este video aprenderás los conceptos básicos para invertir en la bolsa de valores, incluyendo análisis técnico, fundamental y gestión de riesgo. Perfecto para principiantes que quieren dar sus primeros pasos en el mundo de las inversiones.',
    duration: '15:42',
    instructor: {
      name: 'Dr. Carlos Mendoza',
      avatar: 'https://i.pravatar.cc/100?img=3',
      title: 'Especialista en Mercados Financieros'
    },
    course: {
      name: 'Inversión para Principiantes',
      progress: 65
    },
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    likes: 1247,
    comments: 89,
    isLiked: false,
    isBookmarked: false,
    nextVideo: {
      id: '2',
      title: 'Análisis Técnico: Patrones de Velas',
      thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=225&fit=crop'
    }
  })

  // Simular progreso del video
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false)
            return duration
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  // Ocultar controles automáticamente
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (showControls && isPlaying) {
      timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => clearTimeout(timeout)
  }, [showControls, isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    setShowControls(true)
  }

  const handleSeek = (direction: 'forward' | 'backward') => {
    const newTime = direction === 'forward' 
      ? Math.min(currentTime + 10, duration)
      : Math.max(currentTime - 10, 0)
    setCurrentTime(newTime)
    setShowControls(true)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    Alert.alert('¡Gracias!', isLiked ? 'Has quitado tu like' : 'Te gusta este video')
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    Alert.alert('Guardado', isBookmarked ? 'Eliminado de favoritos' : 'Agregado a favoritos')
  }

  const handleShare = () => {
    Alert.alert('Compartir', 'Función de compartir video')
  }

  const handleDownload = () => {
    Alert.alert('Descargar', 'El video se está descargando para ver offline')
  }

  const progressPercentage = (currentTime / duration) * 100

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.courseTitle}>{videoData.course.name}</Text>
          <Text style={styles.progressText}>{videoData.course.progress}% completado</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <TouchableOpacity 
        style={styles.videoContainer}
        onPress={() => setShowControls(!showControls)}
        activeOpacity={1}
      >
        <Image 
          source={{ uri: videoData.thumbnail }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        
        {/* Video Overlay */}
        <View style={styles.videoOverlay}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>

          {/* Controls */}
          {showControls && (
            <View style={styles.controlsContainer}>
              <TouchableOpacity onPress={() => handleSeek('backward')} style={styles.controlButton}>
                <SkipBack size={32} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
                {isPlaying ? (
                  <Pause size={48} color="#fff" />
                ) : (
                  <Play size={48} color="#fff" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleSeek('forward')} style={styles.controlButton}>
                <SkipForward size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Top Controls */}
          {showControls && (
            <View style={styles.topControls}>
              <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.volumeButton}>
                {isMuted ? (
                  <VolumeX size={24} color="#fff" />
                ) : (
                  <Volume2 size={24} color="#fff" />
                )}
              </TouchableOpacity>
              
              <View style={styles.speedContainer}>
                <TouchableOpacity 
                  onPress={() => setPlaybackSpeed(playbackSpeed === 1.0 ? 1.5 : playbackSpeed === 1.5 ? 2.0 : 1.0)}
                  style={styles.speedButton}
                >
                  <Text style={styles.speedText}>{playbackSpeed}x</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => setIsFullscreen(!isFullscreen)} style={styles.fullscreenButton}>
                <Maximize size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Video Info */}
      <ScrollView style={styles.contentContainer}>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{videoData.title}</Text>
          
          <View style={styles.videoStats}>
            <Text style={styles.statsText}>{videoData.likes.toLocaleString()} likes</Text>
            <Text style={styles.statsText}>{videoData.comments} comentarios</Text>
            <Text style={styles.statsText}>Duración: {videoData.duration}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={handleLike}
              style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            >
              <ThumbsUp size={20} color={isLiked ? "#2673f3" : "#666"} />
              <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                Me gusta
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Alert.alert('Comentarios', 'Función de comentarios')} style={styles.actionButton}>
              <MessageCircle size={20} color="#666" />
              <Text style={styles.actionText}>Comentar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Share2 size={20} color="#666" />
              <Text style={styles.actionText}>Compartir</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleBookmark}
              style={[styles.actionButton, isBookmarked && styles.actionButtonActive]}
            >
              {isBookmarked ? (
                <BookmarkCheck size={20} color="#2673f3" />
              ) : (
                <Bookmark size={20} color="#666" />
              )}
              <Text style={[styles.actionText, isBookmarked && styles.actionTextActive]}>
                Guardar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDownload} style={styles.actionButton}>
              <Download size={20} color="#666" />
              <Text style={styles.actionText}>Descargar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructor Info */}
        <View style={styles.instructorCard}>
          <Image 
            source={{ uri: videoData.instructor.avatar }}
            style={styles.instructorAvatar}
          />
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorName}>{videoData.instructor.name}</Text>
            <Text style={styles.instructorTitle}>{videoData.instructor.title}</Text>
          </View>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Seguir</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{videoData.description}</Text>
        </View>

        {/* Next Video */}
        {videoData.nextVideo && (
          <View style={styles.nextVideoCard}>
            <Text style={styles.sectionTitle}>Siguiente video</Text>
            <TouchableOpacity 
              style={styles.nextVideoItem}
              onPress={() => {
                // @ts-ignore - Navigation typing issue
                navigation.navigate('VideoPlayer', { videoId: videoData.nextVideo!.id })
              }}
            >
              <Image 
                source={{ uri: videoData.nextVideo.thumbnail }}
                style={styles.nextVideoThumbnail}
              />
              <View style={styles.nextVideoInfo}>
                <Text style={styles.nextVideoTitle}>{videoData.nextVideo.title}</Text>
                <View style={styles.nextVideoMeta}>
                  <Play size={12} color="#666" />
                  <Text style={styles.nextVideoDuration}>12:30</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  courseTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  videoContainer: {
    width: screenWidth,
    height: screenWidth * 9 / 16, // Aspect ratio 16:9
    position: 'relative',
    backgroundColor: '#000',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2673f3',
    borderRadius: 2,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 40,
    padding: 16,
  },
  topControls: {
    position: 'absolute',
    top: 20,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  volumeButton: {
    padding: 8,
  },
  speedContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  speedButton: {
    alignItems: 'center',
  },
  speedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  fullscreenButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  videoInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    lineHeight: 24,
  },
  videoStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 13,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  actionButtonActive: {
    backgroundColor: '#f0f7ff',
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#2673f3',
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  instructorTitle: {
    fontSize: 13,
    color: '#666',
  },
  followButton: {
    backgroundColor: '#2673f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  descriptionCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  nextVideoCard: {
    padding: 16,
    backgroundColor: '#fff',
  },
  nextVideoItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  nextVideoThumbnail: {
    width: 120,
    height: 68,
    borderRadius: 8,
    marginRight: 12,
  },
  nextVideoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nextVideoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
    lineHeight: 18,
  },
  nextVideoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextVideoDuration: {
    fontSize: 12,
    color: '#666',
  },
})

export default VideoPlayerScreen
