import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react-native'
import { useRoute } from '@react-navigation/native'
import { request } from '../rest/client'
import { useAuthGuard } from '../hooks/useAuthGuard'
import { InvestiVideoPlayer } from '../components/InvestiVideoPlayer'
import Constants from 'expo-constants'

interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  video_url?: string
  content: string
  duration: number
  order: number
  created_at: string
}

export function LessonDetailScreen({ navigation }: any) {
  const route = useRoute()
  const { lessonId, courseId } = route.params as { lessonId: string; courseId: string }
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [marking, setMarking] = useState(false)
  const [generatingContent, setGeneratingContent] = useState(false)

  useAuthGuard()

  useEffect(() => {
    loadLesson()
  }, [lessonId])

  const loadLesson = async () => {
    try {
      setLoading(true)
      const { data, error } = await request('GET', '/lessons', {
        params: { id: `eq.${lessonId}` }
      })
      if (!error && data && data.length > 0) {
        const lessonData = data[0]
        setLesson(lessonData)
        
        // Si no tiene contenido, generarlo con IRI
        if (!lessonData.content || lessonData.content.trim() === '' || lessonData.content.includes('Aquí iría')) {
          await generateLessonContent(lessonData)
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error)
      Alert.alert('Error', 'No se pudo cargar la lección')
    } finally {
      setLoading(false)
    }
  }
  
  const generateLessonContent = async (lessonData: Lesson) => {
    try {
      setGeneratingContent(true)
      console.log('🤖 Generando contenido de lección con IRI...')
      
      const GROK_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GROK_API_KEY
      const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
      
      if (!GROK_API_KEY) {
        console.error('❌ No GROK_API_KEY configurada')
        return
      }
      
      const prompt = `Eres un experto en educación financiera. Genera una lección completa y detallada sobre el siguiente tema:

Título: ${lessonData.title}
Descripción: ${lessonData.description}

La lección debe incluir:
1. Introducción clara y motivadora
2. Conceptos clave explicados de forma simple
3. Ejemplos prácticos con números reales
4. Consejos útiles
5. Resumen final

Formato: Texto claro y estructurado, sin markdown. Usa emojis para hacer más amigable el contenido.`
      
      const response = await fetch(GROK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Eres un experto en educación financiera que crea contenido educativo claro y práctico.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }
      
      const result = await response.json()
      const generatedContent = result.choices?.[0]?.message?.content
      
      if (generatedContent) {
        console.log('✅ Contenido generado exitosamente')
        // Actualizar el estado local
        setLesson({ ...lessonData, content: generatedContent })
        
        // Guardar en BD (opcional)
        try {
          await request('PATCH', '/lessons', {
            params: { id: `eq.${lessonData.id}` },
            body: { content: generatedContent }
          })
          console.log('✅ Contenido guardado en BD')
        } catch (saveError) {
          console.error('⚠️ Error guardando contenido:', saveError)
        }
      }
    } catch (error) {
      console.error('❌ Error generando contenido:', error)
    } finally {
      setGeneratingContent(false)
    }
  }

  const handleMarkAsCompleted = async () => {
    try {
      setMarking(true)
      // Aquí iría la lógica para marcar como completado
      // await request('POST', '/user_lesson_progress', { ... })
      setCompleted(true)
      Alert.alert('Éxito', 'Lección marcada como completada')
    } catch (error) {
      console.error('Error marking lesson as completed:', error)
      Alert.alert('Error', 'No se pudo marcar como completada')
    } finally {
      setMarking(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
        </View>
      </SafeAreaView>
    )
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Lección no encontrada</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se pudo cargar la lección</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {lesson.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Player */}
        {lesson.video_url && (
          <View style={styles.videoContainer}>
            <InvestiVideoPlayer
              uri={lesson.video_url}
              style={styles.videoContainer}
            />
          </View>
        )}

        {/* Lesson Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Clock size={18} color="#2673f3" />
            <Text style={styles.infoText}>
              Duración: {lesson.duration} minutos
            </Text>
          </View>
          {completed && (
            <View style={styles.infoItem}>
              <CheckCircle size={18} color="#10B981" />
              <Text style={styles.infoText}>Completada</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {lesson.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.sectionContent}>{lesson.description}</Text>
          </View>
        )}

        {/* Content */}
        {generatingContent ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contenido</Text>
            <View style={styles.generatingContainer}>
              <ActivityIndicator size="small" color="#2673f3" />
              <Text style={styles.generatingText}>🤖 IRI está generando el contenido de la lección...</Text>
            </View>
          </View>
        ) : lesson.content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contenido</Text>
            <Text style={styles.sectionContent}>{lesson.content}</Text>
          </View>
        )}

        {/* Spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Mark as Completed Button */}
      {!completed && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleMarkAsCompleted}
            disabled={marking}
          >
            <Text style={styles.buttonText}>
              {marking ? 'Marcando...' : 'Marcar como completada'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    flex: 1,
    marginHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#000',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 12,
  },
  generatingText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#2673f3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
