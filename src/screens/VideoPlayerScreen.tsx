
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
  Alert,
  ActivityIndicator,
  TextInput,
  Linking
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
  BookmarkCheck,
  Send
} from 'lucide-react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useAuthGuard } from '../hooks/useAuthGuard'
import {
  getVideoDetails,
  getVideoProgress,
  updateVideoProgress,
  likeVideo,
  unlikeVideo,
  isVideoLiked,
  bookmarkVideo,
  unbookmarkVideo,
  isVideoBookmarked,
  getNextVideo,
  addVideoComment,
  getVideoComments,
  getCurrentUserId
} from '../api'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface VideoData {
  id: string
  title: string
  description: string
  duration: string | number
  instructor: {
    name: string
    avatar: string
    title: string
  }
  course: {
    name: string
    progress: number
  }
  videoUrl?: string
  video_url?: string
  thumbnail?: string
  thumbnail_url?: string
  likes: number
  like_count?: number
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

  // Estados de API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [courseProgress, setCourseProgress] = useState(0)
  const [showComments, setShowComments] = useState(false)

  // Cargar datos del video al montar el componente
  useEffect(() => {
    const loadVideoData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obtener ID del usuario actual
        const currentUserId = await getCurrentUserId()
        
        // Si no hay usuario autenticado, usar un ID temporal
        const effectiveUserId = currentUserId || 'anonymous-user'
        setUserId(effectiveUserId)

        // Cargar detalles del video
        const videoDetails = await getVideoDetails(videoId)
        
        if (!videoDetails) {
          throw new Error('No se pudo cargar el video')
        }
        
        setVideoData(videoDetails)

        // Solo cargar datos de usuario si está autenticado
        if (currentUserId) {
          // Cargar progreso del video (ignorar errores RLS temporalmente)
          try {
            const progress = await getVideoProgress(currentUserId, videoId)
            setCurrentTime(progress?.progress_seconds || 0)
            setDuration(videoDetails.duration || progress?.total_seconds || 300)
          } catch (err) {
            console.warn('Could not load video progress:', err)
            setDuration(videoDetails.duration || 300)
          }

          // Verificar si el video está liked (ignorar errores RLS temporalmente)
          try {
            const liked = await isVideoLiked(currentUserId, videoId)
            setIsLiked(liked)
          } catch (err) {
            console.warn('Could not check video like status:', err)
          }

          // Verificar si el video está bookmarked (ignorar errores RLS temporalmente)
          try {
            const bookmarked = await isVideoBookmarked(currentUserId, videoId)
            setIsBookmarked(bookmarked)
          } catch (err) {
            console.warn('Could not check video bookmark status:', err)
          }
        } else {
          // Usuario no autenticado - usar valores por defecto
          setDuration(videoDetails.duration || 300)
        }

        // Cargar comentarios
        const videoComments = await getVideoComments(videoId)
        setComments(videoComments)

        // Cargar progreso del curso
        setCourseProgress(videoDetails.course?.progress || 0)

      } catch (err) {
        console.error('Error loading video data:', err)
        setError('Error al cargar los datos del video')
      } finally {
        setLoading(false)
      }
    }

    loadVideoData()
  }, [videoId])

  // Simular progreso del video y actualizar en la API
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && userId) {
      interval = setInterval(async () => {
        setCurrentTime(prev => {
          const newTime = prev + 1
          if (newTime >= duration) {
            setIsPlaying(false)
            // Actualizar progreso cuando se complete el video
            updateVideoProgress(userId, videoId, {
              progress_seconds: duration,
              total_seconds: duration,
              progress_percentage: 100,
              completed: true,
              watch_time_seconds: duration
            })
            return duration
          }
          // Actualizar progreso cada 10 segundos
          if (newTime % 10 === 0) {
            updateVideoProgress(userId, videoId, {
              progress_seconds: newTime,
              total_seconds: duration,
              progress_percentage: Math.round((newTime / duration) * 100),
              completed: false,
              watch_time_seconds: newTime
            })
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration, videoId, userId])

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

  const handleLike = async () => {
    if (!userId || !videoData) return

    try {
      if (isLiked) {
        await unlikeVideo(userId, videoId)
        setIsLiked(false)
        setVideoData(prev => prev ? { ...prev, likes: Math.max(0, prev.likes - 1) } : null)
        Alert.alert('¡Gracias!', 'Has quitado tu like')
      } else {
        await likeVideo(userId, videoId)
        setIsLiked(true)
        setVideoData(prev => prev ? { ...prev, likes: prev.likes + 1 } : null)
        Alert.alert('¡Gracias!', 'Te gusta este video')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      Alert.alert('Error', 'No se pudo actualizar el like')
    }
  }

  const handleBookmark = async () => {
    if (!userId || !videoData) return

    try {
      if (isBookmarked) {
        await unbookmarkVideo(userId, videoId)
        setIsBookmarked(false)
        Alert.alert('Guardado', 'Eliminado de favoritos')
      } else {
        await bookmarkVideo(userId, videoId)
        setIsBookmarked(true)
        Alert.alert('Guardado', 'Agregado a favoritos')
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      Alert.alert('Error', 'No se pudo actualizar el marcador')
    }
  }

  const handleShare = () => {
    Alert.alert('Compartir', 'Función de compartir video')
  }

  const handleDownload = () => {
    Alert.alert('Descargar', 'El video se está descargando para ver offline')
  }

  const progressPercentage = (currentTime / duration) * 100

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando video...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !videoData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Error al cargar el video'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.courseTitle}>{videoData.title}</Text>
          <Text style={styles.progressText}>{courseProgress}% completado</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Video Player - Thumbnail con botón para abrir YouTube */}
      <View style={styles.videoContainer}>
        <Image
          source={{ uri: videoData.thumbnail_url }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        <TouchableOpacity 
          style={styles.playOverlay}
          onPress={() => {
            if (videoData.video_url) {
              Linking.openURL(videoData.video_url)
                .catch(err => {
                  console.error('Error opening video:', err)
                  Alert.alert('Error', 'No se pudo abrir el video')
                })
            } else {
              Alert.alert('Video no disponible', 'Este video aún no está disponible')
            }
          }}
        >
          <View style={styles.playButtonLarge}>
            <Play size={48} color="#fff" fill="#fff" />
          </View>
          <Text style={styles.playText}>Ver video en YouTube</Text>
        </TouchableOpacity>
      </View>

      {/* Video Info */}
      <ScrollView style={styles.contentContainer}>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{videoData.title}</Text>
          
          <View style={styles.videoStats}>
            <Text style={styles.statsText}>{(videoData.like_count || 0).toLocaleString()} likes</Text>
            <Text style={styles.statsText}>{comments.length} comentarios</Text>
            <Text style={styles.statsText}>Duración: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</Text>
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

            <TouchableOpacity onPress={() => setShowComments(!showComments)} style={styles.actionButton}>
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

        {/* Comments Section */}
        {showComments && (
          <View style={styles.commentsCard}>
            <Text style={styles.sectionTitle}>Comentarios ({comments.length})</Text>

            {/* Add Comment Input */}
            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Escribe un comentario..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={async () => {
                  if (!userId || !newComment.trim()) return

                  try {
                    await addVideoComment(userId, videoId, newComment.trim())
                    setNewComment('')
                    // Reload comments
                    const updatedComments = await getVideoComments(videoId)
                    setComments(updatedComments)
                    // Update comment count
                    setVideoData(prev => prev ? { ...prev, comments: prev.comments + 1 } : null)
                    Alert.alert('Comentario agregado', 'Tu comentario ha sido publicado')
                  } catch (error) {
                    console.error('Error adding comment:', error)
                    Alert.alert('Error', 'No se pudo agregar el comentario')
                  }
                }}
                style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                disabled={!newComment.trim()}
              >
                <Send size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            {comments.length > 0 ? (
              <View style={styles.commentsList}>
                {comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Image
                      source={{ uri: comment.userAvatar || 'https://via.placeholder.com/32' }}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>{comment.userName}</Text>
                        <Text style={styles.commentTime}>{comment.createdAt}</Text>
                      </View>
                      <Text style={styles.commentText}>{comment.content}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noCommentsText}>Sé el primero en comentar</Text>
            )}
          </View>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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
  commentsCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 80,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    backgroundColor: '#2673f3',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  commentsList: {
    gap: 16,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  noCommentsText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noVideoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  noVideoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideoText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  playText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
})

export default VideoPlayerScreen
