import React, { useState, useEffect } from 'react';  
import {  
  View,  
  Text,  
  TouchableOpacity,  
  SafeAreaView,  
  ScrollView,  
  Image,  
  ActivityIndicator,  
  StyleSheet,  
  Alert,  
} from 'react-native';  
import { useTranslation } from 'react-i18next';  
import { Users } from 'lucide-react-native';  
import { listCommunities, joinCommunity } from '../rest/api';
import { getCurrentUserId } from '../rest/client';  
import { LanguageToggle } from '../components/LanguageToggle';  
import { EmptyState } from '../components/EmptyState';  
import { useAuthGuard } from '../hooks/useAuthGuard';  
  
interface Community {  
  id: string;  
  nombre: string;  
  descripcion?: string;  
  icono_url?: string;  
  member_count?: number;  
  created_at: string;  
}  
  
export const CommunitiesListScreen = ({ navigation }: any) => {  
  const { t } = useTranslation();  
  const [communities, setCommunities] = useState<Community[]>([]);  
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState<string | null>(null);  
  
  useAuthGuard();  
  
  useEffect(() => {  
    loadCommunities();  
  }, []);  
  
  const loadCommunities = async () => {  
    try {  
      setLoading(true);  
      setError(null);  
      const data = await listCommunities();  
      setCommunities(data || []);  
    } catch (error: any) {  
      console.error('Error loading communities:', error);  
      setError(error.message || 'Error al cargar comunidades');  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  const handleJoinCommunity = async (communityId: string) => {  
    try {  
      const userId = await getCurrentUserId();  
      if (!userId) {  
        Alert.alert('Error', 'No se pudo obtener el ID del usuario');  
        return;  
      }  
  
      await joinCommunity(userId, communityId);  
      setJoinedCommunities(prev => [...prev, communityId]);  
        
      Alert.alert('Éxito', 'Te has unido a la comunidad');  
    } catch (error: any) {  
      console.error('Error joining community:', error);  
      Alert.alert('Error', 'No se pudo unir a la comunidad');  
    }  
  };  
  
  if (loading) {  
    return (  
      <SafeAreaView style={styles.container}>  
        <View style={styles.header}>  
          <Text style={styles.headerTitle}>{t('communities.title')}</Text>  
          <LanguageToggle />  
        </View>  
        <View style={styles.loadingContainer}>  
          <ActivityIndicator size="large" color="#2673f3" />  
          <Text style={styles.loadingText}>Cargando comunidades...</Text>  
        </View>  
      </SafeAreaView>  
    );  
  }  
  
  if (error || communities.length === 0) {  
    return (  
      <SafeAreaView style={styles.container}>  
        <View style={styles.header}>  
          <Text style={styles.headerTitle}>{t('communities.title')}</Text>  
          <LanguageToggle />  
        </View>  
        <EmptyState  
          title={error || 'No hay comunidades disponibles'}  
          message="Intenta de nuevo"  
          onRetry={loadCommunities}  
        />  
      </SafeAreaView>  
    );  
  }  
  
  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <Text style={styles.headerTitle}>{t('communities.title')}</Text>  
        <LanguageToggle />  
      </View>  
  
      <ScrollView style={styles.scrollView}>  
        <View style={styles.content}>  
          {communities.map((community) => (  
            <View key={community.id} style={styles.communityCard}>  
              <View style={styles.communityHeader}>  
                <Image  
                  source={{   
                    uri: community.icono_url || 'https://www.investiiapp.com/investi-logo-new-main.png'   
                  }}  
                  style={styles.communityImage}  
                />  
                <View style={styles.communityInfo}>  
                  <Text style={styles.communityName}>  
                    {community.nombre}  
                  </Text>  
                  <View style={styles.communityMeta}>  
                    <Users size={16} color="#6B7280" />  
                    <Text style={styles.memberCount}>  
                      {community.member_count || 0} {t('communities.members')}  
                    </Text>  
                    <Text style={styles.separator}>•</Text>  
                    <Text style={styles.communityType}>  
                      {t('communities.publicCommunity')}  
                    </Text>  
                  </View>  
                </View>  
              </View>  
                
              {community.descripcion && (  
                <Text style={styles.communityDescription}>  
                  {community.descripcion}  
                </Text>  
              )}  
                
              <TouchableOpacity  
                style={[  
                  styles.joinButton,  
                  joinedCommunities.includes(community.id) && styles.joinedButton  
                ]}  
                onPress={() => handleJoinCommunity(community.id)}  
                disabled={joinedCommunities.includes(community.id)}  
              >  
                <Text style={styles.joinButtonText}>  
                  {joinedCommunities.includes(community.id)  
                    ? 'Unido'  
                    : t('communities.join')  
                  }  
                </Text>  
              </TouchableOpacity>  
            </View>  
          ))}  
        </View>  
      </ScrollView>  
    </SafeAreaView>  
  );  
};  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '#f7f8fa',  
  },  
  header: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'center',  
    padding: 16,  
    backgroundColor: 'white',  
    borderBottomWidth: 1,  
    borderBottomColor: '#e5e5e5',  
  },  
  headerTitle: {  
    fontSize: 20,  
    fontWeight: 'bold',  
    color: '#111',  
  },  
  loadingContainer: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
    padding: 40,  
  },  
  loadingText: {  
    marginTop: 16,  
    color: '#666',  
    fontSize: 16,  
  },  
  scrollView: {  
    flex: 1,  
  },  
  content: {  
    padding: 16,  
  },  
  communityCard: {  
    backgroundColor: 'white',  
    borderRadius: 12,  
    padding: 16,  
    marginBottom: 16,  
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.1,  
    shadowRadius: 4,  
    elevation: 2,  
  },  
  communityHeader: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    marginBottom: 12,  
  },  
  communityImage: {  
    width: 64,  
    height: 64,  
    borderRadius: 32,  
    marginRight: 16,  
  },  
  communityInfo: {  
    flex: 1,  
  },  
  communityName: {  
    fontSize: 18,  
    fontWeight: 'bold',  
    color: '#111',  
    marginBottom: 4,  
  },  
  communityMeta: {  
    flexDirection: 'row',  
    alignItems: 'center',  
  },  
  memberCount: {  
    color: '#6B7280',  
    marginLeft: 4,  
    fontSize: 14,  
  },  
  separator: {  
    color: '#9CA3AF',  
    marginHorizontal: 8,  
  },  
  communityType: {  
    color: '#6B7280',  
    fontSize: 14,  
  },  
  communityDescription: {  
    color: '#666',  
    marginBottom: 16,  
    lineHeight: 20,  
  },  
  joinButton: {  
    backgroundColor: '#2673f3',  
    paddingVertical: 12,  
    borderRadius: 8,  
    alignItems: 'center',  
  },  
  joinedButton: {  
    backgroundColor: '#10B981',  
  },  
  joinButtonText: {  
    color: 'white',  
    fontWeight: '600',  
    fontSize: 16,  
  },  
});