import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, TrendingUp, Users, Star, AlertCircle } from 'lucide-react-native'
import { getUserNotifications, markNotificationRead, getCurrentUserId } from '../rest/api'
  
interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  time: string
  read: boolean
  icon: React.ReactNode
}

export function NotificationsScreen({ navigation }: any) {
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const userId = await getCurrentUserId()
      if (!userId) return

      const notifications = await getUserNotifications(userId)
      const transformedNotifications = transformNotifications(notifications)
      setNotificationsList(transformedNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const transformNotifications = (apiNotifications: any[]): NotificationItem[] => {
    return apiNotifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title || getNotificationTitle(notification.type),
      message: notification.message || '',
      time: getTimeAgo(notification.created_at),
      read: notification.is_read || false,
      icon: getNotificationIcon(notification.type)
    }))
  }

  const getNotificationTitle = (type: string): string => {
    switch (type) {
      case 'like': return 'Nueva reacción'
      case 'comment': return 'Nuevo comentario'
      case 'follow': return 'Nuevo seguidor'
      case 'mention': return 'Mención'
      case 'system': return 'Notificación del sistema'
      default: return 'Notificación'
    }
  }

  const getNotificationIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'like': return <Heart size={20} color="#FF3B30" />
      case 'comment': return <MessageCircle size={20} color="#007AFF" />
      case 'follow': return <UserPlus size={20} color="#34C759" />
      case 'mention': return <Users size={20} color="#FF9500" />
      case 'system': return <Bell size={20} color="#8E8E93" />
      default: return <AlertCircle size={20} color="#8E8E93" />
    }
  }

  const getTimeAgo = (dateString: string): string => {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const handleNotificationPress = async (notification: NotificationItem) => {
    try {
      // 1. Mark as read
      setNotificationsList(prev =>
        prev.map(notif =>
          notif.id === notification.id ? { ...notif, read: true } : notif
        )
      )
      await markNotificationRead(notification.id)

      // 2. Navigate based on notification type
      // Since action_url column doesn't exist yet, extract from notification data
      const userId = await getCurrentUserId()
      if (!userId) return

      const apiNotification = await getUserNotifications(userId)
      const fullNotification = apiNotification.find((n: any) => n.id === notification.id)

      if (fullNotification) {
        if (fullNotification.type === 'like' || fullNotification.type === 'comment') {
          // Navigate to PostDetail - extract post ID from target_object or payload
          const postId = fullNotification.target_object?.post_id ||
                        (fullNotification.payload && JSON.parse(fullNotification.payload).post_id)
          if (postId) {
            navigation.navigate('PostDetail', { postId })
          }
        } else if (fullNotification.type === 'follow') {
          // Navigate to Profile - extract user ID from actor_id
          const userId = fullNotification.actor_id ||
                        (fullNotification.payload && JSON.parse(fullNotification.payload).follower_id)
          if (userId) {
            navigation.navigate('Profile', { userId })
          }
        } else if (fullNotification.type === 'market') {
          // Navigate to MarketInfo
          navigation.navigate('MarketInfo')
        }
      }
    } catch (error) {
      console.error('Error handling notification press:', error)
      // Revert read state on error
      setNotificationsList(prev =>
        prev.map(notif =>
          notif.id === notification.id ? { ...notif, read: false } : notif
        )
      )
    }
  }

  const markAsRead = async (id: string) => {
    try {
      // Update local state immediately for better UX
      setNotificationsList(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      )

      // Call API to mark as read
      await markNotificationRead(id)
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Revert local state on error
      setNotificationsList(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: false } : notif
        )
      )
    }
  }

  const markAllAsRead = async () => {
    try {
      // Update local state immediately
      setNotificationsList(prev => prev.map((n: NotificationItem) => ({ ...n, read: true })))

      // Mark all notifications as read via API
      const userId = await getCurrentUserId()
      if (!userId) return

      const notifications = await getUserNotifications(userId)
      await Promise.all(
        notifications
          .filter((n: any) => !n.is_read)
          .map((n: any) => markNotificationRead(n.id))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      // Revert on error
      fetchNotifications()
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchNotifications()
  }

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
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

  if (loading) {
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
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      </SafeAreaView>
    )
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
        <Text style={styles.headerTitle}>Notificaciones</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {unreadCount > 0 && (
          <Text style={styles.unreadCount}>
            {unreadCount} notificaciones sin leer
          </Text>
        )}

        {notificationsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={48} color="#ccc" />
            <Text style={styles.emptyText}>No tienes notificaciones</Text>
            <Text style={styles.emptySubtext}>Cuando tengas actividad, aparecerá aquí</Text>
          </View>
        ) : (
          <FlatList
            data={notificationsList}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
})
  
export default NotificationsScreen  