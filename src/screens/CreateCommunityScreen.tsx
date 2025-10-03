// src/screens/community/CreateCommunityScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { createCommunity, joinCommunity, getSuggestedPeople } from '../rest/api';
import { getCurrentUserId } from '../rest/client';
import { Ionicons } from '@expo/vector-icons';

export default function CreateCommunityScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  // Tipo debe corresponder con el enum community_privacy en la BDD
  const [type, setType] = useState<'public' | 'private' | 'restricted'>('public');
  const [category, setCategory] = useState('general');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [suggestedPeople, setSuggestedPeople] = useState<any[]>([]);
  const navigation = useNavigation();

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'investing', name: 'Inversiones' },
    { id: 'education', name: 'Educación' },
    { id: 'technology', name: 'Tecnología' },
  ];

  // Cargar personas sugeridas para invitar
  React.useEffect(() => {
    (async () => {
      try {
        const uid = await getCurrentUserId();
        const recs = await getSuggestedPeople(uid || '', 8)
        setSuggestedPeople(recs || [])
      } catch (e) {
        // Silenciar errores de carga de sugeridos
        console.warn('No se pudieron cargar sugeridos', e)
      }
    })()
  }, [])

  const handleCreate = () => {
    // Crear comunidad en backend y unir creador
    (async () => {
      try {
        const uid = await getCurrentUserId();
        // Enviamos el tipo seleccionado (debe ser compatible con community_privacy)
        const community = await createCommunity({ nombre: name, descripcion: description, tipo: type, created_by: uid || undefined });
        if (community && community.id && uid) {
          // Añadir creador como miembro
          await joinCommunity(uid, community.id)
          // Añadir miembros seleccionados (si los hay)
          for (const memberId of selectedMembers) {
            if (memberId === uid) continue
            try {
              await joinCommunity(memberId, community.id)
            } catch (e) {
              console.warn('No se pudo añadir miembro', memberId, e)
            }
          }
        }
        navigation.goBack();
      } catch (err) {
        console.error('Error al crear comunidad:', err);
      }
    })();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Comunidad</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.uploadContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera" size={32} color="#666" />
            <Text style={styles.uploadText}>Subir foto</Text>
          </View>
        </View>

        <Text style={styles.label}>Nombre de la comunidad</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ej: Inversores Principiantes"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholder="Describe el propósito de tu comunidad..."
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                category === cat.id && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Tipo de privacidad</Text>
        <View style={styles.categoriesContainer}>
          {[{ id: 'public', name: 'Pública' }, { id: 'private', name: 'Privada' }, { id: 'restricted', name: 'Restringida' }].map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.categoryButton,
                type === (t.id as any) && styles.categoryButtonActive,
              ]}
              onPress={() => setType(t.id as any)}
            >
              <Text style={[styles.categoryText, type === (t.id as any) && styles.categoryTextActive]}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Invitar miembros (sugeridos)</Text>
        <View style={{ marginBottom: 12 }}>
          {suggestedPeople.slice(0, 8).map((p) => {
            const selected = selectedMembers.includes(p.id)
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  setSelectedMembers((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee', marginRight: 12 }} />
                <Text style={{ color: '#333' }}>{p.nombre || p.name || 'Usuario'}</Text>
                <View style={{ flex: 1 }} />
                <Text style={{ color: selected ? '#2673f3' : '#999' }}>{selected ? 'Añadido' : 'Añadir'}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.privacyContainer}>
          <Text style={styles.privacyText}>Comunidad privada</Text>
          <TouchableOpacity
            style={[styles.switch, isPrivate && styles.switchActive]}
            onPress={() => setIsPrivate(!isPrivate)}
          >
            <View
              style={[
                styles.switchCircle,
                isPrivate && styles.switchCircleActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            (!name || !description) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={!name || !description}
        >
          <Text style={styles.createButtonText}>Crear Comunidad</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  uploadContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  uploadText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#2673f3',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 16,
    color: '#333',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    padding: 3,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#4CAF50',
  },
  switchCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  switchCircleActive: {
    alignSelf: 'flex-end',
  },
  createButton: {
    backgroundColor: '#2673f3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});