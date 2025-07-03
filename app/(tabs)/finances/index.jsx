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

  const styles = useMemo(() => createStyles(theme), [theme]);

  const loadFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      
      const filters = {};
      if (selectedFilter !== 'all') {
        filters.type = selectedFilter;
      }

      console.log('Loading financial data with filters:', filters);

      // Ay başından bugüne kadar
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDate = firstDayOfMonth.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      console.log('Date range:', startDate, 'to', endDate);

      const [transactionsData, reportData] = await Promise.all([
        financialAPI.getTransactions(filters),
        financialAPI.getFinancialReport(startDate, endDate)
      ]);

      console.log('Transactions loaded:', transactionsData?.length || 0);
      console.log('Sample transaction:', transactionsData?.[0]);
      console.log('Report data:', reportData);

      setTransactions(transactionsData || []);
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
  }, [selectedFilter]);

  // Sayfa her açıldığında verileri otomatik yenile
  useFocusEffect(
    useCallback(() => {
      loadFinancialData();
    }, [loadFinancialData])
  );

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFinancialData();
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
              <Text style={styles.summaryLabel}>Aylık Gelir</Text>
            </View>
            <Text style={styles.summaryAmount}>{formatAmount(summary.totalIncome)}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Ionicons name="trending-down" size={24} color={theme.colors.error} />
              <Text style={styles.summaryLabel}>Aylık Gider</Text>
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
              <Text style={styles.summaryLabel}>Net Kâr/Zarar</Text>
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
            transactions.map((item, index) => renderTransaction(item, index))
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
}); 