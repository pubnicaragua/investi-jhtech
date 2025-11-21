import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Trophy, Target, CheckCircle, Lock, Star, Zap, Award,
  Users, MessageCircle, ThumbsUp, BookOpen, TrendingUp
} from 'lucide-react-native';
import { supabase } from '../supabase';
import { getCurrentUserId } from '../rest/api';

interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  category: string;
  unlocked: boolean;
  unlocked_at?: string;
}

interface Mission {
  id: string;
  mission_type: string;
  mission_description: string;
  target_count: number;
  current_count: number;
  xp_reward: number;
  period: string;
  status: string;
}

export function MissionsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeTab, setActiveTab] = useState<'achievements' | 'missions'>('missions');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return;

      // Cargar logros
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select(`
          *,
          user_achievements!left(unlocked_at)
        `)
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (achievementsData) {
        const formattedAchievements = achievementsData.map((ach: any) => ({
          ...ach,
          unlocked: ach.user_achievements && ach.user_achievements.length > 0,
          unlocked_at: ach.user_achievements?.[0]?.unlocked_at
        }));
        setAchievements(formattedAchievements);
      }

      // Cargar misiones activas
      const { data: missionsData } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', uid)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (missionsData) {
        setMissions(missionsData);
      }

    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social': return Users;
      case 'engagement': return MessageCircle;
      case 'education': return BookOpen;
      case 'finance': return TrendingUp;
      case 'streak': return Zap;
      default: return Star;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social': return '#3B82F6';
      case 'engagement': return '#8B5CF6';
      case 'education': return '#10B981';
      case 'finance': return '#F59E0B';
      case 'streak': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderAchievement = (achievement: Achievement) => {
    const IconComponent = getCategoryIcon(achievement.category);
    const color = getCategoryColor(achievement.category);
    const isLocked = !achievement.unlocked;

    return (
      <View
        key={achievement.id}
        style={[
          styles.achievementCard,
          isLocked && styles.achievementCardLocked
        ]}
      >
        <View style={[styles.achievementIcon, { backgroundColor: color + '20' }]}>
          {isLocked ? (
            <Lock size={32} color="#9CA3AF" />
          ) : (
            <IconComponent size={32} color={color} />
          )}
        </View>
        
        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementTitle, isLocked && styles.textLocked]}>
            {achievement.title}
          </Text>
          <Text style={[styles.achievementDescription, isLocked && styles.textLocked]}>
            {achievement.description}
          </Text>
          <View style={styles.achievementFooter}>
            <View style={styles.xpBadge}>
              <Star size={14} color="#F59E0B" />
              <Text style={styles.xpText}>+{achievement.xp_reward} XP</Text>
            </View>
            {achievement.unlocked && achievement.unlocked_at && (
              <Text style={styles.unlockedText}>
                ✓ Desbloqueado {new Date(achievement.unlocked_at).toLocaleDateString('es-NI')}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderMission = (mission: Mission) => {
    const progress = (mission.current_count / mission.target_count) * 100;
    const isCompleted = mission.status === 'completed';

    return (
      <View key={mission.id} style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <View style={styles.missionIconContainer}>
            <Target size={24} color="#6366F1" />
          </View>
          <View style={styles.missionInfo}>
            <Text style={styles.missionTitle}>{mission.mission_description}</Text>
            <Text style={styles.missionPeriod}>
              {mission.period === 'daily' && '📅 Diaria'}
              {mission.period === 'weekly' && '📆 Semanal'}
              {mission.period === 'monthly' && '🗓️ Mensual'}
            </Text>
          </View>
          {isCompleted && (
            <CheckCircle size={24} color="#10B981" />
          )}
        </View>

        <View style={styles.missionProgress}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {mission.current_count} / {mission.target_count}
          </Text>
        </View>

        <View style={styles.missionFooter}>
          <View style={styles.xpBadge}>
            <Zap size={14} color="#F59E0B" />
            <Text style={styles.xpText}>+{mission.xp_reward} XP</Text>
          </View>
        </View>
      </View>
    );
  };

  const groupedAchievements = achievements.reduce((acc, ach) => {
    if (!acc[ach.category]) {
      acc[ach.category] = [];
    }
    acc[ach.category].push(ach);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const categoryNames: Record<string, string> = {
    social: 'Social',
    engagement: 'Participación',
    education: 'Educación',
    finance: 'Finanzas',
    streak: 'Racha'
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Cargando misiones...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Trophy size={32} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Misiones y Logros</Text>
        <Text style={styles.headerSubtitle}>
          Completa misiones y desbloquea logros
        </Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'missions' && styles.activeTab]}
          onPress={() => setActiveTab('missions')}
        >
          <Target size={20} color={activeTab === 'missions' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'missions' && styles.activeTabText]}>
            Misiones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
          onPress={() => setActiveTab('achievements')}
        >
          <Award size={20} color={activeTab === 'achievements' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
            Logros
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'missions' ? (
          <View style={styles.section}>
            {missions.length > 0 ? (
              missions.map(renderMission)
            ) : (
              <View style={styles.emptyState}>
                <Target size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No tienes misiones activas</Text>
                <Text style={styles.emptySubtext}>
                  Las misiones se generan automáticamente
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            {Object.entries(groupedAchievements).map(([category, achs]) => (
              <View key={category} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>
                  {categoryNames[category] || category}
                </Text>
                {achs.map(renderAchievement)}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#6366F1',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  textLocked: {
    color: '#9CA3AF',
  },
  achievementFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  unlockedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  missionPeriod: {
    fontSize: 12,
    color: '#6B7280',
  },
  missionProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  missionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
