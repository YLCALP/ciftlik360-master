import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashMessageService } from '../../../../components/common/FlashMessage';
import { financialAPI } from '../../../../services/api';
import { useTheme } from '../../../../themes/useTheme';

export default function FinancialTransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
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
  };

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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>İşlem Bulunamadı</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>İşlem bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>İşlem Detayı</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ana Bilgiler */}
        <View style={styles.section}>
          <View style={styles.amountContainer}>
            <Text style={[
              styles.amount,
              { color: transaction.type === 'income' ? theme.colors.success : theme.colors.error }
            ]}>
              {transaction.type === 'income' ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
            </Text>
            <View style={[
              styles.typeBadge,
              { backgroundColor: transaction.type === 'income' ? theme.colors.success.replace('1', '0.1') : theme.colors.error.replace('1', '0.1') }
            ]}>
              <Text style={[
                styles.typeText,
                { color: transaction.type === 'income' ? theme.colors.success : theme.colors.error }
              ]}>
                {getTypeDisplayName(transaction.type)}
              </Text>
            </View>
          </View>
        </View>

        {/* Detay Bilgiler */}
        <View style={styles.section}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Kategori</Text>
            <Text style={styles.detailValue}>{getCategoryDisplayName(transaction.category)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tarih</Text>
            <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
          </View>

          {transaction.animals && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hayvan</Text>
              <Text style={styles.detailValue}>
                {transaction.animals.tag_number} - {transaction.animals.name}
              </Text>
            </View>
          )}

          {transaction.description && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Açıklama</Text>
              <Text style={styles.detailValue}>{transaction.description}</Text>
            </View>
          )}

          {transaction.profit_loss && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kâr/Zarar</Text>
              <Text style={[
                styles.detailValue,
                { color: transaction.profit_loss > 0 ? theme.colors.success : theme.colors.error }
              ]}>
                {formatAmount(transaction.profit_loss)}
              </Text>
            </View>
          )}

          {transaction.is_automatic && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>İşlem Türü</Text>
              <Text style={styles.detailValue}>Otomatik</Text>
            </View>
          )}
        </View>

        {/* İşlem ID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teknik Bilgiler</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>İşlem ID</Text>
            <Text style={[styles.detailValue, styles.idText]}>{transaction.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Oluşturulma</Text>
            <Text style={styles.detailValue}>
              {new Date(transaction.created_at).toLocaleString('tr-TR')}
            </Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
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
  },
  section: {
    backgroundColor: theme.colors.card,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  idText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: theme.colors.textMuted,
  },
}); 