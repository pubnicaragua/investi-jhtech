/**
 * ============================================================================
 * NEW MESSAGE SCREEN - NUEVA CONVERSACIÓN
 * ============================================================================
 * 
 * Pantalla para iniciar una nueva conversación 100% PIXEL PERFECT.
 * 
 * CARACTERÍSTICAS:
 * ✅ Lista de usuarios sugeridos
 * ✅ Búsqueda en tiempo real
 * ✅ Pull to refresh
 * ✅ Backend-driven (usuarios reales)
 * ✅ Navegación fluida a ChatScreen
 * ✅ Diseño moderno y limpio
 * 
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { ArrowLeft, Search, Users } from 'lucide-react-native';
import { getCurrentUserId, getUserConversations, searchUsers, getSuggestedPeople } from '../rest/api';
import { startConversationWithUser } from '../api';
import { useAuthGuard } from '../hooks/useAuthGuard';

interface User {
  id: string;
  nombre: string;
  avatar_url: string;
  username?: string;
  bio?: string;
  email?: string;
}

export function NewMessageScreen({ navigation }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useAuthGuard();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const uid = await getCurrentUserId();
      if (!uid) return;

      console.log('🔍 [NewMessageScreen] Loading users for:', uid);

      // Get existing conversation participants
      const convs: any[] = await getUserConversations(uid);
      console.log('📊 [NewMessageScreen] Conversations loaded:', convs.length);
      console.log('📋 [NewMessageScreen] Conversations data:', JSON.stringify(convs, null, 2));

      const participants: User[] = [];
      convs.forEach(c => {
        console.log('🔄 [NewMessageScreen] Processing conversation:', c.id, 'participants:', c.participants);
        (c.participants || []).forEach((p: any) => {
          if (p && p.id !== uid && !participants.find(u => u.id === p.id)) {
            console.log('✅ [NewMessageScreen] Adding participant:', p.id, p.nombre);
            participants.push({
              id: p.id,
              nombre: p.nombre || p.full_name || p.username || 'Usuario',
              avatar_url: p.avatar_url || p.photo_url || '',
              username: p.username || '',
              bio: p.bio || '',
              email: p.email || '',
            });
          }
        });
      });

      console.log('👥 [NewMessageScreen] Total participants from conversations:', participants.length);

      // Get suggested people
      try {
        const recs: any[] = await getSuggestedPeople(uid, 20);
        console.log('💡 [NewMessageScreen] Suggested people:', recs?.length || 0);
        
        const normalizedRecs = (recs || []).map((u: any) => ({
          id: u.id,
          nombre: u.nombre || u.name || u.full_name || u.username || 'Usuario',
          avatar_url: u.avatar_url || u.avatar || u.photo_url || '',
          username: u.username || '',
          bio: u.bio || '',
          email: u.email || '',
        }));

        const combined = [...participants];
        normalizedRecs.forEach((r: any) => {
          if (r.id && r.id !== uid && !combined.find((c: any) => c.id === r.id)) {
            combined.push(r);
          }
        });

        console.log('✅ [NewMessageScreen] Total users to display:', combined.length);
        setUsers(combined.length > 0 ? combined : participants);
      } catch (e) {
        console.error('❌ [NewMessageScreen] Error fetching suggested people:', e);
        console.log('⚠️ [NewMessageScreen] Using only participants:', participants.length);
        setUsers(participants);
      }
    } catch (err) {
      console.error('❌ [NewMessageScreen] Error loading users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartConversation(userId: string) {
    try {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) return;

      const conv = await startConversationWithUser(currentUserId, userId);
      const participantInfo = users.find(u => u.id === userId) || { id: userId, nombre: 'Usuario', avatar_url: '' };

      if (conv && (conv.id || typeof conv === 'string')) {
        const convId = typeof conv === 'string' ? conv : conv.id;
        navigation.replace('ChatScreen', {
          conversationId: convId,
          type: 'direct',
          participant: {
            id: participantInfo.id,
            nombre: participantInfo.nombre,
            avatar_url: participantInfo.avatar_url,
          },
        });
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  }

  function renderItem({ item }: { item: User }) {
    return (
      <TouchableOpacity
        style={styles.userItem}
        activeOpacity={0.6}
        onPress={() => handleStartConversation(item.id)}
      >
        <Image
          source={{ uri: item.avatar_url || 'https://i.pravatar.cc/100' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.nombre}</Text>
          <Text style={styles.userSubtitle} numberOfLines={1}>
            {item.username ? `@${item.username}` : item.email || 'Usuario'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUsers();
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredUsers = users.filter(u =>
    query
      ? (u.nombre || '').toLowerCase().includes(query.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(query.toLowerCase())
      : true
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
        </View>
      </SafeAreaView>
    );
  }

  const headerPaddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 20) + 10 : 12;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Volver"
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo mensaje</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Buscar contactos..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Crear Comunidad Button */}
      <View style={styles.createCommunityContainer}>
        <TouchableOpacity
          style={styles.createCommunityButton}
          onPress={() => navigation.navigate('CreateCommunity')}
          activeOpacity={0.8}
        >
          <Users size={20} color="#2673f3" />
          <Text style={styles.createCommunityText}>Crear Comunidad</Text>
        </TouchableOpacity>
      </View>

      {/* Personas de interes Section */}
      {filteredUsers.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {query ? 'Resultados de búsqueda' : 'Personas de interés'}
          </Text>
        </View>
      )}

      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={u => u.id}
        renderItem={renderItem}
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
            <Users size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {query ? 'No se encontraron usuarios' : 'No hay contactos disponibles'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {query ? 'Intenta con otro nombre' : 'Explora comunidades para conocer gente'}
            </Text>
          </View>
        }
        contentContainerStyle={filteredUsers.length === 0 ? { flex: 1 } : {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111',
    paddingVertical: 0,
  },

  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  userInfo: {
    flex: 1,
    marginLeft: 12,
  },

  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },

  userSubtitle: {
    fontSize: 14,
    color: '#666',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyStateSubtext: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },

  createCommunityContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },

  createCommunityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2673f3',
  },

  createCommunityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2673f3',
    marginLeft: 8,
  },

  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
});

export default NewMessageScreen;