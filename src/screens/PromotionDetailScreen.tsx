// ============================================================================
// PromotionDetailScreen.tsx - Detalle de Promoción
// ============================================================================
// 100% Backend Driven + UI Ultra Profesional
// Accesible desde: PromotionsScreen, HomeFeedScreen
// ============================================================================

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  Share as RNShare,
  RefreshControl,
} from 'react-native'
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native'
import type { RootStackParamList } from '../types/navigation'
import {
  ArrowLeft,
  Share2,
  MapPin,
  Clock,
  Tag,
  Calendar,
  Info,
  Phone,
  Mail,
  Globe,
  Check,
  Gift,
  AlertCircle,
  TrendingUp,
  Users,
  Bookmark,
  ExternalLink,
} from 'lucide-react-native'
import { request } from '../rest/client'
import { getCurrentUser } from '../rest/api'

// ============================================================================
// INTERFACES
// ============================================================================

interface Promotion {
  id: string
  title: string
  description: string
  category: string
  discount: string
  image_url: string
  valid_until: string
  location: string
  terms: string
  active: boolean
  created_at: string
  claims_count?: number
  has_claimed?: boolean
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function PromotionDetailScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const route = useRoute()
  const { promotionId } = route.params as { promotionId: string }

  // Estados
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [claiming, setClaiming] = useState(false)
  const [saving, setSaving] = useState(false)

  // ============================================================================
  // CARGAR DATOS
  // ============================================================================

  useEffect(() => {
    loadData()
  }, [promotionId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [user, promotionData] = await Promise.all([
        getCurrentUser(),
        fetchPromotion(),
      ])
      setCurrentUser(user)
    } catch (error) {
      console.error('Error loading data:', error)
      Alert.alert('Error', 'No se pudo cargar la promoción')
    } finally {
      setLoading(false)
    }
  }

  const fetchPromotion = async () => {
    try {
      const response = await request('GET', '/promotions', {
        params: {
          select: '*',
          id: `eq.${promotionId}`,
        },
      })

      if (response && response.length > 0) {
        const promotionData = response[0]

        // Contar reclamos
        const claimsResponse = await request('GET', '/promotion_claims', {
          params: {
            select: 'id',
            promotion_id: `eq.${promotionId}`,
          },
        })
        promotionData.claims_count = claimsResponse?.length || 0

        // Verificar si el usuario actual ya reclamó
        const user = await getCurrentUser()
        if (user) {
          const userClaimResponse = await request('GET', '/promotion_claims', {
            params: {
              select: 'id',
              promotion_id: `eq.${promotionId}`,
              user_id: `eq.${user.id}`,
            },
          })
          promotionData.has_claimed = userClaimResponse && userClaimResponse.length > 0
        }

        setPromotion(promotionData)
        return promotionData
      }
      return null
    } catch (error) {
      console.error('Error fetching promotion:', error)
      return null
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  // ============================================================================
  // ACCIONES
  // ============================================================================

  const handleClaim = async () => {
    if (!promotion || !currentUser || claiming) return

    if (promotion.has_claimed) {
      Alert.alert('Ya reclamaste esta promoción', 'Solo puedes reclamar una vez')
      return
    }

    // Verificar si está activa
    if (!promotion.active) {
      Alert.alert('Promoción no disponible', 'Esta promoción ya no está activa')
      return
    }

    // Verificar fecha de vencimiento
    const validUntil = new Date(promotion.valid_until)
    const now = new Date()
    if (validUntil < now) {
      Alert.alert('Promoción vencida', 'Esta promoción ya expiró')
      return
    }

    Alert.alert(
      'Reclamar promoción',
      `¿Deseas reclamar "${promotion.title}"?\n\n${promotion.discount}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reclamar',
          onPress: async () => {
            try {
              setClaiming(true)

              await request('POST', '/promotion_claims', {
                body: {
                  promotion_id: promotionId,
                  user_id: currentUser.id,
                  status: 'claimed',
                },
              })

              setPromotion({
                ...promotion,
                has_claimed: true,
                claims_count: (promotion.claims_count || 0) + 1,
              })

              Alert.alert(
                '✅ Promoción reclamada',
                'La promoción ha sido agregada a tu cuenta. Revisa los términos y condiciones para usarla.',
                [{ text: 'OK' }]
              )
            } catch (error) {
              console.error('Error claiming promotion:', error)
              Alert.alert('Error', 'No se pudo reclamar la promoción')
            } finally {
              setClaiming(false)
            }
          },
        },
      ]
    )
  }

  const handleShare = async () => {
    if (!promotion) return

    try {
      await RNShare.share({
        message: `🎁 ${promotion.title}\n\n${promotion.discount}\n\n${promotion.description}\n\nVálido hasta: ${formatDate(promotion.valid_until)}\n\n- Compartido desde Investi`,
        title: promotion.title,
      })
    } catch (error) {
      console.error('Error sharing promotion:', error)
    }
  }

  const handleContact = (type: 'phone' | 'email' | 'website', value: string) => {
    try {
      switch (type) {
        case 'phone':
          Linking.openURL(`tel:${value}`)
          break
        case 'email':
          Linking.openURL(`mailto:${value}`)
          break
        case 'website':
          Linking.openURL(value)
          break
      }
    } catch (error) {
      console.error('Error opening link:', error)
      Alert.alert('Error', 'No se pudo abrir el enlace')
    }
  }

  // ============================================================================
  // FORMATEAR FECHA
  // ============================================================================

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const getDaysRemaining = (dateString: string) => {
    const validUntil = new Date(dateString)
    const now = new Date()
    const diffTime = validUntil.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // ============================================================================
  // RENDER LOADING
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Promoción</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando promoción...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!promotion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Promoción</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Gift size={64} color="#ccc" />
          <Text style={styles.emptyText}>Promoción no encontrada</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.emptyButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const daysRemaining = getDaysRemaining(promotion.valid_until)
  const isExpired = daysRemaining < 0
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining >= 0

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promoción</Text>
        <TouchableOpacity onPress={handleShare}>
          <Share2 size={24} color="#111" />
        </TouchableOpacity>
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
        {/* Imagen */}
        <Image
          source={{
            uri:
              promotion.image_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                promotion.title
              )}&background=2673f3&color=fff&size=600`,
          }}
          style={styles.promotionImage}
        />

        {/* Badge de descuento */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{promotion.discount}</Text>
        </View>

        {/* Contenido principal */}
        <View style={styles.contentCard}>
          {/* Título y categoría */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{promotion.title}</Text>
            <View style={styles.categoryBadge}>
              <Tag size={14} color="#2673f3" />
              <Text style={styles.categoryText}>{promotion.category}</Text>
            </View>
          </View>

          {/* Estado */}
          {promotion.has_claimed && (
            <View style={styles.claimedBadge}>
              <Check size={16} color="#10b981" />
              <Text style={styles.claimedText}>Ya reclamaste esta promoción</Text>
            </View>
          )}

          {isExpired && (
            <View style={[styles.claimedBadge, { backgroundColor: '#fee2e2' }]}>
              <AlertCircle size={16} color="#ef4444" />
              <Text style={[styles.claimedText, { color: '#ef4444' }]}>
                Promoción vencida
              </Text>
            </View>
          )}

          {isExpiringSoon && !isExpired && (
            <View style={[styles.claimedBadge, { backgroundColor: '#fef3c7' }]}>
              <Clock size={16} color="#f59e0b" />
              <Text style={[styles.claimedText, { color: '#f59e0b' }]}>
                Vence pronto - {daysRemaining} días restantes
              </Text>
            </View>
          )}

          {/* Descripción */}
          <Text style={styles.description}>{promotion.description}</Text>

          {/* Información */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Calendar size={20} color="#2673f3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Válido hasta</Text>
                <Text style={styles.infoValue}>{formatDate(promotion.valid_until)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <MapPin size={20} color="#2673f3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ubicación</Text>
                <Text style={styles.infoValue}>{promotion.location}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Users size={20} color="#2673f3" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Personas que reclamaron</Text>
                <Text style={styles.infoValue}>
                  {promotion.claims_count || 0} personas
                </Text>
              </View>
            </View>
          </View>

          {/* Términos y condiciones */}
          {promotion.terms && (
            <View style={styles.termsSection}>
              <View style={styles.termsTitleRow}>
                <Info size={20} color="#666" />
                <Text style={styles.termsTitle}>Términos y condiciones</Text>
              </View>
              <Text style={styles.termsText}>{promotion.terms}</Text>
            </View>
          )}

          {/* Botón de reclamar */}
          <TouchableOpacity
            style={[
              styles.claimButton,
              (promotion.has_claimed || isExpired || !promotion.active || claiming) &&
                styles.claimButtonDisabled,
            ]}
            onPress={handleClaim}
            disabled={
              promotion.has_claimed || isExpired || !promotion.active || claiming
            }
          >
            {claiming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Gift size={22} color="#fff" />
                <Text style={styles.claimButtonText}>
                  {promotion.has_claimed
                    ? 'Ya reclamaste esta promoción'
                    : isExpired
                    ? 'Promoción vencida'
                    : !promotion.active
                    ? 'Promoción no disponible'
                    : 'Reclamar promoción'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Información de contacto (ejemplo) */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>¿Necesitas más información?</Text>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('phone', '+505 8888-9999')}
              >
                <Phone size={18} color="#2673f3" />
                <Text style={styles.contactButtonText}>Llamar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('email', 'info@investi.com')}
              >
                <Mail size={18} color="#2673f3" />
                <Text style={styles.contactButtonText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('website', 'https://investi.com')}
              >
                <Globe size={18} color="#2673f3" />
                <Text style={styles.contactButtonText}>Web</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ============================================================================
// ESTILOS - UI ULTRA PROFESIONAL
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2673f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  promotionImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e5e5e5',
  },
  discountBadge: {
    position: 'absolute',
    top: 200,
    right: 20,
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  discountText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  contentCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
    lineHeight: 32,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2673f3',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  claimedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 24,
  },
  infoSection: {
    gap: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  termsSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  termsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2673f3',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
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
  claimButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  contactSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 24,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 10,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2673f3',
  },
})

export default PromotionDetailScreen