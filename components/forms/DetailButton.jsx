import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  View,
  Platform,
  Pressable
} from 'react-native';
import { Icon } from '../common/Icon';
import { useTheme } from '../../themes';

export default function DetailButton({ 
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  style,
  textStyle,
  ...props 
}) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [pressed, setPressed] = useState(false);

  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    const variants = {
      primary: {
        background: theme.colors.primary,
        text: theme.colors.primaryText,
        borderColor: 'transparent',
      },
      secondary: {
        background: theme.colors.secondary,
        text: theme.colors.text,
        borderColor: 'transparent',
      },
      outline: {
        background: 'transparent',
        text: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      ghost: {
        background: 'transparent',
        text: theme.colors.text,
        borderColor: 'transparent',
      },
      danger: {
        background: theme.colors.error,
        text: theme.colors.white,
        borderColor: 'transparent',
      },
      success: {
        background: theme.colors.success,
        text: theme.colors.white,
        borderColor: 'transparent',
      },
    };
    return variants[variant] || variants.primary;
  };

  const getSizeStyles = () => {
    const sizes = {
      sm: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
        borderRadius: theme.spacing.radius.md,
      },
      md: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 48,
        borderRadius: theme.spacing.radius.lg,
      },
      lg: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: 56,
        borderRadius: theme.spacing.radius.xl,
      },
    };
    return sizes[size] || sizes.md;
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyles = [
    styles.button,
    sizeStyles,
    {
      backgroundColor: variantStyles.background,
      borderColor: variantStyles.borderColor,
    },
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    pressed && styles.pressed,
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: variantStyles.text,
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
    },
    isDisabled && styles.disabledText,
    textStyle,
  ];

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;
  const iconColor = isDisabled 
    ? theme.colors.textMuted 
    : variantStyles.text;

  const handlePressIn = () => setPressed(true);
  const handlePressOut = () => setPressed(false);

  const buttonContent = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator 
          color={iconColor} 
          size={iconSize} 
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          {leadingIcon && (
            <View style={styles.leadingIcon}>
              <Icon 
                library={leadingIcon.library}
                name={leadingIcon.name}
                size={iconSize}
                color={iconColor}
              />
            </View>
          )}
          
          <Text style={textStyles} numberOfLines={1}>
            {title}
          </Text>
          
          {trailingIcon && (
            <View style={styles.trailingIcon}>
              <Icon 
                library={trailingIcon.library}
                name={trailingIcon.name}
                size={iconSize}
                color={iconColor}
              />
            </View>
          )}
        </>
      )}
    </View>
  );

  if (Platform.OS === 'android') {
    return (
      <Pressable
        style={buttonStyles}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        android_ripple={{
          color: variantStyles.text + '20',
          borderless: false,
        }}
        {...props}
      >
        {buttonContent}
      </Pressable>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}

const getStyles = (theme) => StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...theme.typography.styles.button,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledText: {
    color: theme.colors.textMuted,
  },
  leadingIcon: {
    marginRight: theme.spacing.sm,
  },
  trailingIcon: {
    marginLeft: theme.spacing.sm,
  },
  loadingIndicator: {
    marginRight: theme.spacing.sm,
  },
});