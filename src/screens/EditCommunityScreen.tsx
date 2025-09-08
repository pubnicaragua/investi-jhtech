// src/screens/community/EditCommunityScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Datos mock de la comunidad
const mockCommunity = {
  id: '1',
  name: 'Inversores Principiantes',
  description: 'Comunidad para personas que están comenzando en el mundo de las inversiones.',
  isPrivate: false,
  category: 'investing',
  members: 1245,
  image: 'https://example.com/community-image.jpg',
  createdAt: '2023-01-15T10:30:00Z',
  rules: [
    'Respetar a todos los miembros',
    'No spam',
    'Compartir conocimiento de valor',
  ],
};

export default function EditCommunityScreen() {
  const [name, setName] = useState(mockCommunity.name);
  const [description, setDescription] = useState(mockCommunity.description);
  const [isPrivate, setIsPrivate] = useState(mockCommunity.isPrivate);
  const [category, setCategory] = useState(mockCommunity.category);
  const [rules, setRules] = useState(mockCommunity.rules.join('\n'));
  const [isSaving, setIsSaving] = useState(false);
  
  const navigation = useNavigation();
  const route = useRoute();

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'investing', name: 'Inversiones' },
    { id: 'education', name: 'Educación' },
    { id: 'technology', name: 'Tecnología' },
  ];

  const handleSave = () => {
    setIsSaving(true);
    // Simular guardado
    setTimeout(() => {
      console.log('Comunidad actualizada:', {
        name,
        description,
        isPrivate,
        category,
        rules: rules.split('\n').filter(rule => rule.trim() !== ''),
      });
      setIsSaving(false);
      navigation.goBack();
    }, 1000);
  };

  const hasChanges = () => {
    return (
      name !== mockCommunity.name ||
      description !== mockCommunity.description ||
      isPrivate !== mockCommunity.isPrivate ||
      category !== mockCommunity.category ||
      rules !== mockCommunity.rules.join('\n')
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Comunidad</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges() || isSaving}
        >
          <Text
            style={[
              styles.saveButton,
              (!hasChanges() || isSaving) && styles.saveButtonDisabled,
            ]}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: mockCommunity.image || 'https://via.placeholder.com/300' }}
            style={styles.communityImage}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nombre de la comunidad"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="Describe tu comunidad..."
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingTitle}>Comunidad Privada</Text>
              <Text style={styles.settingDescription}>
                Solo los miembros aprobados pueden ver y publicar en esta comunidad
              </Text>
            </View>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reglas de la Comunidad</Text>
          <Text style={styles.label}>
            Una regla por línea. Las reglas se mostrarán a todos los miembros.
          </Text>
          <TextInput
            style={[styles.input, styles.textArea, { minHeight: 100 }]}
            value={rules}
            onChangeText={setRules}
            multiline
            placeholder="Ej: Respetar a todos los miembros&#10;No spam&#10;Compartir solo contenido relevante"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.sectionTitle}>Zona de Peligro</Text>
          <TouchableOpacity style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Eliminar Comunidad</Text>
          </TouchableOpacity>
          <Text style={styles.dangerDescription}>
            Eliminar la comunidad es permanente. Todos los datos serán eliminados y no se podrán recuperar.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    color: '#2673f3',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonDisabled: {
    color: '#a0c4ff',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
    position: 'relative',
  },
  communityImage: {
    width: '100%',
    height: '100%',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    maxWidth: '80%',
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
  dangerZone: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffebee',
  },
  dangerButton: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButtonText: {
    color: '#f44336',
    fontWeight: '600',
    fontSize: 16,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});