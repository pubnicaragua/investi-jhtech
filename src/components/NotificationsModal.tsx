import React, { useState, useEffect } from "react"  
import {  
  View,  
  Text,  
  TouchableOpacity,  
  StyleSheet,  
  Modal,  
  FlatList,  
  ActivityIndicator,  
  Image,  
} from "react-native"  
import { Bell, X } from "lucide-react-native"  
import { getNotifications, markNotificationAsRead } from "../rest/api"  
  
interface NotificationsModalProps {  
  visible: boolean  
  onClose: () => void  
  userId: string | null  
  navigation: any  
}  
  
export function NotificationsModal({ visible, onClose, userId, navigation }: NotificationsModalProps) {  
  const [notifications, setNotifications] = useState<any[]>([])  
  const [loading, setLoading] = useState(false)  
  
  useEffect(() => {  
    if (visible && userId) {  
      loadNotifications()  
    }  
  }, [visible, userId])  
  
  const loadNotifications = async () => {  
    if (!userId) return  
      
    setLoading(true)  
    try {  
      const data = await getNotifications(userId)  
      setNotifications(data.slice(0, 5)) // Máximo 5 notificaciones  
    } catch (error) {  
      console.error("Error loading notifications:", error)  
    } finally {  
      setLoading(false)  
    }  
  }  
  
  const handleNotificationPress = async (notification: any) => {  
    try {  
      // Marcar como leída  
      await markNotificationAsRead(notification.id)  
        
      // Cerrar modal  
      onClose()  
        
      // Navegar según el tipo de notificación  
      switch (notification.type) {  
        case "post_like":  
          navigation.navigate("PostDetail", { postId: notification.post_id })  
          break  
        case "post_comment":  
          navigation.navigate("PostDetail", { postId: notification.post_id })  
          break  
        case "follow":  
          navigation.navigate("Profile", { userId: notification.from_user_id })  
          break  
        case "community_invite":  
          navigation.navigate("Communities")  
          break  
        default:  
          navigation.navigate("HomeFeed")  
      }  
    } catch (error) {  
      console.error("Error handling notification:", error)  
    }  
  }  
  
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const renderNotification = ({ item }: any) => {
    // Obtener avatar del actor o from_user
    const avatar = item.from_user?.avatar_url || 
                   item.from_user?.photo_url || 
                   item.actor?.avatar_url || 
                   item.actor?.photo_url || 
                   'https://ui-avatars.com/api/?name=User';
    
    // Obtener título y cuerpo
    const title = item.title || 'Notificación';
    const body = item.body || item.message || item.content || 'Nueva actividad';
    
    return (
      <TouchableOpacity  
        style={[styles.notificationItem, !item.is_read && styles.unreadNotification]}  
        onPress={() => handleNotificationPress(item)}  
      >  
        <Image  
          source={{ uri: avatar }}  
          style={styles.notificationAvatar}  
        />  
        <View style={styles.notificationContent}>  
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.notificationBody}>{body}</Text>  
          <Text style={styles.notificationTime}>  
            {formatTimeAgo(item.created_at)}  
          </Text>  
        </View>  
        {!item.is_read && <View style={styles.unreadDot} />}  
      </TouchableOpacity>
    );
  }  
  
  return (  
    <Modal  
      visible={visible}  
      transparent  
      animationType="fade"  
      onRequestClose={onClose}  
    >  
      <TouchableOpacity  
        style={styles.overlay}  
        activeOpacity={1}  
        onPress={onClose}  
      >  
        <View style={styles.modalContainer}>  
          <View style={styles.modalHeader}>  
            <Text style={styles.modalTitle}>Notificaciones</Text>  
            <TouchableOpacity onPress={onClose}>  
              <X size={24} color="#666" />  
            </TouchableOpacity>  
          </View>  
  
          {loading ? (  
            <View style={styles.loadingContainer}>  
              <ActivityIndicator size="small" color="#2673f3" />  
            </View>  
          ) : notifications.length === 0 ? (  
            <View style={styles.emptyContainer}>  
              <Bell size={48} color="#ccc" />  
              <Text style={styles.emptyText}>No hay notificaciones</Text>  
            </View>  
          ) : (  
            <FlatList  
              data={notifications}  
              keyExtractor={(item) => item.id}  
              renderItem={renderNotification}  
              showsVerticalScrollIndicator={false}  
            />  
          )}  
        </View>  
      </TouchableOpacity>  
    </Modal>  
  )  
}  
  
const styles = StyleSheet.create({  
  overlay: {  
    flex: 1,  
    backgroundColor: "rgba(0, 0, 0, 0.5)",  
    justifyContent: "flex-start",  
    paddingTop: 100,  
    paddingHorizontal: 20,  
  },  
  modalContainer: {  
    backgroundColor: "white",  
    borderRadius: 12,  
    maxHeight: 400,  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 4 },  
    shadowOpacity: 0.25,  
    shadowRadius: 8,  
    elevation: 8,  
  },  
  modalHeader: {  
    flexDirection: "row",  
    justifyContent: "space-between",  
    alignItems: "center",  
    padding: 16,  
    borderBottomWidth: 1,  
    borderBottomColor: "#f0f0f0",  
  },  
  modalTitle: {  
    fontSize: 18,  
    fontWeight: "600",  
    color: "#111",  
  },  
  loadingContainer: {  
    padding: 40,  
    alignItems: "center",  
  },  
  emptyContainer: {  
    padding: 40,  
    alignItems: "center",  
  },  
  emptyText: {  
    marginTop: 12,  
    fontSize: 16,  
    color: "#666",  
  },  
  notificationItem: {  
    flexDirection: "row",  
    padding: 16,  
    borderBottomWidth: 1,  
    borderBottomColor: "#f5f5f5",  
  },  
  unreadNotification: {  
    backgroundColor: "#f8f9ff",  
  },  
  notificationAvatar: {  
    width: 40,  
    height: 40,  
    borderRadius: 20,  
    marginRight: 12,  
  },  
  notificationContent: {  
    flex: 1,  
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: "#111",
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  notificationText: {  
    fontSize: 14,  
    color: "#111",  
    lineHeight: 20,  
  },  
  notificationTime: {  
    fontSize: 12,  
    color: "#999",  
    marginTop: 4,  
  },  
  unreadDot: {  
    width: 8,  
    height: 8,  
    borderRadius: 4,  
    backgroundColor: "#2673f3",  
    marginTop: 6,  
  },  
})