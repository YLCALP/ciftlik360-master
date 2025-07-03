import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { financialAPI } from '../../../services/api';
import { useTheme } from '../../../themes/useTheme';

export default function FinancialReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalProfit: 0,
    categories: {},
    animalProfitLoss: 0
  });
  const [animalProfits, setAnimalProfits] = useState([]);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = new Date().toISOString().split('T')[0];

      const [financialReport, animalProfitReport] = await Promise.all([
        financialAPI.getFinancialReport(startDate, endDate),
        financialAPI.getAnimalProfitReport()
      ]);

      setReport(financialReport);
      setAnimalProfits(animalProfitReport);
    } catch (error) {
      console.error('Load reports error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Sayfa her açıldığında raporları otomatik yenile
  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
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

  const renderAnimalProfit = ({ item }) => (
    <View style={styles.animalProfitCard}>
      <View style={styles.animalProfitHeader}>
        <Text style={styles.animalTag}>{item.animals?.tag_number}</Text>
        <Text style={styles.animalName}>{item.animals?.name || 'İsimsiz'}</Text>
        <Text style={styles.animalSpecies}>{item.animals?.species} - {item.animals?.breed}</Text>
      </View>
      <View style={styles.animalProfitDetails}>
        <View style={styles.profitRow}>
          <Text style={styles.profitLabel}>Alış Fiyatı:</Text>
          <Text style={styles.profitValue}>{formatAmount(item.purchase_price || 0)}</Text>
        </View>
        <View style={styles.profitRow}>
          <Text style={styles.profitLabel}>Satış Fiyatı:</Text>
          <Text style={styles.profitValue}>{formatAmount(item.sale_price || 0)}</Text>
        </View>
        <View style={styles.profitRow}>
          <Text style={styles.profitLabel}>Kâr/Zarar:</Text>
          <Text style={[
            styles.profitValue,
            styles.profitLoss,
            { color: item.profit_loss > 0 ? theme.colors.success : theme.colors.error }
          ]}>
            {formatAmount(item.profit_loss || 0)}
          </Text>
        </View>
        <View style={styles.profitRow}>
          <Text style={styles.profitLabel}>Satış Tarihi:</Text>
          <Text style={styles.profitValue}>{formatDate(item.sale_date)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Finansal Raporlar</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Genel Özet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yıllık Özet ({new Date().getFullYear()})</Text>
          <View style={styles.summaryCards}>
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.summaryLabel}>Toplam Gelir</Text>
              <Text style={styles.summaryAmount}>{formatAmount(report.totalIncome)}</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.summaryLabel}>Toplam Gider</Text>
              <Text style={styles.summaryAmount}>{formatAmount(report.totalExpense)}</Text>
            </View>
            <View style={[styles.summaryCard, { 
              backgroundColor: report.totalProfit >= 0 ? theme.colors.success : theme.colors.error 
            }]}>
              <Text style={styles.summaryLabel}>Net Kâr/Zarar</Text>
              <Text style={styles.summaryAmount}>{formatAmount(report.totalProfit)}</Text>
            </View>
          </View>
        </View>

        {/* Kategori Bazında Dağılım */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategori Bazında Dağılım</Text>
          {Object.entries(report.categories).map(([category, data]) => (
            <View key={category} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{getCategoryDisplayName(category)}</Text>
                <Text style={styles.categoryCount}>{data.count} işlem</Text>
              </View>
              <View style={styles.categoryAmounts}>
                {data.income > 0 && (
                  <Text style={[styles.incomeAmount, { color: theme.colors.success }]}>+{formatAmount(data.income)}</Text>
                )}
                {data.expense > 0 && (
                  <Text style={[styles.expenseAmount, { color: theme.colors.error }]}>-{formatAmount(data.expense)}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Hayvan Kâr/Zarar Raporu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hayvan Kâr/Zarar Raporu</Text>
          {animalProfits.length > 0 ? (
            <FlatList
              data={animalProfits}
              renderItem={renderAnimalProfit}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz satılan hayvan bulunmuyor</Text>
            </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  summaryCards: {
    gap: 12,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  summaryLabel: {
    color: theme.colors.primaryText,
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  summaryAmount: {
    color: theme.colors.primaryText,
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  categoryCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  categoryAmounts: {
    alignItems: 'flex-end',
  },
  incomeAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.error,
  },
  animalProfitCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  animalProfitHeader: {
    marginBottom: 12,
  },
  animalTag: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  animalName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  animalSpecies: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  animalProfitDetails: {
    gap: 8,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  profitValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  profitLoss: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
}); 