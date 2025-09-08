import React, { useState } from 'react'  
import {   
  View,   
  Text,   
  StyleSheet,   
  ScrollView,   
  TouchableOpacity,   
  SafeAreaView,  
  Switch,  
  Alert   
} from 'react-native'  
import { ArrowLeft, Bell, Users, Shield, Trash2, Settings } from 'lucide-react-native'  
  
export function CommunitySettingsScreen({ navigation, route }: any) {  
  const communityId = route?.params?.communityId || '1'  
  const [notifications, setNotifications] = useState(true)  
  const [publicPosts, setPublicPosts] = useState(true)  
  const [allowInvites, setAllowInvites] = useState(false)  
  const [moderationMode, setModerationMode] = useState(false)  
  
  const handleLeaveCommunity = () => {  
    Alert.alert(  
      'Abandonar Comunidad',  
      '¿Estás seguro de que quieres abandonar esta comunidad?',  
      [  
        { text: 'Cancelar', style: 'cancel' },  
        {   
          text: 'Abandonar',   
          style: 'destructive',  
          onPress: () => {  
            Alert.alert('Éxito', 'Has abandonado la comunidad')  
            navigation.goBack()  
          }  
        }  
      ]  
    )  
  }  
  
  const handleDeleteCommunity = () => {  
    Alert.alert(  
      'Eliminar Comunidad',  
      'Esta acción no se puede deshacer. ¿Estás seguro?',  
      [  
        { text: 'Cancelar', style: 'cancel' },  
        {   
          text: 'Eliminar',   
          style: 'destructive',  
          onPress: () => {  
            Alert.alert('Éxito', 'La comunidad ha sido eliminada')  
            navigation.navigate('Communities')  
          }  
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
        <Text style={styles.headerTitle}>Configuración de Comunidad</Text>  
        <View style={styles.headerRight} />  
      </View>  
  
      <ScrollView style={styles.scrollView}>  
        <View style={styles.section}>  
          <Text style={styles.sectionTitle}>Notificaciones</Text>  
            
          <View style={styles.settingItem}>  
            <View style={styles.settingInfo}>  
              <Bell size={20} color="#666" />  
              <View style={styles.settingText}>  
                <Text style={styles.settingTitle}>Notificaciones Push</Text>  
                <Text style={styles.settingDescription}>  
                  Recibe notificaciones de nuevas publicaciones  
                </Text>  
              </View>  
            </View>  
            <Switch  
              value={notifications}  
              onValueChange={setNotifications}  
              trackColor={{ false: '#ccc', true: '#007AFF' }}  
            />  
          </View>  
        </View>  
  
        <View style={styles.section}>  
          <Text style={styles.sectionTitle}>Privacidad</Text>  
            
          <View style={styles.settingItem}>  
            <View style={styles.settingInfo}>  
              <Users size={20} color="#666" />  
              <View style={styles.settingText}>  
                <Text style={styles.settingTitle}>Publicaciones Públicas</Text>  
                <Text style={styles.settingDescription}>  
                  Permite que otros vean tus publicaciones  
                </Text>  
              </View>  
            </View>  
            <Switch  
              value={publicPosts}  
              onValueChange={setPublicPosts}  
              trackColor={{ false: '#ccc', true: '#007AFF' }}  
            />  
          </View>  
  
          <View style={styles.settingItem}>  
            <View style={styles.settingInfo}>  
              <Shield size={20} color="#666" />  
              <View style={styles.settingText}>  
                <Text style={styles.settingTitle}>Permitir Invitaciones</Text>  
                <Text style={styles.settingDescription}>  
                  Otros pueden invitarte a comunidades  
                </Text>  
              </View>  
            </View>  
            <Switch  
              value={allowInvites}  
              onValueChange={setAllowInvites}  
              trackColor={{ false: '#ccc', true: '#007AFF' }}  
            />  
          </View>  
        </View>  
  
        <View style={styles.section}>  
          <Text style={styles.sectionTitle}>Moderación</Text>  
            
          <View style={styles.settingItem}>  
            <View style={styles.settingInfo}>  
              <Settings size={20} color="#666" />  
              <View style={styles.settingText}>  
                <Text style={styles.settingTitle}>Modo Moderación</Text>  
                <Text style={styles.settingDescription}>  
                  Revisar publicaciones antes de publicar  
                </Text>  
              </View>  
            </View>  
            <Switch  
              value={moderationMode}  
              onValueChange={setModerationMode}  
              trackColor={{ false: '#ccc', true: '#007AFF' }}  
            />  
          </View>  
        </View>  
  
        <View style={styles.section}>  
          <Text style={styles.sectionTitle}>Acciones</Text>  
            
          <TouchableOpacity   
            style={styles.actionButton}  
            onPress={handleLeaveCommunity}  
          >  
            <Users size={20} color="#FF3B30" />  
            <Text style={styles.actionButtonText}>Abandonar Comunidad</Text>  
          </TouchableOpacity>  
  
          <TouchableOpacity   
            style={[styles.actionButton, styles.dangerButton]}  
            onPress={handleDeleteCommunity}  
          >  
            <Trash2 size={20} color="#FF3B30" />  
            <Text style={[styles.actionButtonText, styles.dangerText]}>  
              Eliminar Comunidad  
            </Text>  
          </TouchableOpacity>  
        </View>  
      </ScrollView>  
    </SafeAreaView>  
  )  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '#f7f8fa',  
  },  
  header: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    justifyContent: 'space-between',  
    paddingHorizontal: 20,  
    paddingVertical: 15,  
    backgroundColor: '#fff',  
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
  headerRight: {  
    width: 34,  
  },  
  scrollView: {  
    flex: 1,  
  },  
  section: {  
    backgroundColor: 'white',  
    marginTop: 20,  
    paddingVertical: 20,  
  },  
  sectionTitle: {  
    fontSize: 16,  
    fontWeight: '600',  
    color: '#111',  
    paddingHorizontal: 20,  
    marginBottom: 15,  
  },  
  settingItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    justifyContent: 'space-between',  
    paddingHorizontal: 20,  
    paddingVertical: 15,  
    borderBottomWidth: 1,  
    borderBottomColor: '#f0f0f0',  
  },  
  settingInfo: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    flex: 1,  
    gap: 15,  
  },  
  settingText: {  
    flex: 1,  
  },  
  settingTitle: {  
    fontSize: 16,  
    fontWeight: '500',  
    color: '#111',  
    marginBottom: 2,  
  },  
  settingDescription: {  
    fontSize: 13,  
    color: '#666',  
  },  
  actionButton: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    paddingHorizontal: 20,  
    paddingVertical: 15,  
    gap: 15,  
    borderBottomWidth: 1,  
    borderBottomColor: '#f0f0f0',  
  },  
  actionButtonText: {  
    fontSize: 16,  
    color: '#111',  
  },  
  dangerButton: {  
    backgroundColor: '#fff5f5',  
  },  
  dangerText: {  
    color: '#FF3B30',  
  },  
})  
  
export default CommunitySettingsScreen