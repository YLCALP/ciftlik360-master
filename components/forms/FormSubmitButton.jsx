import { useFormikContext } from 'formik';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../themes';

export default function FormSubmitButton({ title, variant = 'primary', style, ...props }) {
  const { handleSubmit, isSubmitting } = useFormikContext();
  const theme = useTheme();

  const textColor = variant === 'primary' ? 'primaryText' : 'text';

  return (
    <TouchableOpacity
      style={[theme.styles.button(variant), style]}
      onPress={handleSubmit}
      disabled={isSubmitting}
      {...props}>
      {isSubmitting ? (
        <ActivityIndicator color={theme.colors[textColor]} />
      ) : (
        <Text style={theme.styles.text('button', textColor)}>{title}</Text>
      )}
    </TouchableOpacity>
  );
} 