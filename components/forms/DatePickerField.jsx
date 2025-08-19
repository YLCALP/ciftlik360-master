import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../common/Icon';
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
  const [tempDate, setTempDate] = useState(null);

  const selectedDate = useMemo(() => parseToDate(value), [value]);
  const displayText = value ? (value instanceof Date ? formatDateDDMMYYYY(value) : String(value)) : '';

  function handleChange(_event, picked) {
    if (Platform.OS === 'ios') {
      // iOS'ta sadece temp date'i güncelle
      setTempDate(picked);
    } else {
      // Android'de direkt uygula
      setShow(false);
      if (!picked) return;
      if (asString) {
        onChange?.(formatDateDDMMYYYY(picked));
      } else {
        onChange?.(picked);
      }
    }
  }

  const showPicker = () => {
    if (Platform.OS === 'ios') {
      setTempDate(selectedDate); // Modal açılırken mevcut değeri temp'e al
    }
    setShow(true);
  };

  const closePicker = () => {
    setShow(false);
    setTempDate(null);
  };

  const confirmPicker = () => {
    // iOS'ta Tamam'a basıldığında temp date'i uygula
    const dateToApply = tempDate || selectedDate;
    if (asString) {
      onChange?.(formatDateDDMMYYYY(dateToApply));
    } else {
      onChange?.(dateToApply);
    }
    setShow(false);
    setTempDate(null);
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          visible={show}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closePicker}>
                  <Text style={styles.modalButton}>İptal</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Tarih Seç</Text>
                <TouchableOpacity onPress={confirmPicker}>
                  <Text style={[styles.modalButton, styles.modalButtonPrimary]}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate || selectedDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.iosDatePicker}
                textColor={theme.colors.text}
                themeVariant={theme.isDark ? 'dark' : 'light'}
              />
            </View>
          </View>
        </Modal>
      );
    } else {
      return show ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          textColor={theme.colors.text}
          themeVariant={theme.isDark ? 'dark' : 'light'}
        />
      ) : null;
    }
  };

  return (
    <View style={styles.wrapper}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity 
        style={styles.inputButton} 
        onPress={showPicker}
        activeOpacity={0.7}
      >
        <Text style={[styles.inputText, !displayText && styles.placeholder]}>
          {displayText || placeholder}
        </Text>
        <Icon library="Feather" name="calendar" size={20} color={theme.colors.textMuted} />
      </TouchableOpacity>
      {renderDatePicker()}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing?.md || 16,
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
    borderRadius: theme.spacing?.radius?.lg || 12,
    paddingHorizontal: theme.spacing?.lg || 16,
    paddingVertical: theme.spacing?.md || 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
  },
  inputText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  placeholder: {
    color: theme.colors.textMuted,
  },
  iosDatePicker: {
    backgroundColor: theme.colors.card,
    height: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.spacing?.radius?.xl || 20,
    borderTopRightRadius: theme.spacing?.radius?.xl || 20,
    paddingBottom: 34,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing?.lg || 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalButton: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modalButtonPrimary: {
    color: theme.colors.primary,
    fontWeight: '700',
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


