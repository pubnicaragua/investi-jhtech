import React, { useState } from 'react'  
import {   
  View,   
  Text,   
  StyleSheet,   
  FlatList,   
  TouchableOpacity,   
  SafeAreaView   
} from 'react-native'  
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, TrendingUp } from 'lucide-react-native'  
  
const notifications = [  
  {  
    id: '1',  
    type: 'like',  
    title: 'Nueva reacción',  
    message: 'A María García le gustó tu publicación sobre inversiones',  
    time: 'Hace 5 min',  
    read: false,  
    icon: <Heart size={20} color="#FF3B30" />  
  },  
  {  
    id: '2',  
    type: 'comment',  
    title: 'Nuevo comentario',  
    message: 'Carlos López comentó en tu publicación',  
    time: 'Hace 15 min',  
    read: false,  
    icon: <MessageCircle size={20} color="#007AFF" />  
  },  
  {  
    id: '3',  
    type: 'follow',  
    title: 'Nuevo seguidor',  
    message: 'Ana Rodríguez comenzó a seguirte',  
    time: 'Hace 1 hora',  
    read: true,  
    icon: <UserPlus size={20} color="#34C759" />  
  },  
  {  
    id: '4',  
    type: 'market',  
    title: 'Alerta de mercado',  
    message: 'Las acciones de tecnología subieron 5%',  
    time: 'Hace 2 horas',  
    read: true,  
    icon: <TrendingUp size={20} color="#FF9500" />  
  },  
]  
  
export function NotificationsScreen({ navigation }: any) {  
  const [notificationsList, setNotificationsList] = useState(notifications)  
  
  const markAsRead = (id: string) => {  
    setNotificationsList(prev =>   
      prev.map(notif =>   
        notif.id === id ? { ...notif, read: true } : notif  
      )  
    )  
  }  
  
  const renderNotification = ({ item }: { item: typeof notifications[0] }) => (  
    <TouchableOpacity   
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}  
      onPress={() => markAsRead(item.id)}  
    >  
      <View style={styles.notificationIcon}>  
        {item.icon}  
      </View>  
        
      <View style={styles.notificationContent}>  
        <Text style={styles.notificationTitle}>{item.title}</Text>  
        <Text style={styles.notificationMessage}>{item.message}</Text>  
        <Text style={styles.notificationTime}>{item.time}</Text>  
      </View>  
        
      {!item.read && <View style={styles.unreadDot} />}  
    </TouchableOpacity>  
  )  
  
  const unreadCount = notificationsList.filter(n => !n.read).length  
  
  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <TouchableOpacity   
          style={styles.backButton}   
          onPress={() => navigation.goBack()}  
        >  
          <ArrowLeft size={24} color="#111" />  
        </TouchableOpacity>  
        <Text style={styles.headerTitle}>Notificaciones</Text>  
        <TouchableOpacity   
          style={styles.markAllButton}  
          onPress={() => setNotificationsList(prev => prev.map(n => ({ ...n, read: true })))}  
        >  
          <Text style={styles.markAllText}>Marcar todas</Text>  
        </TouchableOpacity>  
      </View>  
  
      <View style={styles.content}>  
        {unreadCount > 0 && (  
          <Text style={styles.unreadCount}>  
            {unreadCount} notificaciones sin leer  
          </Text>  
        )}  
          
        <FlatList  
          data={notificationsList}  
          keyExtractor={(item) => item.id}  
          renderItem={renderNotification}  
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
  markAllButton: {  
    padding: 5,  
  },  
  markAllText: {  
    color: '#007AFF',  
    fontSize: 14,  
    fontWeight: '500',  
  },  
  content: {  
    flex: 1,  
    padding: 20,  
  },  
  unreadCount: {  
    fontSize: 14,  
    color: '#007AFF',  
    fontWeight: '500',  
    marginBottom: 15,  
  },  
  listContainer: {  
    paddingBottom: 20,  
  },  
  notificationItem: {  
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
  unreadNotification: {  
    backgroundColor: '#f0f8ff',  
    borderLeftWidth: 4,  
    borderLeftColor: '#007AFF',  
  },  
  notificationIcon: {  
    width: 40,  
    height: 40,  
    borderRadius: 20,  
    backgroundColor: 'rgba(0, 122, 255, 0.1)',  
    justifyContent: 'center',  
    alignItems: 'center',  
    marginRight: 16,  
  },  
  notificationContent: {  
    flex: 1,  
  },  
  notificationTitle: {  
    fontSize: 16,  
    fontWeight: '600',  
    color: '#111',  
    marginBottom: 4,  
  },  
  notificationMessage: {  
    fontSize: 14,  
    color: '#666',  
    marginBottom: 4,  
  },  
  notificationTime: {  
    fontSize: 12,  
    color: '#999',  
  },  
  unreadDot: {  
    width: 8,  
    height: 8,  
    borderRadius: 4,  
    backgroundColor: '#007AFF',  
  },  
})  
  
export default NotificationsScreen  