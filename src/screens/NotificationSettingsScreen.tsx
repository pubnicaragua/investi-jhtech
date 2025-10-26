import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native'
import { ArrowLeft } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'

export function NotificationSettingsScreen() {
  const navigation = useNavigation()
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    followNotifications: true,
    messageNotifications: true,
    communityNotifications: true,
    promotionNotifications: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = () => {
    Alert.alert('✓', 'Configuración de notificaciones guardada')
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Configuración de Notificaciones</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones Push</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Todas las notificaciones</Text>
              <Text style={styles.settingDescription}>Recibe todas las notificaciones en tu dispositivo</Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => handleToggle('pushNotifications')}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.pushNotifications ? '#1382EF' : '#F3F4F6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Notificaciones</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Recomendaciones</Text>
              <Text style={styles.settingDescription}>Cuando alguien recomienda tu post</Text>
            </View>
            <Switch
              value={settings.likeNotifications}
              onValueChange={() => handleToggle('likeNotifications')}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.likeNotifications ? '#1382EF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Comentarios</Text>
              <Text style={styles.settingDescription}>Cuando alguien comenta en tu post</Text>
            </View>
            <Switch
              value={settings.commentNotifications}
              onValueChange={() => handleToggle('commentNotifications')}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.commentNotifications ? '#1382EF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Nuevos Seguidores</Text>
              <Text style={styles.settingDescription}>Cuando alguien te sigue</Text>
            </View>
            <Switch
              value={settings.followNotifications}
              onValueChange={() => handleToggle('followNotifications')}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.followNotifications ? '#1382EF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Mensajes</Text>
              <Text style={styles.settingDescription}>Cuando recibes un mensaje nuevo</Text>
            </View>
            <Switch
              value={settings.messageNotifications}
              onValueChange={() => handleToggle('messageNotifications')}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.messageNotifications ? '#1382EF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Comunidades</Text>
              <Text style={styles.settingDescription}>Actualizaciones de comunidades</Text>
            </View>
            <Switch
              value={settings.communityNotifications}
              onValueChange={() => handleToggle('communityNotifications')}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.communityNotifications ? '#1382EF' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Promociones</Text>
              <Text style={styles.settingDescription}>Ofertas y promociones especiales</Text>
            </View>
            <Switch
              value={settings.promotionNotifications}
              onValueChange={() => handleToggle('promotionNotifications')}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.promotionNotifications ? '#1382EF' : '#F3F4F6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Correo Electrónico</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notificaciones por Email</Text>
              <Text style={styles.settingDescription}>Recibe resumen diario por correo</Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => handleToggle('emailNotifications')}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={settings.emailNotifications ? '#1382EF' : '#F3F4F6'}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#1382EF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
