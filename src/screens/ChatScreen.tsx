import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Linking,
} from "react-native";
import { ArrowLeft, Send, Paperclip, Image as ImageIcon, Video as VideoIcon, FileText } from "lucide-react-native";
import { Video } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  getCurrentUserId,
  getConversationMessages,
  sendMessage as sendChatMessage,
  markMessagesAsRead,
  getCurrentUser,
  uploadChatFile
} from "../api";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { supabase } from "../supabase";
  
interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  media_url?: string;
  message_type?: string;
  read_at?: string | null;
  delivered_at?: string | null;
  user?: {
    id: string;
    nombre: string;
    avatar: string;
  };
}
  
export function ChatScreen({ navigation, route }: any) {  
  const { conversationId: initialConversationId, type = "direct", name, participant, userId: targetUserId } = route.params || {};  
  
  // Validación crítica de parámetros
  console.log('🔍 [ChatScreen] Route params:', { conversationId: initialConversationId, type, name, participant, targetUserId });
  
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);  
  const [chatInfo, setChatInfo] = useState<any>(null);  
  const [input, setInput] = useState("");  
  const [loading, setLoading] = useState(true);  
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [pendingMedia, setPendingMedia] = useState<{ type: string; uri: string; file: any } | null>(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  
  // Estados de presencia
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useAuthGuard();  
  
  useEffect(() => {  
    loadInitialData();
  }, []);  

  // Suscripción a mensajes + presencia
  useEffect(() => {
    if (!conversationId || !participant?.id) return;

    console.log('🔔 [ChatScreen] Setting up realtime subscriptions');

    // Canal para mensajes
    const messagesChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload: any) => {
          console.log('🔔 [ChatScreen] New message received:', payload);
          const newMessage = payload.new;

          const currentUid = await getCurrentUserId();
          const isMyMessage = newMessage.sender_id === currentUid;
          
          let userData;
          if (isMyMessage) {
            userData = {
              id: currentUid,
              nombre: 'Yo',
              avatar: undefined
            };
          } else {
            userData = {
              id: participant?.id || newMessage.sender_id,
              nombre: participant?.nombre || 'Usuario',
              avatar: participant?.avatar_url || 'https://i.pravatar.cc/100'
            };
          }

          const transformedMessage = {
            id: newMessage.id,
            content: newMessage.content || newMessage.contenido,
            created_at: newMessage.created_at,
            sender_id: newMessage.sender_id || newMessage.user_id,
            media_url: newMessage.media_url,
            message_type: newMessage.message_type,
            user: userData
          };

          setMessages(prev => [...prev, transformedMessage]);
          flatListRef.current?.scrollToEnd({ animated: true });

          // Marcar como leído
          if (!isMyMessage && conversationId) {
            markMessagesAsRead(conversationId, currentUid).catch(err => 
              console.warn('Error marcando mensaje como leído:', err)
            );
            
            // Marcar mensaje específico como leído
            supabase.rpc('mark_message_read', { p_message_id: newMessage.id }).catch(() => {});
          }
        }
      )
      .subscribe();

    // Canal para estado online del otro usuario
    const presenceChannel = supabase
      .channel(`user:${participant.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${participant.id}`
        },
        (payload: any) => {
          console.log('👤 [ChatScreen] User status updated:', payload.new);
          setIsOnline(payload.new.is_online || false);
          setLastSeen(payload.new.last_seen_at);
        }
      )
      .subscribe();

    // Canal para typing indicators
    const typingChannel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload: any) => {
          const currentUid = await getCurrentUserId();
          if (payload.new && payload.new.user_id !== currentUid) {
            console.log('⌨️ [ChatScreen] Other user is typing');
            setIsTyping(true);
            
            // Auto-clear después de 3 segundos
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
          } else if (payload.eventType === 'DELETE') {
            setIsTyping(false);
          }
        }
      )
      .subscribe();

    // Cargar estado inicial
    loadUserPresence();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(typingChannel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, participant]);

  // Cargar estado de presencia inicial
  const loadUserPresence = async () => {
    if (!participant?.id) return;
    
    try {
      const { data } = await supabase
        .from('users')
        .select('is_online, last_seen_at')
        .eq('id', participant.id)
        .single();
      
      if (data) {
        setIsOnline(data.is_online || false);
        setLastSeen(data.last_seen_at);
      }
    } catch (error) {
      console.error('Error loading user presence:', error);
    }
  };  

  // Keyboard listeners to move input bar (works for Android and iOS)
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e: any) => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  
  const loadInitialData = async () => {  
    try {  
      setLoading(true);  
      const uid = await getCurrentUserId();  
      setCurrentUserId(uid);  
      
      // Si no hay conversationId, crear o buscar conversación usando participant.id
      const otherUserId = targetUserId || participant?.id;
      
      if (!conversationId && otherUserId && uid) {
        console.log('🔍 [ChatScreen] Buscando/creando conversación:', { uid, otherUserId });
        try {
          // Buscar conversación existente
          const { data: existingConv, error: searchError } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant_one.eq.${uid},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${uid})`)
            .single();
          
          if (existingConv) {
            console.log('✅ [ChatScreen] Conversación encontrada:', existingConv.id);
            setConversationId(existingConv.id);
          } else {
            // Crear nueva conversación
            console.log('🆕 [ChatScreen] Creando nueva conversación...');
            const { data: newConv, error: createError } = await supabase
              .from('conversations')
              .insert({
                type: 'direct',
                participant_one: uid,
                participant_two: otherUserId,
                created_by: uid
              })
              .select('id')
              .single();
            
            if (newConv) {
              console.log('✅ [ChatScreen] Conversación creada:', newConv.id);
              setConversationId(newConv.id);
            } else {
              console.error('❌ [ChatScreen] Error creando conversación:', createError);
            }
          }
        } catch (err) {
          console.error('❌ [ChatScreen] Exception:', err);
        }
      }
        
      await Promise.all([  
        loadChat(),  
        conversationId ? loadMessages() : Promise.resolve()
      ]);  
    } catch (error) {  
      console.error('Error loading initial data:', error);  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  const loadChat = async () => {
    try {
      if (type === "direct" && participant) {
        setChatInfo({
          nombre: participant.nombre,
          avatar_url: participant.avatar_url,
          is_online: isOnline
        });
      } else {
        setChatInfo({
          nombre: name || 'Chat',
          avatar_url: 'https://i.pravatar.cc/100',
          is_online: false
        });
      }
    } catch (err) {
      console.error("Error loading chat info:", err);
    }
  };
  
  // Detectar cuando usuario escribe
  const handleInputChange = async (text: string) => {
    setInput(text);
    
    if (!conversationId || !currentUserId) return;
    
    if (text.length > 0) {
      // Insertar/actualizar typing indicator
      supabase.from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: currentUserId,
          created_at: new Date().toISOString()
        })
        .then(() => {});
    } else {
      // Eliminar typing indicator
      supabase.from('typing_indicators')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', currentUserId)
        .then(() => {});
    }
  };
  
  // Formatear última vez visto
  const formatLastSeen = (lastSeenAt: string | null) => {
    if (!lastSeenAt) return 'hace mucho';
    
    const now = new Date();
    const lastSeen = new Date(lastSeenAt);
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'ahora mismo';
    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return lastSeen.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };  
  
  const loadMessages = async () => {
    try {
      if (!conversationId) {
        console.warn('[ChatScreen] No conversationId, skipping loadMessages');
        return;
      }
      const response = await getConversationMessages(conversationId, 50);
      
      // Transform messages to match our interface
      const transformedMessages = response.map((msg: any) => ({
        id: msg.id,
        content: msg.content || msg.contenido,
        created_at: msg.created_at,
        sender_id: msg.sender_id || msg.user_id,
        media_url: msg.media_url,
        message_type: msg.message_type,
        user: {
          id: msg.user_id,
          nombre: msg.user?.nombre || msg.user?.full_name || 'Usuario',
          avatar: msg.user?.avatar_url || msg.user?.photo_url || 'https://i.pravatar.cc/100'
        }
      }));
      
      setMessages(transformedMessages);
      
      // Mark messages as read
      const uid = await getCurrentUserId();
      if (uid && conversationId) {
        await markMessagesAsRead(conversationId, uid);
      }
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };  
  
  const handleSend = async () => {
    if (sending || uploading) return;

    const messageText = input.trim();
    setInput("");
    setSending(true);
    
    // Limpiar typing indicator
    if (conversationId && currentUserId) {
      supabase.from('typing_indicators')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', currentUserId)
        .then(() => {});
    }

    try {
      const uid = await getCurrentUserId();
      if (!uid) return;

      let sentMessage;

      if (pendingMedia) {
        // Optimistic UI: add a temporary message so media appears immediately
        const tempId = `tmp-${Date.now()}`;
        let rawContent = pendingMedia.file.fileName || pendingMedia.file.name || `file_${Date.now()}`;
        let content = messageText;
        if (!messageText) {
          if (pendingMedia.type === 'document') {
            content = rawContent.split(' ')[0];
            if (content.includes('application/') || content.includes('text/plain') || content.includes('charset=')) {
              content = 'Documento';
            }
          } else {
            content = '';
          }
        }

        const tempMessage: Message = {
          id: tempId,
          content: content,
          created_at: new Date().toISOString(),
          sender_id: uid,
          media_url: pendingMedia.uri, // Use local URI for immediate display
          message_type: pendingMedia.type === 'image' ? 'image' : pendingMedia.type === 'video' ? 'video' : 'file',
          user: {
            id: uid,
            nombre: 'Yo',
            avatar: undefined as any
          }
        };

        setMessages(prev => [...prev, tempMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

        // Upload in background
        setUploading(true);
        const uploadResult = await uploadChatFile(conversationId || '', uid, pendingMedia.file);

        // Send message with uploaded URL
        sentMessage = await sendChatMessage({
          conversation_id: conversationId || undefined,
          user_id: uid,
          other_user_id: participant.id,
          content: content,
          message_type: pendingMedia.type === 'image' ? 'image' : pendingMedia.type === 'video' ? 'video' : 'file',
          media_url: uploadResult.url
        });

        setPendingMedia(null);

        // Replace temporary message with server message
        const serverMessage = Array.isArray(sentMessage) ? sentMessage[0] : sentMessage;
        if (serverMessage && serverMessage.id) {
          setMessages(prev => prev.map(m => {
            if (m.id === tempId) {
              return {
                id: serverMessage.id,
                content: serverMessage.content || serverMessage.contenido,
                created_at: serverMessage.created_at || m.created_at,
                sender_id: serverMessage.sender_id || serverMessage.user_id || uid,
                media_url: serverMessage.media_url || uploadResult.url,
                message_type: serverMessage.message_type || pendingMedia.type === 'image' ? 'image' : pendingMedia.type === 'video' ? 'video' : 'file',
                user: {
                  id: serverMessage.user_id || serverMessage.sender_id || uid,
                  nombre: 'Yo',
                  avatar: m.user?.avatar || undefined as any
                }
              } as Message;
            }
            return m;
          }));
        }

      } else {
        // Send text only
        // Optimistic UI: add a temporary message so it appears immediately
        const tempId = `tmp-${Date.now()}`;
        const tempMessage: Message = {
          id: tempId,
          content: messageText,
          created_at: new Date().toISOString(),
          sender_id: uid,
          user: {
            id: uid,
            nombre: 'Yo',
            avatar: undefined as any
          }
        };

        setMessages(prev => [...prev, tempMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

        // Send to server
        sentMessage = await sendChatMessage({
          conversation_id: conversationId || undefined,
          user_id: uid,
          other_user_id: participant.id,
          content: messageText,
          message_type: 'text'
        });

        // Replace temporary message with server message if available
        const serverMessage = Array.isArray(sentMessage) ? sentMessage[0] : sentMessage;
        if (serverMessage && serverMessage.id) {
          setMessages(prev => prev.map(m => {
            if (m.id === tempId) {
              return {
                id: serverMessage.id,
                content: serverMessage.content || serverMessage.contenido,
                created_at: serverMessage.created_at || m.created_at,
                sender_id: serverMessage.sender_id || serverMessage.user_id || uid,
                user: {
                  id: serverMessage.user_id || serverMessage.sender_id || uid,
                  nombre: 'Yo',
                  avatar: m.user?.avatar || undefined as any
                }
              } as Message;
            }
            return m;
          }));
        }
      }

      // Mark messages as read after sending
      if (conversationId) {
        await markMessagesAsRead(conversationId, uid);
      }

    } catch (err) {
      console.error("Error sending message:", err);
      Alert.alert("Error", "No se pudo enviar el mensaje");
      setInput(messageText);
      // remove temporary messages that failed
      setMessages(prev => prev.filter(m => !m.id.startsWith('tmp-')));
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleAttachFile = () => {
    setShowAttachModal(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso requerido", "Se necesita acceso a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPendingMedia({
        type: 'image',
        uri: result.assets[0].uri,
        file: result.assets[0]
      });
    }
  };

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permiso requerido", "Se necesita acceso a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPendingMedia({
        type: 'video',
        uri: result.assets[0].uri,
        file: result.assets[0]
      });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setPendingMedia({
        type: 'document',
        uri: result.assets[0].uri,
        file: result.assets[0]
      });
    }
  };

  const uploadAndSendFile = async (file: any) => {
    setUploading(true);
    try {
      const uid = await getCurrentUserId();
      if (!uid) return;

      const fileName = file.fileName || file.name || `file_${Date.now()}`;
      const mimeType = file.type || file.mimeType;

      const uploadResult = await uploadChatFile(conversationId || '', uid, file);

      let content = fileName;
      if (content.includes('application/') || content.includes('text/plain') || content.includes('charset=')) {
        content = 'Documento';
      }

      await sendChatMessage({
        conversation_id: conversationId || undefined,
        user_id: uid,
        other_user_id: participant.id,
        content: content,
        message_type: mimeType?.startsWith('image/') ? 'image' : mimeType?.startsWith('video/') ? 'video' : 'file',
        media_url: uploadResult.url
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert("Error", "No se pudo subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelMedia = () => {
    setPendingMedia(null);
  };


  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === currentUserId;  
      
    return (  
      <View  
        style={[  
          styles.messageContainer,  
          isMine ? styles.myMessage : styles.otherMessage,  
        ]}  
      >  
        {!isMine && (  
          <Image  
            source={{  
              uri: item.user?.avatar || "https://i.pravatar.cc/100",  
            }}  
            style={styles.avatar}  
          />  
        )}  
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
          {!isMine && (
            <Text style={styles.senderName}>{item.user?.nombre}</Text>
          )}
          {item.media_url && item.message_type === 'image' && (
            <Image source={{ uri: item.media_url }} style={styles.messageImage} />
          )}
          {item.media_url && item.message_type === 'video' && (
            <Video
              source={{ uri: item.media_url }}
              style={styles.messageVideo}
              useNativeControls
            />
          )}
          {item.media_url && item.message_type === 'file' && (
            <TouchableOpacity
              onPress={() => Linking.openURL(item.media_url!)}
              style={styles.fileContainer}
            >
              <FileText size={20} color={isMine ? "#fff" : "#2673f3"} />
              <Text style={[styles.fileText, isMine && styles.myMessageText]}>{item.content}</Text>
            </TouchableOpacity>
          )}
          {item.message_type === 'text' && (
            <Text style={[styles.messageText, isMine && styles.myMessageText]}>
              {item.content}
            </Text>
          )}
          {item.content && item.message_type !== 'text' && item.message_type !== 'file' && (
            <Text style={[styles.messageText, isMine && styles.myMessageText, styles.mediaCommentText]}>
              {item.content}
            </Text>
          )}
          <View style={styles.messageFooter}>
            <Text style={styles.timeText}>
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {isMine && (
              <Text style={styles.readReceipt}>
                {item.read_at ? '✓✓' : item.delivered_at ? '✓' : '⏱'}
              </Text>
            )}
          </View>
        </View>
      </View>  
    );  
  };  
  
  if (loading) {  
    return (  
      <SafeAreaView style={styles.container}>  
        <View style={styles.loadingContainer}>  
          <ActivityIndicator size="large" color="#2673f3" />  
        </View>  
      </SafeAreaView>  
    );  
  }  
  
  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('ChatList')}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>  
          <Image  
            source={{  
              uri: chatInfo?.icono_url || chatInfo?.avatar_url || "https://i.pravatar.cc/100",  
            }}  
            style={styles.headerAvatar}  
          />  
          <View>  
            <Text style={styles.headerTitle}>  
              {chatInfo?.nombre || name || "Chat"}  
            </Text>  
            <Text style={styles.headerSubtitle}>  
              {type === "community"  
                ? `${chatInfo?.members?.[0]?.count || 0} miembros`  
                : isTyping
                ? "escribiendo..."
                : isOnline  
                ? "En línea"  
                : lastSeen
                ? `Últ. vez ${formatLastSeen(lastSeen)}`
                : "Desconectado"}  
            </Text>  
          </View>  
        </View>  
      </View>  
  
      <FlatList  
        ref={flatListRef}  
        data={messages}  
        renderItem={renderMessage}  
        keyExtractor={(item) => item.id}  
        contentContainerStyle={[styles.messageList, { paddingBottom: 16 + keyboardHeight }]}  
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}  
        keyboardShouldPersistTaps="handled"
      />  
  
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : 'height'}
        keyboardVerticalOffset={80}
      >
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
            <TouchableOpacity onPress={handleCancelMedia} style={styles.cancelButton}>
              <Text style={styles.cancelText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputContainer, { paddingBottom: Platform.OS === 'ios' ? 12 : 12, marginBottom: keyboardHeight }]}>
          <TouchableOpacity onPress={handleAttachFile} style={styles.attachButton} disabled={uploading || !!pendingMedia}>
            {uploading ? <ActivityIndicator size="small" color="#2673f3" /> : <Paperclip size={22} color="#2673f3" />}
          </TouchableOpacity>
          <TextInput
            value={input}
            onChangeText={handleInputChange}
            placeholder={pendingMedia ? "Agrega un comentario (opcional)..." : "Escribe un mensaje..."}
            style={styles.textInput}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, ((!input.trim() && !pendingMedia) || sending || uploading) && styles.sendButtonDisabled]}
            disabled={(!input.trim() && !pendingMedia) || sending || uploading}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showAttachModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAttachModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adjuntar archivo</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowAttachModal(false);
                pickImage();
              }}
            >
              <ImageIcon size={24} color="#2673f3" />
              <Text style={styles.modalOptionText}>Imagen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowAttachModal(false);
                pickVideo();
              }}
            >
              <VideoIcon size={24} color="#2673f3" />
              <Text style={styles.modalOptionText}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowAttachModal(false);
                pickDocument();
              }}
            >
              <FileText size={24} color="#2673f3" />
              <Text style={styles.modalOptionText}>Documento</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowAttachModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}  
  
const styles = StyleSheet.create({  
  container: { flex: 1, backgroundColor: "#f7f8fa" },  
  loadingContainer: {  
    flex: 1,  
    justifyContent: "center",  
    alignItems: "center",  
  },  
  header: {  
    flexDirection: "row",  
    alignItems: "center",  
    padding: 12,  
    borderBottomWidth: 1,  
    borderBottomColor: "#eee",  
    backgroundColor: "#fff",  
  },  
  headerInfo: { flexDirection: "row", alignItems: "center", marginLeft: 12 },  
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },  
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#111" },  
  headerSubtitle: { fontSize: 12, color: "#666" },  
  messageList: { padding: 12 },  
  messageContainer: { flexDirection: "row", marginBottom: 12, maxWidth: "80%" },  
  myMessage: { alignSelf: "flex-end", flexDirection: "row-reverse" },  
  otherMessage: { alignSelf: "flex-start" },  
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },  
  bubble: {  
    padding: 10,  
    borderRadius: 12,  
    maxWidth: "100%",  
  },  
  myBubble: { backgroundColor: "#2673f3", borderBottomRightRadius: 0 },  
  otherBubble: { backgroundColor: "#e5e5ea", borderBottomLeftRadius: 0 },  
  messageText: { fontSize: 15, color: "#111" },
  myMessageText: { color: "#fff" },
  mediaCommentText: { marginTop: 8 },
  senderName: { fontSize: 12, fontWeight: "600", marginBottom: 2, color: "#444" },  
  timeText: { fontSize: 10, color: "#999", marginTop: 4, alignSelf: "flex-end" },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 4
  },
  readReceipt: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4
  },
  inputContainer: {  
    flexDirection: "row",  
    alignItems: "flex-end",  
    backgroundColor: "#fff",  
    paddingHorizontal: 12,  
    paddingVertical: 8,  
    borderTopWidth: 1,  
    borderTopColor: "#eee",  
  },  
  textInput: {   
    flex: 1,   
    fontSize: 16,   
    color: "#111",   
    paddingVertical: 8,  
    maxHeight: 100,  
  },  
  sendButton: {  
    backgroundColor: "#2673f3",  
    borderRadius: 20,  
    padding: 10,  
    marginLeft: 8,  
  },  
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 0
  },
  messageVideo: {
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
});
