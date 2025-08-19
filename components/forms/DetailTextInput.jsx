import { useFormikContext } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../themes';
import { Icon } from '../common/Icon';

export default function DetailTextInput({ 
  name, 
  label, 
  placeholder,
  prefixIcon,
  suffixIcon,
  clearable = false,
  style,
  containerStyle,
  ...props 
}) {
  const { handleChange, handleBlur, setFieldValue, values, touched, errors } = useFormikContext();
  const theme = useTheme();
  const styles = getStyles(theme);
  
  const [isFocused, setIsFocused] = useState(false);
  const labelAnimation = useRef(new Animated.Value(values[name] ? 1 : 0)).current;
  
  const hasError = touched[name] && errors[name];
  const hasValue = values[name] && values[name].toString().length > 0;
  
  useEffect(() => {
    Animated.timing(labelAnimation, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleClear = () => {
    setFieldValue(name, '');
  };

  const getInputState = () => {
    if (hasError) return 'error';
    if (isFocused) return 'focused';
    return 'default';
  };

  const inputState = getInputState();
  
  const containerStyles = [
    styles.container,
    containerStyle,
    hasError && styles.containerError,
    isFocused && styles.containerFocused,
  ];

  const inputStyles = [
    styles.input,
    prefixIcon && styles.inputWithPrefix,
    (suffixIcon || clearable) && styles.inputWithSuffix,
    style,
  ];

  return (
    <View style={containerStyles}>
      <View style={styles.inputContainer}>
        {prefixIcon && (
          <View style={styles.prefixIcon}>
            <Icon 
              library={prefixIcon.library} 
              name={prefixIcon.name} 
              size={20} 
              color={hasError ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.textMuted} 
            />
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Animated.Text
            style={[
              styles.label,
              {
                transform: [{
                  translateY: labelAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                }],
                fontSize: labelAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 12],
                }),
                color: hasError 
                  ? theme.colors.error 
                  : isFocused 
                    ? theme.colors.primary 
                    : theme.colors.textSecondary,
              },
            ]}
            pointerEvents="none"
          >
            {label}
          </Animated.Text>
          
          <TextInput
            style={inputStyles}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={(text) => setFieldValue(name, text)}
            value={values[name] || ''}
            placeholder={isFocused ? placeholder : ''}
            placeholderTextColor={theme.colors.textMuted}
            {...props}
          />
        </View>

        {clearable && hasValue && (
          <TouchableOpacity 
            onPress={handleClear}
            style={styles.suffixIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon 
              library="Feather" 
              name="x" 
              size={18} 
              color={theme.colors.textMuted} 
            />
          </TouchableOpacity>
        )}

        {suffixIcon && !clearable && (
          <View style={styles.suffixIcon}>
            <Icon 
              library={suffixIcon.library} 
              name={suffixIcon.name} 
              size={20} 
              color={hasError ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.textMuted} 
            />
          </View>
        )}
      </View>

      {hasError && (
        <View style={styles.errorContainer}>
          <Icon 
            library="Feather" 
            name="alert-circle" 
            size={14} 
            color={theme.colors.error} 
          />
          <Text style={styles.errorText}>{errors[name]}</Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  containerFocused: {
    // Additional focused container styles
  },
  containerError: {
    // Additional error container styles
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.radius.lg,
    paddingHorizontal: theme.spacing.md,
    minHeight: 56,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  prefixIcon: {
    marginRight: theme.spacing.sm,
  },
  suffixIcon: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  textContainer: {
    flex: 1,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 0,
    top: 0,
    ...theme.typography.styles.label,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  input: {
    ...theme.typography.styles.body,
    color: theme.colors.text,
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 0,
    minHeight: 24,
    textAlignVertical: 'top',
  },
  inputWithPrefix: {
    // Styles when prefix icon is present
  },
  inputWithSuffix: {
    // Styles when suffix icon is present
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.styles.caption,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
});