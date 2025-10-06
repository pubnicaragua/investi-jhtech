import React, { useEffect, useRef, useState } from "react";  
import {  
  View,  
  Text,  
  StyleSheet,  
  TouchableOpacity,  
  Animated,  
  Dimensions,
  PanResponder,  
  Image,  
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from "react-native";  
import { useNavigation } from "@react-navigation/native";  
import {
  Bookmark,
  Users,
  Settings,
  MessageCircle,
  Edit3,
  LogOut,
  ChevronRight,
  User,
  X,
} from "lucide-react-native";  
import { getCurrentUser, getUserCommunities } from "../rest/api";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';  
  
const { width } = Dimensions.get("window");

// Flag emojis por país
const FLAGS: { [key: string]: string } = {
  'Chile': '🇨🇱',
  'Mexico': '🇲🇽',
  'Argentina': '🇦🇷',
  'Colombia': '🇨🇴',
  'Peru': '🇵🇪',
  'Spain': '🇪🇸',
  'USA': '🇺🇸',
};

// Función para obtener iniciales
const getInitials = (name: string) => {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
};

// Función para obtener avatar URL
const getAvatarUrl = (user: any) => {
  if (user?.avatar_url) return user.avatar_url
  if (user?.photo_url) return user.photo_url
  return null
};
  
export const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const [user, setUser] = useState<any>(null);
  const [communities, setCommunities] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [quickAccessIds, setQuickAccessIds] = useState<string[]>([]);
  
  useEffect(() => {  
    Animated.timing(slideAnim, {  
      toValue: isOpen ? 0 : -width,  
      duration: 280,  
      useNativeDriver: true,  
    }).start();  
  }, [isOpen]);  
  
  useEffect(() => {  
    const fetchData = async () => {
      if (!isOpen) return;
      
      try {  
        console.log('🔄 [Sidebar] Fetching user data...')
        const currentUser = await getCurrentUser();  
        console.log('✅ [Sidebar] User data received:', currentUser?.nombre || currentUser?.username)
        
        // Establecer país por defecto si no existe
        if (currentUser && !currentUser.pais) {
          currentUser.pais = 'Chile'
        }
        
        setUser(currentUser);
        
        if (currentUser?.id) {
          console.log('🔄 [Sidebar] Fetching user communities for userId:', currentUser.id)
          const userComms = await getUserCommunities(currentUser.id);  
          console.log('✅ [Sidebar] Communities received:', userComms?.length || 0)
          setCommunities(userComms || []);
          
          // Cargar accesos rápidos guardados
          await loadQuickAccess(userComms || [])
        } else {
          console.warn('⚠️ [Sidebar] No user ID available')
        }
      } catch (err) {  
        console.error("❌ [Sidebar] Error loading data:", err);
      }
    };  
    fetchData();
  }, [isOpen]);  
  
  const loadQuickAccess = async (comms: any[]) => {
    try {
      const saved = await AsyncStorage.getItem('quick_access_communities')
      if (saved) {
        const ids = JSON.parse(saved)
        console.log('📌 [Sidebar] Loaded quick access:', ids)
        setQuickAccessIds(ids)
      } else {
        // Por defecto, las primeras 3
        const defaultIds = comms.slice(0, 3).map(c => c.id)
        console.log('📌 [Sidebar] Using default quick access:', defaultIds)
        setQuickAccessIds(defaultIds)
      }
    } catch (error) {
      console.error('❌ [Sidebar] Error loading quick access:', error)
      const defaultIds = comms.slice(0, 3).map(c => c.id)
      setQuickAccessIds(defaultIds)
    }
  }

  const panResponder = useRef(  
    PanResponder.create({  
      onMoveShouldSetPanResponder: (_, gestureState) =>  
        Math.abs(gestureState.dx) > 20,  
      onPanResponderMove: (_, gesture) => {  
        if (gesture.dx < 0) {  
          slideAnim.setValue(gesture.dx);  
        }  
      },  
      onPanResponderRelease: (_, gesture) => {  
        if (gesture.dx < -80) {  
          onClose();  
        } else {  
          Animated.timing(slideAnim, {  
            toValue: 0,  
            duration: 200,  
            useNativeDriver: true,  
          }).start();  
        }  
      },  
    })  
  ).current;  
  
  const handleProfilePress = () => {  
    try {  
      console.log('🔄 [Sidebar] Navigating to Profile with userId:', user?.id)
      if (!user?.id) {
        console.error('❌ [Sidebar] Cannot navigate to profile: No user ID')
        Alert.alert('Error', 'No se pudo cargar tu perfil. Intenta de nuevo.')
        return
      }
      navigation.navigate("Profile" as never, { userId: user?.id } as never);  
      console.log('✅ [Sidebar] Navigation to Profile initiated')
      onClose();  
    } catch (error) {  
      console.error("❌ [Sidebar] Profile navigation error:", error);  
      Alert.alert('Error', 'No se pudo navegar al perfil')
    }  
  };  
  
  const handleCommunitiesPress = () => {  
    try {  
      console.log('🔄 [Sidebar] Navigating to Communities')
      navigation.navigate("Communities" as never);  
      console.log('✅ [Sidebar] Navigation to Communities initiated')
      onClose();  
    } catch (error) {  
      console.error("❌ [Sidebar] Communities navigation error:", error);  
      Alert.alert('Error', 'No se pudo navegar a comunidades')
    }  
  };  
  
  const handleSettingsPress = () => {  
    try {  
      console.log('🔄 [Sidebar] Navigating to Settings')
      navigation.navigate("Settings" as never);  
      console.log('✅ [Sidebar] Navigation to Settings initiated')
      onClose();  
    } catch (error) {  
      console.error("❌ [Sidebar] Settings navigation error:", error);  
      Alert.alert('Error', 'No se pudo navegar a configuración')
    }  
  };  
  
  const handleSavedPostsPress = () => {  
    try {  
      console.log('🔄 [Sidebar] Navigating to SavedPosts')
      navigation.navigate("SavedPosts" as never);  
      console.log('✅ [Sidebar] Navigation to SavedPosts initiated')
      onClose();  
    } catch (error) {  
      console.error("❌ [Sidebar] SavedPosts navigation error:", error);  
      Alert.alert('Error', 'No se pudo navegar a publicaciones guardadas')
    }  
  };  
  
  const handleChatPress = () => {
    try {
      console.log('🔄 [Sidebar] Navigating to Messages')
      navigation.navigate("Messages" as never);
      console.log('✅ [Sidebar] Navigation to Messages initiated')
      onClose();
    } catch (error) {
      console.error("❌ [Sidebar] Messages navigation error:", error);
      Alert.alert('Error', 'No se pudo navegar a mensajes')
    }
  };

  const handleCommunityPress = (communityId: string) => {
    try {
      console.log('🔄 [Sidebar] Navigating to CommunityDetail with ID:', communityId)
      navigation.navigate("CommunityDetail" as never, { communityId } as never);
      console.log('✅ [Sidebar] Navigation to CommunityDetail initiated')
      onClose();
    } catch (error) {
      console.error("❌ [Sidebar] Community navigation error:", error);
      Alert.alert('Error', 'No se pudo navegar a la comunidad')
    }
  };

  const handleEditQuickAccess = () => {
    console.log('🔄 [Sidebar] Opening edit modal')
    console.log('📊 [Sidebar] Current communities:', communities?.length || 0)
    console.log('📊 [Sidebar] Current quick access:', quickAccessIds)
    
    // Inicializar con los accesos rápidos actuales
    setSelectedCommunities(quickAccessIds.length > 0 ? quickAccessIds : (communities || []).slice(0, 3).map(c => c.id))
    setIsEditModalOpen(true)
  };

  const toggleCommunitySelection = (communityId: string) => {
    setSelectedCommunities(prev => {
      if (prev.includes(communityId)) {
        console.log('➖ [Sidebar] Deselecting community:', communityId)
        return prev.filter(id => id !== communityId)
      } else if (prev.length < 3) {
        console.log('➕ [Sidebar] Selecting community:', communityId)
        return [...prev, communityId]
      } else {
        Alert.alert('Límite alcanzado', 'Solo puedes seleccionar hasta 3 comunidades')
        return prev
      }
    })
  };

  const saveQuickAccess = async () => {
    try {
      console.log('💾 [Sidebar] Saving quick access:', selectedCommunities)
      await AsyncStorage.setItem('quick_access_communities', JSON.stringify(selectedCommunities))
      console.log('✅ [Sidebar] Quick access saved')
      
      // Actualizar el estado inmediatamente
      setQuickAccessIds(selectedCommunities)
      
      setIsEditModalOpen(false)
      Alert.alert('Guardado', 'Tus accesos rápidos han sido actualizados')
    } catch (error) {
      console.error('❌ [Sidebar] Error saving quick access:', error)
      Alert.alert('Error', 'No se pudo guardar los cambios')
    }
  };

  const handleLogout = () => {
    console.log('🔄 [Sidebar] Logout initiated')
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => console.log('❌ [Sidebar] Logout cancelled')
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('🔄 [Sidebar] Clearing AsyncStorage...')
              await AsyncStorage.multiRemove([
                'user_language',
                'user_token',
                'user_data',
                'onboarding_completed',
                'quick_access_communities'
              ]);
              console.log('✅ [Sidebar] AsyncStorage cleared')
              
              console.log('🔄 [Sidebar] Signing out...')
              await signOut();
              console.log('✅ [Sidebar] Sign out successful')
              
              onClose();
              
              console.log('🔄 [Sidebar] Resetting navigation to LanguageSelection')
              navigation.reset({
                index: 0,
                routes: [{ name: 'LanguageSelection' as never }],
              });
              console.log('✅ [Sidebar] Navigation reset complete')
            } catch (error) {
              console.error('❌ [Sidebar] Logout error:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión correctamente');
            }
          }
        }
      ]
    );
  };
  const getCountryFlag = (country: string) => {
    return FLAGS[country] || '🌎';
  };

  const getDisplayedCommunities = () => {
    if (!communities || communities.length === 0) {
      return []
    }
    
    if (quickAccessIds.length === 0) {
      return communities.slice(0, 3)
    }
    
    // Filtrar comunidades que están en quickAccessIds
    const displayed = communities.filter(c => quickAccessIds.includes(c.id))
    console.log('📌 [Sidebar] Displaying communities:', displayed.map(c => c.nombre || c.name))
    return displayed
  };

  const getUserFullName = () => {
    if (user?.full_name) return user.full_name
    if (user?.nombre && user?.nombre !== 'Usuario') return user.nombre
    return user?.username || 'Usuario'
  };

  const getUserDescription = () => {
    if (user?.bio) return user.bio
    if (user?.role && user?.role !== 'Usuario') return user.role
    return 'Miembro de la comunidad'
  };
  
  if (!isOpen) return null;  
  
  return (  
    <View style={styles.overlayContainer}>  
      <TouchableOpacity 
        style={styles.overlay} 
        onPress={onClose} 
        activeOpacity={1}
      />  
      <Animated.View  
        style={[
          styles.sidebar, 
          { transform: [{ translateX: slideAnim }] }
        ]}  
        {...panResponder.panHandlers}  
      >  
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >  
          {/* Profile Section */}  
          <View style={styles.profileSection}>  
            {getAvatarUrl(user) ? (
              <Image  
                source={{ uri: getAvatarUrl(user) }}  
                style={styles.avatar}  
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitials}>
                  {getInitials(getUserFullName())}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>  
              <Text style={styles.userName}>
                {getUserFullName()}
              </Text>  
              <Text style={styles.userBio} numberOfLines={2}>
                {getUserDescription()}
              </Text>
              <View style={styles.userMetaRow}>
                <Text style={styles.countryText}>
                  {getCountryFlag(user?.pais || 'Chile')} {user?.pais || 'Chile'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.profileLink}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <User size={16} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.linkText}>Ir a mi perfil</Text>
          </TouchableOpacity>
  
          <View style={styles.divider} />  
  
          {/* Quick Access Section */}  
          <View style={styles.quickHeader}>
            <View style={styles.quickTitleRow}>
              <ChevronRight size={18} color="#1F2937" strokeWidth={2} />
              <Text style={styles.quickTitle}>Tus accesos rápidos</Text>
            </View>
            <TouchableOpacity 
              onPress={handleEditQuickAccess}
              activeOpacity={0.7}
              style={styles.editButton}
            >
              <Text style={styles.editText}>Editar</Text>
              <Edit3 size={14} color="#3B82F6" strokeWidth={2} />  
            </TouchableOpacity>  
          </View>  
  
          {(communities && communities.length > 0) ? (
            <View style={styles.communitiesList}>
              {getDisplayedCommunities().map((community) => (  
                <TouchableOpacity  
                  key={community.id}  
                  style={styles.communityItem}  
                  onPress={() => handleCommunityPress(community.id)}
                  activeOpacity={0.7}
                >  
                  {community.icono_url || community.image_url ? (
                    <Image  
                      source={{ uri: community.icono_url || community.image_url }}  
                      style={styles.communityIcon}  
                    />
                  ) : (
                    <View style={[styles.communityIcon, styles.communityIconPlaceholder]}>
                      <Text style={styles.communityIconInitials}>
                        {getInitials(community.nombre || community.name)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.communityText} numberOfLines={1}>
                    {community.nombre || community.name}
                  </Text>  
                </TouchableOpacity>  
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No tienes comunidades</Text>
          )}
  
          <View style={styles.divider} />  
  
          {/* Main Menu */}  
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleSavedPostsPress}
            activeOpacity={0.7}
          >  
            <Bookmark size={24} color="#1F2937" strokeWidth={1.5} />
            <Text style={styles.menuText}>Publicaciones guardadas</Text>  
          </TouchableOpacity>  
  
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleCommunitiesPress}
            activeOpacity={0.7}
          >  
            <Users size={24} color="#1F2937" strokeWidth={1.5} />
            <Text style={styles.menuText}>Comunidades</Text>  
          </TouchableOpacity>  
  
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleChatPress}
            activeOpacity={0.7}
          >  
            <MessageCircle size={24} color="#1F2937" strokeWidth={1.5} />
            <Text style={styles.menuText}>Habla con Irí</Text>  
          </TouchableOpacity>  
  
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleSettingsPress}
            activeOpacity={0.7}
          >
            <Settings size={24} color="#1F2937" strokeWidth={1.5} />
            <Text style={styles.menuText}>Configuración</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.logoutItem} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={24} color="#DC2626" strokeWidth={1.5} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>  
      </Animated.View>

      {/* Modal de Edición de Accesos Rápidos */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Accesos Rápidos</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Selecciona hasta 3 comunidades ({selectedCommunities.length}/3)
            </Text>
            
            <FlatList
              data={communities || []}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
              renderItem={({ item }) => {
                const isSelected = selectedCommunities.includes(item.id)
                return (
                  <TouchableOpacity
                    style={[styles.modalCommunityItem, isSelected && styles.modalCommunityItemSelected]}
                    onPress={() => toggleCommunitySelection(item.id)}
                    activeOpacity={0.7}
                  >
                    {item.icono_url || item.image_url ? (
                      <Image
                        source={{ uri: item.icono_url || item.image_url }}
                        style={styles.modalCommunityIcon}
                      />
                    ) : (
                      <View style={[styles.modalCommunityIcon, styles.communityIconPlaceholder]}>
                        <Text style={styles.communityIconInitials}>
                          {getInitials(item.nombre || item.name)}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.modalCommunityName, isSelected && styles.modalCommunityNameSelected]}>
                      {item.nombre || item.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )
              }}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setIsEditModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSave}
                onPress={saveQuickAccess}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>  
  );  
};

const styles = StyleSheet.create({  
  overlayContainer: {  
    ...StyleSheet.absoluteFillObject,  
    zIndex: 1000,  
  },  
  overlay: {  
    flex: 1,  
    backgroundColor: "rgba(0,0,0,0.5)",  
  },  
  sidebar: {  
    position: "absolute",  
    left: 0,  
    top: 0,  
    bottom: 0,  
    width: 320,  
    backgroundColor: "#FFFFFF",  
    shadowColor: "#000",  
    shadowOffset: { width: 2, height: 0 },  
    shadowOpacity: 0.25,  
    shadowRadius: 10,  
    elevation: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  profileSection: {  
    flexDirection: "row",  
    alignItems: "flex-start",
    marginBottom: 12,
  },  
  avatar: {  
    width: 64,  
    height: 64,  
    borderRadius: 32,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    paddingTop: 4,
  },
  userName: {  
    fontSize: 18,  
    fontWeight: "700",  
    color: "#111827",
    marginBottom: 4,
    lineHeight: 22,
  },
  userBio: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 17,
    marginBottom: 4,
  },
  userMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  userSubtitle: {  
    fontSize: 14,  
    color: "#6B7280",
    lineHeight: 18,
  },
  dotSeparator: {
    fontSize: 14,
    color: "#6B7280",
  },
  countryText: {
    fontSize: 13,
    color: "#6B7280",
  },
  profileLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 6,
  },
  linkText: {  
    fontSize: 14,  
    color: "#3B82F6",  
    fontWeight: "600",  
  },  
  divider: {  
    height: 1,  
    backgroundColor: "#E5E7EB",  
    marginVertical: 20,  
  },  
  quickHeader: {  
    flexDirection: "row",  
    justifyContent: "space-between",  
    alignItems: "center",  
    marginBottom: 16,  
  },
  quickTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  quickTitle: {  
    fontSize: 17,  
    fontWeight: "700",  
    color: "#111827",  
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  communitiesList: {
    gap: 4,
  },
  communityItem: {  
    flexDirection: "row",  
    alignItems: "center",  
    paddingVertical: 10,
  },  
  communityIcon: {  
    width: 40,  
    height: 40,  
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  communityIconPlaceholder: {
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityIconInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  communityText: {  
    fontSize: 16,  
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
    paddingVertical: 12,
  },
  menuItem: {  
    flexDirection: "row",  
    alignItems: "center",  
    paddingVertical: 16,
    gap: 16,
  },  
  menuText: {
    fontSize: 17,
    color: "#1F2937",
    fontWeight: "500",
  },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 17,
    color: "#DC2626",
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  modalList: {
    maxHeight: 400,
  },
  modalCommunityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  modalCommunityItemSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  modalCommunityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  modalCommunityName: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  modalCommunityNameSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalButtonSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  modalButtonSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});