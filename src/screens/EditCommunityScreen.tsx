// ============================================================================
// EditCommunityScreen.tsx - Editar Comunidad
// ============================================================================
// 100% Backend Driven + UI Profesional Moderna
// Accesible desde: CommunityDetailScreen, CommunitySettingsScreen
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
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native'
import type { RootStackParamList } from '../types/navigation'
import {
  ArrowLeft,
  Camera,
  Save,
  X,
  Tag,
  MapPin,
  FileText,
  Trash2,
  AlertCircle,
} from 'lucide-react-native'
import { request } from '../rest/client'
import { getCurrentUser } from '../rest/api'
import * as ImagePicker from 'expo-image-picker'

// ============================================================================
// INTERFACES
// ============================================================================

interface Community {
  id: string
  name: string
  nombre: string
  description: string
  descripcion: string
  category: string
  location?: string
  type: 'public' | 'private' | 'invite_only'
  image_url?: string
  icono_url?: string
  avatar_url?: string
  created_by: string
  member_count?: number
  is_verified?: boolean
}

const CATEGORIES = [
  'Finanzas',
  'Inversiones',
  'Tecnología',
  'Educación',
  'Negocios',
  'Emprendimiento',
  'Criptomonedas',
  'Bienes Raíces',
  'General',
]

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function EditCommunityScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute()
  const { communityId } = route.params as { communityId: string }

  // Estados
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [community, setCommunity] = useState<Community | null>(null)
  const [userRole, setUserRole] = useState<string>('member')

  // Formulario
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Finanzas')
  const [location, setLocation] = useState('')
  const [imageUri, setImageUri] = useState<string | null>(null)

  // Datos originales para detectar cambios
  const [originalData, setOriginalData] = useState<any>(null)

  // ============================================================================
  // CARGAR DATOS
  // ============================================================================

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [user, communityData] = await Promise.all([
        getCurrentUser(),
        fetchCommunity(),
      ])

      setCurrentUser(user)

      if (communityData) {
        // Verificar rol del usuario
        const role = await fetchUserRole(user?.id, communityData.id)
        setUserRole(role)

        // Si no es admin u owner, no puede editar
        if (role !== 'owner' && role !== 'admin') {
          Alert.alert(
            'Acceso denegado',
            'No tienes permisos para editar esta comunidad',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          )
          return
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      Alert.alert('Error', 'No se pudo cargar la comunidad')
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
        
        // Setear valores del formulario
        const communityName = data.name || data.nombre
        const communityDesc = data.description || data.descripcion
        
        setName(communityName)
        setDescription(communityDesc)
        setCategory(data.category || 'Finanzas')
        setLocation(data.location || '')
        setImageUri(data.image_url || data.icono_url || data.avatar_url || null)

        // Guardar datos originales
        setOriginalData({
          name: communityName,
          description: communityDesc,
          category: data.category || 'Finanzas',
          location: data.location || '',
        })

        return data
      }
      return null
    } catch (error) {
      console.error('Error fetching community:', error)
      return null
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
  // GUARDAR CAMBIOS
  // ============================================================================

  const hasChanges = () => {
    if (!originalData) return false
    
    return (
      name.trim() !== originalData.name ||
      description.trim() !== originalData.description ||
      category !== originalData.category ||
      location.trim() !== originalData.location
    )
  }

  const handleSave = async () => {
    // Validaciones
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido')
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

    try {
      setSaving(true)

      await request('PATCH', '/communities', {
        params: { id: `eq.${communityId}` },
        body: {
          name: name.trim(),
          nombre: name.trim(),
          descripcion: description.trim(),
          category: category,
          updated_at: new Date().toISOString(),
        },
      })

      Alert.alert('✅ Guardado', 'Los cambios se guardaron correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      console.error('Error saving changes:', error)
      Alert.alert('Error', 'No se pudieron guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  // ============================================================================
  // ELIMINAR COMUNIDAD
  // ============================================================================

  const handleDelete = () => {
    if (userRole !== 'owner') {
      Alert.alert('Permiso denegado', 'Solo el propietario puede eliminar la comunidad')
      return
    }

    Alert.alert(
      '⚠️ Eliminar comunidad',
      `¿Estás seguro de que deseas eliminar "${name}"?\n\nEsta acción es irreversible. Se eliminarán todos los posts, miembros y datos.`,
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

              Alert.alert('Comunidad eliminada', 'La comunidad ha sido eliminada', [
                { text: 'OK', onPress: () => navigation.navigate('Communities') },
              ])
            } catch (error) {
              console.error('Error deleting community:', error)
              Alert.alert('Error', 'No se pudo eliminar la comunidad')
            }
          },
        },
      ]
    )
  }

  // ============================================================================
  // RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Comunidad</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (hasChanges()) {
              Alert.alert(
                'Cambios sin guardar',
                '¿Deseas descartar los cambios?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() },
                ]
              )
            } else {
              navigation.goBack()
            }
          }}
          disabled={saving}
        >
          <X size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Comunidad</Text>
        <TouchableOpacity
          style={styles.saveHeaderButton}
          onPress={handleSave}
          disabled={!hasChanges() || saving}
        >
          <Text
            style={[
              styles.saveHeaderText,
              (!hasChanges() || saving) && styles.saveHeaderTextDisabled,
            ]}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Imagen */}
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={pickImage}
            disabled={saving}
          >
            <Image
              source={{
                uri:
                  imageUri ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    name
                  )}&background=2673f3&color=fff&size=400`,
              }}
              style={styles.communityImage}
            />
            <View style={styles.imageOverlay}>
              <Camera size={32} color="#fff" />
              <Text style={styles.imageOverlayText}>Cambiar imagen</Text>
            </View>
          </TouchableOpacity>

          {/* Información básica */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información básica</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Nombre <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nombre de la comunidad"
                placeholderTextColor="#999"
                maxLength={50}
                editable={!saving}
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
                placeholder="Describe tu comunidad..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
                editable={!saving}
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
                  placeholder="Ej: Santiago, Chile"
                  placeholderTextColor="#999"
                  maxLength={100}
                  editable={!saving}
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
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                  disabled={saving}
                >
                  <Tag size={16} color={category === cat ? '#2673f3' : '#666'} />
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Botón Guardar */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!hasChanges() || saving) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!hasChanges() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Save size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Zona peligrosa */}
          {userRole === 'owner' && (
            <View style={styles.dangerSection}>
              <View style={styles.dangerHeader}>
                <AlertCircle size={18} color="#ef4444" />
                <Text style={styles.dangerTitle}>Zona peligrosa</Text>
              </View>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleDelete}
                disabled={saving}
              >
                <Trash2 size={20} color="#ef4444" />
                <View style={styles.dangerButtonContent}>
                  <Text style={styles.dangerButtonText}>Eliminar comunidad</Text>
                  <Text style={styles.dangerButtonDescription}>
                    Esta acción es irreversible
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
  },
  saveHeaderButton: {
    padding: 4,
  },
  saveHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2673f3',
  },
  saveHeaderTextDisabled: {
    color: '#ccc',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  communityImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e5e5',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  required: {
    color: '#ef4444',
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
    backgroundColor: '#EBF4FF',
    borderColor: '#2673f3',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#2673f3',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2673f3',
    paddingVertical: 16,
    borderRadius: 12,
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
  saveButtonDisabled: {
    backgroundColor: '#a0c4ff',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  dangerButtonContent: {
    flex: 1,
  },
  dangerButtonText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 2,
  },
  dangerButtonDescription: {
    fontSize: 13,
    color: '#f87171',
  },
})