import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { ArrowLeft, Check } from 'lucide-react-native'
import { getUserFollowers } from '../api'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface User {
  id: string
  name: string
  username?: string
  avatarUrl?: string
  bio?: string
  is_verified?: boolean
}

export function FollowersScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { userId } = route.params as { userId: string }

  const [followers, setFollowers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadFollowers()
  }, [userId])

  const loadFollowers = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const data = await getUserFollowers(userId)
      setFollowers(data)
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los seguidores')
      console.error('Error loading followers:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadFollowers(true)
  }

  const handleUserPress = (user: User) => {
    ;(navigation as any).navigate('Profile', { userId: user.id })
  }

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.userAvatarContainer}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} />
        ) : (
          <View style={[styles.userAvatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitials}>
              {item.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.is_verified && (
            <View style={styles.verifiedBadge}>
              <Check size={12} color="#fff" strokeWidth={3} />
            </View>
          )}
        </View>

        {item.username && (
          <Text style={styles.userUsername} numberOfLines={1}>
            @{item.username}
          </Text>
        )}

        {item.bio && (
          <Text style={styles.userBio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        Este usuario aún no tiene seguidores
      </Text>
    </View>
  )

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#0A66C2" />
      <Text style={styles.loadingText}>Cargando seguidores...</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Seguidores</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        renderLoadingState()
      ) : (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          ListEmptyComponent={renderEmptyState}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={followers.length === 0 ? styles.emptyList : undefined}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  userAvatarContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#0A66C2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    maxWidth: SCREEN_WIDTH - 120,
  },
  verifiedBadge: {
    backgroundColor: '#0A66C2',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  userUsername: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userBio: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
})

export default FollowersScreen
