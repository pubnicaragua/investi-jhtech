// ============================================================================
// CreateCommunityScreen.tsx - Crear Nueva Comunidad
// ============================================================================
// 100% Backend Driven + UI Profesional Moderna
// Accesible desde: CommunitiesScreen, HomeScreen
// ============================================================================

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import type { RootStackParamList } from '../types/navigation'
import {
  ArrowLeft,
  Camera,
  Users,
  Lock,
  Globe,
  Shield,
  Check,
  X,
  Info,
  Tag,
  FileText,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react-native'
import { request } from '../rest/client'
import { getCurrentUser } from '../rest/api'
import * as ImagePicker from 'expo-image-picker'

// ============================================================================
// INTERFACES
// ============================================================================

interface Category {
  id: string
  name: string
  icon: any
  color: string
}

interface PrivacyType {
  id: 'public' | 'private' | 'invite_only'
  name: string
  description: string
  icon: any
  color: string
}

interface SuggestedUser {
  id: string
  nombre: string
  full_name: string
  username: string
  avatar_url?: string
  photo_url?: string
}

// ============================================================================
// CONSTANTES
// ============================================================================

const CATEGORIES: Category[] = [
  { id: 'Finanzas', name: 'Finanzas', icon: Tag, color: '#10b981' },
  { id: 'Inversiones', name: 'Inversiones', icon: Tag, color: '#3b82f6' },
  { id: 'Tecnología', name: 'Tecnología', icon: Tag, color: '#8b5cf6' },
  { id: 'Educación', name: 'Educación', icon: Tag, color: '#f59e0b' },
  { id: 'Negocios', name: 'Negocios', icon: Tag, color: '#ef4444' },
  { id: 'Emprendimiento', name: 'Emprendimiento', icon: Tag, color: '#ec4899' },
  { id: 'Criptomonedas', name: 'Criptomonedas', icon: Tag, color: '#f97316' },
  { id: 'Bienes Raíces', name: 'Bienes Raíces', icon: Tag, color: '#14b8a6' },
  { id: 'General', name: 'General', icon: Tag, color: '#6b7280' },
]

const PRIVACY_TYPES: PrivacyType[] = [
  {
    id: 'public',
    name: 'Pública',
    description: 'Cualquiera puede unirse',
    icon: Globe,
    color: '#10b981',
  },
  {
    id: 'private',
    name: 'Privada',
    description: 'Solo por invitación',
    icon: Lock,
    color: '#f59e0b',
  },
  {
    id: 'invite_only',
    name: 'Solo invitación',
    description: 'Requiere aprobación',
    icon: Shield,
    color: '#ef4444',
  },
]

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CreateCommunityScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  // Estados básicos
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Datos del formulario
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Finanzas')
  const [location, setLocation] = useState('')
  const [type, setType] = useState<'public' | 'private' | 'invite_only'>('public')
  const [imageUri, setImageUri] = useState<string | null>(null)

  // Configuración adicional
  const [requireApproval, setRequireApproval] = useState(false)
  const [allowMemberPosts, setAllowMemberPosts] = useState(true)

  // Miembros sugeridos
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // ============================================================================
  // CARGAR DATOS
  // ============================================================================

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)

      // Cargar usuarios sugeridos
      await loadSuggestedUsers(user?.id)
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const loadSuggestedUsers = async (userId: string) => {
    try {
      setLoadingSuggestions(true)

      // Obtener usuarios que sigues
      const followingResponse = await request('GET', '/user_follows', {
        params: {
          select: 'followed:users!user_follows_followed_id_fkey(id,nombre,full_name,username,photo_url,avatar_url)',
          follower_id: `eq.${userId}`,
        },
      })

      const users = followingResponse?.map((f: any) => f.followed).filter(Boolean) || []
      setSuggestedUsers(users.slice(0, 10))
    } catch (error) {
      console.error('Error loading suggested users:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // ============================================================================
  // MANEJO DE IMAGEN
  // ============================================================================

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos permiso para acceder a tus fotos'
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'No se pudo seleccionar la imagen')
    }
  }

  // ============================================================================
  // CREAR COMUNIDAD
  // ============================================================================

  const handleCreate = async () => {
    // Validaciones
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de la comunidad es requerido')
      return
    }

    if (name.trim().length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres')
      return
    }

    if (!description.trim()) {
      Alert.alert('Error', 'La descripción es requerida')
      return
    }

    if (description.trim().length < 10) {
      Alert.alert('Error', 'La descripción debe tener al menos 10 caracteres')
      return
    }

    try {
      setLoading(true)

      // 1. Crear la comunidad
      const communityData = {
        name: name.trim(),
        nombre: name.trim(),
        description: description.trim(),
        descripcion: description.trim(),
        category: category,
        type: type,
        location: location.trim() || null,
        created_by: currentUser?.id,
        member_count: 1,
        is_verified: false,
      }

      const communityResponse = await request('POST', '/communities', {
        body: communityData,
      })

      if (!communityResponse || communityResponse.length === 0) {
        throw new Error('No se pudo crear la comunidad')
      }

      const newCommunity = communityResponse[0]

      // 2. Agregar al creador como owner
      await request('POST', '/user_communities', {
        body: {
          user_id: currentUser?.id,
          community_id: newCommunity.id,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString(),
        },
      })

      // 3. Crear configuración por defecto
      await request('POST', '/community_settings', {
        body: {
          community_id: newCommunity.id,
          is_private: type !== 'public',
          require_approval: requireApproval || type === 'invite_only',
          allow_member_posts: allowMemberPosts,
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
        },
      })

      // 4. Invitar miembros seleccionados
      if (selectedMembers.length > 0) {
        const invitations = selectedMembers.map((memberId) => ({
          user_id: memberId,
          community_id: newCommunity.id,
          role: 'member',
          status: 'active',
          joined_at: new Date().toISOString(),
        }))

        await request('POST', '/user_communities', {
          body: invitations,
        })
      }

      Alert.alert(
        '✅ Comunidad creada',
        `"${name}" ha sido creada exitosamente`,
        [
          {
            text: 'Ver comunidad',
            onPress: () => {
              navigation.navigate('CommunityDetail', {
                communityId: newCommunity.id,
                communityName: name,
              })
            },
          },
        ]
      )
    } catch (error) {
      console.error('Error creating community:', error)
      Alert.alert('Error', 'No se pudo crear la comunidad. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // VALIDACIÓN
  // ============================================================================

  const isFormValid = () => {
    return (
      name.trim().length >= 3 &&
      description.trim().length >= 10 &&
      category &&
      !loading
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Crear Comunidad</Text>
          <Text style={styles.headerSubtitle}>Comparte tus intereses</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Imagen */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Imagen de la comunidad</Text>
            <TouchableOpacity
              style={styles.imageUploadContainer}
              onPress={pickImage}
              disabled={loading}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Camera size={32} color="#999" />
                  <Text style={styles.imagePlaceholderText}>Subir imagen</Text>
                  <Text style={styles.imagePlaceholderSubtext}>Opcional</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información básica</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Nombre de la comunidad <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Inversores Principiantes"
                placeholderTextColor="#999"
                maxLength={50}
                editable={!loading}
              />
              <Text style={styles.inputHelper}>{name.length}/50 caracteres</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Descripción <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe el propósito de tu comunidad..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
                editable={!loading}
              />
              <Text style={styles.inputHelper}>
                {description.length}/500 caracteres
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ubicación (opcional)</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color="#666" />
                <TextInput
                  style={styles.inputWithIconText}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Ej: Managua, Nicaragua"
                  placeholderTextColor="#999"
                  maxLength={100}
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          {/* Categoría */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Categoría <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    category === cat.id && styles.categoryChipActive,
                    category === cat.id && { borderColor: cat.color },
                  ]}
                  onPress={() => setCategory(cat.id)}
                  disabled={loading}
                >
                  <Tag
                    size={16}
                    color={category === cat.id ? cat.color : '#666'}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat.id && { color: cat.color },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Privacidad */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Tipo de privacidad <Text style={styles.required}>*</Text>
            </Text>
            {PRIVACY_TYPES.map((privacyType) => (
              <TouchableOpacity
                key={privacyType.id}
                style={[
                  styles.privacyCard,
                  type === privacyType.id && styles.privacyCardActive,
                  type === privacyType.id && {
                    borderColor: privacyType.color,
                    backgroundColor: `${privacyType.color}10`,
                  },
                ]}
                onPress={() => setType(privacyType.id)}
                disabled={loading}
              >
                <View style={styles.privacyCardLeft}>
                  <View
                    style={[
                      styles.privacyIconContainer,
                      { backgroundColor: `${privacyType.color}20` },
                    ]}
                  >
                    <privacyType.icon size={24} color={privacyType.color} />
                  </View>
                  <View style={styles.privacyCardContent}>
                    <Text style={styles.privacyCardTitle}>
                      {privacyType.name}
                    </Text>
                    <Text style={styles.privacyCardDescription}>
                      {privacyType.description}
                    </Text>
                  </View>
                </View>
                {type === privacyType.id && (
                  <Check size={24} color={privacyType.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Configuración adicional */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuración adicional</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Shield size={20} color="#666" />
                <View style={styles.settingRowContent}>
                  <Text style={styles.settingRowTitle}>Requerir aprobación</Text>
                  <Text style={styles.settingRowDescription}>
                    Aprobar nuevos miembros manualmente
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  requireApproval && styles.toggleActive,
                ]}
                onPress={() => setRequireApproval(!requireApproval)}
                disabled={loading}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    requireApproval && styles.toggleCircleActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <FileText size={20} color="#666" />
                <View style={styles.settingRowContent}>
                  <Text style={styles.settingRowTitle}>
                    Permitir publicaciones
                  </Text>
                  <Text style={styles.settingRowDescription}>
                    Los miembros pueden crear posts
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  allowMemberPosts && styles.toggleActive,
                ]}
                onPress={() => setAllowMemberPosts(!allowMemberPosts)}
                disabled={loading}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    allowMemberPosts && styles.toggleCircleActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Invitar miembros */}
          {suggestedUsers.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Invitar miembros</Text>
                <Text style={styles.sectionSubtitle}>
                  {selectedMembers.length} seleccionados
                </Text>
              </View>

              {loadingSuggestions ? (
                <ActivityIndicator size="small" color="#2673f3" />
              ) : (
                <View style={styles.suggestedUsersContainer}>
                  {suggestedUsers.map((user) => {
                    const isSelected = selectedMembers.includes(user.id)
                    return (
                      <TouchableOpacity
                        key={user.id}
                        style={styles.userCard}
                        onPress={() => {
                          setSelectedMembers((prev) =>
                            prev.includes(user.id)
                              ? prev.filter((id) => id !== user.id)
                              : [...prev, user.id]
                          )
                        }}
                        disabled={loading}
                      >
                        <Image
                          source={{
                            uri:
                              user.avatar_url ||
                              user.photo_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.full_name || user.nombre || user.username
                              )}&background=2673f3&color=fff`,
                          }}
                          style={styles.userAvatar}
                        />
                        <View style={styles.userInfo}>
                          <Text style={styles.userName} numberOfLines={1}>
                            {user.full_name || user.nombre}
                          </Text>
                          {user.username && (
                            <Text style={styles.userUsername} numberOfLines={1}>
                              @{user.username}
                            </Text>
                          )}
                        </View>
                        <View
                          style={[
                            styles.userCheckbox,
                            isSelected && styles.userCheckboxActive,
                          ]}
                        >
                          {isSelected && <Check size={16} color="#fff" />}
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}
            </View>
          )}

          {/* Botón crear */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.createButton,
                !isFormValid() && styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              disabled={!isFormValid()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Check size={20} color="#fff" />
                  <Text style={styles.createButtonText}>Crear Comunidad</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Al crear una comunidad, aceptas nuestras políticas de uso
            </Text>
          </View>

          {/* Spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  required: {
    color: '#ef4444',
  },
  imageUploadContainer: {
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  uploadedImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e5e5',
  },
  inputGroup: {
    marginBottom: 20,
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
  inputHelper: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    padding: 0,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#fff',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    marginBottom: 12,
  },
  privacyCardActive: {
    borderWidth: 2,
  },
  privacyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  privacyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyCardContent: {
    flex: 1,
  },
  privacyCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  privacyCardDescription: {
    fontSize: 13,
    color: '#666',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingRowContent: {
    flex: 1,
  },
  settingRowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111',
    marginBottom: 2,
  },
  settingRowDescription: {
    fontSize: 13,
    color: '#666',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e5e5e5',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#2673f3',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  suggestedUsersContainer: {
    gap: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5e5e5',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 13,
    color: '#666',
  },
  userCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCheckboxActive: {
    backgroundColor: '#2673f3',
    borderColor: '#2673f3',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2673f3',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#2673f3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  createButtonDisabled: {
    backgroundColor: '#a0c4ff',
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
})