import React, { useState } from 'react'  
import {   
  View,   
  Text,   
  TextInput,   
  StyleSheet,   
  FlatList,   
  TouchableOpacity,   
  SafeAreaView,  
  KeyboardAvoidingView,  
  Platform  
} from 'react-native'  
import { ArrowLeft, Send } from 'lucide-react-native'  
  
const messages = [  
  { id: '1', text: '¡Hola a todos! ¿Cómo van con sus inversiones?', sender: 'María García', isMe: false, time: '10:30' },  
  { id: '2', text: 'Muy bien, acabo de comprar algunas acciones de tecnología', sender: 'Tú', isMe: true, time: '10:32' },  
  { id: '3', text: '¡Excelente! ¿Qué opinas del mercado actual?', sender: 'Carlos López', isMe: false, time: '10:35' },  
  { id: '4', text: 'Creo que es un buen momento para diversificar', sender: 'Tú', isMe: true, time: '10:37' },  
]  
  
export function GroupChatScreen({ navigation, route }: any) {  
  const [message, setMessage] = useState('')  
  const groupId = route?.params?.groupId || '1'  
  
  const renderMessage = ({ item }: { item: typeof messages[0] }) => (  
    <View style={[styles.message, item.isMe ? styles.myMessage : styles.otherMessage]}>  
      {!item.isMe && <Text style={styles.sender}>{item.sender}</Text>}  
      <Text style={[styles.messageText, item.isMe && styles.myMessageText]}>  
        {item.text}  
      </Text>  
      <Text style={[styles.messageTime, item.isMe && styles.myMessageTime]}>  
        {item.time}  
      </Text>  
    </View>  
  )  
  
  const handleSend = () => {  
    if (message.trim()) {  
      console.log('Enviando mensaje:', message)  
      setMessage('')  
    }  
  }  
  
  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <TouchableOpacity   
          style={styles.backButton}   
          onPress={() => navigation.goBack()}  
        >  
          <ArrowLeft size={24} color="#111" />  
        </TouchableOpacity>  
        <View style={styles.headerInfo}>  
          <Text style={styles.headerTitle}>Grupo de Inversión</Text>  
          <Text style={styles.headerSubtitle}>4 miembros activos</Text>  
        </View>  
        <View style={styles.headerRight} />  
      </View>  
  
      <KeyboardAvoidingView   
        style={styles.chatContainer}  
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  
      >  
        <FlatList  
          data={messages}  
          keyExtractor={(item) => item.id}  
          renderItem={renderMessage}  
          style={styles.messagesContainer}  
          contentContainerStyle={styles.messagesContent}  
          showsVerticalScrollIndicator={false}  
        />  
  
        <View style={styles.inputContainer}>  
          <TextInput  
            style={styles.input}  
            value={message}  
            onChangeText={setMessage}  
            placeholder="Escribe un mensaje..."  
            multiline  
            maxLength={500}  
          />  
          <TouchableOpacity   
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}   
            onPress={handleSend}  
            disabled={!message.trim()}  
          >  
            <Send size={20} color={message.trim() ? "#fff" : "#ccc"} />  
          </TouchableOpacity>  
        </View>  
      </KeyboardAvoidingView>  
    </SafeAreaView>  
  )  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '#f5f5f5',  
  },  
  header: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    justifyContent: 'space-between',  
    paddingHorizontal: 20,  
    paddingVertical: 15,  
    backgroundColor: '#fff',  
    borderBottomWidth: 1,  
    borderBottomColor: '#eee',  
  },  
  backButton: {  
    padding: 5,  
  },  
  headerInfo: {  
    flex: 1,  
    alignItems: 'center',  
  },  
  headerTitle: {  
    fontSize: 18,  
    fontWeight: '600',  
    color: '#111',  
  },  
  headerSubtitle: {  
    fontSize: 12,  
    color: '#666',  
  },  
  headerRight: {  
    width: 34,  
  },  
  chatContainer: {  
    flex: 1,  
  },  
  messagesContainer: {  
    flex: 1,  
  },  
  messagesContent: {  
    padding: 15,  
    paddingBottom: 20,  
  },  
  message: {  
    padding: 12,  
    borderRadius: 16,  
    marginVertical: 4,  
    maxWidth: '80%',  
  },  
  myMessage: {  
    alignSelf: 'flex-end',  
    backgroundColor: '#007AFF',  
  },  
  otherMessage: {  
    alignSelf: 'flex-start',  
    backgroundColor: '#fff',  
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 1 },  
    shadowOpacity: 0.1,  
    shadowRadius: 2,  
    elevation: 1,  
  },  
  messageText: {  
    color: '#111',  
    fontSize: 16,  
    lineHeight: 20,  
  },  
  myMessageText: {  
    color: '#fff',  
  },  
  sender: {  
    fontWeight: 'bold',  
    marginBottom: 4,  
    fontSize: 12,  
    color: '#007AFF',  
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
  inputContainer: {  
    flexDirection: 'row',  
    padding: 15,  
    backgroundColor: '#fff',
    borderTopWidth: 1,  
    borderTopColor: '#eee',  
    alignItems: 'flex-end',  
    gap: 10,  
  },  
  input: {  
    flex: 1,  
    borderWidth: 1,  
    borderColor: '#ddd',  
    borderRadius: 20,  
    paddingHorizontal: 15,  
    paddingVertical: 10,  
    fontSize: 16,  
    maxHeight: 100,  
  },  
  sendButton: {  
    backgroundColor: '#007AFF',  
    width: 40,  
    height: 40,  
    borderRadius: 20,  
    justifyContent: 'center',  
    alignItems: 'center',  
  },  
  sendButtonDisabled: {  
    backgroundColor: '#ccc',  
  },  
})  
  
export default GroupChatScreen