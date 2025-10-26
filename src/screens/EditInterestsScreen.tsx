import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native'
import { ArrowLeft, Check } from 'lucide-react-native'
import { getCurrentUser } from '../rest/api'
import { request } from '../rest/client'
import { useAuthGuard } from '../hooks/useAuthGuard'

const INTERESTS = [
  'Acciones',
  'Bonos',
  'Criptomonedas',
  'Fondos Mutuos',
  'Bienes Raíces',
  'Emprendimiento',
  'Educación Financiera',
  'Ahorro',
  'Inversión a Largo Plazo',
  'Trading',
  'Dividendos',
  'Portafolio Diversificado',
]

export function EditInterestsScreen({ navigation }: any) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useAuthGuard()

  useEffect(() => {
    loadCurrentInterests()
  }, [])

  const loadCurrentInterests = async () => {
    try {
      const user = await getCurrentUser()
      if (user?.intereses && Array.isArray(user.intereses)) {
        setSelectedInterests(user.intereses)
      }
    } catch (error) {
      console.error('Error loading interests:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleSave = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un interés')
      return
    }

    try {
      setSaving(true)
      const user = await getCurrentUser()
      if (user?.id) {
        await request('PATCH', '/users', {
          params: { id: `eq.${user.id}` },
          body: { intereses: selectedInterests }
        })
        Alert.alert('Éxito', 'Intereses actualizados correctamente')
        navigation.goBack()
      }
    } catch (error) {
      console.error('Error saving interests:', error)
      Alert.alert('Error', 'No se pudieron guardar los intereses')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Intereses</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Selecciona los temas que te interesan para personalizar tu experiencia
        </Text>

        <View style={styles.interestsGrid}>
          {INTERESTS.map(interest => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestChip,
                selectedInterests.includes(interest) && styles.interestChipActive,
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text
                style={[
                  styles.interestText,
                  selectedInterests.includes(interest) && styles.interestTextActive,
                ]}
              >
                {interest}
              </Text>
              {selectedInterests.includes(interest) && (
                <Check size={16} color="#fff" style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  interestChipActive: {
    backgroundColor: '#2673f3',
    borderColor: '#2673f3',
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  interestTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#2673f3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
