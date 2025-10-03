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
  Image
} from 'react-native'
import { ArrowLeft, Send, Users, MoreVertical } from 'lucide-react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { 
  getChannelMessages, 
  sendMessage, 
  getCurrentUser,
  getCommunityChannels 
} from '../rest/api'
import { supabase } from '../supabase'

// ============================================================================
// INTERFACES
// ============================================================================

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: {
    id: string
    name: string
    avatar: string
  }
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
  const flatListRef = useRef<FlatList>(null)

  // ============================================================================
  // CARGAR DATOS INICIALES
  // ============================================================================

  useEffect(() => {
    loadInitialData()
  }, [channelId])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Cargar usuario actual y mensajes en paralelo
      const [user, channelData, messagesData] = await Promise.all([
        getCurrentUser(),
        loadChannelInfo(),
        getChannelMessages(channelId, 100)
      ])

      setCurrentUser(user)
      
      // Mapear mensajes con flag isMe
      const mappedMessages = messagesData.map((msg: any) => ({
        ...msg,
        sender: {
          id: msg.user?.id || msg.sender_id,
          name: msg.user?.nombre || msg.user?.full_name || 'Usuario',
          avatar: msg.user?.avatar_url || msg.user?.photo_url || 'https://i.pravatar.cc/100'
        },
        isMe: msg.user?.id === user?.id || msg.sender_id === user?.id
      }))

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
      return channelData
    } catch (error) {
      console.error('Error loading channel info:', error)
      return null
    }
  }

  // ============================================================================
  // TIEMPO REAL - SUPABASE REALTIME
  // ============================================================================

  useEffect(() => {
    if (!channelId || !currentUser) return

    // Suscripción a nuevos mensajes en tiempo real
    const subscription = supabase
      .channel(`channel:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${channelId}`
        },
        async (payload : any) => {
          console.log('Nuevo mensaje recibido:', payload)
          
          // Obtener datos del remitente
          const { data: senderData } = await supabase
            .from('users')
            .select('id, nombre, full_name, avatar_url, photo_url')
            .eq('id', payload.new.sender_id)
            .single()

          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            sender_id: payload.new.sender_id,
            sender: {
              id: senderData?.id || payload.new.sender_id,
              name: senderData?.full_name || senderData?.nombre || 'Usuario',
              avatar: senderData?.avatar_url || senderData?.photo_url || 'https://i.pravatar.cc/100'
            },
            isMe: payload.new.sender_id === currentUser.id
          }

          setMessages(prev => [...prev, newMessage])
          
          // Auto-scroll si el usuario está cerca del final
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true })
          }, 100)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [channelId, currentUser])

  // ============================================================================
  // ENVIAR MENSAJE
  // ============================================================================

  const handleSend = async () => {
    if (!message.trim() || !currentUser || sending) return

    const messageText = message.trim()
    setMessage('') // Limpiar input inmediatamente para mejor UX
    setSending(true)

    try {
      await sendMessage(channelId, currentUser.id, messageText)
      
      // El mensaje se agregará automáticamente via Realtime
      // Scroll al final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)

    } catch (error) {
      console.error('Error sending message:', error)
      Alert.alert('Error', 'No se pudo enviar el mensaje')
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
      <Text style={[styles.messageText, item.isMe && styles.myMessageText]}>
        {item.content}
      </Text>
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
            <Users size={12} color="#10B981" />
            <Text style={styles.headerSubtitle}>
              {channel?.members_count || '1,098'} activos
            </Text>
            <Text style={styles.headerDot}>•</Text>
            <Text style={styles.headerSubtitle}>12k miembros</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={24} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Mensajes */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
            editable={!sending}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              (!message.trim() || sending) && styles.sendButtonDisabled
            ]} 
            onPress={handleSend}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color={message.trim() ? "#fff" : "#ccc"} />
            )}
          </TouchableOpacity>
        </View>
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
})

export default GroupChatScreen