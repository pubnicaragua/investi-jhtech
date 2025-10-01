import React, { useEffect, useState, useCallback } from "react";  
import {  
  View,  
  Text,  
  StyleSheet,  
  SafeAreaView,  
  TouchableOpacity,  
  FlatList,  
  TextInput,  
  Image,  
  ScrollView,  
  RefreshControl,  
  ActivityIndicator,  
  Platform,
  StatusBar,
} from "react-native";  
import {  
  ArrowLeft,  
  MoreVertical,  
  Search,  
  Edit3,  
} from "lucide-react-native";  
import { getCurrentUserId, getUserConversations } from "../rest/api";  
import { useAuthGuard } from "../hooks/useAuthGuard";  
  
interface User {  
  id: string;  
  nombre: string;  
  avatar_url: string;  
  is_online: boolean;  
  last_seen_at: string;  
}  
  
interface Chat {  
  id: string;  
  type: "direct" | "community";  
  last_message: string;  
  last_message_at: string;  
  unread_count: number;  
  user?: {  
    id: string;  
    nombre: string;  
    avatar_url: string;  
  };  
  community?: {  
    id: string;  
    nombre: string;  
    icono_url: string;  
    members_count: number;  
  };  
}  
  
export function ChatListScreen({ navigation }: any) {  
  const [users, setUsers] = useState<User[]>([]);  
  const [chats, setChats] = useState<Chat[]>([]);  
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);  
  const [activeFilter, setActiveFilter] = useState("Todos");  
  const [searchQuery, setSearchQuery] = useState("");  
  const [loading, setLoading] = useState(true);  
  const [refreshing, setRefreshing] = useState(false);  
  
  useAuthGuard();  
  
  useEffect(() => {  
    loadData();  
  }, []);  
  
  useEffect(() => {  
    filterChats();  
  }, [chats, activeFilter, searchQuery]);  
  
  const loadData = async () => {
    try {
      setLoading(true);
      const uid = await getCurrentUserId();
      if (!uid) return;

      // Load conversations using new API
      const conversations = await getUserConversations(uid);
      
      // Transform conversations to match existing Chat interface
      const transformedChats = conversations.map((conv: any) => {
        const otherParticipant = conv.participants?.find((p: any) => p.id !== uid);
        const isDirect = conv.type === 'direct';
        
        return {
          id: conv.id,
          type: isDirect ? 'direct' : 'community',
          last_message: conv.last_message?.content || 'Sin mensajes aún',
          last_message_at: conv.last_message?.created_at || conv.updated_at,
          unread_count: 0, // Will be calculated separately
          ...(isDirect ? {
            user: {
              id: otherParticipant?.id || '',
              nombre: otherParticipant?.nombre || otherParticipant?.full_name || 'Usuario',
              avatar_url: otherParticipant?.avatar_url || otherParticipant?.photo_url
            }
          } : {
            community: {
              id: conv.id,
              nombre: conv.name || 'Grupo',
              icono_url: conv.avatar_url || '',
              members_count: conv.participants?.length || 0
            }
          })
        };
      });
      
      setChats(transformedChats);
      
      // Load online users (mock data for stories)
      const mockUsers = [
        { id: '1', nombre: 'Ana García', avatar_url: 'https://i.pravatar.cc/100?img=1', is_online: true, last_seen_at: new Date().toISOString() },
        { id: '2', nombre: 'Carlos López', avatar_url: 'https://i.pravatar.cc/100?img=2', is_online: true, last_seen_at: new Date().toISOString() },
        { id: '3', nombre: 'María Rodríguez', avatar_url: 'https://i.pravatar.cc/100?img=3', is_online: false, last_seen_at: new Date().toISOString() },
      ];
      setUsers(mockUsers);
      
    } catch (err) {
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };  
  
  const onRefresh = useCallback(() => {  
    setRefreshing(true);  
    loadData();  
  }, []);  
  
  const filterChats = () => {  
    let filtered = chats;  
  
    if (activeFilter === "No leídos") {  
      filtered = filtered.filter(chat => chat.unread_count > 0);  
    } else if (activeFilter === "Comunidades") {  
      filtered = filtered.filter(chat => chat.type === "community");  
    }  
  
    if (searchQuery.trim()) {  
      filtered = filtered.filter(chat => {  
        const name = chat.type === "community"   
          ? chat.community?.nombre   
          : chat.user?.nombre;  
        return name?.toLowerCase().includes(searchQuery.toLowerCase());  
      });  
    }  
  
    setFilteredChats(filtered);  
  };  
  
  const renderUserStory = ({ item }: { item: User }) => (  
    <TouchableOpacity style={styles.storyContainer}>  
      <View style={styles.storyAvatarContainer}>  
        <Image  
          source={{ uri: item.avatar_url || "https://i.pravatar.cc/100" }}  
          style={styles.storyAvatar}  
        />  
        {item.is_online && <View style={styles.onlineDot} />}  
      </View>  
      <Text style={styles.storyName} numberOfLines={1}>  
        {item.nombre}  
      </Text>  
    </TouchableOpacity>  
  );  
  
  const renderChatItem = ({ item }: { item: Chat }) => {  
    const isCommunity = item.type === "community";  
    const name = isCommunity ? item.community?.nombre : item.user?.nombre;  
    const avatar = isCommunity  
      ? item.community?.icono_url  
      : item.user?.avatar_url;  
    const lastMessage = item.last_message || "Sin mensajes aún";  
    const time = new Date(item.last_message_at).toLocaleTimeString([], {  
      hour: "2-digit",  
      minute: "2-digit",  
    });  
  
    return (  
      <TouchableOpacity  
        style={styles.chatItem}  
        onPress={() =>  
          navigation.navigate("ChatScreen", {  
            conversationId: item.id,  
            type: item.type,  
            name: name,  
            participant: item.type === 'direct' ? item.user : null  
          })  
        }  
      >  
        <Image  
          source={{ uri: avatar || "https://i.pravatar.cc/100" }}  
          style={styles.chatAvatar}  
        />  
        <View style={styles.chatContent}>  
          <Text style={styles.chatName} numberOfLines={1}>  
            {name}  
          </Text>  
          <Text style={styles.chatMessage} numberOfLines={1}>  
            {isCommunity && item.unread_count > 0  
              ? `${item.unread_count} chats no leídos`  
              : lastMessage}  
          </Text>  
        </View>  
        <View style={styles.chatMeta}>  
          <Text style={styles.chatTime}>{time}</Text>  
          {item.unread_count > 0 && <View style={styles.unreadDot} />}  
        </View>  
      </TouchableOpacity>  
    );  
  };  
  
  if (loading) {  
    return (  
      <SafeAreaView style={styles.container}>  
        <View style={styles.loadingContainer}>  
          <ActivityIndicator size="large" color="#2673f3" />  
        </View>  
      </SafeAreaView>  
    );  
  }  
  
  return (
  <SafeAreaView style={styles.container}>
    {(() => {
      const headerPaddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 20) + 10 : 12;
      return (
        <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Volver" style={styles.backButton}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 40,
                    color: '#666',
                    position: 'absolute',
                    left: 0,
                  }}>{'<'}</Text>
                  <Text style={{
                    fontSize: 18,
                    color: '#666',
                    fontWeight: 'bold',
                    paddingTop: 4,
                    paddingLeft: 20,
                  }}>Mensajes</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('CreatePost')} accessibilityLabel="Nuevo mensaje" style={styles.composeButton}>
              <Edit3 size={16} color="#111" />
            </TouchableOpacity>
            <TouchableOpacity>
              <MoreVertical size={22} color="#111" />
            </TouchableOpacity>
          </View>
        </View>
      );
    })()}

    <View style={styles.topSection}>
      <View style={styles.searchBar}>
        <Search size={16} color="#999" />
        <TextInput
          placeholder="Buscar"
          placeholderTextColor="#111"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={styles.filtersContainer}
      >
        {["Todos", "No leídos", "Comunidades"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              activeFilter === f && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(f)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === f && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={users}
        renderItem={renderUserStory}
        keyExtractor={(item) => item.id}
        horizontal
        style={styles.stories}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2673f3']}
            tintColor="#2673f3"
          />
        }
      />
    </View>

    <FlatList
      data={filteredChats}
      renderItem={renderChatItem}
      keyExtractor={(item) => item.id}
      style={styles.chatList}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2673f3']}
          tintColor="#2673f3"
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No hay chats disponibles</Text>
          <Text style={styles.emptyStateSubtext}>
            {activeFilter === "No leídos"
              ? "No tienes mensajes sin leer"
              : "Inicia una conversación"}
          </Text>
        </View>
      }
    />
  </SafeAreaView>
); 
}  
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    padding: 6,
    marginRight: 8,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backCaret: {
    fontSize: 24,
    color: '#111',
    marginRight: 6,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 15,
    marginBottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 6, 
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    borderWidth: 1, 
    borderColor: "#ddd",
  },

  searchInput: {
    marginLeft: 8,
    fontSize: 14,
    color: "#111",
    flex: 1,
    paddingVertical: 0,
  },

  filters: {
    marginHorizontal: 16,
    marginTop: 20,  
    marginBottom: 20, 
  },

  filtersContainer: {
    alignItems: 'center',
    paddingRight: 16,
  },

  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
    minWidth: 80,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterChipActive: {
    backgroundColor: "#2673f3",
    marginLeft:19,
  },

  filterText: {
    fontSize: 14,
    color: "#111",
  },

  filterTextActive: {
    color: "#fff",
  },

  composeButton: {
    marginRight: 12,
    padding: 6,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSection: {
  paddingTop: 0,
  paddingBottom: 0,
},

  stories: {
    paddingLeft: 16,
    marginTop: 0, 
    marginBottom: 6,
  },

  storyContainer: {
    alignItems: "center",
    marginRight: 16,
  },

  storyAvatarContainer: {
    position: "relative",
  },

  storyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2ecc71",
    borderWidth: 2,
    borderColor: "#fff",
  },

  storyName: {
    fontSize: 12,
    color: "#111",
    marginTop: 4,
    maxWidth: 60,
  },

  chatList: {
    flex: 1,
    marginTop: 4,
  },

  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  chatContent: {
    flex: 1,
    marginLeft: 12,
  },

  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  chatMessage: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  chatMeta: {
    alignItems: "flex-end",
  },

  chatTime: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2673f3",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    marginTop: 120,
  },

  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});