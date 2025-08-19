import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashMessageService } from '../../components/common/FlashMessage';
import { Icon } from '../../components/common/Icon';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { getStatIcon } from '../../constants/iconMappings';
import { useAuth } from '../../contexts/AuthContext';
import {
  animalsAPI,
  feedAPI,
  financialAPI,
  userAPI
} from '../../services/api';
import { useTheme } from '../../themes';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      animalsCount: 0,
      feedsCount: 0,
      tasksCount: 0,
      pendingTasksCount: 0,
    },
    recentTransactions: [],
    lowStockItems: [],
  });
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      !refreshing && setLoading(true);
      
      // Bu ayın başlangıç ve bitiş tarihlerini hesapla
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const [
        animalsData,
        feedsData,
        financialReport,
        userProfile,
      ] = await Promise.all([
        animalsAPI.getAnimals(),
        feedAPI.getFeeds(),
        financialAPI.getFinancialReport(startDate, endDate),
        userAPI.getUserProfile(),
      ]);

      // İstatistikleri hesapla
      const animalCount = animalsData?.length || 0;
      const feedCount = feedsData?.length || 0;

      setDashboardData({
        stats: {
          animalsCount: animalCount,
          feedsCount: feedCount,
          tasksCount: 0,
          pendingTasksCount: 0,
        },
        recentTransactions: [],
        lowStockItems: [],
      });

      setFinancialSummary({
        totalIncome: financialReport?.totalIncome || 0,
        totalExpenses: financialReport?.totalExpense || 0,
        netIncome: financialReport?.totalProfit || 0,
      });
    } catch (error) {
      console.error('Dashboard data error:', error);
      FlashMessageService.error('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  // Sayfa her açıldığında verileri yeniden yükle
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };


  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
    
    return formatted;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Icon 
              library="MaterialCommunityIcons" 
              name="cow" 
              size={32} 
              color="#8B4513"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Çiftlik365</Text>
            <Text style={styles.headerSubtitle}>
              Merhaba, {userName || 'Çiftçi'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/explore')}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
        }>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genel Durum</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatsCard
                title="Hayvanlarım"
                value={dashboardData.stats.animalsCount}
                subtitle="Toplam hayvan sayısı"
                icon={getStatIcon('animals').name}
                iconLibrary={getStatIcon('animals').library}
                iconColor={getStatIcon('animals').color}
                iconBgColor={getStatIcon('animals').bgColor}
                onPress={() => router.push('/animals')}
              />
              <StatsCard
                title="Yem Stokları"
                value={dashboardData.stats.feedsCount || 0}
                subtitle="Toplam yem çeşidi"
                icon={getStatIcon('feeds').name}
                iconLibrary={getStatIcon('feeds').library}
                iconColor={getStatIcon('feeds').color}
                iconBgColor={getStatIcon('feeds').bgColor}
                onPress={() => router.push('/feeds')}
              />
            </View>
            <View style={styles.statsRow}>
            <StatsCard
                title="Net Gelir"
                value={formatCurrency(financialSummary.netIncome)}
                subtitle="Bu ay"
                icon={getStatIcon('netIncome').name}
                iconLibrary={getStatIcon('netIncome').library}
                iconColor={getStatIcon('netIncome').color}
                iconBgColor={getStatIcon('netIncome').bgColor}
                valueColor={financialSummary.netIncome >= 0 ? theme.colors.success : theme.colors.error}
                onPress={() => router.push('/finances')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.styles.bodyLarge,
    color: theme.colors.textSecondary,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    marginBottom: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: theme.spacing.iconSizes['4xl'],
    height: theme.spacing.iconSizes['4xl'],
    backgroundColor: '#FFF5E6',
    borderRadius: theme.spacing.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  logoEmoji: {
    fontSize: theme.spacing.iconSizes['2xl'],
  },
  headerTextContainer: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  profileButton: {
    width: theme.spacing.sizes.avatar.lg,
    height: theme.spacing.sizes.avatar.lg,
    borderRadius: theme.spacing.radius.full,
    backgroundColor: '#E6F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  profileIcon: {
    width: theme.spacing.sizes.avatar.md,
    height: theme.spacing.sizes.avatar.md,
    borderRadius: theme.spacing.radius.full,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    ...theme.typography.styles.h5,
    color: '#3b82f6',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingVertical: theme.spacing.layout.contentGap,
  },
  sectionTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.layout.contentGap,
    fontWeight: '700',
  },
  statsGrid: {
    gap: theme.spacing.layout.gridGap,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.layout.gridGap,
  },
  quickActionsContainer: {
    gap: theme.spacing.layout.gridGap,
  },
  alertCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.component.card.padding,
    borderRadius: theme.spacing.component.card.radius,
    marginVertical: theme.spacing.component.card.marginSmall,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
    ...theme.spacing.shadows.md,
  },
  alertText: {
    ...theme.typography.styles.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  alertSubtext: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});
