import React, { useState } from 'react'  
import {   
  View,   
  Text,   
  TextInput,   
  StyleSheet,   
  TouchableOpacity,   
  SafeAreaView,  
  Alert   
} from 'react-native'  
import { ArrowLeft, Camera, Image as ImageIcon } from 'lucide-react-native'  
  
export function SharePostScreen({ navigation }: any) {  
  const [postText, setPostText] = useState('')  
  
  const handleShare = () => {  
    if (!postText.trim()) {  
      Alert.alert('Error', 'Por favor escribe algo antes de compartir')  
      return  
    }  
      
    Alert.alert(  
      'Publicación Compartida',  
      'Tu publicación ha sido compartida exitosamente',  
      [  
        {  
          text: 'OK',  
          onPress: () => navigation.goBack()  
        }  
      ]  
    )  
  }  
  
  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <TouchableOpacity   
          style={styles.backButton}   
          onPress={() => navigation.goBack()}  
        >  
          <ArrowLeft size={24} color="#111" />  
        </TouchableOpacity>  
        <Text style={styles.headerTitle}>Compartir Publicación</Text>  
        <TouchableOpacity   
          style={styles.shareHeaderButton}   
          onPress={handleShare}  
        >  
          <Text style={styles.shareHeaderText}>Publicar</Text>  
        </TouchableOpacity>  
      </View>  
  
      <View style={styles.content}>  
        <TextInput  
          style={styles.input}  
          placeholder="¿Qué estás pensando sobre inversiones?"  
          placeholderTextColor="#999"  
          multiline  
          value={postText}  
          onChangeText={setPostText}  
          maxLength={500}  
        />  
          
        <View style={styles.characterCount}>  
          <Text style={styles.characterText}>{postText.length}/500</Text>  
        </View>  
  
        <View style={styles.actionsContainer}>  
          <TouchableOpacity style={styles.actionButton}>  
            <Camera size={20} color="#007AFF" />  
            <Text style={styles.actionText}>Foto</Text>  
          </TouchableOpacity>  
            
          <TouchableOpacity style={styles.actionButton}>  
            <ImageIcon size={20} color="#007AFF" />  
            <Text style={styles.actionText}>Galería</Text>  
          </TouchableOpacity>  
        </View>  
      </View>  
    </SafeAreaView>  
  )  
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
    paddingHorizontal: 20,  
    paddingVertical: 15,  
    borderBottomWidth: 1,  
    borderBottomColor: '#eee',  
  },  
  backButton: {  
    padding: 5,  
  },  
  headerTitle: {  
    fontSize: 18,  
    fontWeight: '600',  
    color: '#111',  
  },  
  shareHeaderButton: {  
    backgroundColor: '#007AFF',  
    paddingHorizontal: 16,  
    paddingVertical: 8,  
    borderRadius: 20,  
  },  
  shareHeaderText: {  
    color: '#fff',  
    fontWeight: '600',  
    fontSize: 14,  
  },  
  content: {  
    flex: 1,  
    padding: 20,  
  },  
  input: {  
    borderWidth: 1,  
    borderColor: '#ddd',  
    borderRadius: 12,  
    padding: 15,  
    minHeight: 200,  
    textAlignVertical: 'top',  
    fontSize: 16,  
    lineHeight: 22,  
  },  
  characterCount: {  
    alignItems: 'flex-end',  
    marginTop: 10,  
    marginBottom: 20,  
  },  
  characterText: {  
    fontSize: 12,  
    color: '#999',  
  },  
  actionsContainer: {  
    flexDirection: 'row',  
    gap: 15,  
  },  
  actionButton: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    backgroundColor: 'rgba(0, 122, 255, 0.1)',  
    paddingHorizontal: 15,  
    paddingVertical: 10,  
    borderRadius: 20,  
    gap: 8,  
  },  
  actionText: {  
    color: '#007AFF',  
    fontWeight: '500',  
  },  
})  
  
export default SharePostScreen