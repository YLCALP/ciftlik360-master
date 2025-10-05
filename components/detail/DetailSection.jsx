import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
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
  
  // Collapsible olmayan componentler her zaman expanded
  // Collapsible olanlar varsayılan true (kullanıcı deneyimi için)
  const shouldExpand = collapsible ? initiallyExpanded : true;
  const [expanded, setExpanded] = useState(shouldExpand);
  const [contentHeight, setContentHeight] = useState(0);
  
  // Separate animations with dedicated values
  const rotationAnimation = useRef(new Animated.Value(shouldExpand ? 1 : 0)).current;
  const heightAnimation = useRef(new Animated.Value(shouldExpand ? 1 : 0)).current;
  const opacityAnimation = useRef(new Animated.Value(shouldExpand ? 1 : 0)).current;


  const handleToggle = () => {
    if (!collapsible) return;
    
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    // Run animations sequentially to avoid driver conflicts
    // Arrow rotation (can use native driver separately)
    Animated.timing(rotationAnimation, {
      toValue: newExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Height + opacity together (JS driver only)
    Animated.parallel([
      Animated.timing(heightAnimation, {
        toValue: newExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnimation, {
        toValue: newExpanded ? 1 : 0,
        duration: newExpanded ? 350 : 250,
        useNativeDriver: false,
      })
    ]).start();

    if (onToggle) {
      onToggle(newExpanded);
    }
  };

  const onContentLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && (contentHeight === 0 || Math.abs(contentHeight - height) > 5)) {
      setContentHeight(height);
    }
  };

  const arrowRotation = rotationAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const animatedHeight = heightAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(contentHeight, 200)], // More reasonable fallback
  });

  const animatedOpacity = opacityAnimation;

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

      {/* Content with smooth animation */}
      {collapsible ? (
        <Animated.View 
          style={{
            height: animatedHeight,
            opacity: animatedOpacity,
            overflow: 'hidden',
          }}
        >
          <View 
            style={[styles.content, contentStyle]}
            onLayout={onContentLayout}
          >
            {children}
          </View>
          
          {/* Divider */}
          {showDivider && (
            <View style={styles.divider} />
          )}
        </Animated.View>
      ) : (
        <>
          <View style={[styles.content, contentStyle]}>
            {children}
          </View>
          
          {/* Divider */}
          {showDivider && (
            <View style={styles.divider} />
          )}
        </>
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