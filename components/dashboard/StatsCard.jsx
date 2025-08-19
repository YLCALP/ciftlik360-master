import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../themes';
import { CardIcon } from '../common/Icon';

export function StatsCard({ title, value, subtitle, icon, iconLibrary = 'Feather', iconColor, iconBgColor, valueColor, onPress }) {
  const theme = useTheme();
  const styles = getStyles(theme, iconBgColor);

  const valueStyle = [
    styles.value,
    valueColor ? { color: valueColor } : {},
    String(value).length > 8 ? styles.valueSmall : {},
    String(value).length > 6 ? styles.valueMedium : {},
  ];

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}`}
    >
        <View style={styles.topSection}>
          <View style={styles.iconContainer}>
            <CardIcon 
              library={iconLibrary}
              name={icon}
              color={iconColor || theme.colors.text}
              size={28}
            />
          </View>
        </View>
        
        <View style={styles.middleSection}>
          <Text 
            style={valueStyle} 
            numberOfLines={1} 
            adjustsFontSizeToFit
          >
            {value}
          </Text>
        </View>
        
        <View style={styles.bottomSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    </TouchableOpacity>
  );
}

const getStyles = (theme, iconBgColor) => StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.component.card.radius,
    padding: theme.spacing.component.card.padding,
    borderWidth: 0,
    justifyContent: 'space-between',
    minHeight: theme.spacing.sizes.farm.dashboardCardHeight,
    ...theme.spacing.shadows.lg,
    shadowColor: theme.colors.primary,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.component.stats.iconGap,
  },
  iconContainer: {
    width: theme.spacing.iconSizes['3xl'],
    height: theme.spacing.iconSizes['3xl'],
    backgroundColor: iconBgColor || theme.colors.backgroundSecondary,
    borderRadius: theme.spacing.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  icon: {
    fontSize: theme.spacing.iconSizes.lg,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: theme.spacing.component.stats.numberGap,
  },
  value: {
    ...theme.typography.styles.statNumber,
    color: theme.colors.text,
    fontWeight: '800',
  },
  valueMedium: {
    fontSize: theme.typography.sizes['4xl'],
    fontWeight: '700',
  },
  valueSmall: {
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: '700',
  },
  bottomSection: {
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.styles.cardTitle,
    color: theme.colors.text,
    fontWeight: '600',
  },
  subtitle: {
    ...theme.typography.styles.cardSubtitle,
    color: theme.colors.textSecondary,
  },
}); 