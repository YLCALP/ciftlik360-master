/**
 * Component Style Definitions
 * Reusable component styles for consistent UI across Çiftlik365
 */

import { Spacing } from './spacing';

export const ComponentStyles = {
  // Button variants - iOS & Android optimized
  button: {
    base: {
      height: Spacing.sizes.button.height,
      paddingHorizontal: Spacing.component.button.paddingHorizontal,
      paddingVertical: Spacing.component.button.paddingVertical,
      borderRadius: Spacing.component.button.radius,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minWidth: Spacing.sizes.button.minWidth,
    },
    primary: {
      // Colors will be applied from theme
    },
    secondary: {
      borderWidth: 1,
    },
    outline: {
      borderWidth: 1,
      backgroundColor: 'transparent',
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    small: {
      height: Spacing.sizes.button.heightSmall,
      paddingHorizontal: Spacing.component.button.small.paddingHorizontal,
      paddingVertical: Spacing.component.button.small.paddingVertical,
      minWidth: Spacing.sizes.button.minWidthSmall,
    },
    large: {
      height: Spacing.sizes.button.heightLarge,
      paddingHorizontal: Spacing.component.button.large.paddingHorizontal,
      paddingVertical: Spacing.component.button.large.paddingVertical,
      minWidth: Spacing.sizes.button.minWidthLarge,
    },
  },

  // Input variants - iOS optimized
  input: {
    base: {
      height: Spacing.sizes.input.height,
      paddingHorizontal: Spacing.component.form.input.paddingHorizontal,
      paddingVertical: Spacing.component.form.input.paddingVertical,
      borderRadius: Spacing.radius.lg,
      borderWidth: 1,
      fontSize: 16,
      minHeight: Spacing.sizes.input.minHeight,
    },
    small: {
      height: Spacing.sizes.inputSmallHeight,
      paddingHorizontal: Spacing.component.inputHorizontal - 4,
      paddingVertical: Spacing.component.inputVertical - 4,
    },
    error: {
      borderWidth: 2,
    },
    focused: {
      borderWidth: 2,
    },
  },

  // Card variants
  card: {
    base: {
      padding: Spacing.component.cardPadding,
      borderRadius: Spacing.radius.xl,
      marginBottom: Spacing.component.cardMargin,
      ...Spacing.shadows.md,
    },
    flat: {
      shadowOpacity: 0,
      elevation: 0,
    },
    elevated: {
      ...Spacing.shadows.lg,
    },
    stats: {
      height: Spacing.sizes.statsCardHeight,
      padding: Spacing.component.cardPadding,
      borderRadius: Spacing.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },

  // List item variants
  listItem: {
    base: {
      paddingVertical: Spacing.component.listItemVertical,
      paddingHorizontal: Spacing.component.listItemHorizontal,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 56,
    },
    withIcon: {
      paddingLeft: Spacing.component.listItemHorizontal,
    },
    compact: {
      paddingVertical: Spacing.component.listItemVertical - 4,
      minHeight: 48,
    },
  },

  // Avatar variants
  avatar: {
    base: {
      borderRadius: Spacing.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    xs: {
      width: Spacing.sizes.avatarXs,
      height: Spacing.sizes.avatarXs,
    },
    sm: {
      width: Spacing.sizes.avatarSm,
      height: Spacing.sizes.avatarSm,
    },
    md: {
      width: Spacing.sizes.avatarMd,
      height: Spacing.sizes.avatarMd,
    },
    lg: {
      width: Spacing.sizes.avatarLg,
      height: Spacing.sizes.avatarLg,
    },
    xl: {
      width: Spacing.sizes.avatarXl,
      height: Spacing.sizes.avatarXl,
    },
  },

  // Badge variants
  badge: {
    base: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: Spacing.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 20,
      minHeight: 20,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      padding: 0,
      minWidth: 8,
      minHeight: 8,
    },
  },

  // Modal/Sheet variants
  modal: {
    base: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    content: {
      width: '100%',
      maxWidth: Spacing.sizes.modalMaxWidth,
      borderRadius: Spacing.radius['2xl'],
      padding: Spacing['3xl'],
      ...Spacing.shadows.xl,
    },
  },

  bottomSheet: {
    base: {
      borderTopLeftRadius: Spacing.radius['2xl'],
      borderTopRightRadius: Spacing.radius['2xl'],
      padding: Spacing.lg,
    },
    handle: {
      width: Spacing.sizes.sheetHandleWidth,
      height: Spacing.sizes.sheetHandleHeight,
      borderRadius: Spacing.radius.sm,
      alignSelf: 'center',
      marginBottom: Spacing.lg,
    },
  },

  // Tab bar
  tabBar: {
    base: {
      height: Spacing.component.tabBarHeight,
      paddingBottom: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xs,
    },
  },

  // Form field
  formField: {
    base: {
      marginBottom: Spacing.component.formFieldGap,
    },
    label: {
      marginBottom: Spacing.component.labelGap,
    },
    helper: {
      marginTop: Spacing.component.labelGap,
    },
  },

  // Divider
  divider: {
    base: {
      height: 1,
      width: '100%',
    },
    vertical: {
      width: 1,
      height: '100%',
    },
  },

  // Screen container
  screen: {
    base: {
      flex: 1,
      padding: Spacing.layout.screenPadding,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.layout.screenPadding,
    },
    scrollable: {
      flex: 1,
    },
  },
}; 