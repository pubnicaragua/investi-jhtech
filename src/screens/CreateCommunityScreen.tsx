import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, Camera, Check, Users, ChevronRight, Monitor, DollarSign, Rocket, Trophy, Palette, Music, Microscope, GraduationCap, Heart, Map, Lock, Unlock, School } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabase'
import { supabaseUrl, supabaseAnonKey } from '../supabase'
import { getCurrentUserId, getUserConversations, getSuggestedPeople } from '../rest/api'

interface User {
  id: string
  nombre: string
  avatar_url: string
  username?: string
}

const INTERESTS = [
  'Tecnología',
  'Finanzas',
  'Emprendimiento',
  'Deportes',
  'Arte',
  'Música',
  'Ciencia',
  'Educación',
  'Salud',
  'Viajes',
]

// 🎯 ICONOS LUCIDE - Mapeo por interés
const INTEREST_ICON_COMPONENTS: Record<string, any> = {
  'Tecnología': Monitor,
  'Finanzas': DollarSign,
  'Emprendimiento': Rocket,
  'Deportes': Trophy,
  'Arte': Palette,
  'Música': Music,
  'Ciencia': Microscope,
  'Educación': GraduationCap,
  'Salud': Heart,
  'Viajes': Map,
}

const INTEREST_ICON_COLORS: Record<string, string> = {
  'Tecnología': '#EF4444',
  'Finanzas': '#F59E0B',
  'Emprendimiento': '#3B82F6',
  'Deportes': '#10B981',
  'Arte': '#8B5CF6',
  'Música': '#EC4899',
  'Ciencia': '#06B6D4',
  'Educación': '#6366F1',
  'Salud': '#F97316',
  'Viajes': '#84CC16',
}

const PRIVACY_OPTIONS = [
  { 
    label: 'Comunidad Pública', 
    value: 'public', 
    icon: 'unlock',
    description: 'Cualquiera puede unirse. Ideal para grupos abiertos de educación financiera, inversiones, etc.',
    emoji: '🌍'
  },
  { 
    label: 'Comunidad Privada', 
    value: 'private', 
    icon: 'lock',
    description: 'Solo por invitación y aceptación. Para grupos cerrados con miembros seleccionados.',
    emoji: '🔒'
  },
  { 
    label: 'Comunidad de Colegio', 
    value: 'school', 
    icon: 'school',
    description: 'Siempre cerrada, solo con invitación. Incluye metas de ahorro grupales para giras de estudios.',
    emoji: '🎓'
  },
]

export default function CreateCommunityScreen({ navigation }: any) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [formData, setFormData] = useState({
    photo: null as string | null,
    name: '',
    description: '',
    interests: [] as string[],
    privacy: 'public' as string,
    invitedMembers: [] as string[],
  })
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [showAllUsers, setShowAllUsers] = useState(false)

  const scrollViewRef = useRef<ScrollView>(null)
  const nameInputRef = useRef<TextInput>(null)
  const descriptionInputRef = useRef<TextInput>(null)

  useEffect(() => {
    loadSuggestedUsers()

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height)
    })

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0)
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const loadSuggestedUsers = async () => {
    try {
      const uid = await getCurrentUserId()
      if (!uid) return

      // Get existing conversation participants
      const convs: any[] = await getUserConversations(uid)
      const participants: User[] = []
      convs.forEach(c => {
        (c.participants || []).forEach((p: any) => {
          if (p && p.id !== uid && !participants.find(u => u.id === p.id)) {
            participants.push({
              id: p.id,
              nombre: p.nombre || p.full_name || p.username || 'Usuario',
              avatar_url: p.avatar_url || p.photo_url || '',
              username: p.username || '',
            })
          }
        })
      })

      // Get suggested people
      try {
        const recs: any[] = await getSuggestedPeople(uid, 20)
        const normalizedRecs = (recs || []).map((u: any) => ({
          id: u.id,
          nombre: u.nombre || u.name || u.full_name || u.username || 'Usuario',
          avatar_url: u.avatar_url || u.avatar || u.photo_url || '',
          username: u.username || '',
        }))

        const combined = [...participants]
        normalizedRecs.forEach((r: any) => {
          if (r.id && r.id !== uid && !combined.find((c: any) => c.id === r.id)) {
            combined.push(r)
          }
        })

        setSuggestedUsers(combined.length > 0 ? combined : participants)
      } catch (e) {
        console.error('Error fetching suggested people:', e)
        setSuggestedUsers(participants)
      }
    } catch (err) {
      console.error('Error loading users for community creation:', err)
      setSuggestedUsers([])
    }
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar una foto')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, photo: result.assets[0].uri }))
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la comunidad')
      return
    }

    if (formData.interests.length === 0) {
      Alert.alert('Error', 'Por favor selecciona al menos un interés')
      return
    }

    if (!user) {
      Alert.alert('Error', 'Usuario no encontrado')
      return
    }

    setLoading(true)
    try {
      let photoUrl = null
      if (formData.photo) {
          // Convert URI to blob with several fallbacks (fetch -> XHR -> expo-file-system base64)
          const uriToBlob = (uri: string) => new Promise<Blob>((resolve, reject) => {
            try {
              const xhr = new XMLHttpRequest()
              xhr.onload = function () {
                const blob = xhr.response
                resolve(blob)
              }
              xhr.onerror = function (e) {
                reject(new Error('Network request failed while reading file URI'))
              }
              xhr.responseType = 'blob'
              xhr.open('GET', uri, true)
              xhr.send(null)
            } catch (err) {
              reject(err)
            }
          })

          // Helper: decode base64 string to Uint8Array
          const base64ToUint8Array = (base64: string) => {
            // Remove any data URI prefix if present
            const cleaned = base64.replace(/^data:[^;]+;base64,/, '')
            const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
            const len = cleaned.length
            const bufferLength = cleaned.length * 3 / 4
            const bytes = new Uint8Array(Math.floor(bufferLength))
            let p = 0
            let i = 0
            while (i < len) {
              const enc1 = lookup.indexOf(cleaned.charAt(i++))
              const enc2 = lookup.indexOf(cleaned.charAt(i++))
              const enc3 = lookup.indexOf(cleaned.charAt(i++))
              const enc4 = lookup.indexOf(cleaned.charAt(i++))
              const chr1 = (enc1 << 2) | (enc2 >> 4)
              const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
              const chr3 = ((enc3 & 3) << 6) | enc4
              bytes[p++] = chr1
              if (enc3 !== 64 && !Number.isNaN(enc3)) bytes[p++] = chr2
              if (enc4 !== 64 && !Number.isNaN(enc4)) bytes[p++] = chr3
            }
            return bytes.subarray(0, p)
          }

          let fileBody: any = null
          try {
            // Try fetch first (works on web). If it fails, XHR fallback will run.
            const resp = await fetch(formData.photo)
            const blob = await resp.blob()
            fileBody = blob
          } catch (err) {
            console.warn('[CreateCommunity] fetch->blob failed, trying XHR fallback:', err)
            try {
              const blob = await uriToBlob(formData.photo)
              fileBody = blob
            } catch (xhrErr) {
              console.warn('[CreateCommunity] XHR fallback failed, trying expo-file-system base64 fallback:', xhrErr)
              try {
                const base64 = await FileSystem.readAsStringAsync(formData.photo, { encoding: FileSystem.EncodingType.Base64 })
                const uint8 = base64ToUint8Array(base64)
                fileBody = uint8
              } catch (fsErr) {
                console.error('[CreateCommunity] all file conversion fallbacks failed:', fsErr)
                throw fsErr
              }
            }
          }

          const fileName = `community-${Date.now()}.jpg`
          console.log('[CreateCommunity] uploading file to bucket community-media as', fileName)
          let uploadError: any = null
          try {
            const { data: uploadData, error } = await supabase.storage
              .from('community-media')
              .upload(fileName, fileBody, { contentType: 'image/jpeg' })
            uploadError = error
          } catch (e) {
            uploadError = e
          }

          // If upload via supabase client failed due to network/storage, try manual PUT to Storage REST
          if (uploadError) {
            try {
              const manualResult = await (async () => {
                // Build storage URL: {supabaseUrl}/storage/v1/object/{bucket}/{path}
                const url = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/community-media/${encodeURIComponent(fileName)}`
                // Prefer using the user's access token so the storage row is created under their auth (avoids RLS violations)
                let authToken = supabaseAnonKey
                try {
                  const sessionRes = await supabase.auth.getSession()
                  const session = sessionRes?.data?.session
                  if (session?.access_token) authToken = session.access_token
                } catch (tokenErr) {
                  console.warn('[CreateCommunity] could not read session token, falling back to anon key')
                }

                return await new Promise<{ ok: boolean; status: number; responseText: string }>((resolve, reject) => {
                  const xhr = new XMLHttpRequest()
                  xhr.open('PUT', url)
                  xhr.setRequestHeader('Authorization', `Bearer ${authToken}`)
                  xhr.setRequestHeader('x-upsert', 'true')
                  xhr.setRequestHeader('Content-Type', 'image/jpeg')
                  xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                      if (xhr.status >= 200 && xhr.status < 300) {
                        resolve({ ok: true, status: xhr.status, responseText: xhr.responseText })
                      } else {
                        reject(new Error(`Manual upload failed: ${xhr.status} ${xhr.responseText}`))
                      }
                    }
                  }
                  try {
                    xhr.send(fileBody)
                  } catch (sendErr) {
                    reject(sendErr)
                  }
                })
              })()

              console.log('[CreateCommunity] manual PUT upload succeeded:', manualResult.status)
            } catch (manualErr) {
              console.error('[CreateCommunity] manual PUT upload also failed:', manualErr)
              throw uploadError
            }
          }

          photoUrl = supabase.storage.from('community-media').getPublicUrl(fileName).data.publicUrl
      }

      // Compute initial member count: creator + invited members
      const initialMemberCount = 1 + (formData.invitedMembers ? formData.invitedMembers.length : 0)

      const { data, error } = await supabase
        .from('communities')
        .insert({
          nombre:formData.name.trim(),
          name: formData.name.trim(),
          descripcion: formData.description.trim(),
          created_by: user.id,
          icono_url: photoUrl,
          image_url: photoUrl,
          category: formData.interests.join(', '),
          member_count: initialMemberCount,
          tipo: formData.privacy,
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as admin member
      // Use an authenticated PostgREST request with the user's access token to satisfy RLS policies
      const sessionRes = await supabase.auth.getSession()
      const session = sessionRes?.data?.session
      if (!session || !session.access_token) {
        throw new Error('No active session found — must be signed in to create a community')
      }

      const insertMember = async (rows: any[]) => {
        const resp = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/community_members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: supabaseAnonKey,
            Prefer: 'return=representation'
          },
          body: JSON.stringify(rows)
        })

        if (!resp.ok) {
          const text = await resp.text().catch(() => '')
          throw new Error(`PostgREST insert failed: ${resp.status} ${text}`)
        }

        return resp.json()
      }

      try {
        await insertMember([{ community_id: data.id, user_id: user.id, role: 'admin' }])
      } catch (memberErr) {
        throw memberErr
      }

      // If there are invited members, create invited rows in community_members
      if (formData.invitedMembers && formData.invitedMembers.length > 0) {
        try {
          // Instead of inserting other users directly into community_members (which is blocked by RLS),
          // create community_invitations entries so the invited users can accept/join themselves.
          const invitations = formData.invitedMembers.map((uid) => ({
            community_id: data.id,
            from_user_id: user.id,
            to_user_id: uid,
            status: 'pending'
          }))

          const insertInvitations = async (rows: any[]) => {
            const resp = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/community_invitations`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
                apikey: supabaseAnonKey,
                Prefer: 'return=representation'
              },
              body: JSON.stringify(rows)
            })

            if (!resp.ok) {
              const text = await resp.text().catch(() => '')
              throw new Error(`PostgREST insert invitations failed: ${resp.status} ${text}`)
            }

            return resp.json()
          }

          try {
            await insertInvitations(invitations)
          } catch (inviteErr) {
            console.warn('[CreateCommunity] invited members insert error:', inviteErr)
          }
        } catch (e) {
          console.warn('[CreateCommunity] failed to insert invited members:', e)
        }
      }

      Alert.alert('¡Éxito!', 'Comunidad creada exitosamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (error: any) {
      console.error('Error creating community:', error)
      Alert.alert('Error', error.message || 'No se pudo crear la comunidad')
    } finally {
      setLoading(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const toggleMemberInvite = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      invitedMembers: prev.invitedMembers.includes(userId)
        ? prev.invitedMembers.filter(id => id !== userId)
        : [...prev.invitedMembers, userId]
    }))
  }

  const canCreate = () => {
    return formData.name.trim().length > 0 && formData.interests.length > 0
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Comunidad</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
        {/* Foto de la comunidad */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Foto de la comunidad</Text>
          <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
            {formData.photo ? (
              <Image source={{ uri: formData.photo }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Camera size={100} color="#9CA3AF" />
                <Text style={styles.photoPlaceholderText}>Seleccionar foto</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Nombre de la comunidad */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Nombre de la comunidad</Text>
          <TextInput
            ref={nameInputRef}
            style={styles.input}
            placeholder="Ej: Emprendedores Tech"
            placeholderTextColor="#9CA3AF"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            onFocus={() => {
              setTimeout(() => {
                nameInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  scrollViewRef.current?.scrollTo({ y: pageY - keyboardHeight - 100, animated: true })
                })
              }, 100)
            }}
            onSubmitEditing={Keyboard.dismiss}
            blurOnSubmit={false}
            maxLength={100}
          />
        </View>

        {/* Descripción */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Descripción</Text>
          <TextInput
            ref={descriptionInputRef}
            style={[styles.input, styles.textArea]}
            placeholder="Describe de qué trata tu comunidad..."
            placeholderTextColor="#9CA3AF"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            onFocus={() => {
              setTimeout(() => {
                descriptionInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  scrollViewRef.current?.scrollTo({ y: pageY - keyboardHeight - 100, animated: true })
                })
              }, 100)
            }}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        {/* Intereses */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Intereses</Text>
          <Text style={styles.stepSubtitle}>Selecciona los intereses de tu comunidad</Text>
          <View style={styles.interestsContainer}>
            {INTERESTS.map((interest) => {
              const IconComponent = INTEREST_ICON_COMPONENTS[interest]
              const iconColor = INTEREST_ICON_COLORS[interest] || '#2673f3'
              const isSelected = formData.interests.includes(interest)

              return (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestChip,
                    isSelected && styles.interestChipSelected
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <View style={[styles.iconContainer, isSelected && { backgroundColor: iconColor + '20' }]}>
                    {IconComponent && <IconComponent size={20} color={isSelected ? iconColor : '#6B7280'} />}
                  </View>
                  <Text style={[
                    styles.interestText,
                    isSelected && styles.interestTextSelected
                  ]}>
                    {interest}
                  </Text>
                  {isSelected && (
                    <Check size={16} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Tipo de privacidad */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Tipo de Comunidad</Text>
          <Text style={styles.stepSubtitle}>Selecciona el tipo de comunidad que deseas crear</Text>
          {PRIVACY_OPTIONS.map((option) => {
            const IconComponent = option.icon === 'unlock' ? Unlock : option.icon === 'lock' ? Lock : School;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.privacyOption,
                  formData.privacy === option.value && styles.privacyOptionSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, privacy: option.value }))}
              >
                <View style={styles.privacyIconContainer}>
                  <IconComponent size={24} color={formData.privacy === option.value ? '#3B82F6' : '#6B7280'} />
                </View>
                <View style={styles.privacyContent}>
                  <Text style={styles.privacyLabel}>
                    {option.emoji} {option.label}
                  </Text>
                  <Text style={styles.privacyDescription}>{option.description}</Text>
                </View>
                {formData.privacy === option.value && (
                  <Check size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Invitar miembros */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Invitar miembros</Text>
          <Text style={styles.stepSubtitle}>Selecciona personas para invitar a tu comunidad</Text>
          <FlatList
            data={showAllUsers ? suggestedUsers : suggestedUsers.slice(0, 4)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => toggleMemberInvite(item.id)}
              >
                <Image source={{ uri: item.avatar_url || 'https://i.pravatar.cc/100' }} style={styles.userAvatar} />
                <View style={styles.suggestedUserInfo}>
                  <Text style={styles.userName}>{item.nombre?.trim() || item.username?.trim() || 'Usuario'}</Text>
                  {item.username?.trim() && <Text style={styles.userUsername}>@{item.username}</Text>}
                </View>
                {formData.invitedMembers.includes(item.id) && (
                  <Check size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            )}
            style={styles.usersList}
            scrollEnabled={false}
            ListFooterComponent={
              suggestedUsers.length > 4 ? (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllUsers(!showAllUsers)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.showMoreText}>
                    {showAllUsers ? 'Mostrar menos' : `Mostrar todos (${suggestedUsers.length})`}
                  </Text>
                  <ChevronRight size={16} color="#3B82F6" style={showAllUsers ? styles.rotatedIcon : {}} />
                </TouchableOpacity>
              ) : null
            }
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, (!canCreate() || loading) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!canCreate() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Crear Comunidad</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  currentUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  currentUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  currentUserSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  createButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginTop: 32,
    padding: 16,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  interestChipSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  interestText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  interestTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  privacyOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  privacyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  privacyContent: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userUsername: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  suggestedUserInfo: {
    flex: 1,
    flexDirection: 'column',
    color: '#6B7280',
  },
  usersList: {
    maxHeight: 300,
  },
  reviewPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 8,
  },
  rotatedIcon: {
    transform: [{ rotate: '90deg' }],
  },
})
