/**
 * Çiftlik365 Color Palette
 * Black and white color scheme with semantic naming for consistency
 */

// Base Colors
const BLACK = '#000000';
const WHITE = '#ffffff';
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

// Accent Colors (minimal for form states, etc.)
const GREEN = '#10B981';
const RED = '#EF4444';
const AMBER = '#F59E0B';
const BLUE = '#3B82F6';

export const Colors = {
  // Base colors
  base: {
    black: BLACK,
    white: WHITE,
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

  // Accent colors for states
  accent: {
    success: GREEN,
    error: RED,
    warning: AMBER,
    info: BLUE,
  },

  // Light theme
  light: {
    // Primary colors
    primary: BLACK,
    primaryText: WHITE,
    secondary: GRAY_600,
    
    // Background colors
    background: WHITE,
    surface: GRAY_100,
    card: WHITE,
    cardBackground: WHITE,
    
    // Text colors
    text: BLACK,
    textSecondary: GRAY_600,
    textMuted: GRAY_400,
    textDisabled: GRAY_300,
    
    // Border colors
    border: GRAY_300,
    borderLight: GRAY_200,
    borderFocus: BLACK,
    
    // Interactive colors
    tint: BLACK,
    icon: GRAY_500,
    iconActive: BLACK,
    
    // Tab colors
    tabIconDefault: GRAY_400,
    tabIconSelected: BLACK,
    tabBackground: WHITE,
    
    // State colors
    success: GREEN,
    error: RED,
    warning: AMBER,
    info: BLUE,
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  // Dark theme
  dark: {
    // Primary colors
    primary: WHITE,
    primaryText: BLACK,
    secondary: GRAY_300,
    
    // Background colors
    background: BLACK,
    surface: GRAY_900,
    card: BLACK,  
    cardBackground: WHITE,
    // Text colors
    text: WHITE,
    textSecondary: GRAY_300,
    textMuted: GRAY_500,
    textDisabled: GRAY_600,
    
    // Border colors
    border: GRAY_700,
    borderLight: GRAY_800,
    borderFocus: WHITE,
    
    // Interactive colors
    tint: WHITE,
    icon: GRAY_400,
    iconActive: WHITE,
    
    // Tab colors
    tabIconDefault: GRAY_500,
    tabIconSelected: WHITE,
    tabBackground: BLACK,
    
    // State colors
    success: GREEN,
    error: RED,
    warning: AMBER,
    info: BLUE,
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
}; 