import { useField } from 'formik';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../themes/useTheme';
import DatePickerField from './DatePickerField';

export default function FormikDatePickerField({
  name,
  label = 'Tarih',
  placeholder = 'Tarih seçin... (GG.AA.YYYY)',
  asString = false,
  minimumDate,
  maximumDate,
}) {
  const [field, meta, helpers] = useField(name);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  function handleChange(val) {
    helpers.setValue(val);
    if (!meta.touched) helpers.setTouched(true);
  }

  return (
    <View style={styles.container}>
      <DatePickerField
        label={label}
        value={field.value}
        onChange={handleChange}
        placeholder={placeholder}
        asString={asString}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
      {meta.touched && meta.error ? (
        <Text style={styles.errorText}>{meta.error}</Text>
      ) : null}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing?.md || 16,
  },
  errorText: {
    marginTop: 4,
    color: theme.colors.error,
    fontSize: 12,
  },
});


