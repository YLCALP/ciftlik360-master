import { StyleSheet } from 'react-native';

export const getAnimalCardStyles = (theme) => StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.spacing.component.card.radius,
        padding: theme.spacing.component.card.padding,
        marginVertical: theme.spacing.component.card.marginSmall,
        borderWidth: 0,
        minHeight: theme.spacing.sizes.farm.animalCardHeight,
        ...theme.spacing.shadows.lg,
        shadowColor: theme.colors.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.component.card.gap,
    },
    emojiContainer: {
        width: theme.spacing.iconSizes['4xl'],
        height: theme.spacing.iconSizes['4xl'],
        borderRadius: theme.spacing.radius.xl,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.component.card.gap,
        ...theme.spacing.shadows.sm,
    },
    emoji: {
        fontSize: theme.spacing.iconSizes.lg,
    },
    details: {
        flex: 1,
        marginTop: theme.spacing.xs,
    },
    name: {
        ...theme.typography.styles.cardTitle,
        color: theme.colors.text,
        fontWeight: '700',
    },
    tag: {
        ...theme.typography.styles.cardSubtitle,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    statusContainer: {
        alignItems: 'flex-end',
        marginTop: theme.spacing.xs,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.component.button.small.paddingHorizontal,
        paddingVertical: theme.spacing.component.button.small.paddingVertical,
        borderRadius: theme.spacing.radius.full,
    },
    statusText: {
        ...theme.typography.styles.overline,
        color: theme.colors.white,
        fontWeight: '700',
        fontSize: theme.typography.sizes.xs,
    },
    metaRow: {
        flexDirection: 'row',
        gap: theme.spacing.component.card.gapSmall,
    },
    metaItem: {
        flex: 1,
        backgroundColor: theme.colors.cardBackground,
        padding: theme.spacing.component.card.paddingSmall,
        borderRadius: theme.spacing.radius.lg,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.secondary,
    },
    metaLabel: {
        ...theme.typography.styles.statLabel,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    metaValue: {
        ...theme.typography.styles.bodyMedium,
        color: theme.colors.text,
        fontWeight: '600',
    },
});