import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import { feedAPI, feedConsumptionAPI } from '../../../services/api';
import { useTheme } from '../../../themes';

const ConsumptionReports = () => {
  const [consumptionData, setConsumptionData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all
  const [showAddModal, setShowAddModal] = useState(false);
  const [feeds, setFeeds] = useState([]);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [consumptionAmount, setConsumptionAmount] = useState('');
  const [animalCount, setAnimalCount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

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
      
      const [consumption, summary, stockAlerts, feedList] = await Promise.all([
        feedConsumptionAPI.getDailyConsumption(startDate, endDate),
        feedConsumptionAPI.getConsumptionSummary(startDate, endDate),
        feedConsumptionAPI.getFeedStockAlerts(),
        feedAPI.getFeeds(),
      ]);
      
      setConsumptionData(consumption);
      setSummaryData(summary);
      setLowStockAlerts(stockAlerts);
      setFeeds(feedList);
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

  const handleAddConsumption = async () => {
    if (!selectedFeed || !consumptionAmount) {
      FlashMessageService.error('Hata', 'Lütfen yem ve miktar seçin.');
      return;
    }

    try {
      setSaving(true);
      await feedConsumptionAPI.addManualConsumption({
        feed_id: selectedFeed.id,
        total_consumption: parseFloat(consumptionAmount),
        total_animals_count: parseInt(animalCount) || 0,
        notes: notes || null,
      });

      FlashMessageService.success('Başarılı', 'Yem tüketimi kaydedildi.');
      setShowAddModal(false);
      resetForm();
      loadData(); // Verileri yenile
    } catch (error) {
      console.error('Add consumption error:', error);
      FlashMessageService.error('Hata', error.message || 'Tüketim kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedFeed(null);
    setConsumptionAmount('');
    setAnimalCount('');
    setNotes('');
  };

  const renderLowStockAlert = ({ item }) => (
    <View style={styles.alertCard}>
      <Ionicons name="warning" size={24} color={theme.colors.warning} />
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{item.feed_name}</Text>
        <Text style={styles.alertText}>
          Stok: {item.quantity} {item.unit} (Min: {item.min_stock_level})
        </Text>
      </View>
    </View>
  );

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
          <Text style={[
            styles.consumptionStatValue,
            item.remaining_stock <= (item.feed_inventory?.min_stock_level || 0) && styles.lowStockText
          ]}>
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
        {/* Düşük Stok Uyarıları */}
        {lowStockAlerts.length > 0 && (
          <View style={styles.alertSection}>
            <Text style={styles.alertSectionTitle}>⚠️ Düşük Stok Uyarıları</Text>
            <FlatList
              data={lowStockAlerts}
              renderItem={renderLowStockAlert}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

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

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={24} color={theme.colors.primaryText} />
      </TouchableOpacity>

      {/* Manuel Tüketim Ekleme Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manuel Yem Tüketimi</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Yem Seçimi */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Yem Seçin</Text>
                <ScrollView style={styles.feedSelector} horizontal showsHorizontalScrollIndicator={false}>
                  {feeds.map((feed) => (
                    <TouchableOpacity
                      key={feed.id}
                      style={[
                        styles.feedOption,
                        selectedFeed?.id === feed.id && styles.selectedFeedOption,
                      ]}
                      onPress={() => setSelectedFeed(feed)}
                    >
                      <Text style={[
                        styles.feedOptionText,
                        selectedFeed?.id === feed.id && styles.selectedFeedOptionText,
                      ]}>
                        {feed.feed_name}
                      </Text>
                      <Text style={styles.feedOptionSubtext}>
                        Stok: {feed.quantity} {feed.unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Miktar */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tüketim Miktarı ({selectedFeed?.unit || 'kg'})</Text>
                <TextInput
                  style={styles.input}
                  value={consumptionAmount}
                  onChangeText={setConsumptionAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>

              {/* Hayvan Sayısı */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Hayvan Sayısı (Opsiyonel)</Text>
                <TextInput
                  style={styles.input}
                  value={animalCount}
                  onChangeText={setAnimalCount}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>

              {/* Notlar */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notlar (Opsiyonel)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  placeholder="Ek bilgiler..."
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, saving && styles.disabledButton]}
                onPress={handleAddConsumption}
                disabled={saving || !selectedFeed || !consumptionAmount}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  alertSection: {
    backgroundColor: theme.colors.warning + '20',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  alertSectionTitle: {
    ...theme.typography.styles.h5,
    color: theme.colors.warning,
    marginBottom: theme.spacing.md,
  },
  alertCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.radius.lg,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.warning,
    minWidth: 200,
  },
  alertContent: {
    marginLeft: theme.spacing.md,
  },
  alertTitle: {
    ...theme.typography.styles.h6,
    color: theme.colors.text,
  },
  alertText: {
    ...theme.typography.styles.caption,
    color: theme.colors.warning,
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
    color: theme.colors.primaryText,
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
  lowStockText: {
    color: theme.colors.warning,
    fontWeight: theme.typography.weights.bold,
  },
  notesContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.spacing.radius['2xl'],
    borderTopRightRadius: theme.spacing.radius['2xl'],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.xl,
  },
  formLabel: {
    ...theme.typography.styles.label,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  feedSelector: {
    maxHeight: 100,
  },
  feedOption: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.radius.lg,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    minWidth: 120,
  },
  selectedFeedOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  feedOptionText: {
    ...theme.typography.styles.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  selectedFeedOptionText: {
    color: theme.colors.primaryText,
  },
  feedOptionSubtext: {
    ...theme.typography.styles.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.radius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    ...theme.typography.styles.button,
    color: theme.colors.text,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    ...theme.typography.styles.button,
    color: theme.colors.primaryText,
  },
  disabledButton: {
    backgroundColor: theme.colors.textDisabled,
  },
});

export default ConsumptionReports; 