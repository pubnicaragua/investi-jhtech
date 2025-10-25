// ============================================================================
// GroupChatScreen.tsx - Chat Grupal de Comunidad
// ============================================================================
// 100% Backend Driven + Pixel Perfect según diseño
// Usa tabla: community_channels + chat_messages
// Tiempo real con Supabase Realtime
// ============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Linking
} from 'react-native'
import { ArrowLeft, Send, Users, MoreVertical, Paperclip, Image as ImageIcon, Video as VideoIcon, FileText } from 'lucide-react-native'
import { Video } from 'expo-av'
import { useRoute, useNavigation } from '@react-navigation/native'
import { 
  getChannelMessages,
  getCommunityChannelMessages,
  sendMessage,
  sendCommunityMessage,
  getCurrentUser,
  getCommunityChannels 
} from '../rest/api'
import { uploadChatFile } from '../api'
// import * as DocumentPicker from 'expo-document-picker' // Temporalmente deshabilitado
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../supabase'

// ============================================================================
// INTERFACES
// ============================================================================

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  media_url?: string
  message_type?: string
  sender: {
    id: string
    name: string
    avatar: string
  }
  pending?: boolean
  isMe: boolean
}

interface Channel {
  id: string
  name: string
  description: string
  type: string
  community_id: string
  members_count?: number
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function GroupChatScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { channelId, communityId, channelName } = route.params as { 
    channelId: string
    communityId: string
    channelName?: string
  }

  // Estados
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [channel, setChannel] = useState<Channel | null>(null)
  const [pendingMedia, setPendingMedia] = useState<{ type: string; uri: string; file: any } | null>(null)
  const [showAttachModal, setShowAttachModal] = useState(false)
  const [communityStats, setCommunityStats] = useState({ members_count: 0, active_members_count: 0 })
  const flatListRef = useRef<FlatList>(null)
  
  // Estados de presencia
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ============================================================================
  // CARGAR DATOS INICIALES
  // ============================================================================

  useEffect(() => {
    loadInitialData()
  }, [channelId])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Cargar usuario actual y mensajes en paralelo (usar helper de community)
      const [user, channelData, messagesData] = await Promise.all([
        getCurrentUser(),
        loadChannelInfo(),
        getCommunityChannelMessages(channelId, 100)
      ])

      setCurrentUser(user)
      
      // Helper: inferir tipo por extensión si backend no devuelve message_type
      const inferMessageType = (url?: string | null) => {
        if (!url) return undefined
        const path = url.split('?')[0].toLowerCase()
        if (path.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'image'
        if (path.match(/\.(mp4|mov|mkv|webm|3gp)$/)) return 'video'
        return 'file'
      }

      // Mapear mensajes con flag isMe (community messages usan user_id)
      const mappedMessages = messagesData.map((msg: any) => {
        const mediaUrl = msg.media_url || msg.media || msg.media_path || msg.url || null
        const messageType = msg.message_type || msg.type || inferMessageType(mediaUrl)
        return {
          ...msg,
          media_url: mediaUrl,
          message_type: messageType,
          sender: {
            id: msg.user?.id || msg.user_id,
            name: msg.user?.nombre || msg.user?.full_name || 'Usuario',
            avatar: msg.user?.avatar_url || msg.user?.photo_url || 'https://i.pravatar.cc/100'
          },
          isMe: msg.user?.id === user?.id || msg.user_id === user?.id
        }
      })

      setMessages(mappedMessages)
      
      // Scroll al final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false })
      }, 100)

    } catch (error) {
      console.error('Error loading chat data:', error)
      Alert.alert('Error', 'No se pudo cargar el chat')
    } finally {
      setLoading(false)
    }
  }

  const loadChannelInfo = async () => {
    try {
      const channels = await getCommunityChannels(communityId)
      const channelData = channels.find((ch: any) => ch.id === channelId)
      if (channelData) {
        setChannel(channelData)
      }
      
      // Cargar estadísticas reales de la comunidad
      const { data: communityData } = await supabase
        .from('communities')
        .select('member_count')
        .eq('id', communityId)
        .single()
      
      // Contar miembros activos (últimos 15 minutos)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
      const { data: activeMembers } = await supabase
        .from('user_communities')
        .select('user:users!inner(is_online,last_seen_at)')
        .eq('community_id', communityId)
        .eq('status', 'active')
      
      const activeCount = activeMembers?.filter((m: any) => 
        m.user?.is_online || (m.user?.last_seen_at && m.user.last_seen_at > fifteenMinutesAgo)
      ).length || 0
      
      setCommunityStats({
        members_count: communityData?.member_count || 0,
        active_members_count: activeCount
      })
      
      return channelData
    } catch (error) {
      console.error('Error loading channel info:', error)
      return null
    }
  }

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 })
    if (!result.canceled) {
      setPendingMedia({ type: 'image', uri: result.assets[0].uri, file: result.assets[0] })
    }
  }

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permissionResult.granted === false) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, allowsEditing: true, quality: 0.8 })
    if (!result.canceled) {
      setPendingMedia({ type: 'video', uri: result.assets[0].uri, file: result.assets[0] })
    }
  }

  const pickDocument = async () => {
    // Temporalmente deshabilitado - DocumentPicker
    Alert.alert('Próximamente', 'La función de adjuntar documentos estará disponible pronto')
    setShowAttachModal(false)
  }

  const cancelPendingMedia = () => setPendingMedia(null)

  const handleOpenAttach = () => setShowAttachModal(true)

  const handleCloseAttach = () => setShowAttachModal(false)

  // ============================================================================
  // TIEMPO REAL - SUPABASE REALTIME
  // ============================================================================

  useEffect(() => {
    if (!channelId || !currentUser) return

    // Suscripción a nuevos mensajes en tiempo real (community_messages)
    const subscription = supabase
      .channel(`channel:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload : any) => {
          try {
            console.log('🔔 [GroupChat] Nuevo mensaje recibido:', payload)

            const userId = payload.new.user_id
            const isMyMessage = userId === currentUser.id

            // Normalize media URL and infer type if necessary
            const mediaUrl = payload.new.media_url || payload.new.media || payload.new.media_path || payload.new.url || null
            const messageType = payload.new.message_type || payload.new.type || (mediaUrl ? (mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : mediaUrl.match(/\.(mp4|mov|mkv|webm|3gp)$/i) ? 'video' : 'file') : null)

            // OPTIMIZACIÓN: Solo hacer query si NO es mi mensaje
            let senderData = null
            if (!isMyMessage) {
              const { data } = await supabase
                .from('users')
                .select('id, nombre, full_name, avatar_url, photo_url')
                .eq('id', userId)
                .single()
              senderData = data
            }

            const incoming: Message = {
              id: payload.new.id,
              content: payload.new.content,
              created_at: payload.new.created_at,
              sender_id: userId,
              media_url: mediaUrl,
              message_type: messageType || undefined,
              sender: isMyMessage ? {
                id: currentUser.id,
                name: 'Yo',
                avatar: currentUser.avatar_url || 'https://i.pravatar.cc/100'
              } : {
                id: senderData?.id || userId,
                name: senderData?.full_name || senderData?.nombre || 'Usuario',
                avatar: senderData?.avatar_url || senderData?.photo_url || 'https://i.pravatar.cc/100'
              },
              isMe: isMyMessage
            }

            // Merge incoming with any pending local message (match by sender + content + near timestamp)
            setMessages(prev => {
              // Find index of pending message that likely corresponds
              const pendingIndex = prev.findIndex(m => m.pending && m.sender_id === incoming.sender_id && (m.content === incoming.content || m.media_url === incoming.media_url) && Math.abs(new Date(m.created_at).getTime() - new Date(incoming.created_at).getTime()) < 5000)
              if (pendingIndex !== -1) {
                // Replace pending with incoming (server) message
                const next = [...prev]
                next[pendingIndex] = incoming
                return next
              }
              // Otherwise append
              return [...prev, incoming]
            })

            // Auto-scroll INMEDIATO
            flatListRef.current?.scrollToEnd({ animated: true })
          } catch (err) {
            console.error('Error handling realtime payload:', err)
          }
        }
      )
      .subscribe()

    // Suscripción a typing indicators (GroupChat)
    const typingSubscription = supabase
      .channel(`typing:channel:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${channelId}`
        },
        async (payload: any) => {
          if (payload.new && payload.new.user_id !== currentUser?.id) {
            console.log('⌨️ [GroupChat] User typing:', payload.new.user_id)
            setTypingUsers(prev => new Set(prev).add(payload.new.user_id))
            
            // Auto-clear después de 3 segundos
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => {
              setTypingUsers(prev => {
                const next = new Set(prev)
                next.delete(payload.new.user_id)
                return next
              })
            }, 3000)
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setTypingUsers(prev => {
              const next = new Set(prev)
              next.delete(payload.old.user_id)
              return next
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      typingSubscription.unsubscribe()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [channelId, currentUser])

  // ============================================================================
  // ENVIAR MENSAJE
  // ============================================================================

  // Detectar cuando usuario escribe
  const handleInputChange = async (text: string) => {
    setMessage(text)
    
    if (!channelId || !currentUser?.id) return
    
    if (text.length > 0) {
      // Insertar/actualizar typing indicator
      supabase.from('typing_indicators')
        .upsert({
          conversation_id: channelId,
          user_id: currentUser.id,
          created_at: new Date().toISOString()
        })
        .then(() => {})
    } else {
      // Eliminar typing indicator
      supabase.from('typing_indicators')
        .delete()
        .eq('conversation_id', channelId)
        .eq('user_id', currentUser.id)
        .then(() => {})
    }
  }

  const handleSend = async () => {
    // Allow sending if there's pending media even when message is empty
    if (!currentUser || sending) return
    if (!message.trim() && !pendingMedia) return

    const messageText = message.trim()
    setMessage('') // Limpiar input inmediatamente para mejor UX
    setSending(true)
    
    // Limpiar typing indicator
    if (channelId && currentUser?.id) {
      supabase.from('typing_indicators')
        .delete()
        .eq('conversation_id', channelId)
        .eq('user_id', currentUser.id)
        .then(() => {})
    }

    // Create optimistic pending message
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    const optimistic: Message = {
      id: tempId,
      content: messageText,
      created_at: new Date().toISOString(),
      sender_id: currentUser.id,
      media_url: pendingMedia ? pendingMedia.uri : undefined,
      message_type: pendingMedia ? (pendingMedia.type === 'image' ? 'image' : pendingMedia.type === 'video' ? 'video' : 'file') : undefined,
      sender: {
        id: currentUser.id,
        name: currentUser.full_name || currentUser.nombre || 'Yo',
        avatar: currentUser.photo_url || currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name||currentUser.nombre||'U')}`
      },
      pending: true,
      isMe: true
    }

    setMessages(prev => [...prev, optimistic])

    try {
      // If there's pending media, upload first and send with media_url
      if (pendingMedia) {
        const uploadResult = await uploadChatFile(channelId, currentUser.id, pendingMedia.file)
        const mediaUrl = uploadResult.url
        const messageType = pendingMedia.type === 'image' ? 'image' : pendingMedia.type === 'video' ? 'video' : 'file'
        await sendCommunityMessage(channelId, currentUser.id, messageText || (pendingMedia.file.name || ''), { message_type: messageType, media_url: mediaUrl })
        // Clear pending media locally; server realtime will replace optimistic
        setPendingMedia(null)
      } else {
        // Usar la versión específica para mensajes de comunidad (texto)
        await sendCommunityMessage(channelId, currentUser.id, messageText)
      }

      // Server will emit realtime which replaces the pending message via merge logic
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)

    } catch (error) {
      console.error('Error sending message:', error)
      Alert.alert('Error', 'No se pudo enviar el mensaje')
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setMessage(messageText) // Restaurar mensaje si falla
    } finally {
      setSending(false)
    }
  }

  // ============================================================================
  // FORMATEAR TIEMPO
  // ============================================================================

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    
    return date.toLocaleDateString('es', { day: '2-digit', month: 'short' })
  }

  // ============================================================================
  // RENDER MENSAJE
  // ============================================================================

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.message, item.isMe ? styles.myMessage : styles.otherMessage]}>
      {!item.isMe && (
        <View style={styles.messageHeader}>
          <Image 
            source={{ uri: item.sender.avatar }} 
            style={styles.senderAvatar}
          />
          <Text style={styles.sender}>{item.sender.name}</Text>
        </View>
      )}

      {/* Media rendering */}
      {item.media_url && item.message_type === 'image' && (
        <Image source={{ uri: item.media_url }} style={styles.messageImage} />
      )}
      {item.media_url && item.message_type === 'video' && (
        <Video source={{ uri: item.media_url }} style={styles.messageImage} useNativeControls />
      )}
      {item.media_url && item.message_type === 'file' && (
        <TouchableOpacity onPress={() => Linking.openURL(item.media_url!)} style={styles.fileContainer}>
          <FileText size={18} color={item.isMe ? '#fff' : '#2673f3'} />
          <Text style={[styles.fileText, item.isMe && styles.myMessageText]}>{item.content}</Text>
        </TouchableOpacity>
      )}

      {item.content ? (
        <Text style={[styles.messageText, item.isMe && styles.myMessageText]}>
          {item.content}
        </Text>
      ) : null}

      <Text style={[styles.messageTime, item.isMe && styles.myMessageTime]}>
        {formatTime(item.created_at)}
      </Text>
    </View>
  )

  // ============================================================================
  // RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando chat...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Pixel Perfect según diseño */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {channel?.name || channelName || 'Chat grupal'}
          </Text>
          <View style={styles.headerSubtitleRow}>
            {typingUsers.size > 0 ? (
              <Text style={[styles.headerSubtitle, { color: '#10B981', fontStyle: 'italic' }]}>
                {typingUsers.size === 1 ? 'Alguien está escribiendo...' : `${typingUsers.size} personas escribiendo...`}
              </Text>
            ) : (
              <>
                <Users size={12} color="#10B981" />
                <Text style={styles.headerSubtitle}>
                  {communityStats.active_members_count} activos
                </Text>
                <Text style={styles.headerDot}>•</Text>
                <Text style={styles.headerSubtitle}>{communityStats.members_count} miembros</Text>
              </>
            )}
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Mensajes */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior="height"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            // Auto-scroll al cargar
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hay mensajes aún</Text>
              <Text style={styles.emptyStateSubtext}>Sé el primero en escribir</Text>
            </View>
          }
        />

        {/* Input de mensaje - Pixel Perfect */}
        {pendingMedia && (
          <View style={styles.mediaPreview}>
            {pendingMedia.type === 'image' && (
              <Image source={{ uri: pendingMedia.uri }} style={styles.previewImage} />
            )}
            {(pendingMedia.type === 'video' || pendingMedia.type === 'document') && (
              <View style={styles.previewTextContainer}>
                {pendingMedia.type === 'document' && <FileText size={20} color="#2673f3" />}
                <Text style={styles.previewText}>
                  {pendingMedia.type === 'video' ? 'Video: ' : 'Documento: '}
                  {pendingMedia.file.fileName?.split(' ')[0] || pendingMedia.type}
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={cancelPendingMedia} style={styles.cancelButton}>
              <Text style={styles.cancelText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handleOpenAttach} style={styles.attachButton} disabled={sending}>
            <Paperclip size={22} color="#2673f3" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={message}
            onChangeText={handleInputChange}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
            editable={!sending}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              ((!message.trim() && !pendingMedia) || sending) && styles.sendButtonDisabled
            ]} 
            onPress={handleSend}
            disabled={(!message.trim() && !pendingMedia) || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color={(message.trim() || pendingMedia) ? "#fff" : "#ccc"} />
            )}
          </TouchableOpacity>
        </View>

        {/* Attach Modal */}
        <Modal
          visible={showAttachModal}
          transparent
          animationType="slide"
          onRequestClose={handleCloseAttach}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adjuntar</Text>
              <TouchableOpacity style={styles.modalOption} onPress={() => { handleCloseAttach(); pickImage(); }}>
                <ImageIcon size={22} color="#2673f3" />
                <Text style={styles.modalOptionText}>Imagen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => { handleCloseAttach(); pickVideo(); }}>
                <VideoIcon size={22} color="#2673f3" />
                <Text style={styles.modalOptionText}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => { handleCloseAttach(); pickDocument(); }}>
                <FileText size={22} color="#2673f3" />
                <Text style={styles.modalOptionText}>Documento</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancel} onPress={handleCloseAttach}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ============================================================================
// ESTILOS - 100% PIXEL PERFECT
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Header - Según diseño de la imagen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  headerDot: {
    fontSize: 12,
    color: '#ccc',
  },
  moreButton: {
    padding: 4,
  },
  
  // Chat Container
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  
  // Mensajes - Diseño moderno
  message: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: '75%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2673f3',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  senderAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sender: {
    fontWeight: '600',
    fontSize: 13,
    color: '#2673f3',
  },
  messageText: {
    color: '#111',
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  
  // Input Container - Pixel Perfect
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: '#f8f9fa',
    color: '#111',
  },
  sendButton: {
    backgroundColor: '#2673f3',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2673f3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e5e5',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  attachButton: {
    padding: 10,
    marginRight: 8
  },
  mediaPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10
  },
  previewTextContainer: {
    flex: 1,
    marginRight: 10
  },
  previewText: {
    fontSize: 14,
    color: '#111'
  },
  cancelButton: {
    padding: 5,
    backgroundColor: '#ccc',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },

  cancelText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f7f8fa',
    marginBottom: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#111',
    marginLeft: 15,
  },
  modalCancel: {
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#2673f3',
    fontWeight: '600',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 0
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  fileText: {
    fontSize: 14,
    color: '#2673f3',
    marginLeft: 8
  },
})

export default GroupChatScreen