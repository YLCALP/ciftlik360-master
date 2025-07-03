/**
 * useTheme Hook
 * Provides easy access to the current theme and theme utilities
 * Integrates with the existing ThemeContext for theme management
 */

import { useMemo } from 'react';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';
import { createTheme } from './theme';

export function useTheme() {
  const { theme: colorScheme, isThemeLoading: isLoading, setTheme } = useThemeContext();
  
  const theme = useMemo(() => {
    return createTheme(colorScheme ?? 'light');
  }, [colorScheme]);
  
  return {
    ...theme,
    
    // Theme management from context
    themeMode: colorScheme,
    setTheme,
    isLoading,
    
    // Additional convenience methods
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
    
    // Quick style generators
    styles: {
      // Generate button styles with theme colors
      button: (variant = 'primary', size = 'base') => {
        const baseStyle = theme.components.button.base;
        const variantStyle = theme.components.button[variant] || {};
        const sizeStyle = size !== 'base' ? theme.components.button[size] || {} : {};
        
        let colorStyle = {};
        
        switch (variant) {
          case 'primary':
            colorStyle = {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            };
            break;
          case 'secondary':
            colorStyle = {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            };
            break;
          case 'outline':
            colorStyle = {
              borderColor: theme.colors.border,
            };
            break;
        }
        
        return {
          ...baseStyle,
          ...variantStyle,
          ...sizeStyle,
          ...colorStyle,
        };
      },
      
      // Generate input styles with theme colors
      input: (state = 'default') => {
        const baseStyle = theme.components.input.base;
        let stateStyle = {};
        
        switch (state) {
          case 'focused':
            stateStyle = {
              ...theme.components.input.focused,
              borderColor: theme.colors.borderFocus,
            };
            break;
          case 'error':
            stateStyle = {
              ...theme.components.input.error,
              borderColor: theme.colors.error,
            };
            break;
          default:
            stateStyle = {
              borderColor: theme.colors.border,
            };
        }
        
        return {
          ...baseStyle,
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          ...stateStyle,
        };
      },
      
      // Generate card styles with theme colors
      card: (variant = 'base') => {
        const baseStyle = theme.components.card.base;
        const variantStyle = theme.components.card[variant] || {};
        
        return {
          ...baseStyle,
          ...variantStyle,
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        };
      },
      
      // Generate text styles with theme colors
      text: (variant = 'body', color = 'text') => {
        const typographyStyle = theme.typography.styles[variant] || theme.typography.styles.body;
        const textColor = theme.colors[color] || theme.colors.text;
        
        return {
          ...typographyStyle,
          color: textColor,
        };
      },
      
      // Generate screen container styles
      screen: (variant = 'base') => {
        const baseStyle = theme.components.screen[variant] || theme.components.screen.base;
        
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background,
        };
      },
    },
  };
} 