import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../themes';

export function StatsCard({ title, value, subtitle, icon, valueColor, onPress }) {
  const theme = useTheme();
  const styles = getStyles(theme);

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
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
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

const getStyles = (theme) => StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.radius['2xl'],
    padding: theme.spacing.xl,
    margin: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'space-between',
    minHeight: 160,
    ...theme.spacing.shadows.md,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  arrow: {
    fontSize: 18,
    color: theme.colors.textMuted,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    ...theme.typography.styles.h1,
    color: theme.colors.text,
  },
  valueMedium: {
    fontSize: theme.typography.sizes['3xl'],
  },
  valueSmall: {
    fontSize: theme.typography.sizes['2xl'],
  },
  bottomSection: {
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.styles.h6,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.textSecondary,
  },
}); 