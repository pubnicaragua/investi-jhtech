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
} from "react-native";  
import { ArrowLeft, Send } from "lucide-react-native";  
import {  
  getCurrentUserId,  
  getConversationMessages,  
  sendMessage as sendChatMessage,  
  markMessagesAsRead,  
  getCurrentUser  
} from "../api";  
import { useAuthGuard } from "../hooks/useAuthGuard";  
import { supabase } from "../supabase";  
  
interface Message {  
  id: string;  
  content: string;  
  created_at: string;  
  user: {  
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);  
  const flatListRef = useRef<FlatList>(null);  
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
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
        (payload: any) => {
          const newMessage = payload.new as any;
          // Transform the message to match our interface
          const transformedMessage = {
            id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
            user: {
              id: newMessage.user_id,
              nombre: 'Usuario', // Will be populated by loadMessages
              avatar: 'https://i.pravatar.cc/100'
            }
          };
          setMessages(prev => [...prev, transformedMessage]);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
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
        content: msg.content,
        created_at: msg.created_at,
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
    if (!input.trim() || sending) return;

    const messageText = input.trim();
    setInput("");
    setSending(true);

    try {
      const uid = await getCurrentUserId();
      const other = participant.id;
      if (!uid) return;

      await sendChatMessage({
        chat_id: conversationId,
        user_id: uid,
        other_user_id: other,
        content: messageText,
        message_type: 'text',
        media_url : "asdsa",
      });
      
      
    } catch (err) {
      console.error("Error sending message:", err);
      Alert.alert("Error", "No se pudo enviar el mensaje");
      setInput(messageText);
    } finally {
      setSending(false);
    }
  };  
  
  const renderMessage = ({ item }: { item: Message }) => {  
    const isMine = item.user.id === currentUserId;  
      
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
              uri: item.user.avatar || "https://i.pravatar.cc/100",  
            }}  
            style={styles.avatar}  
          />  
        )}  
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>  
          {!isMine && (  
            <Text style={styles.senderName}>{item.user.nombre}</Text>  
          )}  
          <Text style={[styles.messageText, isMine && styles.myMessageText]}>  
            {item.content}  
          </Text>  
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
        <TouchableOpacity onPress={() => navigation.goBack()}>  
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
        <View style={[styles.inputContainer, { paddingBottom: Platform.OS === 'ios' ? 12 : 12, marginBottom: keyboardHeight }]}>  
          <TextInput  
            value={input}  
            onChangeText={setInput}  
            placeholder="Escribe un mensaje..."  
            style={styles.textInput}  
            multiline  
            maxLength={1000}  
          />  
          <TouchableOpacity   
            onPress={handleSend}   
            style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}  
            disabled={!input.trim() || sending}  
          >  
            {sending ? (  
              <ActivityIndicator size="small" color="#fff" />  
            ) : (  
              <Send size={22} color="#fff" />  
            )}  
          </TouchableOpacity>  
        </View>  
      </KeyboardAvoidingView>  
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
});