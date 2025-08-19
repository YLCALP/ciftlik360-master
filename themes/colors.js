/**
 * Çiftlik365 Color Palette
 * Farm-themed color scheme with semantic naming for consistency
 */

// Farm-themed Base Colors
const FOREST_GREEN = '#2D5016';    // Primary - Orman Yeşili
const GOLDEN_YELLOW = '#F4A261';   // Secondary - Altın Sarısı  
const EARTH_BROWN = '#8B4513';     // Accent - Toprak Kahve
const MILK_WHITE = '#FAF9F6';      // Background - Süt Beyazı
const CREAM = '#F8F8F8';           // Light Background
const WHITE = '#ffffff';

// Natural Gray Scale
const GRAY_50 = '#F9FAFB';
const GRAY_100 = '#F3F4F6';
const GRAY_200 = '#E5E7EB';
const GRAY_300 = '#D1D5DB';
const GRAY_400 = '#9CA3AF';
const GRAY_500 = '#6B7280';
const GRAY_600 = '#4B5563';
const GRAY_700 = '#374151';
const GRAY_800 = '#1F2937';
const GRAY_900 = '#111827';
const BLACK = '#000000';

// Farm-themed State Colors
const FRESH_GREEN = '#22C55E';     // Success - Taze Yeşil
const BARN_RED = '#EF4444';        // Error - Ambar Kırmızı
const HARVEST_ORANGE = '#F97316';  // Warning - Hasat Turuncu
const SKY_BLUE = '#3B82F6';        // Info - Gökyüzü Mavi

export const Colors = {
  // Base colors
  base: {
    black: BLACK,
    white: WHITE,
    forestGreen: FOREST_GREEN,
    goldenYellow: GOLDEN_YELLOW,
    earthBrown: EARTH_BROWN,
    milkWhite: MILK_WHITE,
    cream: CREAM,
    gray: {
      50: GRAY_50,
      100: GRAY_100,
      200: GRAY_200,
      300: GRAY_300,
      400: GRAY_400,
      500: GRAY_500,
      600: GRAY_600,
      700: GRAY_700,
      800: GRAY_800,
      900: GRAY_900,
    },
  },

  // Farm-themed accent colors
  accent: {
    success: FRESH_GREEN,
    error: BARN_RED,
    warning: HARVEST_ORANGE,
    info: SKY_BLUE,
  },

  // Light theme - Farm Theme
  light: {
    // Primary colors
    primary: FOREST_GREEN,
    primaryText: WHITE,
    secondary: GOLDEN_YELLOW,
    accent: EARTH_BROWN,
    
    // Background colors
    background: MILK_WHITE,
    surface: WHITE,
    card: WHITE,
    cardBackground: CREAM,
    
    // Text colors
    text: GRAY_800,
    textSecondary: GRAY_600,
    textMuted: GRAY_400,
    textDisabled: GRAY_300,
    
    // Border colors
    border: GRAY_200,
    borderLight: GRAY_100,
    borderFocus: FOREST_GREEN,
    
    // Interactive colors
    tint: FOREST_GREEN,
    icon: GRAY_500,
    iconActive: FOREST_GREEN,
    
    // Tab colors
    tabIconDefault: GRAY_400,
    tabIconSelected: FOREST_GREEN,
    tabBackground: WHITE,
    
    // State colors
    success: FRESH_GREEN,
    successMuted: 'rgba(34, 197, 94, 0.1)',
    error: BARN_RED,
    errorMuted: 'rgba(239, 68, 68, 0.1)',
    warning: HARVEST_ORANGE,
    warningMuted: 'rgba(249, 115, 22, 0.1)',
    info: SKY_BLUE,
    infoMuted: 'rgba(59, 130, 246, 0.1)',
    
    // Overlay colors
    overlay: 'rgba(45, 80, 22, 0.5)',
    shadow: 'rgba(45, 80, 22, 0.1)',
  },

  // Dark theme - Farm Night Mode
  dark: {
    // Primary colors
    primary: '#4ADE80', // Light Green
    primaryText: BLACK,
    secondary: '#FCD34D', // Light Gold
    accent: '#D97706', // Light Brown
    
    // Background colors
    background: GRAY_900,
    surface: GRAY_800,
    card: GRAY_800,  
    cardBackground: GRAY_700,
    
    // Text colors
    text: WHITE,
    textSecondary: GRAY_300,
    textMuted: GRAY_400,
    textDisabled: GRAY_600,
    
    // Border colors
    border: GRAY_600,
    borderLight: GRAY_700,
    borderFocus: '#4ADE80',
    
    // Interactive colors
    tint: '#4ADE80',
    icon: GRAY_400,
    iconActive: '#4ADE80',
    
    // Tab colors
    tabIconDefault: GRAY_500,
    tabIconSelected: '#4ADE80',
    tabBackground: GRAY_900,
    
    // State colors
    success: FRESH_GREEN,
    successMuted: 'rgba(34, 197, 94, 0.2)',
    error: BARN_RED,
    errorMuted: 'rgba(239, 68, 68, 0.2)',
    warning: HARVEST_ORANGE,
    warningMuted: 'rgba(249, 115, 22, 0.2)',
    info: SKY_BLUE,
    infoMuted: 'rgba(59, 130, 246, 0.2)',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
}; 