/**
 * ============================================================================
 * IMAGE PICKER BUTTON - WEB & MOBILE COMPATIBLE
 * ============================================================================
 * 
 * Componente que funciona tanto en web como en mobile
 * - Web: usa input HTML file
 * - Mobile: usa expo-image-picker
 */

import React from 'react'
import { TouchableOpacity, Text, StyleSheet, Platform, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

interface ImagePickerButtonProps {
  onImagePicked: (image: { uri: string; base64?: string }) => void
  children?: React.ReactNode
  style?: any
  textStyle?: any
  allowsEditing?: boolean
  quality?: number
}

export const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({
  onImagePicked,
  children,
  style,
  textStyle,
  allowsEditing = true,
  quality = 0.8,
}) => {
  const pickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: usar input HTML
        pickImageWeb()
      } else {
        // Mobile: usar expo-image-picker
        await pickImageMobile()
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'No se pudo seleccionar la imagen')
    }
  }

  const pickImageWeb = () => {
    // Crear input file dinámicamente
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0]
      if (file) {
        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'La imagen es muy grande. Máximo 5MB.')
          return
        }

        // Leer archivo como data URL
        const reader = new FileReader()
        reader.onload = (event) => {
          const uri = event.target?.result as string
          if (uri) {
            onImagePicked({ uri })
          }
        }
        reader.onerror = () => {
          Alert.alert('Error', 'No se pudo leer la imagen')
        }
        reader.readAsDataURL(file)
      }
    }
    
    // Trigger click
    input.click()
  }

  const pickImageMobile = async () => {
    // Pedir permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos acceso a tu galería para seleccionar imágenes'
      )
      return
    }

    // Abrir galería
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      quality,
      base64: false,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0]
      onImagePicked({
        uri: asset.uri,
        base64: asset.base64,
      })
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={pickImage}
      activeOpacity={0.7}
    >
      {children || <Text style={[styles.buttonText, textStyle]}>Seleccionar Imagen</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2673f3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
