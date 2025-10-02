import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native'
import { X, Search, ChevronRight, Globe, Users as UsersIcon } from 'lucide-react-native'

export interface AudienceOption {
  id: string
  name: string
  type: 'profile' | 'community'
  image_url?: string
  member_count?: number
}

interface AudiencePickerProps {
  visible: boolean
  onClose: () => void
  onSelect: (audience: AudienceOption) => void
  currentUserId: string
  selectedAudience?: AudienceOption
  fetchCommunities: (userId: string, query: string, page: number) => Promise<{
    items: AudienceOption[]
    hasMore: boolean
  }>
}

export function AudiencePicker({
  visible,
  onClose,
  onSelect,
  currentUserId,
  selectedAudience,
  fetchCommunities,
}: AudiencePickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [communities, setCommunities] = useState<AudienceOption[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Profile option (always first)
  const profileOption: AudienceOption = useMemo(
    () => ({
      id: 'profile',
      name: 'Mi Perfil',
      type: 'profile',
    }),
    []
  )

  // Load communities with debounce
  const loadCommunities = useCallback(
    async (query: string, pageNum: number, append = false) => {
      if (loading) return

      setLoading(true)
      try {
        const result = await fetchCommunities(currentUserId, query, pageNum)
        
        if (append) {
          setCommunities((prev) => [...prev, ...result.items])
        } else {
          setCommunities(result.items)
        }
        
        setHasMore(result.hasMore)
      } catch (error) {
        console.error('Error loading communities:', error)
      } finally {
        setLoading(false)
      }
    },
    [currentUserId, fetchCommunities, loading]
  )

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      setPage(1)
      loadCommunities(searchQuery, 1, false)
    }, 300)

    setDebounceTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [searchQuery])

  // Initial load
  useEffect(() => {
    if (visible) {
      setSearchQuery('')
      setPage(1)
      loadCommunities('', 1, false)
    }
  }, [visible])

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadCommunities(searchQuery, nextPage, true)
    }
  }

  const handleSelect = (audience: AudienceOption) => {
    onSelect(audience)
    onClose()
  }

  const renderInitials = (name: string) => {
    const words = name.split(' ')
    const initials = words
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
    return initials
  }

  const renderItem = ({ item }: { item: AudienceOption }) => {
    const isSelected = selectedAudience?.id === item.id

    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.itemSelected]}
        onPress={() => handleSelect(item)}
        accessibilityLabel={`Seleccionar ${item.name}`}
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.itemLeft}>
          {item.type === 'profile' ? (
            <View style={[styles.avatar, styles.avatarProfile]}>
              <Globe size={20} color="#3B82F6" />
            </View>
          ) : item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitials}>{renderInitials(item.name)}</Text>
            </View>
          )}
          
          <View style={styles.itemContent}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.type === 'community' && item.member_count !== undefined && (
              <Text style={styles.itemMeta}>
                {item.member_count} {item.member_count === 1 ? 'miembro' : 'miembros'}
              </Text>
            )}
          </View>
        </View>

        {isSelected && (
          <View style={styles.checkmark}>
            <View style={styles.checkmarkInner} />
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const allOptions = [profileOption, ...communities]

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar audiencia</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar comunidades..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* List */}
          <FlatList
            data={allOptions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading ? (
                <View style={styles.loader}>
                  <ActivityIndicator size="small" color="#3B82F6" />
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  itemSelected: {
    backgroundColor: '#EFF6FF',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarProfile: {
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  loader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
})
