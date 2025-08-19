import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../themes';
import { getFinanceCardStyles } from './FinanceCard.styles';

export const FinanceCard = React.memo(({ transaction, onPress }) => {
  const theme = useTheme();
  const styles = getFinanceCardStyles(theme);

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

  const handlePress = () => {
    onPress(transaction);
  };

  return (
    <TouchableOpacity 
      style={styles.transactionCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionCategory}>
            {getCategoryDisplayName(transaction.category)}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.date)}
          </Text>
          {transaction.animals && (
            <Text style={styles.animalInfo}>
              {transaction.animals.tag_number} - {transaction.animals.name}
            </Text>
          )}
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText,
            { color: transaction.type === 'income' ? theme.colors.text : theme.colors.textSecondary }
          ]}>
            {transaction.type === 'income' ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
          </Text>
          {transaction.profit_loss && (
            <Text style={[
              styles.profitLoss,
              { color: transaction.profit_loss > 0 ? theme.colors.success : theme.colors.error }
            ]}>
              Kâr/Zarar: {formatAmount(transaction.profit_loss)}
            </Text>
          )}
        </View>
      </View>
      {transaction.description && (
        <Text style={styles.transactionDescription}>
          {transaction.description}
        </Text>
      )}
    </TouchableOpacity>
  );
});

FinanceCard.displayName = 'FinanceCard';