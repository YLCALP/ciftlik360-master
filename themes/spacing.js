/**
 * Spacing and Sizing Design System
 * Consistent spacing, padding, margins, and sizes for Çiftlik365
 */

export const Spacing = {
  // Base spacing unit (4px)
  unit: 4,

  // Spacing scale (multiples of 4px)
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 20,   // 20px
  '2xl': 24, // 24px
  '3xl': 32, // 32px
  '4xl': 40, // 40px
  '5xl': 48, // 48px
  '6xl': 64, // 64px

  // Layout spacing
  layout: {
    screenPadding: 16,
    sectionGap: 24,
    cardPadding: 16,
    listItemPadding: 12,
    buttonPadding: 16,
    inputPadding: 12,
  },

  // Component spacing
  component: {
    // Buttons
    buttonVertical: 12,
    buttonHorizontal: 24,
    buttonSmallVertical: 8,
    buttonSmallHorizontal: 16,

    // Cards
    cardPadding: 16,
    cardMargin: 8,
    cardGap: 12,

    // Forms
    formFieldGap: 16,
    inputVertical: 12,
    inputHorizontal: 16,
    labelGap: 4,

    // Lists
    listItemVertical: 12,
    listItemHorizontal: 16,
    listGap: 8,

    // Navigation
    tabBarHeight: 60,
    headerHeight: 44,
    bottomSheetHandle: 4,
  },

  // Border radius
  radius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    full: 9999,
  },

  // Icon sizes
  iconSizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
  },

  // Common component sizes
  sizes: {
    // Buttons
    buttonHeight: 48,
    buttonSmallHeight: 36,
    buttonLargeHeight: 56,

    // Inputs
    inputHeight: 48,
    inputSmallHeight: 36,

    // Avatar sizes
    avatarXs: 24,
    avatarSm: 32,
    avatarMd: 40,
    avatarLg: 48,
    avatarXl: 64,

    // Card sizes
    cardMinHeight: 120,
    statsCardHeight: 100,

    // Modal sizes
    modalMaxWidth: 400,
    sheetHandleWidth: 40,
    sheetHandleHeight: 4,
  },

  // Shadow values
  shadows: {
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      shadowOpacity: 0.05,
      elevation: 1,
    },
    md: {
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      shadowOpacity: 0.1,
      elevation: 2,
    },
    lg: {
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      shadowOpacity: 0.15,
      elevation: 4,
    },
    xl: {
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      shadowOpacity: 0.2,
      elevation: 8,
    },
  },
}; 