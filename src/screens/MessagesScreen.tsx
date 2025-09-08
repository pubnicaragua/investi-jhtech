import React, { useState } from 'react'  
import {   
  View,   
  Text,   
  StyleSheet,   
  FlatList,   
  TouchableOpacity,   
  SafeAreaView,  
  TextInput   
} from 'react-native'  
import { ArrowLeft, Search, MessageCircle, Clock } from 'lucide-react-native'  
  
const conversations = [  
  {  
    id: '1',  
    name: 'María García',  
    lastMessage: 'Hola, ¿cómo estás?',  
    time: '10:30',  
    unread: 2,  
    online: true  
  },  
  {  
    id: '2',  
    name: 'Carlos López',  
    lastMessage: 'Gracias por la información sobre inversiones',  
    time: 'Ayer',  
    unread: 0,  
    online: false  
  },  
  {  
    id: '3',  
    name: 'Ana Rodríguez',  
    lastMessage: '¿Viste las noticias del mercado?',  
    time: '2 días',  
    unread: 1,  
    online: true  
  },  
]  
  
export function MessagesScreen({ navigation }: any) {  
  const [searchText, setSearchText] = useState('')  
  
  const renderConversation = ({ item }: { item: typeof conversations[0] }) => (  
    <TouchableOpacity   
      style={styles.conversationItem}  
      onPress={() => navigation.navigate('ChatScreen', { chatId: item.id, userName: item.name })}  
    >  
      <View style={styles.avatarContainer}>  
        <View style={[styles.avatar, item.online && styles.onlineAvatar]}>  
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>  
        </View>  
        {item.online && <View style={styles.onlineIndicator} />}  
      </View>  
        
      <View style={styles.conversationContent}>  
        <View style={styles.conversationHeader}>  
          <Text style={styles.conversationName}>{item.name}</Text>  
          <Text style={styles.conversationTime}>{item.time}</Text>  
        </View>  
        <View style={styles.conversationFooter}>  
          <Text style={styles.lastMessage} numberOfLines={1}>  
            {item.lastMessage}  
          </Text>  
          {item.unread > 0 && (  
            <View style={styles.unreadBadge}>  
              <Text style={styles.unreadText}>{item.unread}</Text>  
            </View>  
          )}  
        </View>  
      </View>  
    </TouchableOpacity>  
  )  
  
  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <TouchableOpacity   
          style={styles.backButton}   
          onPress={() => navigation.goBack()}  
        >  
          <ArrowLeft size={24} color="#111" />  
        </TouchableOpacity>  
        <Text style={styles.headerTitle}>Mensajes</Text>  
        <View style={styles.headerRight} />  
      </View>  
  
      <View style={styles.searchContainer}>  
        <View style={styles.searchInputContainer}>  
          <Search size={16} color="#666" />  
          <TextInput  
            style={styles.searchInput}  
            placeholder="Buscar conversaciones..."  
            value={searchText}  
            onChangeText={setSearchText}  
          />  
        </View>  
      </View>  
  
      <View style={styles.content}>  
        <FlatList  
          data={conversations.filter(conv =>   
            conv.name.toLowerCase().includes(searchText.toLowerCase())  
          )}  
          keyExtractor={(item) => item.id}  
          renderItem={renderConversation}  
          showsVerticalScrollIndicator={false}  
          contentContainerStyle={styles.listContainer}  
        />  
      </View>  
    </SafeAreaView>  
  )  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '#f7f8fa',  
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
  headerTitle: {  
    fontSize: 18,  
    fontWeight: '600',  
    color: '#111',  
  },  
  headerRight: {  
    width: 34,  
  },  
  searchContainer: {  
    backgroundColor: '#fff',  
    paddingHorizontal: 20,  
    paddingBottom: 15,  
  },  
  searchInputContainer: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    backgroundColor: '#f8f9fa',  
    borderRadius: 20,  
    paddingHorizontal: 15,  
    paddingVertical: 10,  
    gap: 10,  
  },  
  searchInput: {  
    flex: 1,  
    fontSize: 16,  
  },  
  content: {  
    flex: 1,  
  },  
  listContainer: {  
    padding: 20,  
  },  
  conversationItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    backgroundColor: 'white',  
    borderRadius: 12,  
    padding: 16,  
    marginBottom: 12,  
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.1,  
    shadowRadius: 4,  
    elevation: 3,  
  },  
  avatarContainer: {  
    position: 'relative',  
    marginRight: 16,  
  },  
  avatar: {  
    width: 50,  
    height: 50,  
    borderRadius: 25,  
    backgroundColor: '#007AFF',  
    justifyContent: 'center',  
    alignItems: 'center',  
  },  
  onlineAvatar: {  
    borderWidth: 2,  
    borderColor: '#4CAF50',  
  },  
  avatarText: {  
    color: 'white',  
    fontSize: 18,  
    fontWeight: 'bold',  
  },  
  onlineIndicator: {  
    position: 'absolute',  
    bottom: 2,  
    right: 2,  
    width: 12,  
    height: 12,  
    borderRadius: 6,  
    backgroundColor: '#4CAF50',  
    borderWidth: 2,  
    borderColor: 'white',  
  },  
  conversationContent: {  
    flex: 1,  
  },  
  conversationHeader: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'center',  
    marginBottom: 4,  
  },  
  conversationName: {  
    fontSize: 16,  
    fontWeight: '600',  
    color: '#111',  
  },  
  conversationTime: {  
    fontSize: 12,  
    color: '#666',  
  },  
  conversationFooter: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'center',  
  },  
  lastMessage: {  
    fontSize: 14,  
    color: '#666',  
    flex: 1,  
  },  
  unreadBadge: {  
    backgroundColor: '#007AFF',  
    borderRadius: 10,  
    minWidth: 20,  
    height: 20,  
    justifyContent: 'center',  
    alignItems: 'center',  
    paddingHorizontal: 6,  
  },  
  unreadText: {  
    color: 'white',  
    fontSize: 12,  
    fontWeight: 'bold',  
  },  
})  
  
export default MessagesScreen