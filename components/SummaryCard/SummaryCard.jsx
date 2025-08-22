import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from '../common/Icon';
import { useTheme } from '../../themes';
import { getSummaryCardStyles } from './SummaryCard.styles';

export const SummaryCard = ({ 
  type, 
  label, 
  amount, 
  period, 
  formatAmount,
  isProfitCard = false 
}) => {
  const theme = useTheme();
  const styles = getSummaryCardStyles(theme);

  const getIconConfig = () => {
    switch (type) {
      case 'income':
        return { name: 'trending-up', color: theme.colors.success };
      case 'expense':
        return { name: 'trending-down', color: theme.colors.error };
      case 'profit':
        const isPositive = amount >= 0;
        return { 
          name: isPositive ? 'check-circle' : 'x-circle',
          color: isPositive ? theme.colors.success : theme.colors.error 
        };
      default:
        return { name: 'info', color: theme.colors.text };
    }
  };

  const iconConfig = getIconConfig();
  const cardStyles = isProfitCard 
    ? [
        styles.summaryCard, 
        styles.profitCard,
        amount >= 0 ? styles.profitCardPositive : styles.profitCardNegative
      ]
    : styles.summaryCard;

  const amountStyles = isProfitCard
    ? [
        styles.summaryAmount,
        styles.profitAmount,
        type === 'profit' && { 
          color: amount >= 0 ? theme.colors.success : theme.colors.error 
        }
      ]
    : styles.summaryAmount;

  return (
    <View style={cardStyles}>
      <View style={styles.summaryCardHeader}>
        <Icon 
          library="Feather" 
          name={iconConfig.name} 
          size={24} 
          color={iconConfig.color} 
        />
        <Text style={styles.summaryLabel}>
          {period === 'year' ? `Yıllık ${label}` : label}
        </Text>
      </View>
      <Text style={amountStyles}>
        {formatAmount(amount)}
      </Text>
    </View>
  );
};

SummaryCard.displayName = 'SummaryCard';