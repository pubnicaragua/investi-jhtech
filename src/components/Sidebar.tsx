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
  ChevronRight,
  Edit3,
  LogOut,
} from "lucide-react-native";  
import { getCurrentUser, listCommunities } from "../rest/api";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';  
  
const { width } = Dimensions.get("window");  
  
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
  
  // Animación cuando abre/cierra  
  useEffect(() => {  
    Animated.timing(slideAnim, {  
      toValue: isOpen ? 0 : -width,  
      duration: 250,  
      useNativeDriver: false,  
    }).start();  
  }, [isOpen]);  
  
  // Datos del usuario y comunidades  
  useEffect(() => {  
    const fetchData = async () => {  
      try {  
        const currentUser = await getCurrentUser();  
        setUser(currentUser);  
        const comms = await listCommunities();  
        setCommunities(comms.slice(0, 3)); // solo mostrar 3 accesos rápidos  
      } catch (err) {  
        console.error("Sidebar load error:", err);  
      }  
    };  
    if (isOpen) fetchData();  
  }, [isOpen]);  
  
  // Swipe para cerrar  
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
        if (gesture.dx < -100) {  
          onClose();  
        } else {  
          Animated.timing(slideAnim, {  
            toValue: 0,  
            duration: 200,  
            useNativeDriver: false,  
          }).start();  
        }  
      },  
    })  
  ).current;  
  
  const handleProfilePress = () => {  
    try {  
      navigation.navigate("Profile" as never);  
      onClose();  
    } catch (error) {  
      console.log("Profile navigation not available yet");  
    }  
  };  
  
  const handleCommunitiesPress = () => {  
    try {  
      navigation.navigate("Communities" as never);  
      onClose();  
    } catch (error) {  
      console.log("Communities navigation not available yet");  
    }  
  };  
  
  const handleSettingsPress = () => {  
    try {  
      navigation.navigate("Settings" as never);  
      onClose();  
    } catch (error) {  
      console.log("Settings navigation not available yet");  
    }  
  };  
  
  const handleSavedPostsPress = () => {  
    console.log("Saved posts functionality not implemented yet");  
  };  
  
  const handleChatPress = () => {
    console.log("Chat with Irí functionality not implemented yet");
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
              // Limpiar datos locales
              await AsyncStorage.multiRemove([
                'user_language',
                'user_token',
                'user_data',
                'onboarding_completed'
              ]);
              
              // Cerrar sesión en Supabase
              await signOut();
              
              // Cerrar sidebar
              onClose();
              
              // Navegar a selección de idioma
              navigation.reset({
                index: 0,
                routes: [{ name: 'LanguageSelection' as never }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión correctamente');
            }
          }
        }
      ]
    );
  };  
  
  if (!isOpen) return null;  
  
  return (  
    <View style={styles.overlayContainer}>  
      <TouchableOpacity style={styles.overlay} onPress={onClose} />  
      <Animated.View  
        style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}  
        {...panResponder.panHandlers}  
      >  
        <ScrollView>  
          {/* Perfil */}  
          <View style={styles.profileSection}>  
            <Image  
              source={{  
                uri: user?.photo_url || user?.avatar_url || "https://i.pravatar.cc/150?img=3",  
              }}  
              style={styles.avatar}  
            />  
            <View style={{ flex: 1 }}>  
              <Text style={styles.userName}>  
                {user?.nombre || user?.username || "Usuario"}  
              </Text>  
              <Text style={styles.userSubtitle}>  
                {user?.role || "Inversionista"}{" "}  
                {user?.country ? `· ${user.country}` : "· Chile"}  
              </Text>  
            </View>  
            <TouchableOpacity onPress={handleProfilePress}>  
              <Text style={styles.linkText}>Ir a mi perfil</Text>  
            </TouchableOpacity>  
          </View>  
  
          <View style={styles.divider} />  
  
          {/* Accesos rápidos */}  
          <View style={styles.quickHeader}>  
            <Text style={styles.quickTitle}>Tus accesos rápidos</Text>  
            <TouchableOpacity>  
              <Edit3 size={16} color="#2673f3" />  
            </TouchableOpacity>  
          </View>  
  
          {communities.map((c, i) => (  
            <TouchableOpacity  
              key={i}  
              style={styles.communityItem}  
              onPress={handleCommunitiesPress}  
            >  
              <Image  
                source={{  
                  uri: c.icon_url || c.icono_url || "https://i.pravatar.cc/100?img=10",  
                }}  
                style={styles.communityIcon}  
              />  
              <Text style={styles.communityText}>{c.name || c.nombre}</Text>  
            </TouchableOpacity>  
          ))}  
  
          <View style={styles.divider} />  
  
          {/* Opciones principales */}  
          <TouchableOpacity style={styles.menuItem} onPress={handleSavedPostsPress}>  
            <Bookmark size={20} color="#111" style={styles.menuIcon} />  
            <Text style={styles.menuText}>Publicaciones guardadas</Text>  
          </TouchableOpacity>  
  
          <TouchableOpacity style={styles.menuItem} onPress={handleCommunitiesPress}>  
            <Users size={20} color="#111" style={styles.menuIcon} />  
            <Text style={styles.menuText}>Comunidades</Text>  
          </TouchableOpacity>  
  
          <TouchableOpacity style={styles.menuItem} onPress={handleChatPress}>  
            <MessageCircle size={20} color="#111" style={styles.menuIcon} />  
            <Text style={styles.menuText}>Habla con Irí</Text>  
          </TouchableOpacity>  
  
          <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress}>
            <Settings size={20} color="#111" style={styles.menuIcon} />
            <Text style={styles.menuText}>Configuración</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={20} color="#dc2626" style={styles.menuIcon} />
            <Text style={[styles.menuText, styles.logoutText]}>Cerrar Sesión</Text>
          </TouchableOpacity>
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
    width: 300,  
    backgroundColor: "#fff",  
    padding: 20,  
    shadowColor: "#000",  
    shadowOffset: { width: 2, height: 0 },  
    shadowOpacity: 0.15,  
    shadowRadius: 6,  
  },  
  profileSection: {  
    flexDirection: "row",  
    alignItems: "center",  
    marginBottom: 15,  
  },  
  avatar: {  
    width: 56,  
    height: 56,  
    borderRadius: 28,  
    marginRight: 12,  
  },  
  userName: {  
    fontSize: 16,  
    fontWeight: "bold",  
    color: "#111",  
  },  
  userSubtitle: {  
    fontSize: 14,  
    color: "#666",  
    marginTop: 2,  
  },  
  linkText: {  
    fontSize: 13,  
    color: "#2673f3",  
    fontWeight: "500",  
  },  
  divider: {  
    height: 1,  
    backgroundColor: "#f0f0f0",  
    marginVertical: 12,  
  },  
  quickHeader: {  
    flexDirection: "row",  
    justifyContent: "space-between",  
    alignItems: "center",  
    marginBottom: 10,  
  },  
  quickTitle: {  
    fontSize: 15,  
    fontWeight: "600",  
    color: "#111",  
  },  
  communityItem: {  
    flexDirection: "row",  
    alignItems: "center",  
    paddingVertical: 8,  
  },  
  communityIcon: {  
    width: 32,  
    height: 32,  
    borderRadius: 16,  
    marginRight: 10,  
  },  
  communityText: {  
    fontSize: 15,  
    color: "#333",  
  },  
  menuItem: {  
    flexDirection: "row",  
    alignItems: "center",  
    paddingVertical: 14,  
  },  
  menuIcon: {  
    marginRight: 12,  
  },  
  menuText: {
    fontSize: 15,
    color: "#111",
  },
  logoutItem: {
    marginTop: 10,
  },
  logoutText: {
    color: "#dc2626",
    fontWeight: "600",
  },
});