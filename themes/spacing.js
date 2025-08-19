/**
 * Spacing and Layout Design System
 * Modern responsive spacing, sizing, and layout system for Çiftlik365
 * Farm-themed consistent spacing with improved mobile responsiveness
 */

export const Spacing = {
  // Base spacing unit (4px) - Farm-friendly sizing
  unit: 4,

  // Enhanced spacing scale with more granular control
  0: 0,     // 0px
  px: 1,    // 1px - Hairline borders
  0.5: 2,   // 2px
  1: 4,     // 4px  - xs
  2: 8,     // 8px  - sm  
  3: 12,    // 12px - md
  4: 16,    // 16px - lg
  5: 20,    // 20px - xl
  6: 24,    // 24px - 2xl
  7: 28,    // 28px
  8: 32,    // 32px - 3xl
  9: 36,    // 36px
  10: 40,   // 40px - 4xl
  11: 44,   // 44px
  12: 48,   // 48px - 5xl
  14: 56,   // 56px
  16: 64,   // 64px - 6xl
  20: 80,   // 80px - 7xl
  24: 96,   // 96px - 8xl
  32: 128,  // 128px - 9xl

  // Named spacing aliases for semantic usage
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
  '9xl': 128,

  // Responsive layout spacing
  layout: {
    // Screen margins - responsive
    screenPadding: 16,
    screenPaddingLarge: 24,
    screenPaddingTablet: 32,
    
    // Section spacing
    sectionGap: 24,
    sectionGapLarge: 32,
    
    // Content spacing
    contentGap: 16,
    contentGapLarge: 20,
    
    // Container spacing
    containerPadding: 16,
    containerGap: 12,
    
    // Grid spacing
    gridGap: 16,
    gridGapSmall: 12,
    gridGapLarge: 20,
    
    // Stack spacing
    stackGap: 8,
    stackGapLarge: 12,
  },

  // Enhanced component-specific spacing
  component: {
    // Modern button spacing - iOS & Android optimized
    button: {
      paddingVertical: 16,   // Daha yüksek dokunabilir alan
      paddingHorizontal: 32, // Daha geniş yan padding
      gap: 10,
      radius: 14,            // Daha yuvarlak köşeler
      
      small: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        gap: 8,
        radius: 12,
      },
      
      large: {
        paddingVertical: 20,
        paddingHorizontal: 36,
        gap: 12,
        radius: 18,
      },
    },

    // Modern card spacing
    card: {
      padding: 20,
      paddingSmall: 16,
      paddingLarge: 24,
      margin: 12,
      marginSmall: 8,
      gap: 16,
      gapSmall: 12,
      radius: 16,
      radiusSmall: 12,
      radiusLarge: 20,
    },

    // Enhanced form spacing - iOS optimized
    form: {
      fieldGap: 20,
      fieldGapSmall: 16,
      sectionGap: 32,
      
      input: {
        paddingVertical: 16,    // iOS için artırıldı
        paddingHorizontal: 18,  // iOS için artırıldı
        gap: 8,
        radius: 12,
      },
      
      label: {
        marginBottom: 6,
        gap: 4,
      },
      
      helper: {
        marginTop: 4,
      },
    },

    // Modern list spacing
    list: {
      itemPadding: 16,
      itemPaddingHorizontal: 20,
      itemGap: 4,
      sectionGap: 24,
      headerPadding: 12,
      footerPadding: 16,
    },

    // Navigation spacing
    navigation: {
      tabBarHeight: 75,
      tabBarPadding: 8,
      headerHeight: 44,
      headerPadding: 16,
      
      bottomSheet: {
        handleHeight: 4,
        handleWidth: 40,
        handleMargin: 12,
        contentPadding: 20,
      },
    },

    // Modal and overlay spacing
    modal: {
      padding: 24,
      marginHorizontal: 16,
      borderRadius: 20,
      backdropBlur: 10,
    },

    // Stats and dashboard cards
    stats: {
      cardPadding: 20,
      cardGap: 16,
      numberGap: 4,
      iconGap: 12,
    },
  },

  // Modern border radius system
  radius: {
    none: 0,
    xs: 4,      // Small elements
    sm: 6,      // Buttons, inputs
    md: 8,      // Cards
    lg: 12,     // Large buttons, input fields
    xl: 16,     // Cards, modals  
    '2xl': 20,  // Large cards
    '3xl': 24,  // Feature cards
    '4xl': 32,  // Hero sections
    full: 9999, // Circular elements
  },

  // Comprehensive icon sizing
  iconSizes: {
    xs: 12,     // Small indicators
    sm: 16,     // List items, small buttons
    md: 20,     // Regular buttons, form fields
    lg: 24,     // Tab icons, medium buttons
    xl: 28,     // Large buttons
    '2xl': 32,  // Headers, feature icons
    '3xl': 40,  // Large feature icons
    '4xl': 48,  // Hero icons
    '5xl': 64,  // Extra large decorative
  },

  // Enhanced component sizes
  sizes: {
    // Modern button sizes - iOS & Android optimized
    button: {
      height: 54,        // iOS & Android için artırıldı
      heightSmall: 44,   // Küçük butonlar için minimum
      heightLarge: 60,   // Büyük butonlar için
      heightXLarge: 64,
      minWidth: 140,     // Minimum genişlik artırıldı
      minWidthSmall: 100,
      minWidthLarge: 160,
    },

    // Input field sizes - iOS optimized
    input: {
      height: 50,        // iOS için artırıldı
      heightSmall: 44,   // iOS için minimum dokunabilir alan
      heightLarge: 56,
      minHeight: 50,     // iOS için minimum yükseklik
    },

    // Avatar and profile images
    avatar: {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 56,
      '2xl': 64,
      '3xl': 80,
      '4xl': 96,
    },

    // Card and container sizes
    card: {
      minHeight: 120,
      minHeightSmall: 100,
      minHeightLarge: 140,
      maxWidth: 400,
      
      stats: {
        height: 120,
        heightSmall: 100,
        heightLarge: 140,
      },
      
      feature: {
        minHeight: 200,
        maxHeight: 300,
      },
    },

    // Modal and sheet sizes
    modal: {
      maxWidth: 420,
      maxWidthSmall: 350,
      maxWidthLarge: 500,
      minHeight: 200,
    },

    // Farm-specific component sizes
    farm: {
      animalCardHeight: 160,
      feedCardHeight: 120,
      statsCardHeight: 100,
      dashboardCardHeight: 140,
    },
  },

  // Enhanced shadow system with farm theme
  shadows: {
    none: {
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      shadowOpacity: 0,
      elevation: 0,
    },
    
    xs: {
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      shadowOpacity: 0.05,
      elevation: 1,
    },
    
    sm: {
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      shadowOpacity: 0.08,
      elevation: 2,
    },
    
    md: {
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 8,
      shadowOpacity: 0.12,
      elevation: 3,
    },
    
    lg: {
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      shadowOpacity: 0.15,
      elevation: 5,
    },
    
    xl: {
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      shadowOpacity: 0.18,
      elevation: 8,
    },
    
    '2xl': {
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      shadowOpacity: 0.22,
      elevation: 12,
    },

    // Farm-themed colored shadows
    colored: {
      green: {
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        shadowOpacity: 0.1,
        elevation: 4,
        shadowColor: '#2D5016', // Forest Green
      },
      
      gold: {
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        shadowOpacity: 0.1,
        elevation: 4,
        shadowColor: '#F4A261', // Golden Yellow
      },
    },
  },

  // Responsive breakpoints for layout adaptation
  breakpoints: {
    sm: 375,   // Small mobile
    md: 768,   // Tablet
    lg: 1024,  // Large tablet/small desktop
    xl: 1280,  // Desktop
  },

  // Animation and transition values
  animation: {
    duration: {
      fast: 150,
      normal: 200,
      slow: 300,
      slower: 500,
    },
    
    easing: {
      ease: [0.25, 0.1, 0.25, 1],
      easeIn: [0.42, 0, 1, 1],
      easeOut: [0, 0, 0.58, 1],
      easeInOut: [0.42, 0, 0.58, 1],
    },
  },
}; 