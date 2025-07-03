import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../themes';

export default function FormTextInput({ name, label, style, ...props }) {
  const { handleChange, handleBlur, setFieldValue, values, touched, errors } = useFormikContext();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = touched[name] && errors[name];
  const inputState = hasError ? 'error' : isFocused ? 'focused' : 'default';

  return (
    <View style={theme.components.formField.base}>
      {label && <Text style={[theme.typography.styles.label, { color: theme.colors.textSecondary, ...theme.components.formField.label }]}>{label}</Text>}
      <TextInput
        style={[theme.styles.input(inputState), style]}
        onBlur={(e) => { setIsFocused(false); handleBlur(name)(e); }}
        onFocus={() => setIsFocused(true)}
        onChangeText={(text) => setFieldValue(name, text)}
        value={values[name]}
        placeholderTextColor={theme.colors.textMuted}
        {...props}
      />
      {hasError && <Text style={styles.errorText}>{errors[name]}</Text>}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  errorText: {
    ...theme.typography.styles.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
}); 