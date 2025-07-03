import { useFormikContext } from 'formik';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../themes';

export default function AuthButton({ title, style, ...props }) {
  const { handleSubmit, isSubmitting } = useFormikContext();
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[theme.styles.button('primary'), style]}
      onPress={handleSubmit}
      disabled={isSubmitting}
      {...props}>
      {isSubmitting ? (
        <ActivityIndicator color={theme.colors.primaryText} />
      ) : (
        <Text style={theme.styles.text('button', 'primaryText')}>{title}</Text>
      )}
    </TouchableOpacity>
  );
} 