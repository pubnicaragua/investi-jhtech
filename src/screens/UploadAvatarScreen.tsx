"use client"  
  
import { useState } from "react"  
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Alert, ActivityIndicator } from "react-native"  
import { useTranslation } from "react-i18next"  
import { ArrowLeft, Camera } from "lucide-react-native"  
import * as ImagePicker from "expo-image-picker"  
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getCurrentUserId, updateUser } from "../api"  
import { supabase, supabaseUrl, supabaseAnonKey } from "../supabase"  
import { LanguageToggle } from "../components/LanguageToggle"  
  
export function UploadAvatarScreen({ navigation }: any) {  
  const { t } = useTranslation()  
  const [avatar, setAvatar] = useState<any>(null)  
  const [loading, setLoading] = useState(false)  
  
  const pickImage = async () => {  
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()  
    if (status !== 'granted') {  
      Alert.alert('Error', 'Se necesitan permisos para acceder a la galería')  
      return  
    }  

    const result = await ImagePicker.launchImageLibraryAsync({  
      mediaTypes: ['images'],  
      allowsEditing: true,  
      aspect: [1, 1],  
      quality: 0.8,  
    })  

    if (!result.canceled) {  
      setAvatar(result.assets[0])
    }  
  }

  const uploadAvatarToStorage = async (userId: string, file: any) => {  
    try {  
      // Preparar el archivo para upload  
      const fileExt = file.uri.split(".").pop()  
      const fileName = `${userId}/avatar.${fileExt}`  
      
      // Convertir la imagen a blob  
      const response = await fetch(file.uri)  
      const blob = await response.blob()  

      // Subir el archivo (el bucket 'avatars' debe existir en Supabase)
        let uploadError: any = null
        try {
          const { data, error } = await supabase.storage
            .from("avatars")
            .upload(fileName, blob, {
              cacheControl: '3600',
              upsert: true,
            })
          uploadError = error
        } catch (e) {
          uploadError = e
        }

        if (uploadError) {
          console.error('Storage upload error (supabase client):', uploadError)
          // Try manual PUT to storage REST
          try {
            const url = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/avatars/${encodeURIComponent(fileName)}`
            let authToken = supabaseAnonKey
            try {
              const sessionRes = await supabase.auth.getSession()
              const session = sessionRes?.data?.session
              if (session?.access_token) authToken = session.access_token
            } catch (tokenErr) {
              console.warn('[UploadAvatar] could not read session token, falling back to anon key')
            }

            await new Promise<void>((resolve, reject) => {
              const xhr = new XMLHttpRequest()
              xhr.open('PUT', url)
              xhr.setRequestHeader('Authorization', `Bearer ${authToken}`)
              xhr.setRequestHeader('x-upsert', 'true')
              xhr.setRequestHeader('Content-Type', 'image/jpeg')
              xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                  if (xhr.status >= 200 && xhr.status < 300) {
                    resolve()
                  } else {
                    reject(new Error(`Manual upload failed: ${xhr.status} ${xhr.responseText}`))
                  }
                }
              }
              try {
                xhr.send(blob)
              } catch (sendErr) {
                reject(sendErr)
              }
            })
            console.log('UploadAvatar: manual PUT upload succeeded')
          } catch (manualErr) {
            console.error('UploadAvatar: manual PUT upload also failed:', manualErr)
            throw uploadError
          }
        }

      // Obtener la URL pública  
      const { data: { publicUrl } } = supabase.storage  
        .from("avatars")  
        .getPublicUrl(fileName)  

      return publicUrl  
    } catch (error) {  
      console.error('Upload error:', error)  
      throw error  
    }  
  }  
  
  const handleSave = async () => {  
    setLoading(true)  
    try {  
      const uid = await getCurrentUserId()  
      if (!uid) {  
        Alert.alert("Error", "No se pudo obtener el ID del usuario")  
        return  
      }  
  
      if (avatar) {  
        try {  
          // Intentar subir el avatar  
          const avatarUrl = await uploadAvatarToStorage(uid, avatar)  
            
          // Actualizar el perfil del usuario con la URL del avatar  
          await updateUser(uid, { photo_url: avatarUrl })  
          
          // Marcar paso como completado
          await AsyncStorage.setItem('avatar_uploaded', 'true')
            
          Alert.alert("Éxito", "Avatar subido correctamente", [  
            { text: "OK", onPress: () => navigation.navigate("PickGoals") }  
          ])  
        } catch (uploadError: any) {  
          console.error("Upload failed:", uploadError)  
            
          // Si falla el upload, continuar sin avatar  
          Alert.alert(  
            "Aviso",   
            "No se pudo subir la imagen, pero puedes continuar. Podrás agregar tu foto más tarde.",  
            [  
              { text: "Continuar", onPress: () => navigation.navigate("PickGoals") },  
              { text: "Reintentar", onPress: () => handleSave() }  
            ]  
          )  
        }  
      } else {  
        // Si no hay avatar, simplemente continuar
        await AsyncStorage.setItem('avatar_uploaded', 'true')
        navigation.navigate("PickGoals")  
      }  
    } catch (error: any) {  
      console.error("General error:", error)  
      Alert.alert("Error", "Ocurrió un error inesperado")  
    } finally {  
      setLoading(false)  
    }  
  }  
  
  const handleSkip = async () => {
    await AsyncStorage.setItem('avatar_uploaded', 'true')
    navigation.navigate("PickGoals")
  }
  
  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111" />  
        </TouchableOpacity>  
        <Text style={styles.headerTitle}>{t("avatar.title")}</Text>  
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>  
          <Text style={styles.skipButtonText}>{t("avatar.skip")}</Text>  
        </TouchableOpacity>  
      </View>  
  
      <View style={styles.content}>  
        <View style={styles.avatarContainer}>  
          <View style={styles.avatarWrapper}>  
            {avatar ? (  
              <Image source={{ uri: avatar.uri }} style={styles.avatar} />  
            ) : (  
              <View style={styles.avatarPlaceholder}>  
                <Camera size={40} color="#ccc" />  
              </View>  
            )}  
          </View>  
        </View>  
  
        <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>  
          <Camera size={20} color="#2673f3" />  
          <Text style={styles.changePhotoText}>{t("avatar.changePhoto")}</Text>  
        </TouchableOpacity>  
  
        <Text style={styles.subtitle}>{t("avatar.subtitle")}</Text>  
      </View>  
  
      <View style={styles.footer}>  
        <TouchableOpacity  
          style={[styles.continueButton, loading && styles.continueButtonDisabled]}  
          onPress={handleSave}  
          disabled={loading}  
        >  
          {loading ? (  
            <ActivityIndicator color="white" />  
          ) : (  
            <Text style={styles.continueButtonText}>{t("avatar.continue")}</Text>  
          )}  
        </TouchableOpacity>  
      </View>  
  
      <View style={styles.languageToggleContainer}>  
        <LanguageToggle />  
      </View>  
    </SafeAreaView>  
  )  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: "#f7f8fa",  
  },  
  header: {  
    flexDirection: "row",  
    alignItems: "center",  
    justifyContent: "space-between",  
    paddingHorizontal: 20,  
    paddingTop: 10,  
    paddingBottom: 20,  
  },  
  backButton: {  
    width: 60,  
  },  
  headerTitle: {  
    fontSize: 18,  
    fontWeight: "600",  
    color: "#111",  
  },  
  skipButton: {  
    width: 60,  
    alignItems: "flex-end",  
  },  
  skipButtonText: {  
    color: "#2673f3",  
    fontSize: 16,  
    fontWeight: "500",  
  },  
  content: {  
    flex: 1,  
    alignItems: "center",  
    justifyContent: "center",  
    paddingHorizontal: 24,  
  },  
  avatarContainer: {  
    marginBottom: 40,  
  },  
  avatarWrapper: {  
    width: 200,  
    height: 200,  
    borderRadius: 100,  
    overflow: "hidden",  
    borderWidth: 3,  
    borderColor: "#e5e5e5",  
  },  
  avatar: {  
    width: "100%",  
    height: "100%",  
  },  
  avatarPlaceholder: {  
    width: "100%",  
    height: "100%",  
    backgroundColor: "#f0f0f0",  
    alignItems: "center",  
    justifyContent: "center",  
  },  
  changePhotoButton: {  
    flexDirection: "row",  
    alignItems: "center",  
    borderWidth: 1,  
    borderColor: "#2673f3",  
    paddingHorizontal: 20,  
    paddingVertical: 12,  
    borderRadius: 12,  
    marginBottom: 40,  
    backgroundColor: "white",  
  },  
  changePhotoText: {  
    color: "#2673f3",  
    fontSize: 16,  
    fontWeight: "500",  
    marginLeft: 8,  
  },  
  subtitle: {  
    fontSize: 16,  
    color: "#667",  
    textAlign: "center",  
    lineHeight: 22,  
    paddingHorizontal: 20,  
  },  
  footer: {  
    paddingHorizontal: 24,  
    paddingBottom: 40,  
    paddingTop: 20,  
  },  
  continueButton: {  
    backgroundColor: "#2673f3",  
    paddingVertical: 16,  
    borderRadius: 12,  
    alignItems: "center",  
  },  
  continueButtonDisabled: {  
    backgroundColor: "#a0a0a0",  
  },  
  continueButtonText: {  
    color: "white",  
    fontSize: 16,  
    fontWeight: "600",  
  },  
  languageToggleContainer: {  
    position: "absolute",  
    top: 60,  
    right: 20,  
  },  
})