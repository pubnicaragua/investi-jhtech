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
import {
  ArrowLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  Star,
  BarChart3,
  Globe,
  ChevronDown,
} from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'

import { useAuthGuard } from '../hooks/useAuthGuard'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabase'
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

const MAX_CONTENT_LENGTH = 2000
const AUTOSAVE_INTERVAL = 2000

export function CreatePostScreen({ navigation }: any) {
  const { t } = useTranslation()
  
  // Auth
  useAuthGuard()
  const { user } = useAuth()
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
  }, [content, mediaItems, pollData, celebrationType, audience])
  
  const handleAutosave = useCallback(async () => {
    try {
      await saveDraft({
        content,
        audience,
        media: mediaItems,
        poll: pollData,
        celebration: celebrationType,
      })
    } catch (error) {
      console.error('Error autosaving:', error)
    }
  }, [content, audience, mediaItems, pollData, celebrationType])
  
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
  
  // Upload media to Supabase Storage
  const uploadMediaFile = async (item: MediaItem): Promise<string> => {
    try {
      console.log('📤 Uploading media:', item.type, item.uri)
      console.log('👤 User ID:', user?.id)
      
      // Verificar autenticación
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔐 Session exists:', !!session)
      console.log('🔐 Access token exists:', !!session?.access_token)
      
      if (!session) {
        throw new Error('No hay sesión activa. Por favor inicia sesión nuevamente.')
      }
      
      const fileExt = item.uri.split('.').pop() || 'jpg'
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 9)
      const fileName = `${user?.id}/${timestamp}_${random}.${fileExt}`
      
      console.log('📁 File name:', fileName)
      console.log('📦 Bucket: community-media')
      
      // Read file as ArrayBuffer (más compatible con React Native)
      console.log('📥 Fetching file...')
      const response = await fetch(item.uri)
      const arrayBuffer = await response.arrayBuffer()
      console.log('✅ ArrayBuffer created:', arrayBuffer.byteLength, 'bytes')
      
      // Upload to Supabase Storage
      console.log('⬆️ Starting upload...')
      const { data, error } = await supabase.storage
        .from('community-media')
        .upload(fileName, arrayBuffer, {
          contentType: item.mimeType || 'image/png',
          upsert: false,
        })
      
      if (error) {
        console.error('❌ Supabase upload error:', error)
        console.error('❌ Error name:', error.name)
        console.error('❌ Error message:', error.message)
        console.error('❌ Error details:', JSON.stringify(error, null, 2))
        
        // Intentar con REST API directamente como fallback
        console.log('🔄 Trying direct REST API upload...')
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session?.access_token) {
            throw new Error('No access token available')
          }
          
          const supabaseUrl = await supabase.storage.from('community-media').getPublicUrl('').data.publicUrl
          const baseUrl = supabaseUrl.split('/storage/v1')[0]
          const uploadUrl = `${baseUrl}/storage/v1/object/community-media/${fileName}`
          
          console.log('📍 Upload URL:', uploadUrl)
          
          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': item.mimeType || 'image/png',
              'x-upsert': 'false',
            },
            body: arrayBuffer,
          })
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text()
            console.error('❌ REST API error:', errorText)
            throw new Error(`REST API failed: ${uploadResponse.status} - ${errorText}`)
          }
          
          console.log('✅ REST API upload successful!')
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('community-media')
            .getPublicUrl(fileName)
          
          console.log('✅ Public URL:', urlData.publicUrl)
          return urlData.publicUrl
          
        } catch (restError: any) {
          console.error('❌ REST API also failed:', restError)
          throw error // Throw original error
        }
      }
      
      console.log('✅ Upload successful:', data)
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('community-media')
        .getPublicUrl(fileName)
      
      console.log('✅ Public URL:', urlData.publicUrl)
      return urlData.publicUrl
      
    } catch (error: any) {
      console.error('❌ Error uploading media:', error.message || error)
      console.error('❌ Full error:', JSON.stringify(error, null, 2))
      throw new Error(`Error al subir ${item.type}: ${error.message || 'Desconocido'}`)
    }
  }
  
  const handleRetryUpload = useCallback(async (id: string) => {
    const item = mediaItems.find((m) => m.id === id)
    if (!item) return
    
    try {
      setMediaItems((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, uploadProgress: 0, uploadError: undefined } : m
        )
      )
      
      const url = await uploadMediaFile(item)
      
      setMediaItems((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, uri: url, uploadProgress: 100, uploadError: undefined }
            : m
        )
      )
    } catch (error: any) {
      console.error('❌ Error retrying upload:', error)
      setMediaItems((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, uploadError: error.message || 'Error al subir' } : m
        )
      )
    }
  }, [mediaItems, user])
  
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
  
  // ===== PUBLISH =====
  
  const canPublish = useMemo(() => {
    const hasContent = content.trim().length > 0
    const hasMedia = mediaItems.length > 0
    const hasPoll = pollData !== null
    const hasCelebration = celebrationType !== null
    
    return hasContent || hasMedia || hasPoll || hasCelebration
  }, [content, mediaItems, pollData, celebrationType])
  
  const handlePublish = useCallback(async () => {
    if (!canPublish) {
      Alert.alert('Contenido vacío', 'Agrega contenido antes de publicar')
      return
    }
    
    if (!user) {
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
      console.log('🚀 Starting post creation...')
      
      // Upload media first
      const uploadedMediaUrls: string[] = []
      
      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i]
        try {
          console.log(`📤 Uploading media ${i + 1}/${mediaItems.length}...`)
          
          setMediaItems((prev) =>
            prev.map((m, idx) =>
              idx === i ? { ...m, uploadProgress: 50 } : m
            )
          )
          
          const url = await uploadMediaFile(item)
          uploadedMediaUrls.push(url)
          
          setMediaItems((prev) =>
            prev.map((m, idx) =>
              idx === i ? { ...m, uploadProgress: 100 } : m
            )
          )
        } catch (error: any) {
          console.error(`❌ Error uploading media ${i}:`, error)
          setMediaItems((prev) =>
            prev.map((m, idx) =>
              idx === i ? { ...m, uploadError: error.message || 'Error al subir' } : m
            )
          )
          throw error
        }
      }
      
      console.log('✅ All media uploaded:', uploadedMediaUrls)
      
      // Create post
      const postData: any = {
        user_id: user.id,
        content: content.trim(),
        contenido: content.trim(), // Para compatibilidad
      }
      
      // Add community if selected
      if (audience.type === 'community') {
        postData.community_id = audience.id
      }
      
      // Add media URLs (usar media_url que es ARRAY en la BD)
      if (uploadedMediaUrls.length > 0) {
        postData.media_url = uploadedMediaUrls
        // También agregar image_url para el primer item (compatibilidad)
        if (uploadedMediaUrls[0]) {
          postData.image_url = uploadedMediaUrls[0]
        }
      }
      
      console.log('📝 Creating post with data:', postData)
      
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Supabase insert error:', error)
        throw error
      }
      
      console.log('✅ Post created:', data.id)
      
      // Clear draft
      await clearDraft()
      
      // Success
      Alert.alert('✅ ¡Publicado!', 'Tu publicación se ha compartido exitosamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (error: any) {
      console.error('❌ Error publishing post:', error)
      
      let errorMessage = error.message || 'No se pudo publicar el post'
      
      Alert.alert('❌ Error', errorMessage, [
        { text: 'Reintentar', onPress: () => handlePublish() },
        { text: 'Cancelar', style: 'cancel' },
      ])
    } finally {
      setLoading(false)
    }
  }, [canPublish, user, content, audience, mediaItems, pollData, celebrationType, navigation])
  
  // ===== AUDIENCE PICKER =====
  
  const fetchCommunitiesForPicker = useCallback(
    async (userId: string, query: string, page: number) => {
      const result = await listCommunitiesPaged(userId, query, page)
      return {
        items: result.items.map(c => ({
          id: c.id,
          name: c.name,
          type: 'community' as const,
          image_url: c.image_url,
        })),
        hasMore: result.hasMore,
      }
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddPhoto}>
            <ImageIcon size={24} color="#374151" />
            <Text style={styles.actionText}>Agregar una foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddVideo}>
            <VideoIcon size={24} color="#374151" />
            <Text style={styles.actionText}>Agregar un video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleCelebration}>
            <Star size={24} color="#374151" />
            <Text style={styles.actionText}>Celebrar un momento</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowPollEditor(true)}>
            <BarChart3 size={24} color="#374151" />
            <Text style={styles.actionText}>Crea una encuesta</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Indicator */}
        <View style={styles.bottomIndicatorContainer}>
          <View style={styles.bottomIndicator} />
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
  scrollView: {
    flex: 1,
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
    gap: 4,
  },
  audienceText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
    marginRight: 2,
  },
  editorContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 18,
    color: '#111827',
    minHeight: 180,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    textAlign: 'right',
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
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 14,
  },
  bottomIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  bottomIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#111827',
    borderRadius: 100,
  },
})