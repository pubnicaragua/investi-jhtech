import React, { useEffect, useRef, useState } from "react";  
import {  
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
  PanResponder, Image, ScrollView, Alert, Modal, FlatList,
} from "react-native";  
import { useNavigation } from "@react-navigation/native";  
import {
  Bookmark, Users, Settings, MessageCircle, Edit3, LogOut,
  ChevronRight, User, X, Sparkles,
} from "lucide-react-native";  
import { getCurrentUser, getUserCommunities } from "../rest/api";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';  
  
const { width } = Dimensions.get("window");

const FLAGS: { [key: string]: string } = {
  'Chile': '🇨🇱', 'Mexico': '🇲🇽', 'Argentina': '🇦🇷',
  'Colombia': '🇨🇴', 'Peru': '🇵🇪', 'Spain': '🇪🇸', 'USA': '🇺🇸',
};

const getInitials = (name: string) => {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
};

const getAvatarUrl = (user: any) => {
  if (user?.avatar_url) return user.avatar_url
  if (user?.photo_url) return user.photo_url
  return null
};
  
export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
  const navigation = useNavigation();
  const { signOut, user } = useAuth();
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const [communities, setCommunities] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [quickAccessIds, setQuickAccessIds] = useState<string[]>([]);
  
  useEffect(() => {  
    Animated.timing(slideAnim, {  
      toValue: isOpen ? 0 : -width, duration: 280, useNativeDriver: true,  
    }).start();  
  }, [isOpen]);
  
  useEffect(() => {  
    const fetchData = async () => {
      if (!isOpen) return;
      try {  
        if (user?.id) {
          const userComms = await getUserCommunities(user.id);  
          setCommunities(userComms || []);
          await loadQuickAccess(userComms || [])
        }
      } catch (err) {  
        console.error("❌ [Sidebar] Error loading data:", err);
      }
    };  
    fetchData();
  }, [isOpen, user]);  
  
  const loadQuickAccess = async (comms: any[]) => {
    try {
      const saved = await AsyncStorage.getItem('quick_access_communities')
      if (saved) {
        setQuickAccessIds(JSON.parse(saved))
      } else {
        setQuickAccessIds(comms.slice(0, 3).map(c => c.id))
      }
    } catch (error) {
      setQuickAccessIds(comms.slice(0, 3).map(c => c.id))
    }
  }

  const panResponder = useRef(  
    PanResponder.create({  
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,  
      onPanResponderMove: (_, gesture) => { if (gesture.dx < 0) slideAnim.setValue(gesture.dx); },  
      onPanResponderRelease: (_, gesture) => {  
        if (gesture.dx < -80) {  
          onClose();  
        } else {  
          Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();  
        }  
      },  
    })  
  ).current;  
  
  const handleProfilePress = () => {  
    if (!user?.id) { Alert.alert('Error', 'No se pudo cargar tu perfil.'); return; }
    (navigation as any).push("Profile", { userId: user.id });
    onClose();  
  };  
  
  const handleCommunitiesPress = () => { (navigation as any).push("Communities"); onClose(); };  
  const handleSettingsPress = () => { (navigation as any).push("Settings"); onClose(); };  
  const handleSavedPostsPress = () => { (navigation as any).push("SavedPosts"); onClose(); };  
  const handleChatPress = () => { (navigation as any).push("IRIChatScreen"); onClose(); };
  const handleCommunityPress = (communityId: string) => {
    (navigation as any).push("CommunityDetail", { communityId }); onClose();
  };

  const handleEditQuickAccess = () => {
    setSelectedCommunities(quickAccessIds.length > 0 ? quickAccessIds : communities.slice(0, 3).map(c => c.id))
    setIsEditModalOpen(true)
  };

  const toggleCommunitySelection = (communityId: string) => {
    setSelectedCommunities(prev => {
      if (prev.includes(communityId)) return prev.filter(id => id !== communityId)
      else if (prev.length < 3) return [...prev, communityId]
      else { Alert.alert('Límite alcanzado', 'Solo 3 comunidades'); return prev; }
    })
  };

  const saveQuickAccess = async () => {
    try {
      await AsyncStorage.setItem('quick_access_communities', JSON.stringify(selectedCommunities))
      setQuickAccessIds(selectedCommunities)
      setIsEditModalOpen(false)
      Alert.alert('Guardado', 'Accesos rápidos actualizados')
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar')
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión", style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(['user_language','user_token','user_data','onboarding_completed','quick_access_communities']);
          await signOut();
          onClose();
          navigation.reset({ index: 0, routes: [{ name: 'LanguageSelection' as never }] });
        }
      }
    ]);
  };

  const getCountryFlag = (country: string) => FLAGS[country] || '🌎';
  const getDisplayedCommunities = () => {
    if (!communities?.length) return []
    if (!quickAccessIds.length) return communities.slice(0, 3)
    return communities.filter(c => quickAccessIds.includes(c.id))
  };
  const getUserFullName = () => {
    if (!user) return 'Usuario';
    if (user.full_name && user.full_name !== 'Usuario') return user.full_name;
    if (user.nombre && user.nombre !== 'Usuario') return user.nombre;
    return user.username || 'Usuario';
  };
  const getUserDescription = () => {
    if (!user) return 'Miembro de la comunidad';
    if (user.bio) return user.bio;
    if (user.role && user.role !== 'Usuario') return user.role;
    return 'Miembro de la comunidad';
  };
  
  if (!isOpen) return null;  
  
  return (  
    <View style={styles.overlayContainer}>  
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />  
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]} {...panResponder.panHandlers}>  
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={false}>  
          <View style={styles.profileSection}>  
            {getAvatarUrl(user) ? (
              <Image source={{ uri: getAvatarUrl(user) }} style={styles.avatar} />
            ) : (
              <Image 
                source={require('../../assets/splash.png')} 
                style={styles.avatar}
                resizeMode="cover"
              />
            )}
            <View style={styles.profileInfo}>  
              <Text style={styles.userName}>{getUserFullName()}</Text>  
              <Text style={styles.userBio} numberOfLines={2}>{getUserDescription()}</Text>
              <View style={styles.userMetaRow}>
                <Text style={styles.countryText}>{getCountryFlag(user?.pais || 'Chile')} {user?.pais || 'Chile'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.profileLink} onPress={handleProfilePress} activeOpacity={0.7}>
            <User size={16} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.linkText}>Ir a mi perfil</Text>
          </TouchableOpacity>
  
          <View style={styles.divider} />  
  
          <View style={styles.quickHeader}>
            <View style={styles.quickTitleRow}>
              <ChevronRight size={18} color="#1F2937" strokeWidth={2} />
              <Text style={styles.quickTitle}>Tus accesos rápidos</Text>
            </View>
            <TouchableOpacity onPress={handleEditQuickAccess} activeOpacity={0.7} style={styles.editButton}>
              <Text style={styles.editText}>Editar</Text>
              <Edit3 size={14} color="#3B82F6" strokeWidth={2} />  
            </TouchableOpacity>  
          </View>  
  
          {communities?.length > 0 ? (
            <View style={styles.communitiesList}>
              {getDisplayedCommunities().map((community) => (  
                <TouchableOpacity key={community.id} style={styles.communityItem} onPress={() => handleCommunityPress(community.id)} activeOpacity={0.7}>  
                  {community.icono_url || community.image_url ? (
                    <Image source={{ uri: community.icono_url || community.image_url }} style={styles.communityIcon} />
                  ) : (
                    <View style={[styles.communityIcon, styles.communityIconPlaceholder]}>
                      <Text style={styles.communityIconInitials}>{getInitials(community.nombre || community.name)}</Text>
                    </View>
                  )}
                  <Text style={styles.communityText} numberOfLines={1}>{community.nombre || community.name}</Text>  
                </TouchableOpacity>  
              ))}
            </View>
          ) : <Text style={styles.emptyText}>No tienes comunidades</Text>}
  
          <View style={styles.divider} />  
  
          <TouchableOpacity style={styles.menuItem} onPress={handleSavedPostsPress} activeOpacity={0.7}>  
            <Bookmark size={24} color="#1F2937" strokeWidth={1.5} />
            <Text style={styles.menuText}>Publicaciones guardadas</Text>  
          </TouchableOpacity>  
  
          <TouchableOpacity style={styles.menuItem} onPress={handleCommunitiesPress} activeOpacity={0.7}>  
            <Users size={24} color="#1F2937" strokeWidth={1.5} />
            <Text style={styles.menuText}>Comunidades</Text>  
          </TouchableOpacity>  
  
          <TouchableOpacity style={styles.menuItem} onPress={handleChatPress} activeOpacity={0.7}>  
            <Image 
              source={require('../../assets/splash.png')} 
              style={styles.iriMenuIcon}
              resizeMode="contain"
            />
            <Text style={styles.menuText}>Chat con IRÏ</Text>  
          </TouchableOpacity>  
  
          <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress} activeOpacity={0.7}>
            <Settings size={24} color="#1F2937" strokeWidth={1.5} />
            <Text style={styles.menuText}>Configuración</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout} activeOpacity={0.7}>
            <LogOut size={24} color="#DC2626" strokeWidth={1.5} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>  
      </Animated.View>

      <Modal visible={isEditModalOpen} transparent animationType="fade" onRequestClose={() => setIsEditModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Accesos Rápidos</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}><X size={24} color="#6B7280" /></TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Selecciona hasta 3 comunidades ({selectedCommunities.length}/3)</Text>
            
            <FlatList data={communities || []} keyExtractor={(item) => item.id} style={styles.modalList}
              renderItem={({ item }) => {
                const isSelected = selectedCommunities.includes(item.id)
                return (
                  <TouchableOpacity style={[styles.modalCommunityItem, isSelected && styles.modalCommunityItemSelected]}
                    onPress={() => toggleCommunitySelection(item.id)} activeOpacity={0.7}>
                    {item.icono_url || item.image_url ? (
                      <Image source={{ uri: item.icono_url || item.image_url }} style={styles.modalCommunityIcon} />
                    ) : (
                      <View style={[styles.modalCommunityIcon, styles.communityIconPlaceholder]}>
                        <Text style={styles.communityIconInitials}>{getInitials(item.nombre || item.name)}</Text>
                      </View>
                    )}
                    <Text style={[styles.modalCommunityName, isSelected && styles.modalCommunityNameSelected]}>
                      {item.nombre || item.name}
                    </Text>
                    {isSelected && <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>}
                  </TouchableOpacity>
                )
              }}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setIsEditModalOpen(false)} activeOpacity={0.7}>
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSave} onPress={saveQuickAccess} activeOpacity={0.7}>
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
  overlayContainer: { ...StyleSheet.absoluteFillObject, zIndex: 1000 },  
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },  
  sidebar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 320, backgroundColor: "#FFF", shadowColor: "#000", shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50 },
  profileSection: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },  
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12, backgroundColor: '#F3F4F6' },
  avatarPlaceholder: { backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  profileInfo: { flex: 1, paddingTop: 4 },
  userName: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 4, lineHeight: 22 },
  userBio: { fontSize: 13, color: "#6B7280", lineHeight: 17, marginBottom: 4 },
  userMetaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  countryText: { fontSize: 13, color: "#6B7280" },
  profileLink: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 6 },
  linkText: { fontSize: 14, color: "#3B82F6", fontWeight: "600" },  
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 20 },  
  quickHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  quickTitleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  quickTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  editButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: 8 },
  editText: { fontSize: 14, color: "#3B82F6", fontWeight: "600" },
  communitiesList: { gap: 4 },
  communityItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },  
  communityIcon: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#F3F4F6' },
  communityIconPlaceholder: { backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  communityIconInitials: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  communityText: { fontSize: 16, color: "#1F2937", fontWeight: "500", flex: 1 },
  emptyText: { fontSize: 14, color: "#9CA3AF", fontStyle: "italic", paddingVertical: 12 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, gap: 16 },  
  menuText: { fontSize: 17, color: "#1F2937", fontWeight: "500" },
  iriMenuIcon: { width: 24, height: 24, borderRadius: 12 },
  logoutItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, gap: 16, marginTop: 4 },
  logoutText: { fontSize: 17, color: "#DC2626", fontWeight: "600" },
  bottomSpacer: { height: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  modalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  modalList: { maxHeight: 400 },
  modalCommunityItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8, backgroundColor: '#F9FAFB' },
  modalCommunityItemSelected: { backgroundColor: '#EEF2FF', borderWidth: 2, borderColor: '#3B82F6' },
  modalCommunityIcon: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  modalCommunityName: { flex: 1, fontSize: 16, color: '#1F2937', fontWeight: '500' },
  modalCommunityNameSelected: { color: '#3B82F6', fontWeight: '600' },
  checkmark: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  checkmarkText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalButtonCancel: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
  modalButtonCancelText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  modalButtonSave: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#3B82F6', alignItems: 'center' },
  modalButtonSaveText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});