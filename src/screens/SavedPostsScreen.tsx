import React from 'react'  
import {   
  View,   
  Text,   
  StyleSheet,   
  FlatList,   
  TouchableOpacity,   
  SafeAreaView   
} from 'react-native'  
import { ArrowLeft, Bookmark, Clock, Eye } from 'lucide-react-native'  
  
const savedPosts = [  
  {  
    id: '1',  
    title: 'Guía de Inversión para Principiantes',  
    excerpt: 'Aprende los conceptos básicos para comenzar a invertir de manera inteligente y segura...',  
    date: 'Hace 2 días',  
    readTime: '5 min',  
    views: 1234  
  },  
  {  
    id: '2',  
    title: 'Análisis del Mercado Actual',  
    excerpt: 'Tendencias y predicciones para los próximos meses en el mercado financiero...',  
    date: 'Hace 1 semana',  
    readTime: '8 min',  
    views: 856  
  },  
  {  
    id: '3',  
    title: 'Diversificación de Portafolio',  
    excerpt: 'Estrategias para reducir riesgos y maximizar retornos en tus inversiones...',  
    date: 'Hace 2 semanas',  
    readTime: '6 min',  
    views: 2341  
  },  
  {  
    id: '4',  
    title: 'Criptomonedas: Guía Completa',  
    excerpt: 'Todo lo que necesitas saber sobre el mundo de las criptomonedas...',  
    date: 'Hace 3 semanas',  
    readTime: '12 min',  
    views: 3456  
  },  
]  
  
export function SavedPostsScreen({ navigation }: any) {  
  const renderPostItem = ({ item }: { item: typeof savedPosts[0] }) => (  
    <TouchableOpacity   
      style={styles.postItem}  
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}  
    >  
      <View style={styles.postHeader}>  
        <Bookmark size={16} color="#007AFF" />  
        <Text style={styles.postDate}>{item.date}</Text>  
      </View>  
        
      <Text style={styles.postTitle}>{item.title}</Text>  
      <Text style={styles.postExcerpt}>{item.excerpt}</Text>  
        
      <View style={styles.postFooter}>  
        <View style={styles.postStat}>  
          <Clock size={14} color="#666" />  
          <Text style={styles.postStatText}>{item.readTime}</Text>  
        </View>  
        <View style={styles.postStat}>  
          <Eye size={14} color="#666" />  
          <Text style={styles.postStatText}>{item.views.toLocaleString()}</Text>  
        </View>  
      </View>  
    </TouchableOpacity>  
  )  
  
  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <TouchableOpacity   
          style={styles.backButton}   
          onPress={() => navigation.goBack()}  
        >  
          <ArrowLeft size={24} color="#111" />  
        </TouchableOpacity>  
        <Text style={styles.headerTitle}>Publicaciones Guardadas</Text>  
        <View style={styles.headerRight} />  
      </View>  
  
      <View style={styles.content}>  
        {savedPosts.length > 0 ? (  
          <>  
            <Text style={styles.subtitle}>  
              {savedPosts.length} publicaciones guardadas  
            </Text>  
              
            <FlatList  
              data={savedPosts}  
              keyExtractor={(item) => item.id}  
              renderItem={renderPostItem}  
              showsVerticalScrollIndicator={false}  
              contentContainerStyle={styles.listContainer}  
            />  
          </>  
        ) : (  
          <View style={styles.emptyState}>  
            <Bookmark size={48} color="#ccc" />  
            <Text style={styles.emptyTitle}>No hay publicaciones guardadas</Text>  
            <Text style={styles.emptyDescription}>  
              Guarda publicaciones interesantes para leerlas más tarde  
            </Text>  
          </View>  
        )}  
      </View>  
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
  content: {  
    flex: 1,  
    padding: 20,  
  },  
  subtitle: {  
    fontSize: 16,  
    color: '#666',  
    marginBottom: 20,  
  },  
  listContainer: {  
    paddingBottom: 20,  
  },  
  postItem: {  
    backgroundColor: 'white',  
    borderRadius: 12,  
    padding: 16,  
    marginBottom: 12,  
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.1,  
    shadowRadius: 4,  
    elevation: 3,  
  },  
  postHeader: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    marginBottom: 8,  
    gap: 8,  
  },  
  postDate: {  
    fontSize: 12,  
    color: '#666',  
  },  
  postTitle: {  
    fontSize: 18,  
    fontWeight: '600',  
    color: '#111',  
    marginBottom: 8,  
  },  
  postExcerpt: {  
    color: '#666',  
    lineHeight: 20,  
    marginBottom: 12,  
  },  
  postFooter: {  
    flexDirection: 'row',  
    gap: 15,  
  },  
  postStat: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    gap: 4,  
  },  
  postStatText: {  
    fontSize: 12,  
    color: '#666',  
  },  
  emptyState: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
  },  
  emptyTitle: {  
    fontSize: 18,  
    fontWeight: '600',  
    color: '#111',  
    marginTop: 16,  
    marginBottom: 8,  
  },  
  emptyDescription: {  
    fontSize: 14,  
    color: '#666',  
    textAlign: 'center',  
  },  
})  
  
export default SavedPostsScreen