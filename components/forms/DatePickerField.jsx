import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../themes/useTheme';

function formatDateDDMMYYYY(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function parseToDate(value) {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  // Try DD.MM.YYYY
  const m = String(value).match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  // Fallback to Date constructor (ISO etc.)
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default function DatePickerField({
  label = 'Tarih',
  value,
  onChange,
  placeholder = 'Tarih seçin... (GG.AA.YYYY)',
  asString = false,
  minimumDate,
  maximumDate,
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [show, setShow] = useState(false);

  const selectedDate = useMemo(() => parseToDate(value), [value]);
  const displayText = value ? (value instanceof Date ? formatDateDDMMYYYY(value) : String(value)) : '';

  function handleChange(_event, picked) {
    setShow(false);
    if (!picked) return;
    if (asString) {
      onChange?.(formatDateDDMMYYYY(picked));
    } else {
      onChange?.(picked);
    }
  }

  return (
    <View style={styles.wrapper}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.inputButton} onPress={() => setShow(true)}>
        <Text style={[styles.inputText, !displayText && styles.placeholder]}>
          {displayText || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  placeholder: {
    color: theme.colors.textMuted,
  },
  // Shared search bar style for modals that might reuse this component
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
  },
});


