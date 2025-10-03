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
import { getCurrentUserId, getUserConversations, countUnreadMessagesForConversation, markConversationAsRead, getSuggestedPeople } from "../rest/api";  
import { startConversationWithUser } from "../api";
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useAuthGuard();  
  
  useEffect(() => {  
    loadData();  
  }, []);  

  // Refresh when screen comes into focus (returning from chat or after creating new message)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);
  
  useEffect(() => {  
    filterChats();  
  }, [chats, activeFilter, searchQuery]);  
  
  const loadData = async () => {
    try {
      setLoading(true);
  const uid = await getCurrentUserId();
  if (!uid) return;
  setCurrentUserId(uid);

      // Load conversations using new API
      const conversations = await getUserConversations(uid);
      
      // Transform conversations to match existing Chat interface
      const transformedChats = conversations.map((conv: any) => {
        const otherParticipant = conv.participants?.find((p: any) => p.id !== uid);
        const isDirect = conv.type === 'direct';
        const rawLast = conv.last_message;
        const lastMessageText = rawLast && typeof rawLast === 'object'
          ? (rawLast.content || rawLast.contenido || '')
          : (typeof rawLast === 'string' ? rawLast : '');
        const lastMessageAt = rawLast && typeof rawLast === 'object'
          ? (rawLast.created_at || rawLast.createdAt || conv.updated_at)
          : (conv.last_message_at || conv.updated_at);

        return {
          id: conv.id,
          type: isDirect ? 'direct' : 'community',
          last_message: lastMessageText || 'Sin mensajes aún',
          last_message_at: lastMessageAt,
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
      
      // Calcular unread_count real para cada conversación usando la tabla messages_reads   
      try {
        const counts = await Promise.all(transformedChats.map((conv: any) =>
          countUnreadMessagesForConversation(conv.id, uid).catch(() => 0)
        ));

        const chatsWithCounts = transformedChats.map((c: any, i: number) => ({ ...c, unread_count: counts[i] || 0 }));
        // Sort by last_message_at descending (most recent first)
        chatsWithCounts.sort((a: any, b: any) => {
          const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return tb - ta;
        });
        setChats(chatsWithCounts);

        try {
          let filtered = chatsWithCounts;
          if (activeFilter === "No leídos") filtered = filtered.filter((chat: any) => chat.unread_count > 0);
          else if (activeFilter === "Comunidades") filtered = filtered.filter((chat: any) => chat.type === "community");
          if (searchQuery.trim()) {
            filtered = filtered.filter((chat: any) => {
              const name = chat.type === "community" ? chat.community?.nombre : chat.user?.nombre;
              return name?.toLowerCase().includes(searchQuery.toLowerCase());
            });
          }
          setFilteredChats(filtered);
        } catch (e) {
          setFilteredChats(chatsWithCounts);
        }
      } catch (err) {
        // Fallback: si algo falla simplemente asignamos 0 y seguimos
        console.warn('No se pudieron calcular los contadores de no leídos:', err);
        
        transformedChats.sort((a: any, b: any) => {
          const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return tb - ta;
        });
        setChats(transformedChats);
        try {
          let filtered = transformedChats;
          if (activeFilter === "No leídos") filtered = filtered.filter((chat: any) => chat.unread_count > 0);
          else if (activeFilter === "Comunidades") filtered = filtered.filter((chat: any) => chat.type === "community");
          if (searchQuery.trim()) {
            filtered = filtered.filter((chat: any) => {
              const name = chat.type === "community" ? chat.community?.nombre : chat.user?.nombre;
              return name?.toLowerCase().includes(searchQuery.toLowerCase());
            });
          }
          setFilteredChats(filtered);
        } catch (e) {
          setFilteredChats(transformedChats);
        }
      }
      
      // Load online / suggested users for stories using API
      try {
        const suggested = await getSuggestedPeople(uid, 8);
        const mapped = (suggested || []).map((u: any, idx: number) => {
          const lastSeenStr = u.last_seen_at || u.last_active_at || u.updated_at || u.last_seen || null;
          const lastSeenTs = lastSeenStr ? new Date(lastSeenStr).getTime() : null;
          const isOnlineInferred = lastSeenTs ? (Date.now() - lastSeenTs) < (5 * 60 * 1000) : !!u.is_online;

          return {
            id: u.id || u.user_id || `sug-${idx}`,
            nombre: u.nombre || u.name || u.full_name || u.username || 'Usuario',
            avatar_url: u.avatar_url || u.photo_url || u.avatar_url || `https://i.pravatar.cc/100?img=${(idx % 70) + 1}`,
            is_online: isOnlineInferred,
            last_seen_at: lastSeenStr || new Date().toISOString()
          }
        });

        if (mapped.length > 0) setUsers(mapped);
        else {
          // fallback small list
          setUsers([
            { id: '1', nombre: 'Usuario', avatar_url: 'https://i.pravatar.cc/100?img=1', is_online: false, last_seen_at: new Date().toISOString() }
          ]);
        }
      } catch (err) {
        console.warn('No se pudieron cargar usuarios sugeridos:', err);
        setUsers([
          { id: '1', nombre: 'Usuario', avatar_url: 'https://i.pravatar.cc/100?img=1', is_online: false, last_seen_at: new Date().toISOString() }
        ]);
      }
      
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
    <TouchableOpacity style={styles.storyContainer} onPress={() => handleStartConversation(item.id)}>  
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
        onPress={async () => {
          // Optimista: limpiar badge localmente para mejor UX
          setChats(prev => prev.map(c => c.id === item.id ? { ...c, unread_count: 0 } : c));

          // Llamada al backend para marcar como leído en messages_reads
          try {
            if (currentUserId) await markConversationAsRead(item.id, currentUserId);
          } catch (err) {
            console.warn('No se pudo marcar como leído en el backend:', err);
          }

          // Navegación
          if (isCommunity) {
            navigation.navigate('GroupChatScreen', { groupId: item.id, name: name });
          } else {
            navigation.navigate('ChatScreen', {
              conversationId: item.id,
              type: item.type,
              name: name,
              participant: item.type === 'direct' ? item.user : null,
            });
          }
        }}
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

  // Start or open a direct conversation with a user when their story is tapped
  async function handleStartConversation(userId: string) {
    try {
      const currentUserIdLocal = await getCurrentUserId();
      if (!currentUserIdLocal) return;

      // Reuse existing server-side RPC to start/find conversation
      const conv = await startConversationWithUser(currentUserIdLocal, userId as string);

      // Determine conversation id
      if (conv && (conv.id || typeof conv === 'string')) {
        const convId = conv.id || conv;

        // Try to find participant info from suggested users so we can show avatar immediately
        const participantInfo = users.find(u => u.id === userId) as any || { id: userId };

        // Optimistically insert/update the conversation in local state so UI shows correct avatar
        setChats(prev => {
          const exists = prev.find(c => c.id === convId);
          const newEntry: Chat = {
            id: convId,
            type: 'direct',
            last_message: 'Sin mensajes aún',
            last_message_at: new Date().toISOString(),
            unread_count: 0,
            user: {
              id: participantInfo.id,
              nombre: participantInfo.nombre || participantInfo.full_name || 'Usuario',
              avatar_url: participantInfo.avatar_url || participantInfo.photo_url || ''
            }
          };

          let updated = exists ? prev.map(p => p.id === convId ? { ...p, ...newEntry } : p) : [newEntry, ...prev];
          // keep sorted by last_message_at desc
          updated.sort((a: any, b: any) => {
            const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return tb - ta;
          });
          return updated;
        });

        // Navigate passing participant object so ChatScreen can show avatar immediately
        navigation.replace('ChatScreen', { conversationId: convId, type: 'direct', participant: { id: participantInfo.id, nombre: participantInfo.nombre, avatar_url: participantInfo.avatar_url } });

        // Refresh in background to sync true server state
        loadData().catch(() => {});
      } else {
        // Fallback: refresh chats so the new conversation appears
        await loadData();
      }
    } catch (err) {
      console.error('Error starting/opening conversation from story:', err);
      // Ensure list refresh so the user can still find the person
      try { await loadData(); } catch(e){}
    }
  }
  
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
              <TouchableOpacity onPress={() => navigation.navigate('NewMessageScreen')} accessibilityLabel="Nuevo mensaje" style={styles.composeButton}>
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