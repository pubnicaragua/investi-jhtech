// ============================================================================
// CommunitySettingsScreen.tsx - Configuración de Comunidad
// ============================================================================
// 100% Backend Driven + UI Profesional Moderna
// Accesible desde: CommunityDetailScreen (menú ...)
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  RefreshControl,
  Platform,
} from 'react-native'
import {
  ArrowLeft,
  Settings,
  Users,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  Trash2,
  Edit3,
  Globe,
  MapPin,
  Tag,
  FileText,
  Crown,
  Star,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Camera,
  Save,
  Info,
  Zap,
  MessageSquare,
  Heart,
  Ban,
  CheckCircle,
  XCircle,
} from 'lucide-react-native'
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native'
import type { RootStackParamList } from '../types/navigation'
import { request } from '../rest/client'
import { getCurrentUser } from '../rest/api'

// ============================================================================
// INTERFACES
// ============================================================================

interface CommunitySettings {
  id?: string
  community_id: string
  // Privacidad
  is_private: boolean
  require_approval: boolean
  show_member_count: boolean
  show_member_list: boolean
  // Permisos
  allow_member_posts: boolean
  allow_member_invites: boolean
  allow_comments: boolean
  allow_reactions: boolean
  // Notificaciones
  enable_notifications: boolean
  notify_new_members: boolean
  notify_new_posts: boolean
  notify_new_comments: boolean
  // Moderación
  auto_moderate: boolean
  profanity_filter: boolean
  spam_filter: boolean
  max_post_length: number
  max_comment_length: number
  // Metadata
  created_at?: string
  updated_at?: string
}

interface Community {
  id: string
  name: string
  nombre: string
  description: string
  descripcion: string
  image_url?: string
  icono_url?: string
  avatar_url?: string
  banner_url?: string
  category: string
  type: 'public' | 'private' | 'invite_only'
  location?: string
  created_by: string
  member_count?: number
  is_verified?: boolean
  created_at: string
}

interface SettingSection {
  id: string
  title: string
  description?: string
  icon?: any
  items: SettingItem[]
}

interface SettingItem {
  id: string
  icon: any
  label: string
  description?: string
  type: 'toggle' | 'navigation' | 'action' | 'info' | 'number'
  value?: boolean | string | number
  settingKey?: keyof CommunitySettings
  onPress?: () => void
  destructive?: boolean
  requiresOwner?: boolean
  requiresAdmin?: boolean
  badge?: string | number
  badgeColor?: string
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CommunitySettingsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute()
  const { communityId, communityName } = route.params as {
    communityId: string
    communityName?: string
  }

  // Estados
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [community, setCommunity] = useState<Community | null>(null)
  const [settings, setSettings] = useState<CommunitySettings | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('member')
  const [memberCount, setMemberCount] = useState(0)
  const [pendingRequests, setPendingRequests] = useState(0)
  const [activeMembers, setActiveMembers] = useState(0)
  const [totalPosts, setTotalPosts] = useState(0)

  // Edit mode
  const [editMode, setEditMode] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedCategory, setEditedCategory] = useState('')
  const [editedLocation, setEditedLocation] = useState('')

  // ============================================================================
  // CARGAR DATOS
  // ============================================================================

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [user, communityData, settingsData, stats] = await Promise.all([
        getCurrentUser(),
        fetchCommunity(),
        fetchCommunitySettings(),
        fetchCommunityStats(),
      ])

      setCurrentUser(user)

      // Obtener rol del usuario
      if (communityData) {
        const role = await fetchUserRole(user?.id, communityData.id)
        setUserRole(role)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      Alert.alert('Error', 'No se pudo cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunity = async (): Promise<Community | null> => {
    try {
      const response = await request('GET', '/communities', {
        params: {
          select: '*',
          id: `eq.${communityId}`,
        },
      })

      if (response && response.length > 0) {
        const data = response[0]
        setCommunity(data)
        setEditedName(data.name || data.nombre)
        setEditedDescription(data.description || data.descripcion || '')
        setEditedCategory(data.category || '')
        setEditedLocation(data.location || '')
        return data
      }
      return null
    } catch (error) {
      console.error('Error fetching community:', error)
      return null
    }
  }

  const fetchCommunitySettings = async (): Promise<CommunitySettings | null> => {
    try {
      const response = await request('GET', '/community_settings', {
        params: {
          select: '*',
          community_id: `eq.${communityId}`,
        },
      })

      if (response && response.length > 0) {
        setSettings(response[0])
        return response[0]
      } else {
        // Crear configuración por defecto
        await createDefaultSettings()
        return null
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      return null
    }
  }

  const createDefaultSettings = async () => {
    try {
      const defaultSettings: Partial<CommunitySettings> = {
        community_id: communityId,
        is_private: false,
        require_approval: false,
        allow_member_posts: true,
        allow_member_invites: true,
        allow_comments: true,
        allow_reactions: true,
        show_member_count: true,
        show_member_list: true,
        enable_notifications: true,
        notify_new_members: true,
        notify_new_posts: true,
        notify_new_comments: false,
        auto_moderate: false,
        profanity_filter: true,
        spam_filter: true,
        max_post_length: 5000,
        max_comment_length: 1000,
      }

      const response = await request('POST', '/community_settings', {
        body: defaultSettings,
      })

      if (response && response.length > 0) {
        setSettings(response[0])
      }
    } catch (error) {
      console.error('Error creating default settings:', error)
    }
  }

  const fetchUserRole = async (userId: string, commId: string): Promise<string> => {
    try {
      const response = await request('GET', '/user_communities', {
        params: {
          select: 'role',
          user_id: `eq.${userId}`,
          community_id: `eq.${commId}`,
          status: 'eq.active',
        },
      })

      if (response && response.length > 0) {
        return response[0].role
      }
      return 'member'
    } catch (error) {
      console.error('Error fetching user role:', error)
      return 'member'
    }
  }

  const fetchCommunityStats = async () => {
    try {
      // Contar miembros activos
      const membersResponse = await request('GET', '/user_communities', {
        params: {
          select: 'id',
          community_id: `eq.${communityId}`,
          status: 'eq.active',
        },
      })
      setMemberCount(membersResponse?.length || 0)

      // Contar miembros online (últimos 15 minutos)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
      const activeMembersResponse = await request('GET', '/user_communities', {
        params: {
          select: 'user:users(is_online,last_seen_at)',
          community_id: `eq.${communityId}`,
          status: 'eq.active',
        },
      })
      const active = activeMembersResponse?.filter((m: any) => 
        m.user?.is_online || (m.user?.last_seen_at && m.user.last_seen_at > fifteenMinutesAgo)
      ).length || 0
      setActiveMembers(active)

      // Contar solicitudes pendientes
      const requestsResponse = await request('GET', '/community_join_requests', {
        params: {
          select: 'id',
          community_id: `eq.${communityId}`,
          status: 'eq.pending',
        },
      })
      setPendingRequests(requestsResponse?.length || 0)

      // Contar posts
      const postsResponse = await request('GET', '/posts', {
        params: {
          select: 'id',
          community_id: `eq.${communityId}`,
        },
      })
      setTotalPosts(postsResponse?.length || 0)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [])

  // ============================================================================
  // ACTUALIZAR CONFIGURACIÓN
  // ============================================================================

  const updateSetting = async (
    key: keyof CommunitySettings,
    value: boolean | string | number
  ) => {
    try {
      if (!settings) return

      setSaving(true)

      await request('PATCH', '/community_settings', {
        params: { community_id: `eq.${communityId}` },
        body: { [key]: value, updated_at: new Date().toISOString() },
      })

      setSettings({ ...settings, [key]: value })
    } catch (error) {
      console.error('Error updating setting:', error)
      Alert.alert('Error', 'No se pudo actualizar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const updateCommunityInfo = async () => {
    try {
      setSaving(true)

      await request('PATCH', '/communities', {
        params: { id: `eq.${communityId}` },
        body: {
          name: editedName,
          nombre: editedName,
          description: editedDescription,
          descripcion: editedDescription,
          category: editedCategory,
          location: editedLocation,
          updated_at: new Date().toISOString(),
        },
      })

      await fetchCommunity()
      setEditMode(false)
      Alert.alert('Éxito', 'Información actualizada correctamente')
    } catch (error) {
      console.error('Error updating community info:', error)
      Alert.alert('Error', 'No se pudo actualizar la información')
    } finally {
      setSaving(false)
    }
  }

  // ============================================================================
  // ACCIONES PELIGROSAS
  // ============================================================================

  const deleteCommunity = async () => {
    Alert.alert(
      '⚠️ Eliminar comunidad',
      'Esta acción es irreversible. Se eliminarán todos los posts, miembros y datos de la comunidad.\n\n¿Estás completamente seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await request('DELETE', '/communities', {
                params: { id: `eq.${communityId}` },
              })

              Alert.alert('Comunidad eliminada', 'La comunidad ha sido eliminada exitosamente')
              navigation.navigate('Communities')
            } catch (error) {
              console.error('Error deleting community:', error)
              Alert.alert('Error', 'No se pudo eliminar la comunidad')
            }
          },
        },
      ]
    )
  }

  const leaveCommunity = async () => {
    if (userRole === 'owner') {
      Alert.alert(
        'No puedes abandonar',
        'Como propietario, debes transferir la propiedad o eliminar la comunidad primero.'
      )
      return
    }

    Alert.alert(
      'Abandonar comunidad',
      '¿Estás seguro que deseas abandonar esta comunidad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abandonar',
          style: 'destructive',
          onPress: async () => {
            try {
              await request('DELETE', '/user_communities', {
                params: {
                  community_id: `eq.${communityId}`,
                  user_id: `eq.${currentUser?.id}`,
                },
              })

              Alert.alert('Has abandonado la comunidad')
              navigation.navigate('Communities')
            } catch (error) {
              console.error('Error leaving community:', error)
              Alert.alert('Error', 'No se pudo abandonar la comunidad')
            }
          },
        },
      ]
    )
  }

  // ============================================================================
  // PERMISOS
  // ============================================================================

  const isOwner = userRole === 'owner'
  const isAdmin = userRole === 'admin' || userRole === 'owner'
  const isModerator = userRole === 'moderator' || isAdmin

  // ============================================================================
  // SECCIONES DE CONFIGURACIÓN
  // ============================================================================

  const settingsSections: SettingSection[] = [
    // Información
    {
      id: 'info',
      title: 'Información',
      icon: Info,
      items: [
        {
          id: 'edit_info',
          icon: Edit3,
          label: 'Editar información',
          description: 'Nombre, descripción, categoría',
          type: 'action',
          onPress: () => setEditMode(!editMode),
          requiresAdmin: true,
        },
        {
          id: 'change_image',
          icon: Camera,
          label: 'Cambiar imagen',
          description: 'Actualizar foto de la comunidad',
          type: 'action',
          onPress: () => Alert.alert('Próximamente', 'Función de cambio de imagen próximamente'),
          requiresAdmin: true,
        },
      ],
    },

    // Estadísticas
    {
      id: 'stats',
      title: 'Estadísticas',
      icon: Zap,
      items: [
        {
          id: 'member_count',
          icon: Users,
          label: 'Miembros totales',
          type: 'info',
          badge: memberCount.toString(),
          badgeColor: '#2673f3',
        },
        {
          id: 'active_members',
          icon: CheckCircle,
          label: 'Miembros activos',
          description: 'Últimos 15 minutos',
          type: 'info',
          badge: activeMembers.toString(),
          badgeColor: '#10b981',
        },
        {
          id: 'total_posts',
          icon: FileText,
          label: 'Posts publicados',
          type: 'info',
          badge: totalPosts.toString(),
          badgeColor: '#8b5cf6',
        },
        {
          id: 'category',
          icon: Tag,
          label: 'Categoría',
          type: 'info',
          badge: community?.category || 'Sin categoría',
          badgeColor: '#f59e0b',
        },
      ],
    },

    // Privacidad
    {
      id: 'privacy',
      title: 'Privacidad y acceso',
      description: 'Controla quién puede ver y unirse',
      icon: Lock,
      items: [
        {
          id: 'is_private',
          icon: Lock,
          label: 'Comunidad privada',
          description: 'Solo miembros pueden ver el contenido',
          type: 'toggle',
          value: settings?.is_private || false,
          settingKey: 'is_private',
          requiresAdmin: true,
        },
        {
          id: 'require_approval',
          icon: Shield,
          label: 'Requerir aprobación',
          description: 'Aprobar nuevos miembros manualmente',
          type: 'toggle',
          value: settings?.require_approval || false,
          settingKey: 'require_approval',
          requiresAdmin: true,
        },
        {
          id: 'show_member_count',
          icon: Users,
          label: 'Mostrar cantidad de miembros',
          type: 'toggle',
          value: settings?.show_member_count !== false,
          settingKey: 'show_member_count',
          requiresAdmin: true,
        },
        {
          id: 'show_member_list',
          icon: Eye,
          label: 'Mostrar lista de miembros',
          type: 'toggle',
          value: settings?.show_member_list !== false,
          settingKey: 'show_member_list',
          requiresAdmin: true,
        },
      ],
    },

    // Permisos
    {
      id: 'permissions',
      title: 'Permisos de miembros',
      description: 'Define qué pueden hacer los miembros',
      icon: Shield,
      items: [
        {
          id: 'allow_member_posts',
          icon: FileText,
          label: 'Permitir publicaciones',
          description: 'Los miembros pueden crear posts',
          type: 'toggle',
          value: settings?.allow_member_posts !== false,
          settingKey: 'allow_member_posts',
          requiresAdmin: true,
        },
        {
          id: 'allow_member_invites',
          icon: UserPlus,
          label: 'Permitir invitaciones',
          description: 'Los miembros pueden invitar a otros',
          type: 'toggle',
          value: settings?.allow_member_invites !== false,
          settingKey: 'allow_member_invites',
          requiresAdmin: true,
        },
        {
          id: 'allow_comments',
          icon: MessageSquare,
          label: 'Permitir comentarios',
          type: 'toggle',
          value: settings?.allow_comments !== false,
          settingKey: 'allow_comments',
          requiresAdmin: true,
        },
        {
          id: 'allow_reactions',
          icon: Heart,
          label: 'Permitir reacciones',
          type: 'toggle',
          value: settings?.allow_reactions !== false,
          settingKey: 'allow_reactions',
          requiresAdmin: true,
        },
      ],
    },

    // Notificaciones
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Configura las notificaciones',
      icon: Bell,
      items: [
        {
          id: 'enable_notifications',
          icon: Bell,
          label: 'Activar notificaciones',
          type: 'toggle',
          value: settings?.enable_notifications !== false,
          settingKey: 'enable_notifications',
          requiresAdmin: true,
        },
        {
          id: 'notify_new_members',
          icon: UserPlus,
          label: 'Notificar nuevos miembros',
          type: 'toggle',
          value: settings?.notify_new_members !== false,
          settingKey: 'notify_new_members',
          requiresAdmin: true,
        },
        {
          id: 'notify_new_posts',
          icon: FileText,
          label: 'Notificar nuevos posts',
          type: 'toggle',
          value: settings?.notify_new_posts !== false,
          settingKey: 'notify_new_posts',
          requiresAdmin: true,
        },
        {
          id: 'notify_new_comments',
          icon: MessageSquare,
          label: 'Notificar nuevos comentarios',
          type: 'toggle',
          value: settings?.notify_new_comments || false,
          settingKey: 'notify_new_comments',
          requiresAdmin: true,
        },
      ],
    },

    // Moderación
    {
      id: 'moderation',
      title: 'Moderación',
      description: 'Herramientas de moderación y seguridad',
      icon: Shield,
      items: [
        {
          id: 'auto_moderate',
          icon: Zap,
          label: 'Moderación automática',
          description: 'Filtrado automático de contenido',
          type: 'toggle',
          value: settings?.auto_moderate || false,
          settingKey: 'auto_moderate',
          requiresAdmin: true,
        },
        {
          id: 'profanity_filter',
          icon: AlertCircle,
          label: 'Filtro de lenguaje ofensivo',
          type: 'toggle',
          value: settings?.profanity_filter !== false,
          settingKey: 'profanity_filter',
          requiresAdmin: true,
        },
        {
          id: 'spam_filter',
          icon: Ban,
          label: 'Filtro de spam',
          type: 'toggle',
          value: settings?.spam_filter !== false,
          settingKey: 'spam_filter',
          requiresAdmin: true,
        },
      ],
    },

    // Gestión
    {
      id: 'management',
      title: 'Gestión',
      icon: Settings,
      items: [
        {
          id: 'members',
          icon: Users,
          label: 'Gestionar miembros',
          description: `${memberCount} miembros`,
          type: 'navigation',
          onPress: () => navigation.navigate('CommunityMembers', { communityId, communityName }),
          requiresAdmin: true,
        },
        {
          id: 'pending_requests',
          icon: UserPlus,
          label: 'Solicitudes pendientes',
          description: `${pendingRequests} pendientes`,
          type: 'navigation',
          onPress: () => Alert.alert('Próximamente', 'Pantalla de solicitudes próximamente'),
          requiresAdmin: true,
          badge: pendingRequests > 0 ? pendingRequests.toString() : undefined,
          badgeColor: '#ef4444',
        },
        {
          id: 'moderators',
          icon: Crown,
          label: 'Moderadores',
          description: 'Gestionar moderadores',
          type: 'navigation',
          onPress: () => Alert.alert('Próximamente', 'Pantalla de moderadores próximamente'),
          requiresAdmin: true,
        },
        {
          id: 'blocked_users',
          icon: Ban,
          label: 'Usuarios bloqueados',
          type: 'navigation',
          onPress: () => Alert.alert('Próximamente', 'Pantalla de bloqueados próximamente'),
          requiresAdmin: true,
        },
        {
          id: 'reports',
          icon: AlertCircle,
          label: 'Reportes',
          description: 'Ver reportes de contenido',
          type: 'navigation',
          onPress: () => Alert.alert('Próximamente', 'Pantalla de reportes próximamente'),
          requiresAdmin: true,
        },
      ],
    },
  ]

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSettingItem = (item: SettingItem) => {
    // Check permissions
    if (item.requiresOwner && !isOwner) return null
    if (item.requiresAdmin && !isAdmin) return null

    const isDisabled = !settings || saving

    switch (item.type) {
      case 'toggle':
        return (
          <View key={item.id} style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <item.icon size={20} color="#2673f3" />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemLabel}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.settingItemDescription}>{item.description}</Text>
                )}
              </View>
            </View>
            <Switch
              value={item.value as boolean}
              onValueChange={() =>
                item.settingKey && updateSetting(item.settingKey, !(item.value as boolean))
              }
              disabled={isDisabled}
              trackColor={{ false: '#e5e5e5', true: '#2673f3' }}
              thumbColor={item.value ? '#fff' : '#f4f4f4'}
              ios_backgroundColor="#e5e5e5"
            />
          </View>
        )

      case 'navigation':
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.settingItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <item.icon size={20} color="#2673f3" />
              </View>
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemLabel}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.settingItemDescription}>{item.description}</Text>
                )}
              </View>
            </View>
            <View style={styles.settingItemRight}>
              {item.badge && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: item.badgeColor || '#2673f3' },
                  ]}
                >
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <ChevronRight size={20} color="#999" />
            </View>
          </TouchableOpacity>
        )

      case 'info':
        return (
          <View key={item.id} style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <item.icon size={20} color="#666" />
              </View>
              <Text style={styles.settingItemLabel}>{item.label}</Text>
            </View>
            {item.badge && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: item.badgeColor || '#f0f0f0' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: item.badgeColor ? '#fff' : '#666' },
                  ]}
                >
                  {item.badge}
                </Text>
              </View>
            )}
          </View>
        )

      case 'action':
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.settingItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={styles.iconContainer}>
                <item.icon size={20} color={item.destructive ? '#ef4444' : '#2673f3'} />
              </View>
              <View style={styles.settingItemContent}>
                <Text
                  style={[
                    styles.settingItemLabel,
                    item.destructive && { color: '#ef4444' },
                  ]}
                >
                  {item.label}
                </Text>
                {item.description && (
                  <Text style={styles.settingItemDescription}>{item.description}</Text>
                )}
              </View>
            </View>
            <ChevronRight size={20} color={item.destructive ? '#ef4444' : '#999'} />
          </TouchableOpacity>
        )

      default:
        return null
    }
  }

  // ============================================================================
  // RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configuración</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando configuración...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Configuración</Text>
          {communityName && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {communityName}
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {saving && <ActivityIndicator size="small" color="#2673f3" />}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2673f3']}
            tintColor="#2673f3"
          />
        }
      >
        {/* Community Header Card */}
        {community && (
          <View style={styles.communityCard}>
            <Image
              source={{
                uri:
                  community.image_url ||
                  community.icono_url ||
                  community.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    community.name || community.nombre
                  )}&background=2673f3&color=fff&size=200`,
              }}
              style={styles.communityImage}
            />
            <View style={styles.communityInfo}>
              <View style={styles.communityTitleRow}>
                <Text style={styles.communityName}>
                  {community.name || community.nombre}
                </Text>
                {community.is_verified && <Check size={20} color="#2673f3" />}
              </View>
              <Text style={styles.communityDescription} numberOfLines={3}>
                {community.description || community.descripcion}
              </Text>
              <View style={styles.communityMeta}>
                <View style={styles.metaItem}>
                  <Users size={14} color="#666" />
                  <Text style={styles.metaText}>{memberCount} miembros</Text>
                </View>
                {community.category && (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <View style={styles.metaItem}>
                      <Tag size={14} color="#666" />
                      <Text style={styles.metaText}>{community.category}</Text>
                    </View>
                  </>
                )}
                {community.location && (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <View style={styles.metaItem}>
                      <MapPin size={14} color="#666" />
                      <Text style={styles.metaText}>{community.location}</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Role Badge */}
              <View style={styles.roleBadgeContainer}>
                {userRole === 'owner' && (
                  <View style={[styles.roleBadge, { backgroundColor: '#FFF3E0' }]}>
                    <Star size={12} color="#FF6B00" fill="#FF6B00" />
                    <Text style={[styles.roleBadgeText, { color: '#FF6B00' }]}>OWNER</Text>
                  </View>
                )}
                {userRole === 'admin' && (
                  <View style={[styles.roleBadge, { backgroundColor: '#FFFBEA' }]}>
                    <Crown size={12} color="#FFD700" />
                    <Text style={[styles.roleBadgeText, { color: '#FFD700' }]}>ADMIN</Text>
                  </View>
                )}
                {userRole === 'moderator' && (
                  <View style={[styles.roleBadge, { backgroundColor: '#EBF4FF' }]}>
                    <Shield size={12} color="#2673f3" />
                    <Text style={[styles.roleBadgeText, { color: '#2673f3' }]}>MODERATOR</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Edit Mode */}
        {editMode && isAdmin && (
          <View style={styles.editSection}>
            <Text style={styles.editTitle}>✏️ Editar información</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Nombre de la comunidad"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Descripción de la comunidad"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoría</Text>
              <TextInput
                style={styles.input}
                value={editedCategory}
                onChangeText={setEditedCategory}
                placeholder="Ej: Tecnología, Negocios, Finanzas"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ubicación</Text>
              <TextInput
                style={styles.input}
                value={editedLocation}
                onChangeText={setEditedLocation}
                placeholder="Ej: Managua, Nicaragua"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => {
                  setEditMode(false)
                  // Reset values
                  setEditedName(community?.name || community?.nombre || '')
                  setEditedDescription(community?.description || community?.descripcion || '')
                  setEditedCategory(community?.category || '')
                  setEditedLocation(community?.location || '')
                }}
              >
                <X size={18} color="#666" />
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={updateCommunityInfo}
                disabled={saving || !editedName.trim()}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Save size={18} color="white" />
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (item.requiresOwner && !isOwner) return false
            if (item.requiresAdmin && !isAdmin) return false
            return true
          })

          if (visibleItems.length === 0) return null

          return (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  {section.icon && <section.icon size={16} color="#666" />}
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                {section.description && (
                  <Text style={styles.sectionDescription}>{section.description}</Text>
                )}
              </View>
              {visibleItems.map((item) => renderSettingItem(item))}
            </View>
          )
        })}

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <View style={styles.dangerHeader}>
            <AlertCircle size={18} color="#ef4444" />
            <Text style={styles.dangerTitle}>Zona peligrosa</Text>
          </View>

          {userRole !== 'owner' && (
            <TouchableOpacity style={styles.dangerButton} onPress={leaveCommunity}>
              <UserMinus size={20} color="#ef4444" />
              <View style={styles.dangerButtonContent}>
                <Text style={styles.dangerButtonText}>Abandonar comunidad</Text>
                <Text style={styles.dangerButtonDescription}>
                  Dejarás de ser miembro de esta comunidad
                </Text>
              </View>
              <ChevronRight size={20} color="#ef4444" />
            </TouchableOpacity>
          )}

          {isOwner && (
            <TouchableOpacity style={styles.dangerButton} onPress={deleteCommunity}>
              <Trash2 size={20} color="#ef4444" />
              <View style={styles.dangerButtonContent}>
                <Text style={styles.dangerButtonText}>Eliminar comunidad</Text>
                <Text style={styles.dangerButtonDescription}>
                  Esta acción es irreversible
                </Text>
              </View>
              <ChevronRight size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ============================================================================
// ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    width: 32,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  communityCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  communityImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginBottom: 16,
    alignSelf: 'center',
    backgroundColor: '#e5e5e5',
  },
  communityInfo: {
    alignItems: 'center',
  },
  communityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  communityName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  communityDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  communityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  metaDot: {
    fontSize: 12,
    color: '#ccc',
  },
  roleBadgeContainer: {
    marginTop: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  editSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#111',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#2673f3',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemLabel: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  settingItemDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  dangerSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#fee2e2',
  },
  dangerButtonContent: {
    flex: 1,
  },
  dangerButtonText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '600',
  },
  dangerButtonDescription: {
    fontSize: 13,
    color: '#f87171',
    marginTop: 2,
  },
  footer: {
    height: 40,
  },
})

export default CommunitySettingsScreen