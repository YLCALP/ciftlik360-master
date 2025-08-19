import { useFormikContext } from 'formik';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../themes';

export default function AuthButton({ title, style, ...props }) {
  const { handleSubmit, isSubmitting } = useFormikContext();
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity
      style={[
        theme.styles.button('primary'),
        styles.authButton,
        Platform.OS === 'ios' && styles.iosButton,
        Platform.OS === 'android' && styles.androidButton,
        style
      ]}
      onPress={handleSubmit}
      disabled={isSubmitting}
      activeOpacity={0.8}
      {...props}>
      {isSubmitting ? (
        <ActivityIndicator color={theme.colors.primaryText} size="small" />
      ) : (
        <Text style={[theme.styles.text('button', 'primaryText'), styles.buttonText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const getStyles = (theme) => StyleSheet.create({
  authButton: {
    marginTop: theme.spacing.lg,
    width: '100%',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  iosButton: {
    height: 56,              // iOS için daha yüksek
    paddingVertical: 18,     // iOS için daha fazla padding
  },
  androidButton: {
    height: 54,              // Android için optimize
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 18,            // Daha büyük text
    fontWeight: '600',       // Daha bold
    letterSpacing: 0.5,      // Daha iyi okunabilirlik
  },
}); 