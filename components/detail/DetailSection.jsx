import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../themes';
import { Icon } from '../common/Icon';

export default function DetailSection({ 
  title,
  subtitle,
  children,
  collapsible = false,
  initiallyExpanded = true,
  showDivider = true,
  icon,
  rightElement,
  onToggle,
  style,
  headerStyle,
  contentStyle,
  ...props 
}) {
  const theme = useTheme();
  const styles = getStyles(theme);
  
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const rotationAnimation = useRef(new Animated.Value(initiallyExpanded ? 1 : 0)).current;

  const handleToggle = () => {
    if (!collapsible) return;
    
    const newExpanded = !expanded;
    
    // iOS smooth animation
    if (Platform.OS === 'ios') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    
    setExpanded(newExpanded);
    
    // Rotate arrow animation
    Animated.timing(rotationAnimation, {
      toValue: newExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (onToggle) {
      onToggle(newExpanded);
    }
  };

  const arrowRotation = rotationAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, style]} {...props}>
      {/* Header */}
      <TouchableOpacity 
        style={[styles.header, headerStyle]} 
        onPress={handleToggle}
        disabled={!collapsible}
        activeOpacity={collapsible ? 0.7 : 1}
      >
        <View style={styles.headerContent}>
          {icon && (
            <View style={styles.iconContainer}>
              <Icon 
                library={icon.library}
                name={icon.name}
                size={20}
                color={theme.colors.primary}
              />
            </View>
          )}
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>

          {rightElement && (
            <View style={styles.rightElement}>
              {rightElement}
            </View>
          )}

          {collapsible && (
            <Animated.View 
              style={[
                styles.collapseIcon,
                { transform: [{ rotate: arrowRotation }] }
              ]}
            >
              <Icon 
                library="Feather" 
                name="chevron-down" 
                size={20} 
                color={theme.colors.textSecondary} 
              />
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>

      {/* Content */}
      {expanded && (
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      )}

      {/* Divider */}
      {showDivider && expanded && (
        <View style={styles.divider} />
      )}
    </View>
  );
}

const getStyles = (theme) => {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.spacing.radius.lg,
      marginBottom: theme.spacing.lg,
      overflow: 'hidden',
      maxWidth: isTablet ? 600 : '100%',
      alignSelf: isTablet ? 'center' : 'stretch',
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    header: {
      paddingHorizontal: isTablet ? theme.spacing.xl : theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.md,
    width: 32,
    height: 32,
    borderRadius: theme.spacing.radius.md,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.styles.h4,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  rightElement: {
    marginLeft: theme.spacing.md,
  },
  collapseIcon: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
    content: {
      paddingHorizontal: isTablet ? theme.spacing.xl : theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: isTablet ? theme.spacing.xl : theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
});
};