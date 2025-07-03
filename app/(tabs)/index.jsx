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
import { StatsCard } from '../../components/dashboard/StatsCard';
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
      
      const [
        animalsData,
        feedsData,
        financialData,
        userProfile,
      ] = await Promise.all([
        animalsAPI.getAnimals(),
        feedAPI.getFeeds(),
        financialAPI.getTransactions(),
        userAPI.getUserProfile(),
      ]);

      console.log("KULLANICI PROFİLİ",userProfile);

      // Kullanıcı adını ayarla
      if (userProfile && userProfile.name) {
        setUserName(userProfile.name);
      } else if (user) {
        setUserName(user.email.split('@')[0]);
      }

      // İstatistikleri hesapla
      const animalCount = animalsData?.length || 0;
      const feedCount = feedsData?.length || 0;
      
      const totalIncome = financialData
        ?.filter(t => t.type === 'income')
        ?.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0;
      
      const totalExpense = financialData
        ?.filter(t => t.type === 'expense')
        ?.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0;

      setDashboardData({
        stats: {
          animalsCount: animalCount,
          feedsCount: feedCount,
          tasksCount: 0,
          pendingTasksCount: 0,
        },
        recentTransactions: financialData?.slice(0, 5) || [],
        lowStockItems: [],
      });

      setFinancialSummary({
        totalIncome,
        totalExpenses: totalExpense,
        netIncome: totalIncome - totalExpense,
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

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
 
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🐄</Text>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Çiftlik365</Text>
              <Text style={styles.headerSubtitle}>
                Hoş geldiniz, {userName || 'Çiftçi'}
              </Text>
            </View>
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
        
        {/* İstatistik Kartları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genel Durum</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatsCard
                title="Hayvanlarım"
                value={dashboardData.stats.animalsCount}
                subtitle="Toplam hayvan sayısı"
                icon="🐄"
                onPress={() => router.push('/animals')}
              />
              <StatsCard
                title="Net Gelir"
                value={formatCurrency(financialSummary.netIncome)}
                subtitle="Bu ay"
                icon="💰"
                valueColor={financialSummary.netIncome >= 0 ? theme.colors.success : theme.colors.error}
                onPress={() => router.push('/finances')}
              />
            </View>
            <View style={styles.statsRow}>
              <StatsCard
                title="Bekleyen Görevler"
                value={dashboardData.stats.pendingTasksCount}
                subtitle={`${dashboardData.stats.tasksCount} görevden`}
                icon="📋"
                valueColor={theme.colors.error}
                onPress={() => router.push('/tasks')}
              />
              <StatsCard
                title="Yem Stokları"
                value={dashboardData.stats.feedsCount || 0}
                subtitle="Toplam yem çeşidi"
                icon="🌾"
                onPress={() => router.push('/feeds')}
              />
            </View>
          </View>
        </View>
        {/* Düşük Stok Uyarıları */}
        {dashboardData.lowStockItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Düşük Stok Uyarıları</Text>
            {dashboardData.lowStockItems.map((item, index) => (
              <View key={index} style={styles.alertCard}>
                <Text style={styles.alertText}>
                  {item.item_name}: {item.quantity} {item.unit}
                </Text>
                <Text style={styles.alertSubtext}>
                  Minimum: {item.min_threshold} {item.unit}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  },
  loadingText: {
    ...theme.typography.styles.body,
    color: theme.colors.textSecondary,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  headerTextContainer: {
    marginLeft: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text,
  },
  headerSubtitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    ...theme.typography.styles.h5,
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    gap: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -theme.spacing.sm,
  },
  quickActionsContainer: {
    marginHorizontal: -theme.spacing.sm,
  },
  alertCard: {
    backgroundColor: theme.colors.warningMuted,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.radius.lg,
    marginVertical: theme.spacing.xs,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  alertText: {
    ...theme.typography.styles.body,
    color: theme.colors.warningText,
  },
  alertSubtext: {
    ...theme.typography.styles.caption,
    color: theme.colors.warningText,
    marginTop: theme.spacing.xs,
  },
});
