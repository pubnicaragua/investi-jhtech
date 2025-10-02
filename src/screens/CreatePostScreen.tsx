import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
  Image as RNImage,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  Star,
  BarChart3,
  Globe,
  ChevronDown,
  FileText,
} from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'

import { useAuthGuard } from '../hooks/useAuthGuard'
import {
  getCurrentUser,
  uploadMedia,
  listCommunitiesPaged,
  createPostFull,
  saveDraft,
  loadDraft,
  clearDraft,
} from '../rest/api'
import { AudiencePicker, AudienceOption } from '../components/pickers/AudiencePicker'
import { MediaPreview, MediaItem } from '../components/media/MediaPreview'
import { PollEditor, PollData } from '../components/poll/PollEditor'

type CelebrationType = 'milestone' | 'achievement' | 'success' | 'investment_win' | 'other'

interface PartnershipData {
  businessType: string
  investmentAmount: string
  location: string
}

const MAX_CONTENT_LENGTH = 2000
const AUTOSAVE_INTERVAL = 2000 // 2 seconds

export function CreatePostScreen({ navigation }: any) {
  const { t } = useTranslation()
  
  // Auth
  useAuthGuard()
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // Content
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState<AudienceOption>({
    id: 'profile',
    name: 'Mi Perfil',
    type: 'profile',
  })
  
  // Media
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  
  // Poll
  const [pollData, setPollData] = useState<PollData | null>(null)
  
  // Celebration
  const [celebrationType, setCelebrationType] = useState<CelebrationType | null>(null)
  
  // Partnership
  const [partnershipData, setPartnershipData] = useState<PartnershipData | null>(null)
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [showAudiencePicker, setShowAudiencePicker] = useState(false)
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
    if (draft.audience) setAudience(draft.audience)
    if (draft.media) setMediaItems(draft.media)
    if (draft.poll) setPollData(draft.poll)
    if (draft.celebration) setCelebrationType(draft.celebration)
    if (draft.partnership) setPartnershipData(draft.partnership)
  }
  
  // ===== AUTOSAVE =====
  
  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }
    
    if (content || mediaItems.length > 0 || pollData || celebrationType || partnershipData) {
      autosaveTimerRef.current = setTimeout(() => {
        handleAutosave()
      }, AUTOSAVE_INTERVAL)
    }
  }, [content, mediaItems, pollData, celebrationType, partnershipData, audience])
  
  const handleAutosave = useCallback(async () => {
    try {
      await saveDraft({
        content,
        audience,
        media: mediaItems,
        poll: pollData,
        celebration: celebrationType,
        partnership: partnershipData,
      })
    } catch (error) {
      console.error('Error autosaving:', error)
    }
  }, [content, audience, mediaItems, pollData, celebrationType, partnershipData])
  
  // ===== MEDIA HANDLING =====
  
  const handleAddPhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería para agregar fotos')
        return
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      })
      
      if (!result.canceled) {
        const newItems: MediaItem[] = result.assets.map((asset) => ({
          id: `${Date.now()}_${Math.random()}`,
          uri: asset.uri,
          type: 'image',
          mimeType: asset.mimeType,
          size: asset.fileSize,
        }))
        setMediaItems((prev) => [...prev, ...newItems])
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'No se pudo seleccionar la imagen')
    }
  }, [])
  
  const handleAddVideo = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu galería para agregar videos')
        return
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 0.8,
      })
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        const newItem: MediaItem = {
          id: `${Date.now()}_${Math.random()}`,
          uri: asset.uri,
          type: 'video',
          mimeType: asset.mimeType,
          size: asset.fileSize,
        }
        setMediaItems((prev) => [...prev, newItem])
      }
    } catch (error) {
      console.error('Error picking video:', error)
      Alert.alert('Error', 'No se pudo seleccionar el video')
    }
  }, [])
  
  
  const handleRemoveMedia = useCallback((id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id))
  }, [])
  
  const handleRetryUpload = useCallback(async (id: string) => {
    const item = mediaItems.find((m) => m.id === id)
    if (!item || !currentUser) return
    
    try {
      setMediaItems((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, uploadProgress: 0, uploadError: undefined } : m
        )
      )
      
      const uploaded = await uploadMedia(item.uri, item.type, currentUser.id)
      
      setMediaItems((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, uri: uploaded.url, uploadProgress: 100, uploadError: undefined }
            : m
        )
      )
    } catch (error) {
      console.error('Error retrying upload:', error)
      setMediaItems((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, uploadError: 'Error al subir' } : m
        )
      )
    }
  }, [mediaItems, currentUser])
  
  // ===== CELEBRATION =====
  
  const handleCelebration = useCallback(() => {
    Alert.alert(
      'Tipo de celebración',
      'Selecciona el tipo de celebración',
      [
        { text: '🎯 Hito alcanzado', onPress: () => setCelebrationType('milestone') },
        { text: '🏆 Logro personal', onPress: () => setCelebrationType('achievement') },
        { text: '✨ Éxito empresarial', onPress: () => setCelebrationType('success') },
        { text: '💰 Ganancia de inversión', onPress: () => setCelebrationType('investment_win') },
        { text: '🎉 Otro', onPress: () => setCelebrationType('other') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    )
  }, [])
  
  // ===== PARTNERSHIP =====
  
  const handlePartnership = useCallback(() => {
    Alert.prompt(
      'Buscar socio',
      'Tipo de negocio',
      (businessType) => {
        if (!businessType) return
        Alert.prompt(
          'Buscar socio',
          'Monto de inversión',
          (investmentAmount) => {
            if (!investmentAmount) return
            Alert.prompt(
              'Buscar socio',
              'Ubicación',
              (location) => {
                if (!location) return
                setPartnershipData({ businessType, investmentAmount, location })
              }
            )
          }
        )
      }
    )
  }, [])
  
  // ===== PUBLISH =====
  
  const canPublish = useMemo(() => {
    const hasContent = content.trim().length > 0
    const hasMedia = mediaItems.length > 0
    const hasPoll = pollData !== null
    const hasCelebration = celebrationType !== null
    const hasPartnership = partnershipData !== null
    
    return hasContent || hasMedia || hasPoll || hasCelebration || hasPartnership
  }, [content, mediaItems, pollData, celebrationType, partnershipData])
  
  const handlePublish = useCallback(async () => {
    if (!canPublish) {
      Alert.alert('Contenido vacío', 'Agrega contenido antes de publicar')
      return
    }
    
    if (!currentUser) {
      Alert.alert('Error', 'Usuario no encontrado')
      return
    }
    
    if (content.length > MAX_CONTENT_LENGTH) {
      Alert.alert('Contenido muy largo', `Máximo ${MAX_CONTENT_LENGTH} caracteres`)
      return
    }
    
    setLoading(true)
    Keyboard.dismiss()
    
    try {
      // Upload media first
      const uploadedMedia: Array<{ url: string; type: string; mime: string; size: number }> = []
      
      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i]
        try {
          setMediaItems((prev) =>
            prev.map((m, idx) =>
              idx === i ? { ...m, uploadProgress: 0 } : m
            )
          )
          
          const uploaded = await uploadMedia(item.uri, item.type, currentUser.id)
          
          setMediaItems((prev) =>
            prev.map((m, idx) =>
              idx === i ? { ...m, uploadProgress: 100 } : m
            )
          )
          
          uploadedMedia.push({
            url: uploaded.url,
            type: item.type,
            mime: uploaded.mime,
            size: uploaded.bytes,
          })
        } catch (error) {
          console.error(`Error uploading media ${i}:`, error)
          setMediaItems((prev) =>
            prev.map((m, idx) =>
              idx === i ? { ...m, uploadError: 'Error al subir' } : m
            )
          )
          throw error
        }
      }
      
      // Create post
      const payload: any = {
        user_id: currentUser.id,
        content: content.trim(),
        audience_type: audience.type,
      }
      
      if (audience.type === 'community') {
        payload.audience_id = audience.id
      }
      
      if (uploadedMedia.length > 0) {
        payload.media = uploadedMedia
      }
      
      if (pollData) {
        payload.poll = {
          options: pollData.options,
          duration_days: pollData.duration,
        }
      }
      
      if (celebrationType) {
        payload.celebration = { type: celebrationType }
      }
      
      if (partnershipData) {
        payload.partnership = partnershipData
      }
      
      const result = await createPostFull(payload)
      
      // Clear draft
      await clearDraft()
      
      // Success
      Alert.alert('¡Publicado!', 'Tu publicación se ha compartido exitosamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (error: any) {
      console.error('Error publishing post:', error)
      
      let errorMessage = 'No se pudo publicar el post'
      if (error?.message?.includes('network')) {
        errorMessage = 'Error de conexión. Verifica tu internet.'
      } else if (error?.message?.includes('auth')) {
        errorMessage = 'Error de autenticación. Inicia sesión nuevamente.'
      } else if (error?.message?.includes('permission')) {
        errorMessage = 'No tienes permisos para publicar en esta comunidad.'
      }
      
      Alert.alert('Error', errorMessage, [
        { text: 'Reintentar', onPress: () => handlePublish() },
        { text: 'Cancelar', style: 'cancel' },
      ])
    } finally {
      setLoading(false)
    }
  }, [canPublish, currentUser, content, audience, mediaItems, pollData, celebrationType, partnershipData, navigation])
  
  // ===== AUDIENCE PICKER =====
  
  const fetchCommunitiesForPicker = useCallback(
    async (userId: string, query: string, page: number) => {
      return await listCommunitiesPaged(userId, query, page)
    },
    []
  )
  
  // ===== RENDER HELPERS =====
  
  const renderUserInitials = (name: string) => {
    const words = name.split(' ')
    const initials = words
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
    return initials
  }
  
  const charCount = content.length
  const charCountColor = charCount > MAX_CONTENT_LENGTH ? '#EF4444' : charCount > MAX_CONTENT_LENGTH * 0.9 ? '#F59E0B' : '#9CA3AF'
  
  

    // Render
    if (loadingData) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        </SafeAreaView>
      )
    }
  
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compartir publicación</Text>
          <TouchableOpacity
            style={[styles.publishButton, !canPublish && styles.publishButtonDisabled]}
            onPress={handlePublish}
            disabled={!canPublish || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.publishButtonText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>
  
        <ScrollView style={styles.scrollView}>
          {/* User Header */}
          <View style={styles.userContainer}>
            {currentUser?.avatar_url ? (
              <RNImage source={{ uri: currentUser.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitials}>
                  {renderUserInitials(currentUser?.nombre || 'U')}
                </Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {currentUser?.nombre || 'Usuario'}
              </Text>
              <TouchableOpacity
                style={styles.audienceChip}
                onPress={() => setShowAudiencePicker(true)}
              >
                <Globe size={14} color="#3B82F6" />
                <Text style={styles.audienceText}>{audience.name}</Text>
                <ChevronDown size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
  
          {/* Editor */}
          <View style={styles.editorContainer}>
            <TextInput
              ref={contentInputRef}
              style={styles.textInput}
              placeholder="¿Qué estás pensando?"
              placeholderTextColor="#6B7280"
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={MAX_CONTENT_LENGTH}
            />
            <Text style={[styles.charCounter, { color: charCountColor }]}>
              {charCount}/{MAX_CONTENT_LENGTH}
            </Text>
          </View>
  
          {/* Media Preview */}
          {mediaItems.length > 0 && (
            <MediaPreview
              items={mediaItems}
              onRemove={handleRemoveMedia}
              onRetry={handleRetryUpload}
            />
          )}
  
          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddPhoto}>
              <ImageIcon size={22} color="#374151" />
              <Text style={styles.actionText}>Agregar una foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddVideo}>
              <VideoIcon size={22} color="#374151" />
              <Text style={styles.actionText}>Agregar un video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleCelebration}>
              <Star size={22} color="#374151" />
              <Text style={styles.actionText}>Celebrar un momento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowPollEditor(true)}>
              <BarChart3 size={22} color="#374151" />
              <Text style={styles.actionText}>Crea una encuesta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
  
        {/* Modals */}
        <AudiencePicker
          visible={showAudiencePicker}
          onClose={() => setShowAudiencePicker(false)}
          onSelect={(selected) => {
            setAudience(selected)
            setShowAudiencePicker(false)
          }}
          currentUserId={currentUser?.id || ''}
          selectedAudience={audience}
          fetchCommunities={fetchCommunitiesForPicker}
        />
  
        <PollEditor
          visible={showPollEditor}
          onClose={() => setShowPollEditor(false)}
          onSave={(poll) => {
            setPollData(poll)
            setShowPollEditor(false)
          }}
          initialData={pollData || undefined}
        />
      </SafeAreaView>
    )
  }
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: "#f7f8fa",  
  },  
  loadingContainer: {  
    flex: 1,  
    justifyContent: "center",  
    alignItems: "center",  
  },  
  loadingText: {  
    marginTop: 10,  
    fontSize: 16,  
    color: "#666",  
  },  
  header: {  
    flexDirection: "row",  
    alignItems: "center",  
    justifyContent: "space-between",  
    paddingHorizontal: 20,  
    paddingVertical: 16,  
    backgroundColor: "white",  
    borderBottomWidth: 1,  
    borderBottomColor: "#e5e5e5",  
  },  
  backButton: {  
    padding: 4,  
  },  
  headerTitle: {  
    fontSize: 18,  
    fontWeight: "600",  
    color: "#111",  
  },  
  publishButton: {  
    padding: 4,  
    minWidth: 60,  
    alignItems: "center",  
  },  
  publishButtonDisabled: {  
    opacity: 0.5,  
  },  
  publishButtonText: {  
    fontSize: 16,  
    fontWeight: "600",  
  },  
  scrollView: {  
    flex: 1,  
  },  
  userContainer: {  
    flexDirection: "row",  
    paddingHorizontal: 20,  
    paddingVertical: 20,  
    backgroundColor: "white",  
  },  
  avatar: {  
    width: 48,  
    height: 48,  
    borderRadius: 24,  
    marginRight: 12,  
  },  
  userInfo: {  
    flex: 1,  
  },  
  userName: {  
    fontSize: 16,  
    fontWeight: "600",  
    color: "#111",  
    marginBottom: 4,  
  },  
  communitySelector: {  
    flexDirection: "row",  
    alignItems: "center",  
    backgroundColor: "#f0f0f0",  
    paddingHorizontal: 12,  
    paddingVertical: 6,  
    borderRadius: 20,  
    alignSelf: "flex-start",  
  },  
  communityIcon: {  
    width: 8,  
    height: 8,  
    backgroundColor: "#007AFF",  
    borderRadius: 4,  
    marginRight: 8,  
  },  
  communityText: {  
    fontSize: 14,  
    color: "#111",  
    marginRight: 4,  
  },  
  textContainer: {  
    backgroundColor: "white",  
    paddingHorizontal: 20,  
    paddingBottom: 20,  
  },  
  textInput: {  
    fontSize: 18,  
    color: "#111",  
    minHeight: 200,  
    textAlignVertical: "top",  
    marginBottom: 10,  
  },  
  characterCount: {  
    fontSize: 12,  
    color: "#999",  
    textAlign: "right",  
  },  
  dividerContainer: {  
    alignItems: "center",  
    paddingVertical: 20,  
    backgroundColor: "white",  
  },  
  divider: {  
    width: 50,  
    height: 4,  
    backgroundColor: "#ddd",  
    borderRadius: 2,  
  },  
  optionsContainer: {  
    backgroundColor: "white",  
    paddingHorizontal: 20,  
    paddingBottom: 40,  
  },  
  option: {  
    flexDirection: "row",  
    alignItems: "center",  
    paddingVertical: 16,  
  },  
  optionText: {  
    fontSize: 16,  
    color: "#111",  
    marginLeft: 16,  
  },  
  bottomIndicator: {  
    alignItems: "center",  
    paddingVertical: 20,  
    backgroundColor: "white",  
  },  
  indicator: {  
    width: 134,  
    height: 4,  
    backgroundColor: "#111",  
    borderRadius: 2,  
  },  
  modalOverlay: {  
    flex: 1,  
    backgroundColor: 'rgba(0,0,0,0.5)',  
    justifyContent: 'flex-end',  
  },  
  modalContent: {  
    backgroundColor: 'white',  
    borderTopLeftRadius: 20,  
    borderTopRightRadius: 20,  
    padding: 20,  
    maxHeight: '70%',  
  },  
  modalHeader: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'center',  
    marginBottom: 20,  
  },  
  modalTitle: {  
    fontSize: 18,  
    fontWeight: '600',  
    textAlign: 'center',  
    flex: 1,  
  },  
  modalCloseIcon: {  
    padding: 4,  
  },  
  communityItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    paddingVertical: 12,  
    borderBottomWidth: 1,  
    borderBottomColor: '#f0f0f0',  
  },  
  communityItemIcon: {  
    width: 12,  
    height: 12,  
    backgroundColor: '#007AFF',  
    borderRadius: 6,  
    marginRight: 12,  
  },  
  communityItemText: {  
    flex: 1,  
    fontSize: 16,  
  },  
  modalCloseButton: {  
    marginTop: 20,  
    padding: 15,  
    backgroundColor: '#f0f0f0',  
    borderRadius: 10,  
    alignItems: 'center',  
  },  
  modalCloseText: {  
    fontSize: 16,  
    fontWeight: '600',  
  },  
  mediaPreview: {  
    backgroundColor: 'white',  
    paddingHorizontal: 20,  
    paddingVertical: 16,  
  },  
  mediaItem: {  
    position: 'relative',  
    marginRight: 12,  
  },  
  mediaImage: {  
    width: 80,  
    height: 80,  
    borderRadius: 8,  
  },  
  removeMedia: {  
    position: 'absolute',  
    top: -8,  
    right: -8,  
    backgroundColor: '#ff4444',  
    borderRadius: 12,  
    width: 24,  
    height: 24,  
    justifyContent: 'center',  
    alignItems: 'center',  
  },  
  modalLabel: {  
    fontSize: 16,  
    fontWeight: '600',  
    marginBottom: 8,  
    marginTop: 16,  
  },  
  modalInput: {  
    borderWidth: 1,  
    borderColor: '#ddd',  
    borderRadius: 8,  
    padding: 12,  
    fontSize: 16,  
    marginBottom: 12,  
  },  
  addOptionButton: {  
    padding: 12,  
    backgroundColor: '#f0f0f0',  
    borderRadius: 8,  
    alignItems: 'center',  
    marginBottom: 16,  
  },  
  addOptionText: {  
    color: '#007AFF',  
    fontWeight: '600',  
  },  
  modalSaveButton: {  
    backgroundColor: '#007AFF',  
    padding: 15,  
    borderRadius: 8,  
    alignItems: 'center',  
    marginTop: 16,  
  },  
  modalSaveText: {  
    color: 'white',  
    fontSize: 16,  
    fontWeight: '600',  
  },  
  celebrationOption: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'center',  
    padding: 16,  
    borderWidth: 1,  
    borderColor: '#ddd',  
    borderRadius: 8,  
    marginBottom: 8,  
  },  
  celebrationOptionSelected: {  
    borderColor: '#007AFF',  
    backgroundColor: '#f0f8ff',  
  },  
  celebrationOptionText: {  
    fontSize: 16,  
  },  
})