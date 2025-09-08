import React from 'react'  
import {   
  View,   
  Text,   
  StyleSheet,   
  ScrollView,   
  TouchableOpacity,   
  SafeAreaView,  
  Image   
} from 'react-native'  
import { ArrowLeft, Clock, Eye, Share } from 'lucide-react-native'  
  
export function NewsDetailScreen({ navigation, route }: any) {  
  const newsId = route?.params?.newsId || '1'  
  
  const newsData = {  
    id: newsId,  
    title: 'Mercado de Valores Alcanza Nuevos Máximos',  
    content: `El mercado de valores experimentó un crecimiento significativo durante la sesión de hoy,   
    con el índice principal alcanzando niveles récord. Los analistas atribuyen este comportamiento   
    a varios factores económicos positivos.  
  
    Las acciones de tecnología lideraron las ganancias, seguidas por el sector financiero.   
    Los inversores muestran optimismo ante las próximas decisiones de política monetaria.  
  
    Expertos recomiendan mantener una estrategia diversificada y no dejarse llevar por la   
    euforia del momento. La volatilidad sigue siendo un factor importante a considerar.`,  
    publishDate: '2 de septiembre, 2025',  
    readTime: '3 min',  
    views: 2847,  
    author: 'Redacción Investí'  
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
        <Text style={styles.headerTitle}>Noticia</Text>  
        <TouchableOpacity style={styles.shareButton}>  
          <Share size={20} color="#007AFF" />  
        </TouchableOpacity>  
      </View>  
  
      <ScrollView style={styles.scrollView}>  
        <View style={styles.imageContainer}>  
          <Image  
            source={{  
              uri: "https://via.placeholder.com/400x200/007AFF/FFFFFF?text=Mercado+de+Valores"  
            }}  
            style={styles.newsImage}  
            resizeMode="cover"  
          />  
        </View>  
  
        <View style={styles.content}>  
          <Text style={styles.title}>{newsData.title}</Text>  
            
          <View style={styles.metadata}>  
            <Text style={styles.author}>Por {newsData.author}</Text>  
            <View style={styles.metadataRow}>  
              <View style={styles.metadataItem}>  
                <Clock size={14} color="#666" />  
                <Text style={styles.metadataText}>{newsData.readTime}</Text>  
              </View>  
              <View style={styles.metadataItem}>  
                <Eye size={14} color="#666" />  
                <Text style={styles.metadataText}>{newsData.views.toLocaleString()}</Text>  
              </View>  
            </View>  
            <Text style={styles.publishDate}>{newsData.publishDate}</Text>  
          </View>  
  
          <Text style={styles.contentText}>{newsData.content}</Text>  
        </View>  
      </ScrollView>  
    </SafeAreaView>  
  )  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '#fff',  
  },  
  header: {flexDirection: 'row',  
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
  shareButton: {  
    padding: 5,  
  },  
  scrollView: {  
    flex: 1,  
  },  
  imageContainer: {  
    height: 200,  
    backgroundColor: '#f0f0f0',  
  },  
  newsImage: {  
    width: '100%',  
    height: '100%',  
  },  
  content: {  
    padding: 20,  
  },  
  title: {  
    fontSize: 24,  
    fontWeight: 'bold',  
    color: '#111',  
    marginBottom: 15,  
    lineHeight: 30,  
  },  
  metadata: {  
    marginBottom: 20,  
    paddingBottom: 15,  
    borderBottomWidth: 1,  
    borderBottomColor: '#eee',  
  },  
  author: {  
    fontSize: 14,  
    color: '#007AFF',  
    fontWeight: '500',  
    marginBottom: 8,  
  },  
  metadataRow: {  
    flexDirection: 'row',  
    gap: 15,  
    marginBottom: 8,  
  },  
  metadataItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    gap: 4,  
  },  
  metadataText: {  
    fontSize: 12,  
    color: '#666',  
  },  
  publishDate: {  
    fontSize: 12,  
    color: '#999',  
  },  
  contentText: {  
    fontSize: 16,  
    color: '#333',  
    lineHeight: 24,  
  },  
})  
  
export default NewsDetailScreen