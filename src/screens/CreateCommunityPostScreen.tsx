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
      await createCommunityPost({
        community_id: communityId,
        user_id: currentUser.id,
        contenido: content.trim(),
        media_url: uploadedMediaUrls,
      })

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
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear publicación</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.submitButtonText, !canSubmit && styles.submitButtonTextDisabled]}>
              Publicar
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Content Input */}
        <View style={styles.contentSection}>
          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            placeholder="¿Qué quieres compartir?"
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={MAX_CONTENT_LENGTH}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {content.length}/{MAX_CONTENT_LENGTH}
          </Text>
        </View>

        {/* Media Preview */}
        {mediaItems.length > 0 && (
          <View style={styles.mediaSection}>
            <MediaPreview
              items={mediaItems}
              onRemove={handleRemoveMedia}
            />
          </View>
        )}

        {/* Poll Editor */}
        <PollEditor
          visible={showPollEditor}
          onClose={handlePollClose}
          onSave={handlePollSave}
          initialData={pollData || undefined}
        />

        {/* Celebration Selector */}
        {celebrationType && (
          <View style={styles.celebrationSection}>
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
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPress={handlePickImage}
              style={styles.actionButton}
            >
              <ImageIcon size={20} color="#666" />
              <Text style={styles.actionButtonText}>Imagen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePickVideo}
              style={styles.actionButton}
            >
              <VideoIcon size={20} color="#666" />
              <Text style={styles.actionButtonText}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPollEditor(true)}
              style={styles.actionButton}
            >
              <BarChart3 size={20} color="#666" />
              <Text style={styles.actionButtonText}>Encuesta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleCelebrationSelect(celebrationType ? null : 'milestone')}
              style={styles.actionButton}
            >
              <Star size={20} color={celebrationType ? "#FFD700" : "#666"} />
              <Text style={styles.actionButtonText}>Celebrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  scrollView: {
    flex: 1,
  },
  contentSection: {
    padding: 16,
  },
  contentInput: {
    minHeight: 120,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    padding: 0,
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  mediaSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  pollSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  celebrationSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  celebrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  celebrationText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    minWidth: 70,
  },
  actionButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
})
