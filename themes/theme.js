/**
 * Main Theme Configuration
 * Combines all design tokens into unified light and dark themes for Çiftlik365
 */

import { Colors } from './colors';
import { ComponentStyles } from './components';
import { Spacing } from './spacing';
import { Typography } from './typography';

export function createTheme(mode = 'light') {
  const colors = Colors[mode];
  
  return {
    mode,
    colors,
    typography: Typography,
    spacing: Spacing,
    components: ComponentStyles,
    
    // Quick access to commonly used values
    quick: {
      primaryColor: colors.primary,
      backgroundColor: colors.background,
      textColor: colors.text,
      borderColor: colors.border,
      cardColor: colors.card,
      
      // Common spacing
      screenPadding: Spacing.layout.screenPadding,
      cardPadding: Spacing.component.cardPadding,
      buttonHeight: Spacing.sizes.buttonHeight,
      
      // Common typography
      bodyText: Typography.styles.body,
      headerText: Typography.styles.h3,
      captionText: Typography.styles.caption,
    },
    
    // Utility functions
    utils: {
      // Get color with fallback
      getColor: (colorKey, fallback = colors.text) => {
        return colors[colorKey] || fallback;
      },
      
      // Get spacing value
      getSpacing: (key) => {
        return Spacing[key] || Spacing.md;
      },
      
      // Get typography style
      getTypography: (key) => {
        return Typography.styles[key] || Typography.styles.body;
      },
      
      // Get component style
      getComponent: (component, variant = 'base') => {
        return ComponentStyles[component]?.[variant] || {};
      },
      
      // Apply theme-aware colors to component styles
      applyColors: (baseStyle, colorOverrides = {}) => {
        return {
          ...baseStyle,
          ...colorOverrides,
        };
      },
    },
  };
}

// Default themes
export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark'); 