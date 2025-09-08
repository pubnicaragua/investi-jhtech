import React, { useState, useEffect } from 'react';  
import {  
  View,  
  Text,  
  StyleSheet,  
  SafeAreaView,  
  ScrollView,  
  TouchableOpacity,  
  Image,  
  ActivityIndicator,  
  RefreshControl,  
} from 'react-native';  
import { useTranslation } from 'react-i18next';  
import { useNavigation } from '@react-navigation/native';  
import { BookOpen, Book, Award, Clock, ChevronRight, Home, Users, MessageCircle, Bell, GraduationCap } from 'lucide-react-native';  
import { getCourses, getLessons, getUserLearningProgress, getCurrentUserId } from '../rest/api';  
import { LanguageToggle } from '../components/LanguageToggle';  
import { useAuthGuard } from '../hooks/useAuthGuard';  
import { useSafeAreaInsets } from 'react-native-safe-area-context';  
  
interface Course {  
  id: string;  
  title: string;  
  description: string;  
  image: string;  
  progress: number;  
  totalLessons: number;  
  duration: string;  
  category: string;  
  price: number;  
  currency: string;  
}  
  
interface Lesson {  
  id: string;  
  title: string;  
  duration: string;  
  completed: boolean;  
  type: 'video' | 'article' | 'quiz';  
}  
  
export function EducacionScreen() {  
  const { t } = useTranslation();  
  const navigation = useNavigation();  
  const insets = useSafeAreaInsets();  
  const [activeTab, setActiveTab] = useState('cursos');  
  const [loading, setLoading] = useState(true);  
  const [refreshing, setRefreshing] = useState(false);  
  const [courses, setCourses] = useState<Course[]>([]);  
  const [lessons, setLessons] = useState<Lesson[]>([]);  
  const [learningProgress, setLearningProgress] = useState<any[]>([]);  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);  
  
  useAuthGuard();  
  
  useEffect(() => {  
    loadData();  
  }, []);  
  
  const loadData = async (isRefreshing = false) => {  
    try {  
      if (!isRefreshing) setLoading(true);  
        
      const userId = await getCurrentUserId();  
      setCurrentUserId(userId);  
        
      const [coursesData, lessonsData, progressData] = await Promise.all([  
        getCourses(userId || undefined),  
        getLessons(userId || undefined),  
        userId ? getUserLearningProgress(userId) : Promise.resolve([])  
      ]);  
        
      setCourses(coursesData);  
      setLessons(lessonsData);  
      setLearningProgress(progressData);  
    } catch (error) {  
      console.error('Error loading education data:', error);  
    } finally {  
      setLoading(false);  
      setRefreshing(false);  
    }  
  };  
  
  const onRefresh = () => {  
    setRefreshing(true);  
    loadData(true);  
  };  
  
  const renderCourseItem = (course: Course) => (  
    <TouchableOpacity  
      key={course.id}  
      style={styles.courseCard}  
      onPress={() => navigation.navigate('CursoDetalle', { courseId: course.id })}  
    >  
      <Image  
        source={{ uri: course.image || 'https://via.placeholder.com/100' }}  
        style={styles.courseImage}  
      />  
      <View style={styles.courseInfo}>  
        <Text style={styles.courseTitle}>{course.title}</Text>  
        <Text style={styles.courseDescription} numberOfLines={2}>  
          {course.description}  
        </Text>  
          
        {course.progress > 0 && (  
          <View style={styles.progressContainer}>  
            <View style={styles.progressBar}>  
              <View style={[styles.progressFill, { width: `${course.progress}%` }]} />  
            </View>  
            <Text style={styles.progressText}>{course.progress}%</Text>  
          </View>  
        )}  
          
        <View style={styles.courseMeta}>  
          <View style={styles.metaItem}>  
            <Book size={14} color="#666" />  
            <Text style={styles.metaText}>{course.totalLessons} lecciones</Text>  
          </View>  
          <View style={styles.metaItem}>  
            <Clock size={14} color="#666" />  
            <Text style={styles.metaText}>{course.duration}</Text>  
          </View>  
        </View>  
          
        {course.price > 0 && (  
          <Text style={styles.coursePrice}>  
            {course.currency} ${course.price}  
          </Text>  
        )}  
      </View>  
      <ChevronRight size={20} color="#999" />  
    </TouchableOpacity>  
  );  
  
  const renderLessonItem = (lesson: Lesson) => (  
    <TouchableOpacity  
      key={lesson.id}  
      style={styles.lessonItem}  
      onPress={() => navigation.navigate('LeccionDetalle', { lessonId: lesson.id })}  
    >  
      <View style={styles.lessonIcon}>  
        {lesson.type === 'video' && <BookOpen size={20} color="#4A90E2" />}  
        {lesson.type === 'article' && <Book size={20} color="#50E3C2" />}  
        {lesson.type === 'quiz' && <Award size={20} color="#F5A623" />}  
        </View>  
      <View style={styles.lessonInfo}>  
        <Text style={styles.lessonTitle}>{lesson.title}</Text>  
        <View style={styles.lessonMeta}>  
          <View style={styles.lessonMetaItem}>  
            <Clock size={12} color="#999" />  
            <Text style={styles.lessonMetaText}>{lesson.duration}</Text>  
          </View>  
        </View>  
      </View>  
      {lesson.completed && (  
        <View style={styles.completedBadge}>  
          <Text style={styles.completedText}>Completado</Text>  
        </View>  
      )}  
    </TouchableOpacity>  
  );  
  
  if (loading && !refreshing) {  
    return (  
      <SafeAreaView style={styles.loadingContainer}>  
        <ActivityIndicator size="large" color="#4A90E2" />  
      </SafeAreaView>  
    );  
  }  
  
  return (  
    <View style={[styles.container, { paddingTop: insets.top }]}>  
      {/* Header */}  
      <View style={styles.header}>  
        <Text style={styles.headerTitle}>Educación Financiera</Text>  
        <LanguageToggle />  
      </View>  
  
      {/* Sección de progreso de aprendizaje */}  
      {learningProgress.length > 0 && (  
        <View style={styles.progressSection}>  
          <Text style={styles.sectionTitle}>Continúa aprendiendo</Text>  
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>  
            {learningProgress.map((progress, index) => (  
              <TouchableOpacity  
                key={index}  
                style={styles.progressCard}  
                onPress={() => navigation.navigate('CursoDetalle', { courseId: progress.courseId })}  
              >  
                <Image  
                  source={{ uri: progress.image || 'https://via.placeholder.com/120x80' }}  
                  style={styles.progressImage}  
                />  
                <Text style={styles.progressTitle} numberOfLines={2}>  
                  {progress.title}  
                </Text>  
                <Text style={styles.progressStatus}>  
                  {progress.completedLessons} de {progress.totalLessons} completadas  
                </Text>  
                <View style={styles.progressBarSmall}>  
                  <View style={[styles.progressFillSmall, { width: `${progress.progress}%` }]} />  
                </View>  
              </TouchableOpacity>  
            ))}  
          </ScrollView>  
        </View>  
      )}  
  
      {/* Tabs */}  
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
          style={[styles.tab, activeTab === 'lecciones' && styles.activeTab]}  
          onPress={() => setActiveTab('lecciones')}  
        >  
          <Text style={[styles.tabText, activeTab === 'lecciones' && styles.activeTabText]}>  
            Lecciones  
          </Text>  
        </TouchableOpacity>  
      </View>  
  
      {/* Content */}  
      <ScrollView  
        style={styles.content}  
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}  
      >  
        {activeTab === 'cursos' ? (  
          courses.length > 0 ? (  
            courses.map(renderCourseItem)  
          ) : (  
            <View style={styles.emptyState}>  
              <Text style={styles.emptyStateText}>No hay cursos disponibles</Text>  
            </View>  
          )  
        ) : lessons.length > 0 ? (  
          lessons.map(renderLessonItem)  
        ) : (  
          <View style={styles.emptyState}>  
            <Text style={styles.emptyStateText}>No hay lecciones disponibles</Text>  
          </View>  
        )}  
      </ScrollView>  
  
      {/* Navbar igual al HomeFeed */}  
      <View style={[styles.navbar, { paddingBottom: insets.bottom }]}>  
        <TouchableOpacity   
          style={styles.navItem}  
          onPress={() => navigation.navigate('HomeFeed')}  
        >  
          <Home size={24} color="#666" />  
          <Text style={styles.navText}>Inicio</Text>  
        </TouchableOpacity>  
  
        <TouchableOpacity   
          style={styles.navItem}  
          onPress={() => navigation.navigate('Communities')}  
        >  
          <Users size={24} color="#666" />  
          <Text style={styles.navText}>Comunidades</Text>  
        </TouchableOpacity>  
  
        <TouchableOpacity   
          style={styles.navItem}  
          onPress={() => navigation.navigate('Messages')}  
        >  
          <MessageCircle size={24} color="#666" />  
          <Text style={styles.navText}>Mensajes</Text>  
        </TouchableOpacity>  
  
        <TouchableOpacity   
          style={styles.navItem}  
          onPress={() => navigation.navigate('Notifications')}  
        >  
          <Bell size={24} color="#666" />  
          <Text style={styles.navText}>Notificaciones</Text>  
        </TouchableOpacity>  
  
        <TouchableOpacity   
          style={[styles.navItem, styles.activeNavItem]}  
        >  
          <GraduationCap size={24} color="#2673f3" />  
          <Text style={[styles.navText, styles.activeNavText]}>Educación</Text>  
        </TouchableOpacity>  
      </View>  
    </View>  
  );  
}  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '#fff',  
  },  
  loadingContainer: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
    backgroundColor: '#fff',  
  },  
  header: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'center',  
    padding: 16,  
    borderBottomWidth: 1,  
    borderBottomColor: '#eee',  
  },  
  headerTitle: {  
    fontSize: 20,  
    fontWeight: 'bold',  
    color: '#333',  
  },  
  progressSection: {  
    padding: 16,  
    backgroundColor: '#f8f9fa',  
  },  
  sectionTitle: {  
    fontSize: 18,  
    fontWeight: '600',  
    color: '#333',  
    marginBottom: 12,  
  },  
  progressCard: {  
    width: 140,  
    marginRight: 12,  
    backgroundColor: '#fff',  
    borderRadius: 8,  
    padding: 8,  
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 1 },  
    shadowOpacity: 0.1,  
    shadowRadius: 2,  
    elevation: 1,  
  },  
  progressImage: {  
    width: '100%',  
    height: 80,  
    borderRadius: 6,  
    marginBottom: 8,  
  },  
  progressTitle: {  
    fontSize: 14,  
    fontWeight: '600',  
    color: '#333',  
    marginBottom: 4,  
  },  
  progressStatus: {  
    fontSize: 12,  
    color: '#666',  
    marginBottom: 6,  
  },  
  progressBarSmall: {  
    height: 4,  
    backgroundColor: '#eee',  
    borderRadius: 2,  
    overflow: 'hidden',  
  },  
  progressFillSmall: {  
    height: '100%',  
    backgroundColor: '#4A90E2',  
    borderRadius: 2,  
  },  
  tabs: {  
    flexDirection: 'row',  
    borderBottomWidth: 1,  
    borderBottomColor: '#eee',  
  },  
  tab: {  
    flex: 1,  
    paddingVertical: 16,  
    alignItems: 'center',  
    borderBottomWidth: 2,  
    borderBottomColor: 'transparent',  
  },  
  activeTab: {  
    borderBottomColor: '#4A90E2',  
  },  
  tabText: {  
    fontSize: 16,  
    color: '#666',  
    fontWeight: '500',  
  },  
  activeTabText: {  
    color: '#4A90E2',  
    fontWeight: '600',  
  },  
  content: {  
    flex: 1,  
    padding: 16,  
  },  
  courseCard: {  
    flexDirection: 'row',  
    backgroundColor: '#fff',  
    borderRadius: 12,  
    padding: 12,  
    marginBottom: 16,  
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.1,  
    shadowRadius: 4,  
    elevation: 2,  
    alignItems: 'center',  
  },  
  courseImage: {  
    width: 80,  
    height: 80,  
    borderRadius: 8,  
    marginRight: 12,  
  },  
  courseInfo: {  
    flex: 1,  
    marginRight: 8,  
  },  
  courseTitle: {  
    fontSize: 16,  
    fontWeight: '600',  
    color: '#333',  
    marginBottom: 4,  
  },  
  courseDescription: {  
    fontSize: 12,  
    color: '#666',  
    marginBottom: 8,  
  },  
  coursePrice: {  
    fontSize: 14,  
    fontWeight: '600',  
    color: '#4A90E2',  
    marginTop: 4,  
  },  
  progressContainer: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    marginBottom: 8,  
  },  
  progressBar: {  
    flex: 1,  
    height: 6,  
    backgroundColor: '#eee',  
    borderRadius: 3,  
    marginRight: 8,  
    overflow: 'hidden',  
  },  
  progressFill: {  
    height: '100%',  
    backgroundColor: '#4A90E2',  
    borderRadius: 3,  
  },  
  progressText: {  
    fontSize: 12,  
    color: '#666',  
    fontWeight: '500',  
  },  
  courseMeta: {  
    flexDirection: 'row',  
  },  
  metaItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    marginRight: 16,  
  },  
  metaText: {  
    fontSize: 12,  
    color: '#666',  
    marginLeft: 4,  
  },  
  lessonItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    paddingVertical: 16,  
    borderBottomWidth: 1,  
    borderBottomColor: '#f0f0f0',  
  },  
  lessonIcon: {  
    width: 40,  
    height: 40,  
    borderRadius: 20,  
    backgroundColor: '#E8F0FE',  
    justifyContent: 'center',  
    alignItems: 'center',  
    marginRight: 12,  
  },  
  lessonInfo: {  
    flex: 1,  
  },  
  lessonTitle: {  
    fontSize: 16,  
    color: '#333',  
    marginBottom: 4,  
  },  
  lessonMeta: {  
    flexDirection: 'row',  
  },  
  lessonMetaItem: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    marginRight: 12,  
  },  
  lessonMetaText: {  
    fontSize: 12,  
    color: '#999',  
    marginLeft: 4,  
  },  
  completedBadge: {  
    backgroundColor: '#E8F5E9',  
    paddingHorizontal: 8,  
    paddingVertical: 4,  
    borderRadius: 12,  
  },  
  completedText: {  
    fontSize: 12,  
    color: '#4CAF50',  
    fontWeight: '500',  
  },  
  emptyState: {  
    flex: 1,  
    justifyContent: 'center',  
    alignItems: 'center',  
    padding: 32,  
  },  
  emptyStateText: {  
    fontSize: 16,  
    color: '#999',  
    textAlign: 'center',  
  },  
    
  // Navbar styles (igual al HomeFeed)  
  navbar: {  
    flexDirection: "row",  
    backgroundColor: "#fff",  
    borderTopWidth: 1,  
    borderTopColor: "#e5e5e5",  
    paddingTop: 8,  
  },  
  navItem: {  
    flex: 1,  
    alignItems: "center",  
    paddingVertical: 8,  
  },  
  activeNavItem: {  
    // Estilo para el item activo  
  },  
  navText: {  
    fontSize: 12,  
    color: "#666",  
    marginTop: 4,  
  },  
  activeNavText: {  
    color: "#2673f3",  
    fontWeight: "600",  
  },  
});