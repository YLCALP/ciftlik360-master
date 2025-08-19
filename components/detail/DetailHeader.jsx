import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../themes';
import { Icon } from '../common/Icon';

export default function DetailHeader({ 
  title,
  subtitle,
  emoji,
  statusBadge,
  rightActions = [],
  gradient = false,
  onBackPress,
  style,
  ...props 
}) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const getStatusBadgeColors = (status) => {
    const statusColors = {
      active: { bg: theme.colors.success, text: theme.colors.white },
      sick: { bg: theme.colors.warning, text: theme.colors.white },
      sold: { bg: theme.colors.textMuted, text: theme.colors.white },
      deceased: { bg: theme.colors.error, text: theme.colors.white },
      success: { bg: theme.colors.success, text: theme.colors.white },
      warning: { bg: theme.colors.warning, text: theme.colors.white },
      error: { bg: theme.colors.error, text: theme.colors.white },
      info: { bg: theme.colors.primary, text: theme.colors.primaryText },
    };
    return statusColors[status] || statusColors.info;
  };

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        gradient && styles.gradientContainer,
        style
      ]} 
      edges={['top']}
      {...props}
    >
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'default'}
        backgroundColor={gradient ? theme.colors.primary : theme.colors.background}
      />
      
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity 
          onPress={handleBackPress}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon 
            library="Feather" 
            name="arrow-left" 
            size={24} 
            color={gradient ? theme.colors.white : theme.colors.text} 
          />
        </TouchableOpacity>

        {/* Title Section */}
        <View style={styles.titleContainer}>
          {emoji && (
            <Text style={styles.emoji}>{emoji}</Text>
          )}
          
          <View style={styles.textContainer}>
            <Text 
              style={[
                styles.title,
                { color: gradient ? theme.colors.white : theme.colors.text }
              ]} 
              numberOfLines={1}
            >
              {title}
            </Text>
            
            {subtitle && (
              <Text 
                style={[
                  styles.subtitle,
                  { color: gradient ? theme.colors.white + 'CC' : theme.colors.textSecondary }
                ]} 
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {statusBadge && (
            <View 
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBadgeColors(statusBadge.status).bg }
              ]}
            >
              <Text 
                style={[
                  styles.statusText,
                  { color: getStatusBadgeColors(statusBadge.status).text }
                ]}
              >
                {statusBadge.label}
              </Text>
            </View>
          )}
        </View>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          {rightActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={action.onPress}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon 
                library={action.icon.library}
                name={action.icon.name}
                size={22} 
                color={gradient ? theme.colors.white : theme.colors.text} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) => {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  
  return StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  gradientContainer: {
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isTablet ? theme.spacing.xl : theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minHeight: isTablet ? 80 : 60,
      maxWidth: isTablet ? 800 : '100%',
      alignSelf: isTablet ? 'center' : 'stretch',
      width: '100%',
    },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing.radius.full,
    marginRight: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
    emoji: {
      fontSize: isTablet ? 40 : 32,
      marginRight: theme.spacing.md,
    },
  textContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.styles.h3,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    ...theme.typography.styles.body,
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.radius.full,
    marginLeft: theme.spacing.sm,
  },
  statusText: {
    ...theme.typography.styles.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
    actionButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.spacing.radius.lg,
      marginLeft: theme.spacing.xs,
    },
});
};