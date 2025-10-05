import { StyleSheet } from 'react-native';

export const getFinanceCardStyles = (theme) => StyleSheet.create({
  transactionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.component.card.radius,
    padding: theme.spacing.component.card.padding,
    marginBottom: theme.spacing.component.card.marginSmall,
    borderWidth: 0,
    borderLeftWidth: 4,
    ...theme.spacing.shadows.md,
  },
  incomeCard: {
    borderLeftColor: theme.colors.success,
  },
  expenseCard: {
    borderLeftColor: theme.colors.error,
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
    ...theme.typography.styles.cardTitle,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  transactionDate: {
    ...theme.typography.styles.cardSubtitle,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  animalInfo: {
    ...theme.typography.styles.caption,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...theme.typography.styles.h5,
    fontWeight: '800',
  },
  profitLoss: {
    ...theme.typography.styles.caption,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },
  transactionDescription: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
});