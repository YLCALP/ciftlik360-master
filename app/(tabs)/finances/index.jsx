import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import { Icon } from '../../../components/common/Icon';
import { FinanceCard } from '../../../components/FinanceCard';
import { SummaryCard } from '../../../components/SummaryCard';
import { useAuth } from '../../../contexts/AuthContext';
import { financialAPI } from '../../../services/api';
import { useTheme } from '../../../themes/useTheme';

export default function FinancesScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalProfit: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [period, setPeriod] = useState('month'); // 'month' | 'year'
  const [customRange, setCustomRange] = useState({ start: null, end: null });
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 30;
  const [rangeDraftStart, setRangeDraftStart] = useState(null);
  const [rangeDraftEnd, setRangeDraftEnd] = useState(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const loadFinancialData = useCallback(async (reset = false) => {
    try {
      if (reset) setPage(0);
      setLoading(true);
      
      const filters = {};
      if (selectedFilter !== 'all') {
        filters.type = selectedFilter;
      }

      console.log('Loading financial data with filters:', filters);

      // Dönem başlangıç-bitiş
      const today = new Date();
      let startDate;
      let endDate;
      if (customRange.start && customRange.end) {
        startDate = new Date(customRange.start).toISOString().split('T')[0];
        endDate = new Date(customRange.end).toISOString().split('T')[0];
      } else {
        if (period === 'year') {
          const start = new Date(today.getFullYear(), 0, 1);
          const end = new Date(today.getFullYear(), 11, 31);
          startDate = start.toISOString().split('T')[0];
          endDate = end.toISOString().split('T')[0];
        } else {
          const start = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate = start.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
        }
      }

      console.log('Date range:', startDate, 'to', endDate);

      const offset = reset ? 0 : page * PAGE_SIZE;
      const [transactionsData, reportData] = await Promise.all([
        financialAPI.getTransactions({ ...filters, startDate, endDate, offset, limit: PAGE_SIZE }),
        financialAPI.getFinancialReport(startDate, endDate)
      ]);

      console.log('Transactions loaded:', transactionsData?.length || 0);
      console.log('Sample transaction:', transactionsData?.[0]);
      console.log('Report data:', reportData);

      // Güvenli taraf: sunucu sıralasa da, istemci tarafında da son kontrol sıralama
      const newPageData = (transactionsData || []).sort((a, b) => {
        const ad = new Date(a.date).getTime();
        const bd = new Date(b.date).getTime();
        if (bd !== ad) return bd - ad;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      if (reset) {
        setTransactions(newPageData);
      } else {
        setTransactions(prev => [...prev, ...newPageData]);
      }
      setSummary({
        totalIncome: reportData?.totalIncome || 0,
        totalExpense: reportData?.totalExpense || 0,
        totalProfit: reportData?.totalProfit || 0
      });
    } catch (error) {
      console.error('Load financial data error:', error);
      FlashMessageService.error('Hata', 'Finansal veriler yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter, period, customRange, page]);

  // Sayfa her açıldığında verileri otomatik yenile
  useFocusEffect(
    useCallback(() => {
      loadFinancialData(true);
    }, [selectedFilter, period, customRange])
  );

  useEffect(() => {
    loadFinancialData(true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    loadFinancialData(true).finally(() => setRefreshing(false));
  };

  const loadMore = () => {
    if (loading) return;
    setPage(prev => prev + 1);
  };

  const formatAmount = (amount) => {
    const formatted = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${formatted} ₺`;
  };

  const handleTransactionPress = useCallback((transaction) => {
    router.push(`/finances/detail/${transaction.id}`);
  }, []);

  const renderTransaction = (item, index) => (
    <FinanceCard
      key={item.id}
      transaction={item}
      onPress={handleTransactionPress}
    />
  );

  const FilterButton = ({ type, title }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === type && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(type)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === type && styles.filterButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const PeriodButton = ({ value, title }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        period === value && styles.filterButtonActive
      ]}
      onPress={() => setPeriod(value)}
    >
      <Text style={[
        styles.filterButtonText,
        period === value && styles.filterButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.title}>Finansal İşlemler</Text>
          <Text style={styles.subtitle}>{transactions.length} işlem {selectedFilter !== 'all' ? '(filtrelenmiş)' : ''}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => router.push('/finances/reports')}
          >
            <Icon library="Feather" name="bar-chart-2" size={20} color={theme.colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/finances/add')}
          >
            <Icon library="Feather" name="plus" size={24} color={theme.colors.primaryText} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryContainer}>
          <SummaryCard
            type="income"
            label="Gelir"
            amount={summary.totalIncome}
            period={period}
            formatAmount={formatAmount}
          />
          
          <SummaryCard
            type="expense"
            label="Gider"
            amount={summary.totalExpense}
            period={period}
            formatAmount={formatAmount}
          />
          
          <SummaryCard
            type="profit"
            label="Net Kâr/Zarar"
            amount={summary.totalProfit}
            period={period}
            formatAmount={formatAmount}
            isProfitCard={true}
          />
        </View>

        {/* Period Filter */}
        <View style={styles.filterContainer}>
          <PeriodButton value="month" title="Aylık" />
          <PeriodButton value="year" title="Yıllık" />
        </View>

        <View style={styles.filterContainer}>
          <FilterButton type="all" title="Hepsi" />
          <FilterButton type="income" title="Gelirler" />
          <FilterButton type="expense" title="Giderler" />
        </View>

        <View style={styles.transactionsContainer}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <Icon library="Feather" name="clock" size={64} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Yükleniyor...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon library="Feather" name="file-text" size={64} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Henüz finansal işlem bulunmuyor</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/finances/add')}
              >
                <Text style={styles.emptyButtonText}>İlk İşlemi Ekle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {transactions.map((item, index) => renderTransaction(item, index))}
             
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
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
  title: {
    ...theme.typography.styles.h2,
    color: theme.colors.text,
    fontWeight: '700',
  },
  subtitle: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  reportButton: {
    backgroundColor: theme.colors.success,
    borderWidth: 0,
    width: theme.spacing.sizes.button.height,
    height: theme.spacing.sizes.button.height,
    borderRadius: theme.spacing.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.spacing.shadows.md,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: theme.spacing.sizes.button.height,
    height: theme.spacing.sizes.button.height,
    borderRadius: theme.spacing.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.spacing.shadows.md,
  },
  summaryContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingVertical: theme.spacing.layout.sectionGap,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingVertical: theme.spacing.layout.contentGap,
    backgroundColor: theme.colors.card,
    gap: theme.spacing.sm,
    ...theme.spacing.shadows.xs,
    marginBottom: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.component.button.small.paddingVertical,
    paddingHorizontal: theme.spacing.component.button.small.paddingHorizontal,
    borderRadius: theme.spacing.component.button.small.radius,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 0,
    alignItems: 'center',
    ...theme.spacing.shadows.sm,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.success,
    ...theme.spacing.shadows.md,
  },
  filterButtonText: {
    ...theme.typography.styles.buttonSmall,
    color: theme.colors.text,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  transactionsContainer: {
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingVertical: theme.spacing.layout.contentGap,
    paddingBottom: theme.spacing.layout.sectionGapLarge,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['8xl'],
  },
  emptyText: {
    ...theme.typography.styles.bodyLarge,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.layout.contentGap,
    marginBottom: theme.spacing.layout.sectionGap,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.component.button.paddingVertical,
    paddingHorizontal: theme.spacing.component.button.paddingHorizontal,
    borderRadius: theme.spacing.component.button.radius,
    ...theme.spacing.shadows.lg,
    shadowColor: theme.colors.success,
  },
  emptyButtonText: {
    ...theme.typography.styles.button,
    color: theme.colors.white,
    fontWeight: '700',
  },
  loadMoreBtn: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.component.button.small.paddingVertical,
    borderRadius: theme.spacing.component.button.small.radius,
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 0,
    ...theme.spacing.shadows.sm,
  },
  loadMoreText: {
    ...theme.typography.styles.buttonSmall,
    color: theme.colors.text,
    fontWeight: '600',
  },
  rangeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  rangeCard: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.spacing.component.modal.borderRadius,
    borderTopRightRadius: theme.spacing.component.modal.borderRadius,
    padding: theme.spacing.component.modal.padding,
    borderWidth: 0,
    ...theme.spacing.shadows['2xl'],
  },
  rangeTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '700',
  },
}); 