import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import { feedConsumptionAPI } from '../../../services/api';
import { useTheme } from '../../../themes';

const ConsumptionReports = () => {
  const [consumptionData, setConsumptionData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all

  const theme = useTheme();
  const styles = getStyles(theme);

  const periods = [
    { key: 'week', name: 'Son 7 Gün' },
    { key: 'month', name: 'Bu Ay' },
    { key: 'all', name: 'Tümü' },
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = ((period) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        switch (period) {
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return { startDate: weekAgo.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] };
          case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return { startDate: monthStart.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] };
          default:
            return { startDate: null, endDate: null };
        }
      })(selectedPeriod);
      
      const [consumption, summary] = await Promise.all([
        feedConsumptionAPI.getDailyConsumption(startDate, endDate),
        feedConsumptionAPI.getConsumptionSummary(startDate, endDate),
      ]);
      
      setConsumptionData(consumption);
      setSummaryData(summary);
    } catch (error) {
      console.error('Load data error:', error);
      FlashMessageService.error('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const getSpeciesEmoji = (species) => {
    const emojis = {
      cattle: '🐄',
      sheep: '🐑',
      goat: '🐐',
      poultry: '🐔',
      manual: '✋',
    };
    return emojis[species] || '🐾';
  };

  const getFeedTypeText = (feedType) => {
    const texts = {
      concentrate: 'Konsantre',
      roughage: 'Kaba Yem',
      supplement: 'Takviye',
    };
    return texts[feedType] || feedType;
  };

  const renderSummaryCard = ({ item }) => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryEmoji}>{getSpeciesEmoji(item.species)}</Text>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryTitle}>
            {item.species === 'manual' ? 'Manuel Kayıtlar' : item.species} - {getFeedTypeText(item.feed_type)}
          </Text>
          <Text style={styles.summaryDate}>{formatDate(item.consumption_date)}</Text>
        </View>
      </View>
      
      <View style={styles.summaryStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Toplam Tüketim</Text>
          <Text style={styles.statValue}>{item.total_daily_consumption?.toFixed(1)} kg</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Hayvan Sayısı</Text>
          <Text style={styles.statValue}>{item.total_animals}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Hayvan Başına</Text>
          <Text style={styles.statValue}>{item.avg_consumption_per_animal?.toFixed(2)} kg</Text>
        </View>
      </View>
      
      {item.feeds_used && (
        <View style={styles.feedsUsed}>
          <Text style={styles.feedsUsedLabel}>Kullanılan Yemler:</Text>
          <Text style={styles.feedsUsedText}>{item.feeds_used}</Text>
        </View>
      )}
    </View>
  );

  const renderConsumptionCard = ({ item }) => (
    <View style={styles.consumptionCard}>
      <View style={styles.consumptionHeader}>
        <Text style={styles.consumptionEmoji}>{getSpeciesEmoji(item.species)}</Text>
        <View style={styles.consumptionInfo}>
          <Text style={styles.consumptionTitle}>
            {item.feed_inventory?.feed_name || 'Bilinmeyen Yem'}
          </Text>
          <Text style={styles.consumptionSubtitle}>
            {getFeedTypeText(item.feed_type)} • {formatDate(item.consumption_date)}
          </Text>
        </View>
        {item.is_manual && (
          <View style={styles.manualBadge}>
            <Text style={styles.manualText}>Manuel</Text>
          </View>
        )}
      </View>
      
      <View style={styles.consumptionStats}>
        <View style={styles.consumptionStat}>
          <Text style={styles.consumptionStatLabel}>Tüketim</Text>
          <Text style={styles.consumptionStatValue}>
            {item.total_consumption} {item.feed_inventory?.unit || 'kg'}
          </Text>
        </View>
        <View style={styles.consumptionStat}>
          <Text style={styles.consumptionStatLabel}>Hayvan Sayısı</Text>
          <Text style={styles.consumptionStatValue}>{item.total_animals_count}</Text>
        </View>
        <View style={styles.consumptionStat}>
          <Text style={styles.consumptionStatLabel}>Kalan Stok</Text>
          <Text style={styles.consumptionStatValue}>
            {item.remaining_stock} {item.feed_inventory?.unit || 'kg'}
          </Text>
        </View>
      </View>
      
      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  const renderPeriodButton = (period) => (
    <TouchableOpacity
      key={period.key}
      style={[
        styles.periodButton,
        selectedPeriod === period.key && styles.selectedPeriodButton,
      ]}
      onPress={() => setSelectedPeriod(period.key)}
    >
      <Text
        style={[
          styles.periodButtonText,
          selectedPeriod === period.key && styles.selectedPeriodButtonText,
        ]}
      >
        {period.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Raporlar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yem Tüketim Raporları</Text>
        <View style={styles.periodSelector}>
          {periods.map(renderPeriodButton)}
        </View>
      </View>

      <ScrollView>
        {/* Özet Kartları */}
        {summaryData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Özet</Text>
            <FlatList
              data={summaryData}
              renderItem={renderSummaryCard}
              keyExtractor={(item, index) => `summary-${index}`}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Detaylı Tüketim Kayıtları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Detaylı Kayıtlar</Text>
          {consumptionData.length > 0 ? (
            <FlatList
              data={consumptionData}
              renderItem={renderConsumptionCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyTitle}>Henüz tüketim kaydı yok</Text>
              <Text style={styles.emptyText}>
                Seçili dönemde yem tüketim kaydı bulunamadı.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.styles.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  periodButton: {
    ...theme.styles.button('secondary', 'sm'),
    paddingHorizontal: theme.spacing.lg,
  },
  selectedPeriodButton: {
    ...theme.styles.button('primary', 'sm'),
  },
  periodButtonText: {
    ...theme.styles.text('button', 'secondary'),
  },
  selectedPeriodButtonText: {
    ...theme.styles.text('button', 'primaryText'),
  },
  section: {
    margin: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryEmoji: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    ...theme.typography.styles.h6,
    color: theme.colors.text,
  },
  summaryDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.textSecondary,
  },
  statValue: {
    ...theme.typography.styles.body,
    color: theme.colors.text,
    fontWeight: theme.typography.weights.bold,
  },
  feedsUsed: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  feedsUsedLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  feedsUsedText: {
    ...theme.typography.styles.caption,
    color: theme.colors.textMuted,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  consumptionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  consumptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  consumptionEmoji: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  consumptionInfo: {
    flex: 1,
  },
  consumptionTitle: {
    ...theme.typography.styles.h6,
    color: theme.colors.text,
  },
  consumptionSubtitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  manualBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.radius.sm,
  },
  manualText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  consumptionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  consumptionStat: {
    alignItems: 'center',
  },
  consumptionStatLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.textSecondary,
  },
  consumptionStatValue: {
    ...theme.typography.styles.body,
    color: theme.colors.text,
  },
  notesContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.radius.md,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.radius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.styles.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    padding: theme.spacing.xl,
  },
});

export default ConsumptionReports; 