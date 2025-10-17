import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  InteractionManager,
  Keyboard,
  Platform,
  Image as RNImage,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useRoute } from '@react-navigation/native'
import {
  ArrowLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  Star,
  BarChart3,
  Scroll,
} from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'

import { useAuthGuard } from '../hooks/useAuthGuard'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabase'
import {
  getCurrentUser,
  uploadMedia,
  saveDraft,
  loadDraft,
  clearDraft,
} from '../rest/api'
import {
  createCommunityPost
} from '../rest/communityPosts'
import { MediaPreview } from '../components/media/MediaPreview'
import { PollEditor } from '../components/poll/PollEditor'
import { MediaItem } from '../components/media/MediaPreview'
import { PollData } from '../components/poll/PollEditor'

type CelebrationType = 'milestone' | 'achievement' | 'success' | 'investment_win' | 'other'

const MAX_CONTENT_LENGTH = 2000
const AUTOSAVE_INTERVAL = 2000

export function CreateCommunityPostScreen({ navigation }: any) {
  const { t } = useTranslation()
  const route = useRoute()
  const { communityId } = route.params as { communityId: string }

  // Auth
  useAuthGuard()
  const { user } = useAuth()
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Content
  const [content, setContent] = useState('')

  // Media
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])

  // Poll
  const [pollData, setPollData] = useState<PollData | null>(null)

  // Celebration
  const [celebrationType, setCelebrationType] = useState<CelebrationType | null>(null)

  // UI State
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [showPollEditor, setShowPollEditor] = useState(false)

  // Refs
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentInputRef = useRef<TextInput>(null)

  // ===== INITIALIZATION =====

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      initializeScreen()
    })

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [])

  const initializeScreen = async () => {
    try {
      setLoadingData(true)

      // Load user
      const user = await getCurrentUser()
      if (!user) {
        Alert.alert('Error', 'No se pudo cargar el usuario')
        navigation.goBack()
        return
      }
      setCurrentUser(user)

      // Load draft
      const draft = await loadDraft()
      if (draft) {
        Alert.alert(
          'Borrador encontrado',
          '¿Deseas restaurar el borrador guardado?',
          [
            {
              text: 'No',
              onPress: () => clearDraft(),
              style: 'cancel',
            },
            {
              text: 'Sí',
              onPress: () => restoreDraft(draft),
            },
          ]
        )
      }
    } catch (error) {
      console.error('Error initializing screen:', error)
      Alert.alert('Error', 'No se pudo inicializar la pantalla')
    } finally {
      setLoadingData(false)
    }
  }

  const restoreDraft = (draft: any) => {
    if (draft.content) setContent(draft.content)
    if (draft.media) setMediaItems(draft.media)
    if (draft.poll) setPollData(draft.poll)
    if (draft.celebration) setCelebrationType(draft.celebration)
  }

  // ===== AUTOSAVE =====

  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }

    if (content || mediaItems.length > 0 || pollData || celebrationType) {
      autosaveTimerRef.current = setTimeout(() => {
        handleAutosave()
      }, AUTOSAVE_INTERVAL)
    }
  }, [content, mediaItems, pollData, celebrationType])

  const handleAutosave = useCallback(async () => {
    try {
      await saveDraft({
        content,
        media: mediaItems,
        poll: pollData,
        celebration: celebrationType,
      })
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }, [content, mediaItems, pollData, celebrationType])

  // ===== MEDIA HANDLING =====

  const handlePickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (permissionResult.granted === false) {
        Alert.alert('Permiso requerido', 'Necesitas permisos para acceder a la galería')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        const mediaItem: MediaItem = {
          id: Date.now().toString(),
          type: 'image',
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        }
        setMediaItems(prev => [...prev, mediaItem])
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'No se pudo seleccionar la imagen')
    }
  }, [])

  const handlePickVideo = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (permissionResult.granted === false) {
        Alert.alert('Permiso requerido', 'Necesitas permisos para acceder a la galería')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        const mediaItem: MediaItem = {
          id: Date.now().toString(),
          type: 'video',
          uri: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          mimeType: asset.mimeType || 'video/mp4',
        }
        setMediaItems(prev => [...prev, mediaItem])
      }
    } catch (error) {
      console.error('Error picking video:', error)
      Alert.alert('Error', 'No se pudo seleccionar el video')
    }
  }, [])

  const handleRemoveMedia = useCallback((mediaId: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== mediaId))
  }, [])

  // ===== POLL HANDLING =====

  const handlePollSave = useCallback((data: PollData) => {
    setPollData(data)
    setShowPollEditor(false)
  }, [])

  const handlePollClose = useCallback(() => {
    setShowPollEditor(false)
  }, [])

  // ===== CELEBRATION HANDLING =====

  const handleCelebrationSelect = useCallback((type: CelebrationType | null) => {
    setCelebrationType(type)
  }, [])

  // ===== SUBMIT HANDLING =====

  const handleSubmit = useCallback(async () => {
    if (!content.trim() && mediaItems.length === 0 && !pollData) {
      Alert.alert('Error', 'Debes agregar contenido, media o una encuesta')
      return
    }

    if (!currentUser) {
      Alert.alert('Error', 'Usuario no encontrado')
      return
    }

    try {
      setLoading(true)

      // Upload media if any
      let uploadedMediaUrls: string[] = []
      if (mediaItems.length > 0) {
        const uploadResults = await Promise.all(
          mediaItems.map(async (item) => {
            return await uploadMedia(item.uri, item.type, currentUser.id)
          })
        )
        uploadedMediaUrls = uploadResults.map(result => result.url)
      }

      // Create post
      const newPost = await createCommunityPost({
        community_id: communityId,
        user_id: currentUser.id,
        contenido: content.trim(),
        media_url: uploadedMediaUrls,
      })
      
      // Notify success
      Alert.alert('¡Éxito!', 'Tu publicación se ha creado correctamente.')

      // Clear draft
      await clearDraft()

      // Navigate back
      navigation.goBack()
    } catch (error) {
      console.error('Error creating post:', error)
      Alert.alert('Error', 'No se pudo crear la publicación')
    } finally {
      setLoading(false)
    }
  }, [content, mediaItems, pollData, celebrationType, currentUser, communityId, navigation])

  // ===== RENDER =====

  const canSubmit = useMemo(() => {
    return (content.trim().length > 0 || mediaItems.length > 0 || pollData !== null) && !loading
  }, [content, mediaItems, pollData, loading])

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear publicación</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[styles.publishButton, !canSubmit && styles.publishButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.publishButtonText}>
              Publicar
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.contentWrapper}>
            {/* User Info Section */}
            {currentUser && (
            <View style={styles.userContainer}>
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                {currentUser.avatar_url ? (
                  <RNImage 
                    source={{ uri: currentUser.avatar_url }} 
                    style={styles.avatar}
                  />
                ) : (
                  <Text style={styles.avatarInitials}>
                    {currentUser.nombre?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{currentUser.nombre || 'Usuario'}</Text>
                <View style={styles.audienceChip}>
                  <Text style={styles.audienceText}>Publicación en comunidad</Text>
                </View>
              </View>
            </View>
          )}

          {/* Media Preview - Ahora va primero */}
          {mediaItems.length > 0 && (
            <View style={styles.mediaSection}>
              <MediaPreview
                items={mediaItems}
                onRemove={handleRemoveMedia}
              />
            </View>
          )}

          {/* Content Editor - Ahora va después del media */}
          <View style={styles.editorContainer}>
            <TextInput
              ref={contentInputRef}
              style={[
                styles.textInput,
                mediaItems.length > 0 && styles.textInputWithMedia
              ]}
              placeholder={mediaItems.length > 0 ? "Escribe un pie de foto..." : "¿Qué quieres compartir con la comunidad?"}
              multiline
              value={content}
              onChangeText={setContent}
              maxLength={MAX_CONTENT_LENGTH}
              textAlignVertical="top"
            />
            {/* Character Counter - Movido dentro del editor container */}
            <Text style={[styles.charCounter, content.length >= MAX_CONTENT_LENGTH ? styles.charCounterLimit : null]}>
              {content.length}/{MAX_CONTENT_LENGTH}
            </Text>
          </View>

          {/* Poll Editor */}
          <PollEditor
            visible={showPollEditor}
            onClose={handlePollClose}
            onSave={handlePollSave}
            initialData={pollData || undefined}
          />

          {/* Celebration Badge */}
          {celebrationType && (
            <View style={styles.celebrationBadge}>
              <Star size={16} color="#FFD700" />
              <Text style={styles.celebrationText}>
                {celebrationType === 'milestone' && 'Hito alcanzado'}
                {celebrationType === 'achievement' && 'Logro importante'}
                {celebrationType === 'success' && 'Éxito logrado'}
                {celebrationType === 'investment_win' && 'Victoria de inversión'}
                {celebrationType === 'other' && 'Celebración especial'}
              </Text>
            </View>
          )}
        </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.actionButton}
          >
            <ImageIcon size={24} color="#374151" />
            <Text style={styles.actionButtonText}>Imagen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickVideo}
            style={styles.actionButton}
          >
            <VideoIcon size={24} color="#374151" />
            <Text style={styles.actionButtonText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowPollEditor(true)}
            style={styles.actionButton}
          >
            <BarChart3 size={24} color="#374151" />
            <Text style={styles.actionButtonText}>Encuesta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCelebrationSelect(celebrationType ? null : 'milestone')}
            style={styles.actionButton}
          >
            <Star size={24} color={celebrationType ? "#FFD700" : "#374151"} />
            <Text style={styles.actionButtonText}>Celebrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentWrapper: {
    padding: 16,
    paddingBottom: 80, // Add extra padding for bottom bar
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  userContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  audienceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  audienceText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 6,
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  publishButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editorContainer: {
    flex: 1,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  textInput: {
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
    maxHeight: 300,
    textAlignVertical: 'top',
    padding: 16,
    paddingTop: 12,
    lineHeight: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    margin: 8,
  },
  charCounter: {
    fontSize: 12,
    textAlign: 'right',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  charCounterLimit: {
    color: '#EF4444',
  },
  dividerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
  },
  contentInput: {
    fontSize: 18,
    color: '#111827',
    minHeight: 180,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  mediaSection: {
    backgroundColor: '#FFFFFF',
    overflow: 'visible',
    padding: 16,
    minHeight: 150, // Ensure enough space for the preview
  },
  textInputWithMedia: {
    minHeight: 320,
    maxHeight: 2000,
    fontSize: 15,
    marginTop: 2,
  },
  pollSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
    padding: 12,
  },
  celebrationSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
    padding: 12,
  },
  celebrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#92400E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  celebrationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  actionsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
