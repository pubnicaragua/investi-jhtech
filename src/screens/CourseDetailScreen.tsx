import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image
} from 'react-native'
import { ArrowLeft, Play, Clock, BookOpen, Star } from 'lucide-react-native'
import { getCourseDetails } from '../api'

export function CourseDetailScreen({ navigation, route }: any) {
  const courseId = route?.params?.courseId
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        setError('No se especificó un curso')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getCourseDetails(courseId)
        
        if (!data) {
          throw new Error('No se pudo cargar el curso')
        }
        
        setCourse(data)
      } catch (err) {
        console.error('Error loading course:', err)
        setError('Error al cargar el curso')
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId])

  const handleLessonPress = (lesson: any) => {
    // Por ahora solo mostramos las lecciones, navegación a videos pendiente
    console.log('Lección seleccionada:', lesson.titulo)
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getTotalDuration = () => {
    if (!course?.lessons) return 0
    return course.lessons.reduce((total: number, lesson: any) => total + (lesson.duration || 0), 0)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
          <Text style={styles.loadingText}>Cargando curso...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Curso no encontrado'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
        <Text style={styles.headerTitle}>Detalle del Curso</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        {course.thumbnail_url && (
          <Image
            source={{ uri: course.thumbnail_url }}
            style={styles.courseThumbnail}
            resizeMode="cover"
          />
        )}

        <View style={styles.courseHeader}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          {course.instructor && (
            <Text style={styles.instructorName}>Por {course.instructor.name}</Text>
          )}

          <View style={styles.courseStats}>
            <View style={styles.statItem}>
              <Clock size={16} color="#666" />
              <Text style={styles.statText}>{formatDuration(getTotalDuration())}</Text>
            </View>
            <View style={styles.statItem}>
              <BookOpen size={16} color="#666" />
              <Text style={styles.statText}>{course.lessons?.length || 0} lecciones</Text>
            </View>
            <View style={styles.statItem}>
              <Star size={16} color="#FFD700" />
              <Text style={styles.statText}>{course.level || 'Principiante'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {course.description || 'No hay descripción disponible'}
          </Text>

          <Text style={styles.sectionTitle}>Contenido del Curso</Text>
          <View style={styles.lessonsList}>
            {course.lessons && course.lessons.length > 0 ? (
              course.lessons.map((lesson: any, index: number) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonItem}
                  onPress={() => handleLessonPress(lesson)}
                >
                  <View style={styles.lessonNumber}>
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.lessonContent}>
                    <Text style={styles.lessonText}>{lesson.titulo}</Text>
                    {lesson.descripcion && (
                      <Text style={styles.lessonDescription}>{lesson.descripcion}</Text>
                    )}
                    <View style={styles.lessonMeta}>
                      {lesson.duration && (
                        <Text style={styles.lessonDuration}>
                          {lesson.duration} min
                        </Text>
                      )}
                      {lesson.tipo && (
                        <Text style={styles.lessonType}>{lesson.tipo}</Text>
                      )}
                    </View>
                  </View>
                  <Play size={20} color="#2673f3" />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No hay lecciones disponibles</Text>
            )}
          </View>

          <TouchableOpacity style={styles.enrollButton}>
            <Text style={styles.enrollButtonText}>Comenzar Curso</Text>
          </TouchableOpacity>
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
  headerRight: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  courseHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 5,
  },
  instructorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  courseStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 10,
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  lessonsList: {
    marginTop: 10,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2673f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  lessonContent: {
    flex: 1,
  },
  lessonText: {
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#999',
  },
  lessonType: {
    fontSize: 12,
    color: '#2673f3',
    textTransform: 'capitalize',
  },
  enrollButton: {
    backgroundColor: '#2673f3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  enrollButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2673f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  courseThumbnail: {
    width: '100%',
    height: 200,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
})

export default CourseDetailScreen
