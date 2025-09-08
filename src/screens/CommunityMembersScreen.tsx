// src/screens/community/CommunityMembersScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Datos mock de miembros
const mockMembers = [
  {
    id: '1',
    name: 'María González',
    role: 'admin',
    avatar: 'MG',
    joinDate: '2023-01-15',
    lastActive: 'Hace 2 horas',
  },
  {
    id: '2',
    name: 'Carlos López',
    role: 'moderator',
    avatar: 'CL',
    joinDate: '2023-02-20',
    lastActive: 'Ayer',
  },
  // ... más miembros
  ...Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 3),
    name: `Usuario ${i + 3}`,
    role: 'member',
    avatar: `U${i + 3}`,
    joinDate: '2023-03-' + (i + 1).toString().padStart(2, '0'),
    lastActive: i % 3 === 0 ? 'En línea' : `Hace ${i + 1} días`,
  })),
];

const roleOptions = [
  { id: 'admin', name: 'Administrador' },
  { id: 'moderator', name: 'Moderador' },
  { id: 'member', name: 'Miembro' },
];

export default function CommunityMembersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [members, setMembers] = useState(mockMembers);

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const changeMemberRole = (memberId, newRole) => {
    setMembers(
      members.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  const removeMember = (memberId) => {
    setMembers(members.filter((member) => member.id !== memberId));
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        {item.role === 'admin' && (
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberMeta}>
          Se unió el {new Date(item.joinDate).toLocaleDateString()} •{' '}
          {item.lastActive}
        </Text>
      </View>
      <View style={styles.memberActions}>
        <View style={styles.roleSelector}>
          <Text style={styles.roleText}>
            {roleOptions.find((r) => r.id === item.role)?.name}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeMember(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar miembros..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedRole === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedRole('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedRole === 'all' && styles.filterButtonTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
          {roleOptions.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.filterButton,
                selectedRole === role.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedRole(role.id)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedRole === role.id && styles.filterButtonTextActive,
                ]}
              >
                {role.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderMemberItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={64}
              color="#ddd"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No se encontraron miembros</Text>
            <Text style={styles.emptySubtext}>
              Prueba con otro término de búsqueda o ajusta los filtros
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.inviteButton}>
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={styles.inviteButtonText}>Invitar Miembros</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2673f3',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  adminBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  memberMeta: {
    fontSize: 12,
    color: '#888',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  roleText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    maxWidth: 300,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2673f3',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});