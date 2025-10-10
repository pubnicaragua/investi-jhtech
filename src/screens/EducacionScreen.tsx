import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  BookOpen, Book, Clock, ChevronRight, Home, TrendingUp, PlusCircle,
  Newspaper, Search, Play, GraduationCap, Video as VideoIcon, Wrench,
  Star, CheckCircle, Target, DollarSign, BarChart3, FileText
} from 'lucide-react-native';
import { 
  getCourses, getVideos, getVideoThemes, getCourseTopics, getEducationalTools
} from '../rest/api';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Course {
  id: string; title: string; description: string; category: string;
  level: string; duration: number; price: number; currency: string;
  topic?: string; progress?: number; total_lessons?: number; thumbnail_url?: string;
}

interface Video {
  id: string; title: string; description: string; video_url: string;
  thumbnail_url: string; duration: number; theme_id: string;
  view_count: number; like_count: number; category: string;
}

interface VideoTheme { id: string; name: string; color: string; order_index: number; }
interface CourseTopic { id: string; name: string; description: string; color: string; icon: string; order_index: number; }
interface Tool { id: string; name: string; description: string; icon: string; route: string; is_premium: boolean; }

const getIconForTopic = (iconName: string) => {
  const icons: { [key: string]: any} = { 'target': Target, 'dollar-sign': DollarSign, 'trending-up': TrendingUp, 'bar-chart': BarChart3 };
  return icons[iconName] || Book;
};

const getIconForTool = (iconName: string) => {
  const icons: { [key: string]: any } = { 'target': Target, 'dollar-sign': DollarSign, 'trending-up': TrendingUp, 'bar-chart': BarChart3, 'file-text': FileText };
  return icons[iconName] || Wrench;
};

export function EducacionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const currentRoute = route.name;

  useAuthGuard();

  const [activeTab, setActiveTab] = useState('inicio');
  const [selectedVideoTheme, setSelectedVideoTheme] = useState('all');
  const [selectedCourseTopic, setSelectedCourseTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [videoThemes, setVideoThemes] = useState<VideoTheme[]>([]);
  const [courseTopics, setCourseTopics] = useState<CourseTopic[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);

  const loadData = async () => {
    try {
      const [themesData, videosData, topicsData, coursesData, toolsData] = await Promise.all([
        getVideoThemes(), getVideos(), getCourseTopics(), getCourses(), getEducationalTools()
      ]);
      setVideoThemes(themesData || []);
      setVideos(videosData || []);
      setCourseTopics(topicsData || []);
      setCourses(coursesData || []);
      setTools(toolsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setRefreshing(true); loadData(); };
  const handleTabChange = (tab: string) => { setActiveTab(tab); setSearchQuery(''); };
  const handleVideoPress = (video: Video) => navigation.navigate('VideoPlayer' as never, { videoId: video.id } as never);
  const handleCoursePress = (course: Course) => navigation.navigate('CourseDetail' as never, { courseId: course.id } as never);
  const handleToolPress = (tool: Tool) => navigation.navigate(tool.route as never);
  const handleNavigation = (screen: string) => navigation.navigate(screen as never);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getLevelBadge = (level: string) => {
    const levels: { [key: string]: { color: string; label: string } } = {
      'principiante': { color: '#10b981', label: 'Principiante' },
      'intermedio': { color: '#f59e0b', label: 'Intermedio' },
      'avanzado': { color: '#ef4444', label: 'Avanzado' },
    };
    return levels[level.toLowerCase()] || levels['principiante'];
  };

  const filteredVideos = videos.filter(video => {
    const matchesTheme = selectedVideoTheme === 'all' || video.theme_id === selectedVideoTheme;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  const filteredCourses = courses.filter(course => {
    const matchesTopic = selectedCourseTopic === 'all' || course.topic === selectedCourseTopic;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const renderVideoItem = (video: Video) => (
    <TouchableOpacity key={video.id} style={styles.videoCard} onPress={() => handleVideoPress(video)} activeOpacity={0.7}>
      <Image source={{ uri: video.thumbnail_url }} style={styles.videoThumbnail} resizeMode="cover" />
      <View style={styles.videoDurationBadge}>
        <Text style={styles.videoDurationText}>{formatDuration(video.duration)}</Text>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.videoDescription} numberOfLines={2}>{video.description}</Text>
        <View style={styles.videoMeta}>
          <Play size={12} color="#999" />
          <Text style={styles.videoViewsText}>{video.view_count.toLocaleString()} vistas</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCourseItem = (course: Course) => {
    const levelBadge = getLevelBadge(course.level);
    return (
      <TouchableOpacity key={course.id} style={styles.courseCard} onPress={() => handleCoursePress(course)} activeOpacity={0.7}>
        {course.thumbnail_url && <Image source={{ uri: course.thumbnail_url }} style={styles.courseThumbnail} resizeMode="cover" />}
        <View style={styles.courseHeader}>
          <View style={styles.courseIconContainer}><Book size={20} color="#4A90E2" /></View>
          <View style={[styles.levelBadge, { backgroundColor: levelBadge.color }]}>
            <Text style={styles.levelBadgeText}>{levelBadge.label}</Text>
          </View>
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
          <Text style={styles.courseDescription} numberOfLines={2}>{course.description}</Text>
          <View style={styles.courseMeta}>
            <View style={styles.metaItem}>
              <Clock size={14} color="#666" />
              <Text style={styles.metaText}>{course.duration} min</Text>
            </View>
            {course.total_lessons && (
              <View style={styles.metaItem}>
                <BookOpen size={14} color="#666" />
                <Text style={styles.metaText}>{course.total_lessons} lecciones</Text>
              </View>
            )}
          </View>
          {course.progress !== undefined && course.progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${course.progress}%`, backgroundColor: '#4A90E2' }]} />
              </View>
              <Text style={styles.progressText}>{course.progress}%</Text>
            </View>
          )}
          {course.price > 0 ? (
            <Text style={styles.coursePrice}>{course.currency} {course.price.toFixed(2)}</Text>
          ) : (
            <View style={styles.freeBadge}>
              <CheckCircle size={14} color="#10b981" />
              <Text style={styles.freeBadgeText}>GRATIS</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderToolItem = (tool: Tool) => {
    const IconComponent = getIconForTool(tool.icon);
    return (
      <TouchableOpacity key={tool.id} style={styles.toolCard} onPress={() => handleToolPress(tool)} activeOpacity={0.7}>
        <View style={styles.toolIconContainer}><IconComponent size={28} color="#4A90E2" /></View>
        <View style={styles.toolInfo}>
          <Text style={styles.toolTitle}>{tool.name}</Text>
          <Text style={styles.toolDescription} numberOfLines={2}>{tool.description}</Text>
        </View>
        <ChevronRight size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <GraduationCap size={28} color="#4A90E2" />
            <Text style={styles.headerTitle}>Educación</Text>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <Search size={18} color="#999" />
          <TextInput style={styles.searchInput} placeholder="Buscar videos, cursos..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#999" />
        </View>
        <View style={styles.tabsContainer}>
          {['inicio', 'videos', 'cursos', 'herramientas'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => handleTabChange(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Cargando contenido...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'inicio' && (
              <>
                {videos.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Videos Destacados</Text>
                      <TouchableOpacity onPress={() => handleTabChange('videos')}>
                        <Text style={styles.seeAllText}>Ver todos</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
                      {videos.slice(0, 6).map(renderVideoItem)}
                    </ScrollView>
                  </View>
                )}
                {courseTopics.map(topic => {
                  const topicCourses = courses.filter(c => c.topic === topic.id);
                  if (topicCourses.length === 0) return null;
                  const IconComponent = getIconForTopic(topic.icon);
                  return (
                    <View key={topic.id} style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.topicHeader}>
                          <View style={[styles.topicIconContainer, { backgroundColor: topic.color + '20' }]}>
                            <IconComponent size={20} color={topic.color} />
                          </View>
                          <View>
                            <Text style={styles.sectionTitle}>{topic.name}</Text>
                            <Text style={styles.sectionSubtitle}>{topic.description}</Text>
                          </View>
                        </View>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>
                        {topicCourses.map(renderCourseItem)}
                      </ScrollView>
                    </View>
                  );
                })}
                {tools.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Herramientas Financieras</Text>
                      <TouchableOpacity onPress={() => handleTabChange('herramientas')}>
                        <Text style={styles.seeAllText}>Ver todas</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.toolsGrid}>{tools.map(renderToolItem)}</View>
                  </View>
                )}
              </>
            )}

            {activeTab === 'videos' && (
              <View style={styles.section}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollContent}>
                  <TouchableOpacity style={[styles.filterChip, selectedVideoTheme === 'all' && styles.filterChipActive]} onPress={() => setSelectedVideoTheme('all')}>
                    <Text style={[styles.filterChipText, selectedVideoTheme === 'all' && styles.filterChipTextActive]}>Todos los temas</Text>
                  </TouchableOpacity>
                  {videoThemes.map(theme => (
                    <TouchableOpacity key={theme.id} style={[styles.filterChip, selectedVideoTheme === theme.id && styles.filterChipActive]} onPress={() => setSelectedVideoTheme(theme.id)}>
                      <Text style={[styles.filterChipText, selectedVideoTheme === theme.id && styles.filterChipTextActive]}>{theme.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.videosGrid}>
                  {filteredVideos.length > 0 ? filteredVideos.map(renderVideoItem) : (
                    <View style={styles.emptyState}>
                      <VideoIcon size={48} color="#ccc" />
                      <Text style={styles.emptyStateText}>No hay videos disponibles</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {activeTab === 'cursos' && (
              <View style={styles.section}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollContent}>
                  <TouchableOpacity style={[styles.filterChip, selectedCourseTopic === 'all' && styles.filterChipActive]} onPress={() => setSelectedCourseTopic('all')}>
                    <Text style={[styles.filterChipText, selectedCourseTopic === 'all' && styles.filterChipTextActive]}>Todos los tópicos</Text>
                  </TouchableOpacity>
                  {courseTopics.map(topic => (
                    <TouchableOpacity key={topic.id} style={[styles.filterChip, selectedCourseTopic === topic.id && styles.filterChipActive]} onPress={() => setSelectedCourseTopic(topic.id)}>
                      <Text style={[styles.filterChipText, selectedCourseTopic === topic.id && styles.filterChipTextActive]}>{topic.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.coursesGrid}>
                  {filteredCourses.length > 0 ? filteredCourses.map(renderCourseItem) : (
                    <View style={styles.emptyState}>
                      <Book size={48} color="#ccc" />
                      <Text style={styles.emptyStateText}>No hay cursos disponibles</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {activeTab === 'herramientas' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Herramientas Financieras</Text>
                <Text style={styles.sectionSubtitle}>Utiliza estas herramientas para mejorar tu educación financiera</Text>
                <View style={styles.toolsGrid}>
                  {tools.length > 0 ? tools.map(renderToolItem) : (
                    <View style={styles.emptyState}>
                      <Wrench size={48} color="#ccc" />
                      <Text style={styles.emptyStateText}>No hay herramientas disponibles</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("HomeFeed")} 
        >
          <Ionicons 
            name={currentRoute === "HomeFeed" ? "home" : "home-outline"}
            size={26} 
            color={currentRoute === "HomeFeed" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("MarketInfo")} 
        >
          <Ionicons 
            name={currentRoute === "MarketInfo" ? "trending-up" : "trending-up-outline"}
            size={26} 
            color={currentRoute === "MarketInfo" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.fabContainer} 
          onPress={() => handleNavigation("CreatePost")} 
        >
          <View style={styles.fabButton}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("News")} 
        >
          <Ionicons 
            name={currentRoute === "News" ? "newspaper" : "newspaper-outline"}
            size={26} 
            color={currentRoute === "News" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => handleNavigation("Educacion")} 
        >
          <Ionicons 
            name={currentRoute === "Educacion" ? "school" : "school-outline"}
            size={26} 
            color={currentRoute === "Educacion" ? "#2673f3" : "#9CA3AF"} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: '#fff', paddingTop: 16, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#333' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 16, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#4A90E2' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#4A90E2', fontWeight: '600' },
  content: { flex: 1 },
  section: { paddingVertical: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  sectionSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  seeAllText: { fontSize: 14, color: '#4A90E2', fontWeight: '600' },
  topicHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topicIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  horizontalScrollContent: { paddingHorizontal: 16, gap: 12 },
  filtersScrollContent: { paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f5f5f5' },
  filterChipActive: { backgroundColor: '#4A90E2' },
  filterChipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  videosGrid: { paddingHorizontal: 16, gap: 12 },
  coursesGrid: { paddingHorizontal: 16, gap: 12 },
  toolsGrid: { paddingHorizontal: 16, gap: 12 },
  videoCard: { width: 280, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  videoThumbnail: { width: '100%', height: 160, backgroundColor: '#eee' },
  videoDurationBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  videoDurationText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  videoInfo: { padding: 12 },
  videoTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  videoDescription: { fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 18 },
  videoMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  videoViewsText: { fontSize: 12, color: '#999' },
  courseCard: { width: 280, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, overflow: 'hidden' },
  courseThumbnail: { width: '100%', height: 140, backgroundColor: '#eee' },
  courseHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(74, 144, 226, 0.1)', justifyContent: 'center', alignItems: 'center' },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  levelBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  courseInfo: { padding: 16 },
  courseTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 6 },
  courseDescription: { fontSize: 13, color: '#666', marginBottom: 12, lineHeight: 18 },
  courseMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#666' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  progressBar: { flex: 1, height: 5, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600', color: '#666' },
  coursePrice: { fontSize: 16, fontWeight: '700', color: '#4A90E2' },
  freeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  freeBadgeText: { fontSize: 12, fontWeight: '700', color: '#10b981' },
  toolCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  toolIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(74, 144, 226, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  toolInfo: { flex: 1 },
  toolTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  toolDescription: { fontSize: 13, color: '#666', lineHeight: 18 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyStateText: { fontSize: 14, color: '#999', marginTop: 8 },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  navItem: {
    padding: 12,
  },
  fabContainer: {
    marginTop: -16,
    padding: 8,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2673f3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2673f3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});