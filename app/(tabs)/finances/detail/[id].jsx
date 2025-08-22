import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FlashMessageService } from '../../../../components/common/FlashMessage';
import DetailHeader from '../../../../components/detail/DetailHeader';
import DetailSection from '../../../../components/detail/DetailSection';
import DetailButton from '../../../../components/forms/DetailButton';
import { financialAPI } from '../../../../services/api';
import { useTheme } from '../../../../themes';

export default function FinancialTransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const styles = getStyles(theme);

  const loadTransaction = useCallback(async () => {
    try {
      setLoading(true);
      const data = await financialAPI.getTransaction(id);
      if (!data) {
        FlashMessageService.error('Hata', 'İşlem yüklenirken hata oluştu');
        router.back();
        return;
      }
      setTransaction(data);
    } catch (error) {
      console.error('Load transaction error:', error);
      FlashMessageService.error('Hata', 'İşlem yüklenirken hata oluştu');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadTransaction(); }, [loadTransaction]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatAmount = (amount) => {
    const formatted = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    return `${formatted} ₺`;
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

  const getTypeDisplayName = (type) => {
    return type === 'income' ? 'Gelir' : 'Gider';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <DetailHeader title="Yükleniyor..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>İşlem bilgileri yükleniyor...</Text>
        </View>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <DetailHeader title="Hata" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>İşlem bulunamadı</Text>
          <DetailButton 
            title="Geri Dön" 
            variant="outline" 
            onPress={() => router.back()}
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>
      </View>
    );
  }

  const transactionIcon = transaction.type === 'income' ? 
    { library: 'Feather', name: 'trending-up' } : 
    { library: 'Feather', name: 'trending-down' };
  
  const statusBadge = {
    status: transaction.type === 'income' ? 'success' : 'error',
    label: getTypeDisplayName(transaction.type)
  };

  return (
    <View style={styles.container}>
      <DetailHeader
        title={getCategoryDisplayName(transaction.category)}
        subtitle={`${formatDate(transaction.date)}`}
        emoji={transaction.type === 'income' ? '💰' : '💸'}
        statusBadge={statusBadge}
        gradient={true}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Amount Display */}
        <DetailSection
          title="Tutar"
          subtitle="İşlem tutarı"
          icon={transactionIcon}
          showDivider={false}
        >
          <View style={styles.amountDisplay}>
            <Text style={[
              styles.amountText,
              { color: transaction.type === 'income' ? theme.colors.success : theme.colors.error }
            ]}>
              {transaction.type === 'income' ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
            </Text>
          </View>
        </DetailSection>

        {/* Transaction Details */}
        <DetailSection
          title="İşlem Detayları"
          subtitle="Temel bilgiler"
          icon={{ library: 'Feather', name: 'info' }}
        >
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Kategori</Text>
              <Text style={styles.detailValue}>{getCategoryDisplayName(transaction.category)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tarih</Text>
              <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
            </View>

            {transaction.animals && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Hayvan</Text>
                <Text style={styles.detailValue}>
                  {transaction.animals.tag_number} - {transaction.animals.name}
                </Text>
              </View>
            )}

            {transaction.is_automatic && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>İşlem Türü</Text>
                <Text style={styles.detailValue}>Otomatik</Text>
              </View>
            )}
          </View>
        </DetailSection>

        {/* Description */}
        {transaction.description && (
          <DetailSection
            title="Açıklama"
            icon={{ library: 'Feather', name: 'file-text' }}
            collapsible={true}
          >
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{transaction.description}</Text>
            </View>
          </DetailSection>
        )}

        {/* Profit/Loss */}
        {transaction.profit_loss && (
          <DetailSection
            title="Kâr/Zarar Analizi"
            icon={{ library: 'Feather', name: 'bar-chart-2' }}
            collapsible={true}
          >
            <View style={styles.profitLossContainer}>
              <Text style={[
                styles.profitLossAmount,
                { color: transaction.profit_loss > 0 ? theme.colors.success : theme.colors.error }
              ]}>
                {transaction.profit_loss > 0 ? '+' : ''}{formatAmount(transaction.profit_loss)}
              </Text>
              <Text style={styles.profitLossLabel}>
                {transaction.profit_loss > 0 ? 'Kâr' : 'Zarar'}
              </Text>
            </View>
          </DetailSection>
        )}

        {/* Technical Information */}
        <DetailSection
          title="Teknik Bilgiler"
          subtitle="Sistem kayıtları"
          icon={{ library: 'Feather', name: 'settings' }}
          collapsible={true}
        >
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>İşlem ID</Text>
              <Text style={[styles.detailValue, styles.idText]}>{transaction.id}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Oluşturulma</Text>
              <Text style={styles.detailValue}>
                {new Date(transaction.created_at).toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>
        </DetailSection>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.styles.bodyLarge,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorText: {
    ...theme.typography.styles.h4,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
    scrollContent: {
      paddingHorizontal: isTablet ? theme.spacing.xl : theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      maxWidth: isTablet ? 800 : '100%',
      alignSelf: isTablet ? 'center' : 'stretch',
      width: '100%',
    },
  amountDisplay: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  amountText: {
    ...theme.typography.styles.display,
    fontSize: 42,
    fontWeight: '800',
  },
  detailsGrid: {
    gap: theme.spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  detailLabel: {
    ...theme.typography.styles.body,
    color: theme.colors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  detailValue: {
    ...theme.typography.styles.bodyLarge,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  descriptionContainer: {
    paddingVertical: theme.spacing.md,
  },
  descriptionText: {
    ...theme.typography.styles.body,
    color: theme.colors.text,
    lineHeight: 24,
  },
  profitLossContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  profitLossAmount: {
    ...theme.typography.styles.h2,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  profitLossLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  idText: {
    ...theme.typography.styles.caption,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: theme.colors.textMuted,
    fontSize: 11,
  },
    actionSection: {
      paddingHorizontal: theme.spacing.sm,
      marginTop: theme.spacing.xl,
      maxWidth: isTablet ? 400 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
});
};