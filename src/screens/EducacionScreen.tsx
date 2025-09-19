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
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';  
import { useTranslation } from 'react-i18next';  
import { useNavigation } from '@react-navigation/native';  
import { 
  BookOpen, 
  Book, 
  Award, 
  Clock, 
  ChevronRight, 
  Home, 
  TrendingUp,
  PlusCircle,
  Newspaper,
  Search,
  Play,
  MoreVertical,
  ThumbsUp,
  MessageCircle as MessageCircleIcon,
  Share2,
  Bookmark,
  Users,
  Bell,
  GraduationCap
} from 'lucide-react-native';  
import { getCourses, getLessons, getUserLearningProgress, getCurrentUserId } from '../rest/api';  
import { LanguageToggle } from '../components/LanguageToggle';  
import { useAuthGuard } from '../hooks/useAuthGuard';  
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');  
  
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

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  instructor: {
    name: string;
    avatar: string;
  };
  views: number;
  likes: number;
  rating: number; // 1-5 stars
  userRating?: number; // User's rating
  isLiked: boolean;
  isBookmarked: boolean;
  theme: VideoTheme;
}

interface VideoTheme {
  id: string;
  name: string;
  color: string;
}

interface CourseLevel {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  isPremium: boolean;
  route: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  courses: number;
  level: string;
  color: string;
  icon: string;
}
  
export function EducacionScreen() {  
  const { t } = useTranslation();  
  const navigation = useNavigation();  
  const insets = useSafeAreaInsets();  
  const [activeTab, setActiveTab] = useState('inicio');  
  const [loading, setLoading] = useState(true);  
  const [refreshing, setRefreshing] = useState(false);  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideoTheme, setSelectedVideoTheme] = useState<string>('all');
  const [selectedCourseLevel, setSelectedCourseLevel] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);  
  const [lessons, setLessons] = useState<Lesson[]>([]);  
  const [videos, setVideos] = useState<Video[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [learningProgress, setLearningProgress] = useState<any[]>([]);  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Temáticas de videos
  const videoThemes: VideoTheme[] = [
    { id: 'all', name: 'Todos', color: '#666' },
    { id: 'basico', name: 'Educación Financiera: Lo básico que debes saber', color: '#4A90E2' },
    { id: 'metas', name: 'Creación y Planificación de Metas Financieras', color: '#50E3C2' },
    { id: 'emprendedores', name: 'Educación Financiera para Emprendedores', color: '#50E3C2' },
    { id: 'ninos', name: 'Educación Financiera para Niños', color: '#4A90E2' },
    { id: 'avanzada', name: 'Educación Financiera Avanzada', color: '#F5A623' },
    { id: 'inversiones', name: 'Inversiones para Principiantes', color: '#4A90E2' }
  ];

  // Niveles de cursos
  const courseLevels: CourseLevel[] = [
    { id: 'all', name: 'Todos los niveles', color: '#666', icon: '📚' },
    { id: 'principiante', name: 'Principiante', color: '#4A90E2', icon: '✅' },
    { id: 'intermedio', name: 'Intermedio', color: '#50E3C2', icon: '✅' },
    { id: 'avanzado', name: 'Avanzado', color: '#F5A623', icon: '✅' },
    { id: 'experto', name: 'Experto', color: '#E94B3C', icon: '✅' }
  ];

  // Learning Paths data
  const learningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Inversión para Principiantes',
      description: 'Aprende los conceptos básicos de inversión desde cero',
      duration: '6 semanas',
      courses: 8,
      level: 'Principiante',
      color: '#4A90E2',
      icon: '📈'
    },
    {
      id: '2',
      title: 'Mercado de Valores',
      description: 'Todo sobre acciones, bonos y mercados financieros',
      duration: '4 semanas',
      courses: 6,
      level: 'Intermedio',
      color: '#50E3C2',
      icon: '📊'
    },
    {
      id: '3',
      title: 'Bienes Raíces',
      description: 'Inversión en propiedades y real estate',
      duration: '8 semanas',
      courses: 10,
      level: 'Avanzado',
      color: '#F5A623',
      icon: '🏠'
    },
    {
      id: '4',
      title: 'Criptomonedas',
      description: 'Introducción al mundo de las criptomonedas',
      duration: '5 semanas',
      courses: 7,
      level: 'Intermedio',
      color: '#E94B3C',
      icon: '₿'
    },
    {
      id: '5',
      title: 'Finanzas Personales',
      description: 'Gestión completa de tus finanzas personales',
      duration: '3 semanas',
      courses: 5,
      level: 'Principiante',
      color: '#9013FE',
      icon: '💰'
    }
  ];

  // Mock data para videos
  const mockVideos: Video[] = [
    {
      id: '1',
      title: 'Fundamentos de las Finanzas Personales',
      description: 'Aprende los conceptos básicos que todo adulto debe saber sobre dinero',
      duration: '15:42',
      thumbnail: 'https://picsum.photos/400/225?random=1',
      instructor: {
        name: 'Dr. Carlos Mendoza',
        avatar: 'https://i.pravatar.cc/100?img=3'
      },
      views: 1247,
      likes: 89,
      rating: 4.8,
      userRating: 5,
      isLiked: false,
      isBookmarked: false,
      theme: videoThemes[1] // Educación Financiera Básica
    },
    {
      id: '2',
      title: 'Cómo Crear tu Primera Meta Financiera',
      description: 'Planifica y alcanza tus objetivos financieros paso a paso',
      duration: '22:15',
      thumbnail: 'https://picsum.photos/400/225?random=2',
      instructor: {
        name: 'Ana García',
        avatar: 'https://i.pravatar.cc/100?img=5'
      },
      views: 892,
      likes: 67,
      rating: 4.6,
      userRating: 4,
      isLiked: true,
      isBookmarked: true,
      theme: videoThemes[2] // Metas Financieras
    },
    {
      id: '3',
      title: 'Finanzas para Emprendedores: Lo Esencial',
      description: 'Maneja las finanzas de tu negocio como un profesional',
      duration: '18:30',
      thumbnail: 'https://picsum.photos/400/225?random=3',
      instructor: {
        name: 'Roberto Silva',
        avatar: 'https://i.pravatar.cc/100?img=7'
      },
      views: 654,
      likes: 45,
      rating: 4.7,
      isLiked: false,
      isBookmarked: false,
      theme: videoThemes[3] // Emprendedores
    },
    {
      id: '4',
      title: 'Enseñando Dinero a los Niños',
      description: 'Herramientas prácticas para educar financieramente a tus hijos',
      duration: '12:20',
      thumbnail: 'https://picsum.photos/400/225?random=4',
      instructor: {
        name: 'María López',
        avatar: 'https://i.pravatar.cc/100?img=9'
      },
      views: 1156,
      likes: 78,
      rating: 4.9,
      isLiked: false,
      isBookmarked: true,
      theme: videoThemes[4] // Niños
    },
    {
      id: '5',
      title: 'Inversiones Avanzadas: Diversificación',
      description: 'Estrategias profesionales para maximizar tu portafolio',
      duration: '28:45',
      thumbnail: 'https://picsum.photos/400/225?random=5',
      instructor: {
        name: 'Dr. Fernando Ruiz',
        avatar: 'https://i.pravatar.cc/100?img=11'
      },
      views: 543,
      likes: 34,
      rating: 4.5,
      isLiked: false,
      isBookmarked: false,
      theme: videoThemes[5] // Avanzada
    },
    {
      id: '6',
      title: 'Tu Primera Inversión en Bolsa',
      description: 'Guía completa para comenzar a invertir sin miedo',
      duration: '20:10',
      thumbnail: 'https://picsum.photos/400/225?random=6',
      instructor: {
        name: 'Laura Martínez',
        avatar: 'https://i.pravatar.cc/100?img=13'
      },
      views: 2341,
      likes: 156,
      rating: 4.8,
      userRating: 5,
      isLiked: true,
      isBookmarked: true,
      theme: videoThemes[6] // Inversiones para Principiantes
    }
  ];

  // Mock data para herramientas
  const mockTools: Tool[] = [
    {
      id: '1',
      title: 'Planificador Financiero',
      description: 'Organiza ingresos, gastos y metas',
      icon: '📊',
      isPremium: false,
      route: 'PlanificadorFinanciero'
    },
    {
      id: '2',
      title: 'CazaHormigas',
      description: 'Detecta gastos pequeños que drenan tu dinero',
      icon: '🐜',
      isPremium: true,
      route: 'CazaHormigas'
    },
    {
      id: '3',
      title: 'Reportes Avanzados',
      description: 'Análisis financiero profesional',
      icon: '📈',
      isPremium: true,
      route: 'ReportesAvanzados'
    }
  ];  
  
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
      setVideos(mockVideos);
      setTools(mockTools);
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

  const renderStars = (rating: number, userRating?: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} style={styles.starButton}>
          <Text style={[
            styles.star, 
            { color: i <= (userRating || rating) ? '#FFD700' : '#ddd' }
          ]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const renderLearningPathItem = (path: LearningPath) => (
    <TouchableOpacity
      key={path.id}
      style={[styles.learningPathCard, { borderLeftColor: path.color }]}
      onPress={() => {
        // Navigate to learning path detail
        console.log('Navigate to learning path:', path.id);
      }}
    >
      <View style={styles.learningPathHeader}>
        <View style={[styles.learningPathIcon, { backgroundColor: path.color }]}>
          <Text style={styles.learningPathIconText}>{path.icon}</Text>
        </View>
        <View style={styles.learningPathBadge}>
          <Text style={styles.learningPathLevel}>{path.level}</Text>
        </View>
      </View>
      
      <Text style={styles.learningPathTitle}>{path.title}</Text>
      <Text style={styles.learningPathDescription}>{path.description}</Text>
      
      <View style={styles.learningPathMeta}>
        <View style={styles.learningPathMetaItem}>
          <Clock size={14} color="#666" />
          <Text style={styles.learningPathMetaText}>{path.duration}</Text>
        </View>
        <View style={styles.learningPathMetaItem}>
          <BookOpen size={14} color="#666" />
          <Text style={styles.learningPathMetaText}>{path.courses} cursos</Text>
        </View>
      </View>
      
      <TouchableOpacity style={[styles.startPathButton, { backgroundColor: path.color }]}>
        <Text style={styles.startPathButtonText}>Comenzar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderVideoItem = (video: Video) => (
    <TouchableOpacity
      key={video.id}
      style={styles.videoCardHorizontal}
      onPress={() => navigation.navigate('VideoPlayer' as never, { videoId: video.id })}
    >
      <View style={styles.videoThumbnailHorizontal}>
        <Image
          source={{ uri: video.thumbnail }}
          style={styles.videoThumbnailImage}
          resizeMode="cover"
        />
        <View style={styles.playButtonHorizontal}>
          <Play size={14} color="#fff" fill="#fff" />
        </View>
        <View style={styles.videoDurationHorizontal}>
          <Text style={styles.videoDurationText}>{video.duration}</Text>
        </View>
      </View>
      
      <View style={styles.videoInfoHorizontal}>
        <Text style={styles.videoTitleHorizontal} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.videoChannelName} numberOfLines={1}>{video.instructor.name}</Text>
        <Text style={styles.videoViewsText}>{video.views.toLocaleString()} vistas</Text>
      </View>
    </TouchableOpacity>
  );

  const renderToolItem = (tool: Tool) => (
    <TouchableOpacity
      key={tool.id}
      style={styles.toolCard}
      onPress={() => navigation.navigate(tool.route as never)}
    >
      <View style={styles.toolHeader}>
        <Text style={styles.toolIcon}>{tool.icon}</Text>
        {tool.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        )}
      </View>
      <Text style={styles.toolTitle}>{tool.title}</Text>
      <Text style={styles.toolDescription}>{tool.description}</Text>
    </TouchableOpacity>
  );  
  
  const renderCourseItem = (course: Course) => (  
    <TouchableOpacity  
      key={course.id}  
      style={styles.courseCard}  
      onPress={() => navigation.navigate('CursoDetalle', { courseId: course.id })}  
    >  
      <Image  
        source={{ uri: course.image || 'https://picsum.photos/100' }}  
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
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>  
      {/* Header con búsqueda */}  
      <View style={styles.header}>  
        <Text style={styles.headerTitle}>Educación</Text>  
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
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
                    source={{ uri: progress.image || 'https://picsum.photos/120x80' }}
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
  
      {/* Tabs principales */}  
      <View style={styles.tabs}>  
        <TouchableOpacity  
          style={[styles.tab, activeTab === 'inicio' && styles.activeTab]}  
          onPress={() => setActiveTab('inicio')}  
        >  
          <Text style={[styles.tabText, activeTab === 'inicio' && styles.activeTabText]}>  
            Inicio  
          </Text>  
        </TouchableOpacity>  
        <TouchableOpacity  
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]}  
          onPress={() => setActiveTab('videos')}  
        >  
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>  
            Videos  
          </Text>  
        </TouchableOpacity>  
        <TouchableOpacity  
          style={[styles.tab, activeTab === 'cursos' && styles.activeTab]}  
          onPress={() => setActiveTab('cursos')}  
        >  
          <Text style={[styles.tabText, activeTab === 'cursos' && styles.activeTabText]}>  
            Cursos  
          </Text>  
        </TouchableOpacity>  
        <TouchableOpacity  
          style={[styles.tab, activeTab === 'herramientas' && styles.activeTab]}  
          onPress={() => setActiveTab('herramientas')}  
        >  
          <Text style={[styles.tabText, activeTab === 'herramientas' && styles.activeTabText]}>  
            Herramientas  
          </Text>  
        </TouchableOpacity>  
      </View>  
  
      {/* Content */}  
      <ScrollView  
        style={styles.content}  
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}  
      >  
        {activeTab === 'inicio' && (
          <>
            {/* Sección Learning Paths */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Rutas de Aprendizaje</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>Ver todas</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionSubtitle}>Aprende paso a paso con nuestros cursos estructurados</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {learningPaths.map(renderLearningPathItem)}
              </ScrollView>
            </View>

            {/* Sección Videos con filtros de temáticas */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Videos</Text>
                <TouchableOpacity onPress={() => setActiveTab('videos')}>
                  <Text style={styles.seeAllText}>Ver todos los videos</Text>
                </TouchableOpacity>
              </View>
              
              {/* Filtros de temáticas */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                {videoThemes.map((theme) => (
                  <TouchableOpacity
                    key={theme.id}
                    style={[
                      styles.filterChip,
                      { backgroundColor: selectedVideoTheme === theme.id ? theme.color : '#f5f5f5' }
                    ]}
                    onPress={() => setSelectedVideoTheme(theme.id)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      { color: selectedVideoTheme === theme.id ? '#fff' : '#666' }
                    ]}>
                      {theme.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <View style={styles.videosContainer}>
                {videos
                  .filter(video => selectedVideoTheme === 'all' || video.theme.id === selectedVideoTheme)
                  .slice(0, 8) // Mostrar 8 videos en lista vertical
                  .map((video) => (
                    renderVideoItem(video)
                  ))}
              </View>
            </View>

            {/* Sección Cursos */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cursos</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>Ver todos los cursos</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {courses.slice(0, 3).map(renderCourseItem)}
              </ScrollView>
            </View>

            {/* Sección Herramientas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Herramientas</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tools.map(renderToolItem)}
              </ScrollView>
            </View>
          </>
        )}

        {activeTab === 'videos' && (
          <View style={styles.section}>
            {/* Filtros de temáticas */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
              {videoThemes.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.filterChip,
                    { backgroundColor: selectedVideoTheme === theme.id ? theme.color : '#f5f5f5' }
                  ]}
                  onPress={() => setSelectedVideoTheme(theme.id)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: selectedVideoTheme === theme.id ? '#fff' : '#666' }
                  ]}>
                    {theme.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Lista de videos filtrados */}
            <View style={styles.videosGrid}>
              {videos
                .filter(video => selectedVideoTheme === 'all' || video.theme.id === selectedVideoTheme)
                .map(renderVideoItem)}
            </View>
          </View>
        )}

        {activeTab === 'herramientas' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Herramientas Financieras</Text>
            <View style={styles.toolsGrid}>
              {tools.map(renderToolItem)}
            </View>
          </View>
        )}

        {activeTab === 'cursos' && (
          courses.length > 0 ? (
            courses.map(renderCourseItem)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hay cursos disponibles</Text>
            </View>
          )
        )}
      </ScrollView>  
  
      {/* NAVBAR INFERIOR - Orden correcto con iconos profesionales */}
      <View style={[styles.bottomNavigation, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('HomeFeed' as never)} 
        >
          <Home size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('MarketInfo' as never)} 
        >
          <TrendingUp size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.fabContainer} 
          onPress={() => navigation.navigate('CreatePost' as never)} 
        >
          <PlusCircle size={34} color="#2673f3" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('News' as never)} 
        >
          <Newspaper size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
        >
          <BookOpen size={24} color="#2673f3" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>  
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
  toolsSection: {
    marginBottom: 24,
  },
  toolCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  toolEmoji: {
    fontSize: 24,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  premiumBadge: {
    backgroundColor: '#2673f3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  premiumText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Navigation styles
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#2673f3',
    fontWeight: '600',
  },

  // Nuevos estilos para la búsqueda
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginLeft: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },

  // Estilos para secciones
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2673f3',
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },

  // Estilos para videos
  videosContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  videoGridItem: {
    width: '48%',
    marginBottom: 20,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  videoThumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#f5f5f5',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  videoDurationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
    height: 36,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  instructorAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  instructorName: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoStatsText: {
    fontSize: 10,
    color: '#888',
    fontWeight: '400',
  },
  videoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  videoAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoActionText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },

  // Estilos adicionales para videos
  videoDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    height: 32,
  },
  themeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  // Navegación inferior profesional
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  fabContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2673f3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Estilos para filtros
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Estilos para rating con estrellas
  starButton: {
    padding: 2,
  },
  star: {
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  learningPathCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  learningPathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  learningPathIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  learningPathIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  learningPathBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
  },

  // Estilos para videos horizontales (como YouTube)
  videoCardHorizontal: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  videoThumbnailHorizontal: {
    position: 'relative',
    width: 120,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  videoThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playButtonHorizontal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDurationHorizontal: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  videoInfoHorizontal: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'flex-start',
  },
  videoTitleHorizontal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    lineHeight: 18,
  },
  videoChannelName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  videoViewsText: {
    fontSize: 12,
    color: '#888',
  },

  // Grids para herramientas
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  learningPathLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  learningPathTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 18,
  },
  learningPathDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  learningPathMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  learningPathMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learningPathMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  startPathButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startPathButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});