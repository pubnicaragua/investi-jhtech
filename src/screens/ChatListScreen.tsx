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
} from "react-native";  
import {  
  ArrowLeft,  
  MoreVertical,  
  Search,  
  Edit3,  
} from "lucide-react-native";  
import { getCurrentUserId, request } from "../rest/api";  
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
  
      const usersRes = await request("GET", "/users", {  
        params: {  
          select: "id,nombre,avatar_url,is_online,last_seen_at",  
          order: "last_seen_at.desc",  
          limit: "10",  
        },  
      });  
      setUsers(usersRes || []);  
  
      const chatsRes = await request("GET", "/chats", {  
        params: {  
          or: `user_id.eq.${uid},participant_id.eq.${uid}`,  
          select: "id,type,last_message,last_message_at,unread_count,community:communities(id,nombre,icono_url),user:users!chats_participant_id_fkey(id,nombre,avatar_url)",  
          order: "last_message_at.desc",  
        },  
      });  
      setChats(chatsRes || []);  
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
            chatId: item.id,  
            type: item.type,  
            name: name,  
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
      <View style={styles.header}>  
        <Text style={styles.headerTitle}>Mensajes</Text>  
        <View style={styles.headerActions}>  
          <TouchableOpacity>  
            <Search size={22} color="#111" style={{ marginRight: 16 }} />  
          </TouchableOpacity>  
          <TouchableOpacity>  
            <MoreVertical size={22} color="#111" />  
          </TouchableOpacity>  
        </View>  
      </View>  
  
      <View style={styles.searchBar}>  
        <Search size={18} color="#999" />  
        <TextInput  
          placeholder="Buscar"  
          placeholderTextColor="#999"  
          style={styles.searchInput}  
          value={searchQuery}  
          onChangeText={setSearchQuery}  
        />  
      </View>  
  
      <ScrollView  
        horizontal  
        showsHorizontalScrollIndicator={false}  
        style={styles.filters}  
      >  
        {["Todos", "No leídos", "Comunidades"].map((f) => (  
          <TouchableOpacity  
            key={f}  
            style={[  
              styles.filterChip,  
              activeFilter === f && styles.filterChipActive,  
            ]}  
            onPress={() => setActiveFilter(f)}  
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
  
      <FlatList  
        data={filteredChats}  
        renderItem={renderChatItem}  
        keyExtractor={(item) => item.id}  
        style={styles.chatList}  
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
  container: { flex: 1, backgroundColor: "#fff" },  
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
    paddingVertical: 12,  
    borderBottomWidth: 1,  
    borderBottomColor: "#eee",  
  },  
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#111" },  
  headerActions: { flexDirection: "row", alignItems: "center" },  
  searchBar: {  
    flexDirection: "row",  
    alignItems: "center",  
    margin: 16,  
    paddingHorizontal: 12,  
    paddingVertical: 8,  
    borderRadius: 12,  
    backgroundColor: "#f5f5f5",  
  },  
  searchInput: { marginLeft: 8, fontSize: 16, color: "#111", flex: 1 },  
  filters: { marginLeft: 16, marginBottom: 12 },  
  filterChip: {  
    paddingHorizontal: 14,  
    paddingVertical: 6,  
    borderRadius: 20,  
    backgroundColor: "#f5f5f5",  
    marginRight: 8,  
  },  
  filterChipActive: { backgroundColor: "#2673f3" },  
  filterText: { fontSize: 14, color: "#111" },  
  filterTextActive: { color: "#fff" },  
  stories: { paddingLeft: 16, marginBottom: 8 },  
  storyContainer: { alignItems: "center", marginRight: 16 },  
  storyAvatarContainer: { position: "relative" },  
  storyAvatar: { width: 56, height: 56, borderRadius: 28 },  
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
  storyName: { fontSize: 12, color: "#111", marginTop: 4, maxWidth: 60 },  
  chatList: { flex: 1 },  
  chatItem: {  
    flexDirection: "row",  
    alignItems: "center",  
    paddingHorizontal: 16,  
    paddingVertical: 14,  
    borderBottomWidth: 1,  
    borderBottomColor: "#f0f0f0",  
  },  
  chatAvatar: { width: 48, height: 48, borderRadius: 24 },  
  chatContent: { flex: 1, marginLeft: 12 },  
  chatName: { fontSize: 16, fontWeight: "600", color: "#111" },  
  chatMessage: { fontSize: 14, color: "#666", marginTop: 2 },  
  chatMeta: { alignItems: "flex-end" },  
  chatTime: { fontSize: 12, color: "#999", marginBottom: 6 },  
  unreadDot: {  
    width: 10,  
    height: 10,  
    borderRadius: 5,  
    backgroundColor: "#2673f3",  
  },  
  emptyState: {  
    alignItems: "center",  
    paddingVertical: 40,  
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