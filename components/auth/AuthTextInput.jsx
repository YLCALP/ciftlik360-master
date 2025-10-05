import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../themes';

export default function AuthTextInput({ name, label, style, ...props }) {
  const { handleChange, handleBlur, values, touched, errors } = useFormikContext();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = touched[name] && errors[name];
  const inputState = hasError ? 'error' : isFocused ? 'focused' : 'default';

  const inputStyle = [
    theme.styles.input(inputState),
    Platform.OS === 'ios' && styles.iosInput,
    style
  ];

  return (
    <View style={theme.components.formField.base}>
      {label && <Text style={[theme.typography.styles.label, { color: theme.colors.textSecondary, ...theme.components.formField.label }]}>{label}</Text>}
      <TextInput
        style={inputStyle}
        onChangeText={handleChange(name)}
        onBlur={(e) => {
          setIsFocused(false);
          handleBlur(name)(e);
        }}
        onFocus={() => setIsFocused(true)}
        value={values[name]}
        placeholderTextColor={theme.colors.textMuted}
        textContentType={getTextContentType(name)}
        autoComplete={getAutoComplete(name)}
        scrollEnabled={false}
        multiline={false}
        textAlignVertical="center"
        numberOfLines={1}
        maxLength={100}
        editable={true}
        selectTextOnFocus={false}
        {...props}
      />
      {hasError && <Text style={styles.errorText}>{errors[name]}</Text>}
    </View>
  );
}

// iOS için textContentType ve autoComplete önerileri
function getTextContentType(name) {
  const mapping = {
    email: 'emailAddress',
    password: 'password',
    name: 'name',
    phone: 'telephoneNumber',
    farmName: 'organizationName',
  };
  return mapping[name] || 'none';
}

function getAutoComplete(name) {
  const mapping = {
    email: 'email',
    password: 'password',
    name: 'name',
    phone: 'tel',
  };
  return mapping[name] || 'off';
}

const getStyles = (theme) => StyleSheet.create({
  errorText: {
    ...theme.typography.styles.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  // iOS için özel input stilleri
  iosInput: {
    height: 60,          // iOS'ta daha yüksek
    paddingVertical: 18, // iOS'ta daha fazla dikey padding
    paddingHorizontal: 20, // iOS'ta daha fazla yatay padding  
    fontSize: 16,        // iOS'ta zoom engellemek için minimum 16px
    lineHeight: 20,      // iOS'ta daha iyi hizalama
    fontFamily: 'System', // Sistem fontunu zorla
    textAlignVertical: 'center', // Android için center alignment
    includeFontPadding: false,   // Android için font padding'i kaldır
    textAlign: 'left',           // Explicit text alignment
  },
}); 