import { Ionicons } from '@expo/vector-icons';
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
import DatePickerField from '../../../components/forms/DatePickerField';
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
        const start = period === 'year'
          ? new Date(today.getFullYear(), 0, 1)
          : new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = start.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
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

  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      animal_purchase: 'Hayvan Alımı',
      animal_sale: 'Hayvan Satışı',
      feed_purchase: 'Yem Alımı',
      veterinary: 'Veteriner',
      medicine: 'İlaç',
      vaccination: 'Aşı',
      equipment: 'Ekipman',
      maintenance: 'Bakım',
      fuel: 'Yakıt',
      electricity: 'Elektrik',
      water: 'Su',
      milk_sale: 'Süt Satışı',
      egg_sale: 'Yumurta Satışı',
      other_income: 'Diğer Gelir',
      other_expense: 'Diğer Gider'
    };
    return categoryNames[category] || category;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const renderTransaction = (item, index) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.transactionCard}
      onPress={() => router.push(`/finances/detail/${item.id}`)}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionCategory}>
            {getCategoryDisplayName(item.category)}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.date)}
          </Text>
          {item.animals && (
            <Text style={styles.animalInfo}>
              {item.animals.tag_number} - {item.animals.name}
            </Text>
          )}
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText,
            { color: item.type === 'income' ? theme.colors.text : theme.colors.textSecondary }
          ]}>
            {item.type === 'income' ? '+' : '-'}{formatAmount(Math.abs(item.amount))}
          </Text>
          {item.profit_loss && (
            <Text style={[
              styles.profitLoss,
              { color: item.profit_loss > 0 ? theme.colors.success : theme.colors.error }
            ]}>
              Kâr/Zarar: {formatAmount(item.profit_loss)}
            </Text>
          )}
        </View>
      </View>
      {item.description && (
        <Text style={styles.transactionDescription}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
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
      <View style={styles.header}>
        <Text style={styles.title}>Finansal İşlemler</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => router.push('/finances/reports')}
          >
            <Ionicons name="stats-chart" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/finances/add')}
          >
            <Ionicons name="add" size={24} color={theme.colors.primaryText} />
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
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Ionicons name="trending-up" size={24} color={theme.colors.success} />
              <Text style={styles.summaryLabel}>{period === 'year' ? 'Yıllık Gelir' : 'Aylık Gelir'}</Text>
            </View>
            <Text style={styles.summaryAmount}>{formatAmount(summary.totalIncome)}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Ionicons name="trending-down" size={24} color={theme.colors.error} />
              <Text style={styles.summaryLabel}>{period === 'year' ? 'Yıllık Gider' : 'Aylık Gider'}</Text>
            </View>
            <Text style={styles.summaryAmount}>{formatAmount(summary.totalExpense)}</Text>
          </View>
          
          <View style={[styles.summaryCard, styles.profitCard]}>
            <View style={styles.summaryCardHeader}>
              <Ionicons 
                name={summary.totalProfit >= 0 ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color={summary.totalProfit >= 0 ? theme.colors.success : theme.colors.error} 
              />
              <Text style={styles.summaryLabel}>{period === 'year' ? 'Yıllık Net Kâr/Zarar' : 'Net Kâr/Zarar'}</Text>
            </View>
            <Text style={[
              styles.summaryAmount,
              styles.profitAmount,
              { color: summary.totalProfit >= 0 ? theme.colors.success : theme.colors.error }
            ]}>
              {formatAmount(summary.totalProfit)}
            </Text>
          </View>
        </View>

        {/* Period Filter */}
        <View style={styles.filterContainer}>
          <PeriodButton value="month" title="Aylık" />
          <PeriodButton value="year" title="Yıllık" />
          <TouchableOpacity
            style={[styles.filterButton, customRange.start && styles.filterButtonActive]}
            onPress={() => setShowRangePicker(true)}
          >
            <Text style={[styles.filterButtonText, customRange.start && styles.filterButtonTextActive]}>Özel</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <FilterButton type="all" title="Hepsi" />
          <FilterButton type="income" title="Gelirler" />
          <FilterButton type="expense" title="Giderler" />
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="hourglass-outline" size={64} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Yükleniyor...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color={theme.colors.textMuted} />
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
              <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                <Text style={styles.loadMoreText}>Daha Fazla Yükle</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      {showRangePicker && (
        <View style={styles.rangeOverlay}>
          <View style={styles.rangeCard}>
            <Text style={styles.rangeTitle}>Özel Tarih Aralığı</Text>
            <TouchableOpacity onPress={() => setShowRangePicker(false)} style={{ position: 'absolute', right: 12, top: 12 }}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={{ height: 12 }} />
            <DatePickerField label="Başlangıç" value={rangeDraftStart} onChange={setRangeDraftStart} />
            <DatePickerField label="Bitiş" value={rangeDraftEnd} onChange={setRangeDraftEnd} />
            <View style={{ height: 8 }} />
            <TouchableOpacity
              style={[styles.filterButton, !(rangeDraftStart && rangeDraftEnd) && { opacity: 0.6 }]}
              disabled={!(rangeDraftStart && rangeDraftEnd)}
              onPress={() => {
                setCustomRange({ start: rangeDraftStart, end: rangeDraftEnd });
                setPage(0);
                setShowRangePicker(false);
                setTimeout(() => loadFinancialData(true), 0);
              }}
            >
              <Text style={styles.filterButtonText}>Uygula</Text>
            </TouchableOpacity>
            <View style={{ height: 12 }} />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                // Basit seçim: son 7 gün
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 6);
                setRangeDraftStart(start);
                setRangeDraftEnd(end);
              }}
            >
              <Text style={styles.filterButtonText}>Son 7 Gün</Text>
            </TouchableOpacity>
            <View style={{ height: 8 }} />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                // Bu yıl
                const end = new Date();
                const start = new Date(end.getFullYear(), 0, 1);
                setRangeDraftStart(start);
                setRangeDraftEnd(end);
              }}
            >
              <Text style={styles.filterButtonText}>Bu Yıl</Text>
            </TouchableOpacity>
            <View style={{ height: 12 }} />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                // Özel aralığı temizle
                setCustomRange({ start: null, end: null });
                setRangeDraftStart(null);
                setRangeDraftEnd(null);
                setPage(0);
                setShowRangePicker(false);
                setTimeout(() => loadFinancialData(true), 0);
              }}
            >
              <Text style={styles.filterButtonText}>Temizle</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  reportButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profitCard: {
    marginBottom: 0,
  },
  profitAmount: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: theme.colors.primaryText,
  },
  transactionsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  transactionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  animalInfo: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profitLoss: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  transactionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: theme.colors.primaryText,
    fontWeight: '600',
  },
  loadMoreBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadMoreText: {
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rangeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
}); 