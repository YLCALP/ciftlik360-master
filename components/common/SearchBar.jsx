import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Icon } from './Icon';
import { useTheme } from '../../themes';

export function SearchBar({ 
  placeholder = "Ara...", 
  value = "", 
  onChangeText, 
  showClearButton = true,
  containerStyle,
  inputStyle,
  disabled = false
}) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const handleClear = () => {
    if (onChangeText) {
      onChangeText('');
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <Icon 
          library="Feather" 
          name="search" 
          size={18} 
          color={theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessible={true}
          accessibilityLabel={`Search input: ${placeholder}`}
          accessibilityRole="search"
        />
        {showClearButton && value.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClear}
            accessible={true}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon 
              library="Feather" 
              name="x" 
              size={16} 
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.spacing.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.styles.body,
    color: theme.colors.text,
    fontSize: 16,
    paddingVertical: 0, // Remove default padding
    margin: 0, // Remove default margin
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
    borderRadius: theme.spacing.radius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
  },
});