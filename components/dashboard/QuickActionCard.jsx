import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../themes';

export function QuickActionCard({ title, description, icon, color, onPress }) {
  const theme = useTheme();
  const styles = getStyles(theme, color);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${description}`}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      
      <View style={styles.arrow}>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (theme, color = theme.colors.primary) => StyleSheet.create({
  card: {
    ...theme.styles.card('base'),
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.spacing.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    backgroundColor: `${color}25`, // Use transparency
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  title: {
    ...theme.typography.styles.h6,
    color: theme.colors.text,
  },
  description: {
    ...theme.typography.styles.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  arrow: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.radius.lg,
  },
  arrowText: {
    fontSize: 18,
    color: theme.colors.textMuted,
  },
}); 