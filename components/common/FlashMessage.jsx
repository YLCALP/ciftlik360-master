import React from 'react';
import FlashMessage, { hideMessage, showMessage } from 'react-native-flash-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '../../hooks/useColorScheme';

export function CustomFlashMessage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <FlashMessage
      position="top"
      floating
      duration={3000}
      autoHide
      animated
      style={{
        borderRadius: 16,
        marginHorizontal: 12,
        marginTop: insets.top || 16,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        borderWidth: 1,
      }}
      titleStyle={{
        fontSize: 17,
        fontWeight: '700',
        color: '#ffffff',
        lineHeight: 22,
      }}
      textStyle={{
        fontSize: 15,
        fontWeight: '400',
        color: '#ffffff',
        lineHeight: 20,
      }}
    />
  );
}

// Flash message service to replace Alert
export const FlashMessageService = {
  // Show success message (green)
  success: (title, message = null) => {
    showMessage({
      message: title,
      description: message,
      type: 'success',
      icon: 'success',
    });
  },

  // Show error message (red)
  error: (title, message = null) => {
    showMessage({
      message: title,
      description: message,
      type: 'danger',
      icon: 'danger',
      duration: 4000,
    });
  },

  // Show info message (blue)
  info: (title, message = null) => {
    showMessage({
      message: title,
      description: message,
      type: 'info',
      icon: 'info',
    });
  },

  // Show warning message (orange)
  warning: (title, message = null) => {
    showMessage({
      message: title,
      description: message,
      type: 'warning',
      icon: 'warning',
      duration: 3500,
    });
  },

  // Show custom message
  show: (options) => {
    showMessage({
      duration: 3000,
      ...options,
    });
  },

  // Hide message
  hide: () => {
    hideMessage();
  },

  // Replacement for Alert.alert with callback support
  alert: (title, message = null, buttons = null) => {
    // For confirmation, we'll use a warning-style message
    if (buttons && buttons.length > 0) {
      const primaryAction = buttons.find(b => b.style !== 'cancel');
      if (primaryAction && primaryAction.onPress) {
        showMessage({
          message: title,
          description: message,
          type: 'warning',
          icon: 'warning',
          duration: 5000,
          onPress: () => primaryAction.onPress(),
        });
      }
    } else {
      FlashMessageService.info(title, message);
    }
  },
};

export { hideMessage, showMessage };

 