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
  user?: {
    id: string;
    nombre: string;
    avatar: string;
  };
}
  
export function ChatScreen({ navigation, route }: any) {  
  const { conversationId, type = "direct", name, participant } = route.params || {};  
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
  
  useAuthGuard();  
  
  useEffect(() => {  
    loadInitialData();
    
    // Configurar Supabase Realtime para mensajes en tiempo real
    const channel = supabase
      .channel(`conversation_${conversationId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload: any) => {
          console.log('Nuevo mensaje recibido en tiempo real:', payload);
          const newMessage = payload.new as any;

          // Obtener datos completos del usuario remitente
          let userData = null;
          try {
            const { data, error } = await supabase
              .from('users')
              .select('id, nombre, full_name, avatar_url, photo_url')
              .eq('id', newMessage.sender_id || newMessage.user_id)
              .single();

            if (!error && data) {
              userData = {
                id: data.id,
                nombre: data.full_name || data.nombre || 'Usuario',
                avatar: data.avatar_url || data.photo_url || 'https://i.pravatar.cc/100'
              };
            }
          } catch (error) {
            console.warn('Error obteniendo datos del usuario:', error);
          }

          // Transform the message to match our interface
          const transformedMessage = {
            id: newMessage.id,
            content: newMessage.content || newMessage.contenido,
            created_at: newMessage.created_at,
            sender_id: newMessage.sender_id || newMessage.user_id,
            media_url: newMessage.media_url,
            message_type: newMessage.message_type,
            user: userData || {
              id: newMessage.user_id || newMessage.sender_id,
              nombre: 'Usuario',
              avatar: 'https://i.pravatar.cc/100'
            }
          };

          setMessages(prev => [...prev, transformedMessage]);

          // Auto-scroll al final
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);

          // Marcar como leído si no es nuestro mensaje
          const currentUid = await getCurrentUserId();
          if (currentUid && newMessage.sender_id !== currentUid) {
            try {
              await markMessagesAsRead(conversationId, currentUid);
            } catch (error) {
              console.warn('Error marcando mensaje como leído:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);  

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
        
      await Promise.all([  
        loadChat(),  
        loadMessages()  
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
          is_online: Math.random() > 0.5 // Mock online status
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
  
  const loadMessages = async () => {
    try {
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
      if (uid) {
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
        const uploadResult = await uploadChatFile(conversationId, uid, pendingMedia.file);

        // Send message with uploaded URL
        sentMessage = await sendChatMessage({
          conversation_id: conversationId,
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
          conversation_id: conversationId,
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
      await markMessagesAsRead(conversationId, uid);

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

      const uploadResult = await uploadChatFile(conversationId, uid, file);

      let content = fileName;
      if (content.includes('application/') || content.includes('text/plain') || content.includes('charset=')) {
        content = 'Documento';
      }

      await sendChatMessage({
        conversation_id: conversationId,
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
          <Text style={styles.timeText}>
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
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
                : chatInfo?.is_online  
                ? "En línea"  
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
            onChangeText={setInput}
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
