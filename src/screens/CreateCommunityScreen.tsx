// src/screens/community/CreateCommunityScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function CreateCommunityScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [category, setCategory] = useState('general');
  const navigation = useNavigation();

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'investing', name: 'Inversiones' },
    { id: 'education', name: 'Educación' },
    { id: 'technology', name: 'Tecnología' },
  ];

  const handleCreate = () => {
    // Lógica para crear la comunidad
    const newCommunity = {
      id: Date.now().toString(),
      name,
      description,
      isPrivate,
      category,
      members: 1,
      createdAt: new Date().toISOString(),
    };
    console.log('Creando comunidad:', newCommunity);
    navigation.goBack();
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