"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native"
import { useTranslation } from "react-i18next"
import { ArrowRight, BookOpen, BarChart2, DollarSign, TrendingUp, ChevronRight, Play, CheckCircle, Clock as Clock3 } from "lucide-react-native"
import { getCurrentUserId } from "../rest/client"
import { LanguageToggle } from "../components/LanguageToggle"
import { EmptyState } from "../components/EmptyState"
import { useAuthGuard } from "../hooks/useAuthGuard"

type Course = {
  id: string
  title: string
  description: string
  duration: string
  level: string
  lessons: number
  progress: number
  imageUrl: string
}

type Article = {
  id: string
  title: string
  readTime: string
  category: string
  imageUrl: string
}

export function InversionesScreen({ navigation }: any) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('cursos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [articles, setArticles] = useState<Article[]>([])

  useAuthGuard()

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Datos de ejemplo para cursos
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Introducción a las inversiones',
          description: 'Aprende los conceptos básicos para comenzar a invertir de manera inteligente',
          duration: '4 semanas',
          level: 'Principiante',
          lessons: 12,
          progress: 30,
          imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: '2',
          title: 'Bolsa de Valores 101',
          description: 'Todo lo que necesitas saber para invertir en la bolsa de valores',
          duration: '6 semanas',
          level: 'Intermedio',
          lessons: 18,
          progress: 10,
          imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        }
      ]

      // Datos de ejemplo para artículos
      const mockArticles: Article[] = [
        {
          id: '1',
          title: '5 errores comunes al comenzar a invertir',
          readTime: '5 min',
          category: 'Consejos',
          imageUrl: 'https://images.unsplash.com/photo-1554224155-3a58922a22c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: '2',
          title: 'Guía de fondos indexados para principiantes',
          readTime: '8 min',
          category: 'Educación',
          imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        }
      ]

      setCourses(mockCourses)
      setArticles(mockArticles)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Error al cargar el contenido')
      setLoading(false)
    }
  }

  const renderCourseCard = (course: Course) => (
    <TouchableOpacity 
      key={course.id} 
      style={styles.courseCard}
      onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
    >
      <Image 
        source={{ uri: course.imageUrl }} 
        style={styles.courseImage}
        resizeMode="cover"
      />
      <View style={styles.courseContent}>
        <Text style={styles.courseLevel}>{course.level}</Text>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDescription}>{course.description}</Text>
        
        <View style={styles.courseMeta}>
          <View style={styles.metaItem}>
            <BookOpen size={14} color="#666" />
            <Text style={styles.metaText}>{course.lessons} lecciones</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock3 size={16} color="#6B7280" />
            <Text style={styles.metaText}>{course.duration}</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${course.progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{course.progress}% completado</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderArticleCard = (article: Article) => (
    <TouchableOpacity 
      key={article.id} 
      style={styles.articleCard}
      onPress={() => navigation.navigate('ArticleDetail', { articleId: article.id })}
    >
      <Image 
        source={{ uri: article.imageUrl }} 
        style={styles.articleImage}
        resizeMode="cover"
      />
      <View style={styles.articleContent}>
        <Text style={styles.articleCategory}>{article.category}</Text>
        <Text style={styles.articleTitle}>{article.title}</Text>
        <View style={styles.articleFooter}>
          <Text style={styles.articleReadTime}>
            <Clock3 size={12} color="#666" /> {article.readTime} de lectura
          </Text>
          <ChevronRight size={16} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('investing.title')}</Text>
          <LanguageToggle />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('investing.title')}</Text>
          <LanguageToggle />
        </View>
        <EmptyState
          title={t('common.errorLoading')}
          message={t('common.retry')}
          onRetry={loadContent}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('investing.title')}</Text>
        <LanguageToggle />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Aprende a invertir desde cero</Text>
          <Text style={styles.heroSubtitle}>Cursos y recursos para comenzar tu viaje en el mundo de las inversiones</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <DollarSign size={24} color="#2673f3" />
              <Text style={styles.statNumber}>1,200+</Text>
              <Text style={styles.statLabel}>Estudiantes</Text>
            </View>
            <View style={styles.statItem}>
              <BookOpen size={24} color="#2673f3" />
              <Text style={styles.statNumber}>15+</Text>
              <Text style={styles.statLabel}>Cursos</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={24} color="#2673f3" />
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Satisfacción</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'cursos' && styles.activeTab]}
            onPress={() => setActiveTab('cursos')}
          >
            <Text style={[styles.tabText, activeTab === 'cursos' && styles.activeTabText]}>
              Cursos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'articulos' && styles.activeTab]}
            onPress={() => setActiveTab('articulos')}
          >
            <Text style={[styles.tabText, activeTab === 'articulos' && styles.activeTabText]}>
              Artículos
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === 'cursos' ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cursos populares</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>Ver todos</Text>
                </TouchableOpacity>
              </View>
              
              {courses.map(course => renderCourseCard(course))}
              
              <View style={styles.featuredSection}>
                <Text style={styles.sectionTitle}>Nuevo en la plataforma</Text>
                <View style={styles.featuredCard}>
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredBadge}>Nuevo</Text>
                    <Text style={styles.featuredTitle}>Inversiones en criptomonedas</Text>
                    <Text style={styles.featuredDescription}>Todo lo que necesitas saber sobre criptomonedas</Text>
                    <TouchableOpacity style={styles.featuredButton}>
                      <Text style={styles.featuredButtonText}>Comenzar ahora</Text>
                      <ArrowRight size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1639762681057-1e73aa6ed8c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Artículos recientes</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>Ver todos</Text>
                </TouchableOpacity>
              </View>
              
              {articles.map(article => renderArticleCard(article))}
              
              <View style={styles.newsletter}>
                <Text style={styles.newsletterTitle}>Recibe consejos semanales</Text>
                <Text style={styles.newsletterText}>Suscríbete a nuestro boletín para recibir los mejores consejos de inversión directamente en tu correo.</Text>
                <TouchableOpacity style={styles.newsletterButton}>
                  <Text style={styles.newsletterButtonText}>Suscribirme</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    padding: 20,
    backgroundColor: "#2673f3",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#2673f3",
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  seeAll: {
    color: "#2673f3",
    fontSize: 14,
  },
  courseCard: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseImage: {
    width: "100%",
    height: 120,
  },
  courseContent: {
    padding: 16,
  },
  courseLevel: {
    fontSize: 12,
    color: "#2673f3",
    fontWeight: "600",
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  courseMeta: {
    flexDirection: "row",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2673f3",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  articleCard: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  articleImage: {
    width: 100,
    height: 100,
  },
  articleContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  articleCategory: {
    fontSize: 12,
    color: "#2673f3",
    fontWeight: "600",
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
    flex: 1,
  },
  articleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  articleReadTime: {
    fontSize: 12,
    color: "#666",
    flexDirection: "row",
    alignItems: "center",
  },
  featuredSection: {
    marginTop: 24,
  },
  featuredCard: {
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "row",
    height: 160,
  },
  featuredContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  featuredBadge: {
    backgroundColor: "#e6f0ff",
    color: "#2673f3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  featuredButton: {
    backgroundColor: "#2673f3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  featuredButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 4,
  },
  featuredImage: {
    width: 120,
    height: "100%",
  },
  newsletter: {
    backgroundColor: "#f0f5ff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  newsletterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
  },
  newsletterText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  newsletterButton: {
    backgroundColor: "#2673f3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  newsletterButtonText: {
    color: "white",
    fontWeight: "600",
  },
})
