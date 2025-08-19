/**
 * Typography Design System
 * Farm-themed consistent text styles for Çiftlik365
 */

export const Typography = {
  // Font families
  families: {
    system: {
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    },
    heading: {
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    },
    body: {
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    },
  },

  // Font weights
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Responsive font sizes (SP units)
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
  },

  // Improved line heights
  lineHeights: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },

  // Modern predefined text styles
  styles: {
    // Display & Headers - Large impact text
    display: {
      fontSize: 48,
      fontWeight: '800',
      lineHeight: 52,
      letterSpacing: -0.5,
    },
    h1: {
      fontSize: 40,
      fontWeight: '700',
      lineHeight: 44,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 32,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 28,
      letterSpacing: 0,
    },
    h5: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 24,
      letterSpacing: 0,
    },
    h6: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 22,
      letterSpacing: 0,
    },

    // Body text - Improved readability
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 28,
      letterSpacing: 0,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0,
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0.1,
    },

    // UI Components - Enhanced
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
      letterSpacing: 0.1,
    },
    buttonLarge: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
      letterSpacing: 0.1,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    
    // Supporting text
    subtitle1: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 22,
      letterSpacing: 0.1,
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0.1,
    },
    overline: {
      fontSize: 11,
      fontWeight: '600',
      lineHeight: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },

    // Special styles
    link: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
      textDecorationLine: 'underline',
      letterSpacing: 0,
    },
    code: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      fontFamily: 'monospace',
      letterSpacing: 0,
    },

    // Navigation
    tabLabel: {
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 16,
      letterSpacing: 0.3,
    },
    navTitle: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
      letterSpacing: 0,
    },

    // Form elements - Improved
    label: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    input: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0,
    },
    placeholder: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0,
    },
    helperText: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0.1,
    },
    errorText: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.1,
    },

    // Card components
    cardTitle: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 24,
      letterSpacing: 0,
    },
    cardSubtitle: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 18,
      letterSpacing: 0.1,
    },
    
    // Stats and numbers
    statNumber: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 32,
      letterSpacing: -0.2,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
  },
}; 