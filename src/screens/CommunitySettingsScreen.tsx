// ============================================================================
// COMMUNITY SETTINGS SCREEN - 100% Backend Driven + UI Profesional
// Accesible desde: CommunityDetailScreen (menú ...)
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
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
  Image as ImageIcon,
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
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';

// ============================================================================
// INTERFACES
// ============================================================================

interface CommunitySettings {
  community_id: string;
  is_private: boolean;
  require_approval: boolean;
  allow_member_posts: boolean;
  allow_member_invites: boolean;
  allow_comments: boolean;
  allow_reactions: boolean;
  show_member_count: boolean;
  show_member_list: boolean;
  enable_notifications: boolean;
  notify_new_members: boolean;
  notify_new_posts: boolean;
  notify_new_comments: boolean;
  auto_moderate: boolean;
  profanity_filter: boolean;
  spam_filter: boolean;
  max_post_length: number;
  max_comment_length: number;
  created_at?: string;
  updated_at?: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  category: string;
  location?: string;
  created_by: string;
  member_count?: number;
  is_verified?: boolean;
  created_at: string;
}

interface CommunityMember {
  user_id: string;
  community_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joined_at: string;
  user?: {
    id: string;
    name: string;
    username: string;
    photo_url?: string;
  };
}

interface SettingSection {
  id: string;
  title: string;
  description?: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  icon: any;
  label: string;
  description?: string;
  type: 'toggle' | 'navigation' | 'action' | 'info' | 'number';
  value?: boolean | string | number;
  settingKey?: keyof CommunitySettings;
  onPress?: () => void;
  destructive?: boolean;
  requiresOwner?: boolean;
  requiresAdmin?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CommunitySettingsScreen({ route, navigation }: any) {
  const { communityId } = route.params;
  const { user } = useAuth();

  // ============================================================================
  // STATE
  // ============================================================================
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [community, setCommunity] = useState<Community | null>(null);
  const [settings, setSettings] = useState<CommunitySettings | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedLocation, setEditedLocation] = useState('');

  // ============================================================================
  // FETCH DATA FROM BACKEND
  // ============================================================================

  const fetchCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();

      if (error) throw error;
      setCommunity(data);
      setEditedName(data.name);
      setEditedDescription(data.description || '');
      setEditedCategory(data.category || '');
      setEditedLocation(data.location || '');
    } catch (error) {
      console.error('Error fetching community:', error);
      Alert.alert('Error', 'No se pudo cargar la comunidad');
    }
  };

  const fetchCommunitySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('community_settings')
        .select('*')
        .eq('community_id', communityId)
        .single();

      if (error) {
        // If settings don't exist, create default ones
        if (error.code === 'PGRST116') {
          await createDefaultSettings();
          return;
        }
        throw error;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error fetching community settings:', error);
    }
  };

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
      };

      const { data, error } = await supabase
        .from('community_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };

  const fetchUserRole = async () => {
    try {
      console.log('🔍 Fetching role for user:', user?.id, 'in community:', communityId);
      
      const { data, error } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('❌ Error fetching user role:', error);
        // Si no encuentra el registro, el usuario no es miembro
        setUserRole('member');
        return;
      }

      console.log('✅ User role fetched:', data.role);
      setUserRole(data.role);
    } catch (error) {
      console.error('❌ Exception fetching user role:', error);
      setUserRole('member');
    }
  };

  const fetchMemberCount = async () => {
    try {
      const { count, error } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId);

      if (error) throw error;
      setMemberCount(count || 0);
    } catch (error) {
      console.error('Error fetching member count:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const { count, error } = await supabase
        .from('community_join_requests')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', communityId)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingRequests(count || 0);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchCommunity(),
      fetchCommunitySettings(),
      fetchUserRole(),
      fetchMemberCount(),
      fetchPendingRequests(),
    ]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', onRefresh);
    onRefresh();
    return unsubscribe;
  }, [navigation, communityId, user?.id]);

  // ============================================================================
  // UPDATE FUNCTIONS
  // ============================================================================
  const updateSetting = async (
    key: keyof CommunitySettings,
    value: boolean | string | number
  ) => {
    try {
      if (!settings) return;

      setSaving(true);

      const { error } = await supabase
        .from('community_settings')
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq('community_id', communityId);

      if (error) throw error;

      setSettings({ ...settings, [key]: value });
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'No se pudo actualizar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const updateCommunityInfo = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('communities')
        .update({
          name: editedName,
          description: editedDescription,
          category: editedCategory,
          location: editedLocation,
          updated_at: new Date().toISOString(),
        })
        .eq('id', communityId);

      if (error) throw error;

      await fetchCommunity();
      setEditMode(false);
      Alert.alert('Éxito', 'Información actualizada correctamente');
    } catch (error) {
      console.error('Error updating community info:', error);
      Alert.alert('Error', 'No se pudo actualizar la información');
    } finally {
      setSaving(false);
    }
  };

  const deleteCommunity = async () => {
    Alert.alert(
      'Eliminar comunidad',
      '⚠️ Esta acción es irreversible. Se eliminarán todos los posts, miembros y datos de la comunidad.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('communities')
                .delete()
                .eq('id', communityId);

              if (error) throw error;

              Alert.alert('Comunidad eliminada', 'La comunidad ha sido eliminada exitosamente');
              navigation.navigate('Communities');
            } catch (error) {
              console.error('Error deleting community:', error);
              Alert.alert('Error', 'No se pudo eliminar la comunidad');
            }
          },
        },
      ]
    );
  };

  const leaveCommunity = async () => {
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
              const { error } = await supabase
                .from('community_members')
                .delete()
                .eq('community_id', communityId)
                .eq('user_id', user?.id);

              if (error) throw error;

              Alert.alert('Has abandonado la comunidad');
              navigation.navigate('Communities');
            } catch (error) {
              console.error('Error leaving community:', error);
              Alert.alert('Error', 'No se pudo abandonar la comunidad');
            }
          },
        },
      ]
    );
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleToggleSetting = (
    key: keyof CommunitySettings,
    currentValue: boolean
  ) => {
    updateSetting(key, !currentValue);
  };

  const handleNavigateToMembers = () => {
    navigation.navigate('CommunityMembers', { communityId });
  };

  const handleNavigateToPendingRequests = () => {
    navigation.navigate('PendingRequests', { communityId });
  };

  const handleNavigateToModerators = () => {
    navigation.navigate('CommunityModerators', { communityId });
  };

  const handleNavigateToBlockedUsers = () => {
    navigation.navigate('BlockedUsers', { communityId });
  };

  const handleNavigateToReports = () => {
    navigation.navigate('CommunityReports', { communityId });
  };

  const handleChangeImage = () => {
    Alert.alert('Cambiar imagen', 'Funcionalidad de cambio de imagen próximamente');
  };

  // ============================================================================
  // PERMISSION CHECKS
  // ============================================================================

  const isOwner = userRole === 'admin'; // En DB solo existe 'admin', no 'owner'
  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator' || isAdmin;

  // ============================================================================
  // SETTINGS SECTIONS (BACKEND DRIVEN)
  // ============================================================================

  const settingsSections: SettingSection[] = [
    // Community Info Section
    {
      id: 'info',
      title: 'Información de la comunidad',
      items: [
        {
          id: 'edit_info',
          icon: Edit3,
          label: 'Editar información',
          type: 'action',
          onPress: () => setEditMode(!editMode),
          requiresAdmin: true,
        },
        {
          id: 'change_image',
          icon: Camera,
          label: 'Cambiar imagen',
          type: 'action',
          onPress: handleChangeImage,
          requiresAdmin: true,
        },
        {
          id: 'member_count',
          icon: Users,
          label: `${memberCount} miembros`,
          type: 'info',
        },
        {
          id: 'category',
          icon: Tag,
          label: community?.category || 'Sin categoría',
          type: 'info',
        },
      ],
    },

    // Privacy & Access Section
    {
      id: 'privacy',
      title: 'Privacidad y acceso',
      description: 'Controla quién puede ver y unirse a la comunidad',
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
          description: 'Los administradores deben aprobar nuevos miembros',
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
          value: settings?.show_member_count || false,
          settingKey: 'show_member_count',
          requiresAdmin: true,
        },
        {
          id: 'show_member_list',
          icon: Eye,
          label: 'Mostrar lista de miembros',
          type: 'toggle',
          value: settings?.show_member_list || false,
          settingKey: 'show_member_list',
          requiresAdmin: true,
        },
      ],
    },

    // Member Permissions Section
    {
      id: 'permissions',
      title: 'Permisos de miembros',
      description: 'Define qué pueden hacer los miembros',
      items: [
        {
          id: 'allow_member_posts',
          icon: FileText,
          label: 'Permitir publicaciones de miembros',
          description: 'Los miembros pueden crear posts',
          type: 'toggle',
          value: settings?.allow_member_posts || false,
          settingKey: 'allow_member_posts',
          requiresAdmin: true,
        },
        {
          id: 'allow_member_invites',
          icon: UserPlus,
          label: 'Permitir invitaciones',
          description: 'Los miembros pueden invitar a otros',
          type: 'toggle',
          value: settings?.allow_member_invites || false,
          settingKey: 'allow_member_invites',
          requiresAdmin: true,
        },
        {
          id: 'allow_comments',
          icon: FileText,
          label: 'Permitir comentarios',
          type: 'toggle',
          value: settings?.allow_comments || false,
          settingKey: 'allow_comments',
          requiresAdmin: true,
        },
        {
          id: 'allow_reactions',
          icon: Star,
          label: 'Permitir reacciones',
          type: 'toggle',
          value: settings?.allow_reactions || false,
          settingKey: 'allow_reactions',
          requiresAdmin: true,
        },
      ],
    },

    // Notifications Section
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Configura las notificaciones de la comunidad',
      items: [
        {
          id: 'enable_notifications',
          icon: Bell,
          label: 'Activar notificaciones',
          type: 'toggle',
          value: settings?.enable_notifications || false,
          settingKey: 'enable_notifications',
          requiresAdmin: true,
        },
        {
          id: 'notify_new_members',
          icon: UserPlus,
          label: 'Notificar nuevos miembros',
          type: 'toggle',
          value: settings?.notify_new_members || false,
          settingKey: 'notify_new_members',
          requiresAdmin: true,
        },
        {
          id: 'notify_new_posts',
          icon: FileText,
          label: 'Notificar nuevos posts',
          type: 'toggle',
          value: settings?.notify_new_posts || false,
          settingKey: 'notify_new_posts',
          requiresAdmin: true,
        },
        {
          id: 'notify_new_comments',
          icon: FileText,
          label: 'Notificar nuevos comentarios',
          type: 'toggle',
          value: settings?.notify_new_comments || false,
          settingKey: 'notify_new_comments',
          requiresAdmin: true,
        },
      ],
    },

    // Moderation Section
    {
      id: 'moderation',
      title: 'Moderación',
      description: 'Herramientas de moderación y seguridad',
      items: [
        {
          id: 'auto_moderate',
          icon: Shield,
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
          value: settings?.profanity_filter || false,
          settingKey: 'profanity_filter',
          requiresAdmin: true,
        },
        {
          id: 'spam_filter',
          icon: Shield,
          label: 'Filtro de spam',
          type: 'toggle',
          value: settings?.spam_filter || false,
          settingKey: 'spam_filter',
          requiresAdmin: true,
        },
      ],
    },

    // Management Section
    {
      id: 'management',
      title: 'Gestión',
      items: [
        {
          id: 'members',
          icon: Users,
          label: 'Gestionar miembros',
          description: `${memberCount} miembros`,
          type: 'navigation',
          onPress: handleNavigateToMembers,
          requiresAdmin: true,
        },
        {
          id: 'pending_requests',
          icon: UserPlus,
          label: 'Solicitudes pendientes',
          description: `${pendingRequests} pendientes`,
          type: 'navigation',
          onPress: handleNavigateToPendingRequests,
          requiresAdmin: true,
        },
        {
          id: 'moderators',
          icon: Crown,
          label: 'Moderadores',
          type: 'navigation',
          onPress: handleNavigateToModerators,
          requiresAdmin: true,
        },
        {
          id: 'blocked_users',
          icon: UserMinus,
          label: 'Usuarios bloqueados',
          type: 'navigation',
          onPress: handleNavigateToBlockedUsers,
          requiresAdmin: true,
        },
        {
          id: 'reports',
          icon: AlertCircle,
          label: 'Reportes',
          type: 'navigation',
          onPress: handleNavigateToReports,
          requiresAdmin: true,
        },
      ],
    },
  ];

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSettingItem = (item: SettingItem) => {
    // Check permissions
    if (item.requiresOwner && !isOwner) return null;
    if (item.requiresAdmin && !isAdmin) return null;

    const isDisabled = !settings || saving;

    switch (item.type) {
      case 'toggle':
        return (
          <View key={item.id} style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <item.icon size={22} color="#374151" />
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemLabel}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.settingItemDescription}>
                    {item.description}
                  </Text>
                )}
              </View>
            </View>
            <Switch
              value={item.value as boolean}
              onValueChange={() =>
                item.settingKey &&
                handleToggleSetting(item.settingKey, item.value as boolean)
              }
              disabled={isDisabled}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={item.value ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        );

      case 'navigation':
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.settingItem}
            onPress={item.onPress}
          >
            <View style={styles.settingItemLeft}>
              <item.icon size={22} color="#374151" />
              <View style={styles.settingItemContent}>
                <Text style={styles.settingItemLabel}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.settingItemDescription}>
                    {item.description}
                  </Text>
                )}
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        );

      case 'info':
        return (
          <View key={item.id} style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <item.icon size={22} color="#374151" />
              <Text style={styles.settingItemLabel}>{item.label}</Text>
            </View>
          </View>
        );

      case 'action':
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.settingItem}
            onPress={item.onPress}
          >
            <View style={styles.settingItemLeft}>
              <item.icon
                size={22}
                color={item.destructive ? '#EF4444' : '#374151'}
              />
              <Text
                style={[
                  styles.settingItemLabel,
                  item.destructive && { color: '#EF4444' },
                ]}
              >
                {item.label}
              </Text>
            </View>
            <ChevronRight
              size={20}
              color={item.destructive ? '#EF4444' : '#9CA3AF'}
            />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Cargando configuración...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.headerRight}>
          {saving && <ActivityIndicator size="small" color="#10B981" />}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Community Header Card */}
        {community && (
          <View style={styles.communityCard}>
            <Image
              source={{
                uri: community.image_url || 'https://via.placeholder.com/100',
              }}
              style={styles.communityImage}
            />
            <View style={styles.communityInfo}>
              <View style={styles.communityTitleRow}>
                <Text style={styles.communityName}>{community.name}</Text>
                {community.is_verified && (
                  <Check size={18} color="#10B981" />
                )}
              </View>
              <Text style={styles.communityDescription} numberOfLines={2}>
                {community.description}
              </Text>
              <View style={styles.communityMeta}>
                <View style={styles.metaItem}>
                  <Users size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{memberCount} miembros</Text>
                </View>
                {community.category && (
                  <View style={styles.metaItem}>
                    <Tag size={14} color="#6B7280" />
                    <Text style={styles.metaText}>{community.category}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Edit Mode */}
        {editMode && isAdmin && (
          <View style={styles.editSection}>
            <Text style={styles.editTitle}>Editar información</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Nombre de la comunidad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Descripción de la comunidad"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoría</Text>
              <TextInput
                style={styles.input}
                value={editedCategory}
                onChangeText={setEditedCategory}
                placeholder="Ej: Tecnología, Negocios, etc."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ubicación</Text>
              <TextInput
                style={styles.input}
                value={editedLocation}
                onChangeText={setEditedLocation}
                placeholder="Ej: Managua, Nicaragua"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => setEditMode(false)}
              >
                <X size={18} color="#6B7280" />
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={updateCommunityInfo}
                disabled={saving}
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
            if (item.requiresOwner && !isOwner) return false;
            if (item.requiresAdmin && !isAdmin) return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.description && (
                  <Text style={styles.sectionDescription}>
                    {section.description}
                  </Text>
                )}
              </View>
              {visibleItems.map((item) => renderSettingItem(item))}
            </View>
          );
        })}

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Zona peligrosa</Text>

          {!isOwner && (
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={leaveCommunity}
            >
              <UserMinus size={20} color="#EF4444" />
              <Text style={styles.dangerButtonText}>Abandonar comunidad</Text>
            </TouchableOpacity>
          )}

          {isOwner && (
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={deleteCommunity}
            >
              <Trash2 size={20} color="#EF4444" />
              <Text style={styles.dangerButtonText}>Eliminar comunidad</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Role Badge */}
        <View style={styles.roleSection}>
          <Text style={styles.roleText}>
            Tu rol: <Text style={styles.roleBadge}>{userRole?.toUpperCase() || 'MEMBER'}</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  communityCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  communityImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'center',
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
    color: '#111827',
  },
  communityDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  communityMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  editSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 8,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
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
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    paddingVertical: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  settingItemDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  dangerSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  roleSection: {
    padding: 20,
    alignItems: 'center',
  },
  roleText: {
    fontSize: 14,
    color: '#6B7280',
  },
  roleBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
});

export default CommunitySettingsScreen;