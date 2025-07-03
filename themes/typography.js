/**
 * Typography Design System
 * Consistent text styles for Çiftlik365
 */

export const Typography = {
  // Font weights
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Predefined text styles
  styles: {
    // Headers
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 44,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 26,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },

    // Body text
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },

    // UI text
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    overline: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Special styles
    link: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
      textDecorationLine: 'underline',
    },
    code: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      fontFamily: 'monospace',
    },

    // Tab bar
    tabLabel: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },

    // Form elements
    label: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    input: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    placeholder: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    helperText: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    errorText: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
  },
}; 