import { useFormikContext } from 'formik';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../themes';

export default function FormikSelectorGrid({ name, label, options }) {
  const { setFieldValue, values } = useFormikContext();
  const theme = useTheme();
  const styles = getStyles(theme);

  const selectedValue = values[name];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.grid}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => setFieldValue(name, option.value)}>
              {option.emoji && <Text style={styles.optionEmoji}>{option.emoji}</Text>}
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        ...theme.typography.styles.h4,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
    },
    optionCard: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.spacing.radius.xl,
        padding: theme.spacing.lg,
        alignItems: 'center',
        shadowColor: theme.colors.shadow,
        ...theme.spacing.shadows.sm,
    },
    optionCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.background,
        borderWidth: 2,
    },
    optionEmoji: {
        fontSize: 28,
        marginBottom: theme.spacing.sm,
    },
    optionLabel: {
        ...theme.typography.styles.bodySmall,
        color: theme.colors.textSecondary,
        fontWeight: theme.typography.weights.medium,
        textAlign: 'center',
    },
    optionLabelSelected: {
        color: theme.colors.primary,
        fontWeight: theme.typography.weights.bold,
    },
}); 