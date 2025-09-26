import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function DebugStorageScreen() {
  const [storageData, setStorageData] = useState<Record<string, string | null>>({})

  const checkStorage = async () => {
    try {
      const keys = ['user_language', 'language_selected', 'auth_token', 'user_data']
      const values = await AsyncStorage.multiGet(keys)
      const data: Record<string, string | null> = {}
      values.forEach(([key, value]) => {
        data[key] = value
      })
      setStorageData(data)
    } catch (error) {
      console.error('Error checking storage:', error)
    }
  }

  const clearStorage = async () => {
    try {
      await AsyncStorage.multiRemove(['user_language', 'language_selected', 'auth_token', 'user_data'])
      console.log('✅ AsyncStorage limpiado')
      checkStorage()
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }

  const setTestLanguage = async () => {
    try {
      await AsyncStorage.setItem('user_language', 'es')
      await AsyncStorage.setItem('language_selected', 'true')
      console.log('✅ Idioma de prueba establecido')
      checkStorage()
    } catch (error) {
      console.error('Error setting test language:', error)
    }
  }

  useEffect(() => {
    checkStorage()
  }, [])

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Debug AsyncStorage</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado Actual:</Text>
        {Object.entries(storageData).map(([key, value]) => (
          <View key={key} style={styles.item}>
            <Text style={styles.key}>{key}:</Text>
            <Text style={styles.value}>{value || 'null'}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={checkStorage}>
          <Text style={styles.buttonText}>🔄 Actualizar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearStorage}>
          <Text style={styles.buttonText}>🧹 Limpiar Todo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.testButton]} onPress={setTestLanguage}>
          <Text style={styles.buttonText}>🌍 Set Test Language</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>📋 Instrucciones:</Text>
        <Text style={styles.instructionsText}>
          1. Usa "Limpiar Todo" para resetear el estado{'\n'}
          2. Cierra y abre la app{'\n'}
          3. Deberías ver LanguageSelectionScreen{'\n'}
          4. Selecciona un idioma{'\n'}
          5. Deberías navegar a Welcome
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  item: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
  },
  key: {
    fontWeight: '600',
    color: '#2673f3',
    width: 120,
  },
  value: {
    flex: 1,
    color: '#666',
    fontFamily: 'monospace',
  },
  buttons: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2673f3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#ff4444',
  },
  testButton: {
    backgroundColor: '#00aa44',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#856404',
  },
  instructionsText: {
    color: '#856404',
    lineHeight: 20,
  },
})
