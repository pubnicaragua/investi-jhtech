import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { 
  ArrowRight, 
  BookOpen, 
  BarChart2, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Info
} from 'lucide-react-native';

import { fetchInvestorProfile, fetchCourses } from '../rest/api';
import { LanguageToggle } from '../components/LanguageToggle';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/theme';

type RiskLevel = 'conservador' | 'moderado' | 'agresivo';

const InversionistaScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'perfil' | 'cursos' | 'rendimiento'>('perfil');

  const loadData = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);
      
      // Cargar perfil del inversionista
      const [profileData, coursesData] = await Promise.all([
        fetchInvestorProfile(user?.id || ''),
        fetchCourses(user?.id || '', { page: 1, limit: 3 })
      ]);
      
      setProfile(profileData);
      setCourses(coursesData?.data || []);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(t('inversionista.errorLoading') || 'Error al cargar los datos');
      Alert.alert(
        t('common.error'),
        t('inversionista.errorLoading') || 'No se pudieron cargar los datos del perfil'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  const renderRiskMeter = (level: RiskLevel) => {
    const levels = ['conservador', 'moderado', 'agresivo'];
    const activeIndex = levels.indexOf(level);
    
    return (
      <View style={styles.riskMeterContainer}>
        {levels.map((l, index) => (
          <View 
            key={l} 
            style={[
              styles.riskLevel, 
              index <= activeIndex && styles[`riskLevel${l.charAt(0).toUpperCase() + l.slice(1)}`]
            ]}
          >
            <Text style={styles.riskLevelText}>
              {t(`inversionista.riskLevels.${l}`)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPortfolioChart = () => {
    const data = profile?.portfolio_distribution || [
      { name: 'Acciones', amount: 40, color: '#4CAF50' },
      { name: 'Bonos', amount: 30, color: '#2196F3' },
      { name: 'Fondos', amount: 20, color: '#FFC107' },
      { name: 'Efectivo', amount: 10, color: '#9E9E9E' },
    ];

    return (
      <View style={styles.chartContainer}>
        <PieChart
          data={data}
          width={250}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
        <View style={styles.legendContainer}>
          {data.map((item: any, index: number) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.name}: {item.amount}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPerformanceChart = () => {
    const data = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          data: [20, 45, 28, 80, 99, 43],
          color: (opacity = 1) => `rgba(38, 115, 243, ${opacity})`,
          strokeWidth: 2
        }
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <BarChart
          data={data}
          width={350}
          height={220}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('inversionista.title')}</Text>
          <LanguageToggle />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('inversionista.title')}</Text>
          <LanguageToggle />
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => loadData()}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('inversionista.title')}</Text>
        <LanguageToggle />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: profile?.photo_url || 'https://www.investiiapp.com/investi-logo-new-main.png' }} 
            style={styles.avatar}
            defaultSource={{ uri: 'https://www.investiiapp.com/investi-logo-new-main.png' }}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{profile?.name || t('inversionista.anonymous')}</Text>
            <Text style={styles.userLevel}>
              {t('inversionista.level')}: {profile?.level || t('inversionista.levels.beginner')}
            </Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {['perfil', 'cursos', 'rendimiento'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {t(`inversionista.tabs.${tab}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'perfil' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{t('inversionista.riskProfile')}</Text>
                <TouchableOpacity>
                  <Info size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.riskLevelLabel}>
                {t('inversionista.yourRiskLevel')}: {t(`inversionista.riskLevels.${profile?.risk_level || 'moderado'}`)}
              </Text>
              {renderRiskMeter(profile?.risk_level || 'moderado')}
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <DollarSign size={24} color={colors.primary} />
                  <Text style={styles.statValue}>${profile?.total_invested?.toLocaleString() || '0'}</Text>
                  <Text style={styles.statLabel}>{t('inversionista.totalInvested')}</Text>
                </View>
                <View style={styles.statItem}>
                  <TrendingUp size={24} color={colors.success} />
                  <Text style={[styles.statValue, { color: colors.success }]}>
                    {profile?.roi || '0'}%
                  </Text>
                  <Text style={styles.statLabel}>{t('inversionista.ROI')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('inversionista.portfolioDistribution')}</Text>
              {renderPortfolioChart()}
            </View>
          </View>
        )}

        {activeTab === 'cursos' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('inversionista.recommendedCourses')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Inversiones')}>
                <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
              </TouchableOpacity>
            </View>

            {courses.length > 0 ? (
              courses.map((course) => (
                <TouchableOpacity 
                  key={course.id} 
                  style={styles.courseCard}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                >
                  <Image 
                    source={{ uri: course.image_url || 'https://www.investiiapp.com/investi-logo-new-main.png' }} 
                    style={styles.courseImage}
                    defaultSource={{ uri: 'https://www.investiiapp.com/investi-logo-new-main.png' }}
                  />
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <View style={styles.courseMeta}>
                      <View style={styles.metaItem}>
                        <BookOpen size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{course.lessons} {t('common.lessons')}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{course.duration}</Text>
                      </View>
                    </View>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${course.progress || 0}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>{course.progress || 0}%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <BookOpen size={48} color={colors.textSecondary} />
                <Text style={styles.emptyText}>{t('inversionista.noCourses')}</Text>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate('Inversiones')}
                >
                  <Text style={styles.primaryButtonText}>
                    {t('inversionista.exploreCourses')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'rendimiento' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('inversionista.performance')}</Text>
              {renderPerformanceChart()}
              
              <View style={styles.performanceStats}>
                <View style={styles.performanceStat}>
                  <Text style={styles.performanceStatValue}>
                    {profile?.total_return?.toLocaleString() || '0'}%
                  </Text>
                  <Text style={styles.performanceStatLabel}>{t('inversionista.totalReturn')}</Text>
                </View>
                <View style={styles.performanceStat}>
                  <Text style={[styles.performanceStatValue, { color: colors.success }]}>
                    +{profile?.monthly_return || '0'}%
                  </Text>
                  <Text style={styles.performanceStatLabel}>{t('inversionista.monthlyReturn')}</Text>
                </View>
                <View style={styles.performanceStat}>
                  <Text style={[styles.performanceStatValue, { color: colors.danger }]}>
                    {profile?.max_drawdown || '0'}%
                  </Text>
                  <Text style={styles.performanceStatLabel}>{t('inversionista.maxDrawdown')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('inversionista.recentActivity')}</Text>
              {profile?.recent_activity?.length > 0 ? (
                <View>
                  {profile.recent_activity.map((activity: any, index: number) => (
                    <View key={index} style={styles.activityItem}>
                      <View style={styles.activityIcon}>
                        {activity.type === 'investment' && <DollarSign size={16} color={colors.success} />}
                        {activity.type === 'learning' && <BookOpen size={16} color={colors.primary} />}
                        {activity.type === 'achievement' && <TrendingUp size={16} color={colors.warning} />}
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>{activity.title}</Text>
                        <Text style={styles.activityDate}>{activity.date}</Text>
                      </View>
                      <Text style={[
                        styles.activityAmount,
                        activity.amount > 0 ? styles.positiveAmount : styles.negativeAmount
                      ]}>
                        {activity.amount > 0 ? '+' : ''}{activity.amount}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Info size={32} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>{t('inversionista.noActivity')}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#6c757d',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2673f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    color: '#6c757d',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2673f3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#2673f3',
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  riskMeterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  riskLevel: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    marginRight: 1,
  },
  riskLevelConservador: {
    backgroundColor: '#4caf50',
  },
  riskLevelModerado: {
    backgroundColor: '#ffc107',
  },
  riskLevelAgresivo: {
    backgroundColor: '#f44336',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    marginRight: 0,
  },
  riskLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  riskLevelLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6c757d',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  seeAll: {
    color: '#2673f3',
    fontSize: 14,
    fontWeight: '500',
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseImage: {
    width: 100,
    height: 100,
  },
  courseInfo: {
    flex: 1,
    padding: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  courseMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2673f3',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
    minWidth: 30,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#2673f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  performanceStat: {
    alignItems: 'center',
    flex: 1,
  },
  performanceStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2673f3',
    marginBottom: 4,
  },
  performanceStatLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(38, 115, 243, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  positiveAmount: {
    color: '#28a745',
  },
  negativeAmount: {
    color: '#dc3545',
  },
});

export default InversionistaScreen;
