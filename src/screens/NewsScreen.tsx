import React, { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  ScrollView
} from "react-native"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Bookmark, Share2, Clock } from "lucide-react-native"

const NEWS_CATEGORIES = [
  'Todas',
  'Regulaciones',
  'Criptomonedas',
  'Tecnología',
  'Inversiones',
  'Startups',
  'Educación',
  'Mercados'
]

type NewsItem = {
  id: string
  title: string
  summary: string
  image: string
  date: string
  category: string
}

export function NewsScreen({ navigation }: any) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Todas')

  // Datos de ejemplo - en una app real, esto vendría de una API
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'Tendencias del mercado de criptomonedas',
      summary: 'Análisis detallado de las principales criptomonedas y su comportamiento en el mercado actual.',
      image: 'https://images.unsplash.com/photo-1639762681057-1e7ca56441a8?ixlib=rb-4.0.3',
      date: 'Hace 2 horas',
      category: 'Mercados'
    },
    {
      id: '2',
      title: 'Guía para principiantes en inversiones',
      summary: 'Todo lo que necesitas saber para comenzar a invertir de manera inteligente y segura.',
      image: 'https://images.unsplash.com/photo-1554224155-3a58922a22c3?ixlib=rb-4.0.3',
      date: 'Ayer',
      category: 'Educación'
    },
    {
      id: '3',
      title: 'Nuevas regulaciones financieras',
      summary: 'Cómo afectan las nuevas regulaciones a los pequeños y medianos inversionistas.',
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3',
      date: '17 ago',
      category: 'Regulaciones'
    },
  ]

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = () => {
    setLoading(true)
    // Simular carga de datos
    setTimeout(() => {
      setNews(mockNews)
      setLoading(false)
      setRefreshing(false)
    }, 1000)
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadNews()
  }

  const filteredNews = selectedCategory === 'Todas' 
    ? news 
    : news.filter(item => item.category === selectedCategory)

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => navigation.navigate('NewsDetail', { newsId: item.id })}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.newsImage}
        resizeMode="cover"
      />
      <View style={styles.newsContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
        <View style={styles.newsFooter}>
          <View style={styles.timeContainer}>
            <Clock size={14} color="#666" />
            <Text style={styles.timeText}>{item.date}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Bookmark size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Noticias</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filtros de Categorías */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {NEWS_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category && styles.categoryChipTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Contenido */}
      {loading && news.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
        </View>
      ) : (
        <FlatList
          data={filteredNews}
          renderItem={renderNewsItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2673f3']}
              tintColor="#2673f3"
            />
          }
        />
      )}
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 180,
  },
  newsContent: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: '#e6f0ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  categoryText: {
    color: '#2673f3',
    fontSize: 12,
    fontWeight: '600',
  },
  newsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
    marginBottom: 6,
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
  categoriesContainer: {
    maxHeight: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2673f3',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
})
