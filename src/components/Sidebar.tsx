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
        const currentUser = await getCurrentUser();  
        setUser(currentUser);
        
        if (currentUser?.id) {
          const userComms = await getUserCommunities(currentUser.id);  
          setCommunities(userComms || []);
        }
      } catch (err) {  
        console.error("Sidebar load error:", err);
      }
    };  
    fetchData();
  }, [isOpen]);  
  
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
      navigation.navigate("Profile" as never, { userId: user?.id } as never);  
      onClose();  
    } catch (error) {  
      console.error("Profile navigation error:", error);  
    }  
  };  
  
  const handleCommunitiesPress = () => {  
    try {  
      navigation.navigate("Communities" as never);  
      onClose();  
    } catch (error) {  
      console.error("Communities navigation error:", error);  
    }  
  };  
  
  const handleSettingsPress = () => {  
    try {  
      navigation.navigate("Settings" as never);  
      onClose();  
    } catch (error) {  
      console.error("Settings navigation error:", error);  
    }  
  };  
  
  const handleSavedPostsPress = () => {  
    try {  
      navigation.navigate("SavedPosts" as never);  
      onClose();  
    } catch (error) {  
      console.error("SavedPosts navigation error:", error);  
    }  
  };  
  
  const handleChatPress = () => {
    try {
      navigation.navigate("Messages" as never);
      onClose();
    } catch (error) {
      console.error("Messages navigation error:", error);
    }
  };

  const handleCommunityPress = (communityId: string) => {
    try {
      navigation.navigate("CommunityDetail" as never, { communityId } as never);
      onClose();
    } catch (error) {
      console.error("Community navigation error:", error);
    }
  };

  const handleEditQuickAccess = () => {
    // TODO: Navigate to edit quick access screen
    console.log("Edit quick access");
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'user_language',
                'user_token',
                'user_data',
                'onboarding_completed'
              ]);
              
              await signOut();
              onClose();
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'LanguageSelection' as never }],
              });
            } catch (error) {
              console.error('Logout error:', error);
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
            <Image  
              source={{ uri: user?.avatar_url || user?.photo_url }}  
              style={styles.avatar}  
            />  
            <View style={styles.profileInfo}>  
              <Text style={styles.userName}>
                {user?.full_name || user?.username || "Usuario"}
              </Text>  
              <View style={styles.userMetaRow}>
                <Text style={styles.userSubtitle}>
                  {user?.bio || user?.role || "usuario"}
                </Text>
                {user?.country && (
                  <>
                    <Text style={styles.dotSeparator}> · </Text>
                    <Text style={styles.countryText}>
                      {getCountryFlag(user.country)} {user.country}
                    </Text>
                  </>
                )}
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
  
          {communities.length > 0 ? (
            <View style={styles.communitiesList}>
              {communities.slice(0, 3).map((community) => (  
                <TouchableOpacity  
                  key={community.id}  
                  style={styles.communityItem}  
                  onPress={() => handleCommunityPress(community.id)}
                  activeOpacity={0.7}
                >  
                  <Image  
                    source={{ uri: community.icon_url || community.avatar }}  
                    style={styles.communityIcon}  
                  />  
                  <Text style={styles.communityText} numberOfLines={1}>
                    {community.name}
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
  },  
  profileInfo: {
    flex: 1,
    paddingTop: 4,
  },
  userName: {  
    fontSize: 18,  
    fontWeight: "700",  
    color: "#111827",
    marginBottom: 6,
    lineHeight: 22,
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
    fontSize: 14,
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
});