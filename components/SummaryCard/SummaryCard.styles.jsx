import { StyleSheet } from 'react-native';

export const getSummaryCardStyles = (theme) => StyleSheet.create({
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.component.card.radius,
    padding: theme.spacing.component.card.padding,
    marginBottom: theme.spacing.component.card.marginSmall,
    borderWidth: 0,
    ...theme.spacing.shadows.lg,
    shadowColor: theme.colors.success,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.component.stats.numberGap,
  },
  summaryLabel: {
    ...theme.typography.styles.cardSubtitle,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    fontWeight: '600',
  },
  summaryAmount: {
    ...theme.typography.styles.statNumber,
    color: theme.colors.text,
    fontWeight: '800',
  },
  profitCard: {
    marginBottom: 0,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  profitAmount: {
    fontSize: theme.typography.sizes['4xl'],
    fontWeight: '800',
  },
});