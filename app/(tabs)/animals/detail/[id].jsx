import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Yup from 'yup';
import { FlashMessageService } from '../../../../components/common/FlashMessage';
import DetailHeader from '../../../../components/detail/DetailHeader';
import DetailSection from '../../../../components/detail/DetailSection';
import DetailButton from '../../../../components/forms/DetailButton';
import DetailTextInput from '../../../../components/forms/DetailTextInput';
import FormikDatePickerField from '../../../../components/forms/FormikDatePickerField';
import FormikSelectorGrid from '../../../../components/forms/FormikSelectorGrid';
import { animalsAPI } from '../../../../services/api';
import { useTheme } from '../../../../themes';

const AnimalSchema = Yup.object().shape({
  name: Yup.string(),
  species: Yup.string().required(),
  gender: Yup.string().required(),
  birth_date: Yup.string().matches(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.\d{4}$/, 'Geçersiz tarih formatı. GG.AA.YYYY kullanın'),
  tag_number: Yup.string().required('Küpe numarası zorunludur'),
  breed: Yup.string(),
  weight: Yup.number().typeError('Ağırlık sayı olmalıdır'),
  status: Yup.string().required(),
  notes: Yup.string(),
});

const speciesOptions = [
    { value: 'cattle', label: 'Sığır', emoji: '🐄' },
    { value: 'sheep', label: 'Koyun', emoji: '🐑' },
    { value: 'goat', label: 'Keçi', emoji: '🐐' },
    { value: 'poultry', label: 'Kümes Hayvanı', emoji: '🐔' },
    { value: 'other', label: 'Diğer', emoji: '🐾' },
];

const genderOptions = [
    { value: 'female', label: 'Dişi' },
    { value: 'male', label: 'Erkek' },
];

const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'sick', label: 'Hasta' },
    { value: 'sold', label: 'Satıldı' },
    { value: 'deceased', label: 'Öldü' },
];

export default function AnimalDetailScreen() {
  const { id } = useLocalSearchParams();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const theme = useTheme();
  const styles = getStyles(theme);

  const loadAnimal = useCallback(async () => {
    try {
      setLoading(true);
      const data = await animalsAPI.getAnimals();
      const foundAnimal = data.find(a => a.id === id);
      if (foundAnimal) {
        setAnimal({
          ...foundAnimal,
          birth_date: foundAnimal.birth_date ? new Date(foundAnimal.birth_date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
          weight: foundAnimal.weight ? String(foundAnimal.weight) : '',
          purchase_price: foundAnimal.purchase_price ? String(foundAnimal.purchase_price) : '',
          purchase_date: foundAnimal.purchase_date ? new Date(foundAnimal.purchase_date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
        });
      } else {
        FlashMessageService.error('Hata', 'Hayvan bulunamadı.');
        router.back();
      }
    } catch (error) {
      FlashMessageService.error('Hata', 'Hayvan yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadAnimal(); }, [loadAnimal]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (values, { setSubmitting }) => {
    if (isSaving) return; // Prevent double submission
    
    setIsSaving(true);
    try {
        const formatDateForDB = (dateStr) => {
            if (!dateStr || !dateStr.trim()) return null;
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
            const dateMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            if (dateMatch) {
                const [, day, month, year] = dateMatch;
                return `${year}-${month}-${day}`;
            }
            return null; 
        };

        const updateData = {
            ...values,
            birth_date: formatDateForDB(values.birth_date),
            purchase_date: formatDateForDB(values.purchase_date),
            weight: values.weight ? parseFloat(values.weight) : null,
            purchase_price: values.purchase_price ? parseFloat(values.purchase_price) : null,
            notes: values.notes || null,
        };

        await animalsAPI.updateAnimal(id, updateData);
        FlashMessageService.success('Başarılı', 'Hayvan bilgileri güncellendi.');
        router.back();
    } catch (error) {
        FlashMessageService.error('Hata', 'Hayvan güncellenirken bir hata oluştu.');
    } finally {
        setSubmitting(false);
        setIsSaving(false);
    }
  };
  
  const getStatusText = (status) => (statusOptions.find(s => s.value === status)?.label || status);

  if (loading) {
    return (
      <View style={styles.container}>
        <DetailHeader title="Yükleniyor..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.loadingText}>Hayvan bilgileri yükleniyor...</Text>
        </View>
      </View>
    );
  }

  if (!animal) {
    return (
      <View style={styles.container}>
        <DetailHeader title="Hata" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Hayvan bulunamadı</Text>
          <DetailButton 
            title="Geri Dön" 
            variant="outline" 
            onPress={() => router.back()}
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>
      </View>
    );
  }

  const animalEmoji = speciesOptions.find(s => s.value === animal.species)?.emoji || '🐾';
  const statusInfo = statusOptions.find(s => s.value === animal.status);

  return (
    <View style={styles.container}>
      <Formik
        initialValues={animal}
        validationSchema={AnimalSchema}
        onSubmit={handleSave}
        enableReinitialize
      >
        {({ values, isSubmitting, handleSubmit }) => {
          const isReadOnly = values.status === 'sold' || values.status === 'deceased';
          
          return (
          <>
            <DetailHeader
              title={values.name || values.tag_number}
              subtitle={`Küpe No: ${values.tag_number}`}
              emoji={animalEmoji}
              statusBadge={{
                status: values.status,
                label: getStatusText(values.status)
              }}
              rightActions={[
                {
                  icon: { library: 'FontAwesome5', name: 'lira-sign' },
                  onPress: () => router.push(`/finances?animalId=${id}`)
                }
              ]}
              gradient={true}
            />

            <ScrollView 
              style={styles.scrollView} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Species Selection */}
              <DetailSection
                title="Hayvan Türü"
                icon={{ library: 'MaterialCommunityIcons', name: 'cow' }}
                showDivider={false}
              >
                <FormikSelectorGrid name="species" label="Hayvan Türü" options={speciesOptions} disabled={isReadOnly} />
              </DetailSection>

              {/* Basic Information */}
              <DetailSection
                title="Temel Bilgiler"
                subtitle="Hayvanın kimlik bilgileri"
                icon={{ library: 'Feather', name: 'info' }}
              >
                <DetailTextInput 
                  name="tag_number" 
                  label="Küpe Numarası *" 
                  prefixIcon={{ library: 'Feather', name: 'tag' }}
                  clearable 
                  editable={!isReadOnly}
                />
                <DetailTextInput 
                  name="name" 
                  label="Hayvan Adı" 
                  prefixIcon={{ library: 'Feather', name: 'type' }}
                  placeholder="Örn: Papatya"
                  clearable 
                  editable={!isReadOnly}
                />
                <FormikSelectorGrid name="gender" label="Cinsiyet" options={genderOptions} disabled={isReadOnly} />
                <FormikDatePickerField name="birth_date" label="Doğum Tarihi" asString disabled={isReadOnly} />
                <DetailTextInput 
                  name="breed" 
                  label="Irk" 
                  placeholder="Örn: Holstein"
                  clearable 
                  editable={!isReadOnly}
                />
                <DetailTextInput 
                  name="weight" 
                  label="Ağırlık" 
                  keyboardType="numeric"
                  suffixIcon={{ library: 'Feather', name: 'trending-up' }}
                  placeholder="kg"
                  editable={!isReadOnly}
                />
              </DetailSection>

              {/* Status */}
              <DetailSection
                title="Durum Bilgileri"
                icon={{ library: 'Feather', name: 'activity' }}
              >
                <FormikSelectorGrid name="status" options={statusOptions} />
              </DetailSection>

              {/* Purchase Information */}
              <DetailSection
                title="Alış Bilgileri"
                subtitle="Satın alma detayları"
                icon={{ library: 'Feather', name: 'shopping-cart' }}
                collapsible={true}
              >
                <DetailTextInput 
                  name="purchase_price" 
                  label="Alış Fiyatı" 
                  keyboardType="numeric"
                  prefixIcon={{ library: 'FontAwesome5', name: 'lira-sign' }}
                  placeholder="0.00"
                  formatAsCurrency={true}
                  editable={!isReadOnly}
                />
                <FormikDatePickerField name="purchase_date" label="Alış Tarihi" asString disabled={isReadOnly} />
              </DetailSection>

              {/* Notes */}
              <DetailSection
                title="Notlar"
                subtitle="Ek bilgiler ve gözlemler"
                icon={{ library: 'Feather', name: 'edit-3' }}
                collapsible={true}
              >
                <DetailTextInput 
                  name="notes" 
                  label="Notlar"
                  multiline 
                  numberOfLines={4}
                  placeholder="Hayvan hakkında notlarınızı yazın..."
                  style={{ height: 100, textAlignVertical: 'top' }}
                  editable={!isReadOnly}
                />
              </DetailSection>

              {/* Action Buttons */}
              <View style={styles.actionSection}>
                <DetailButton
                  title={isReadOnly ? "Düzenleme Kapalı" : "Değişiklikleri Kaydet"}
                  onPress={handleSubmit}
                  loading={isSubmitting || isSaving}
                  disabled={isReadOnly || isSubmitting || isSaving}
                  leadingIcon={{ library: 'Feather', name: 'save' }}
                  fullWidth
                  size="lg"
                />

                <DetailButton
                  title="Finansal İşlemler"
                  variant="outline"
                  onPress={() => router.push(`/finances?animalId=${id}`)}
                  leadingIcon={{ library: 'FontAwesome5', name: 'lira-sign' }}
                  fullWidth
                  style={{ marginTop: theme.spacing.md }}
                />
              </View>
            </ScrollView>
          </>
          );
        }}
      </Formik>
    </View>
  );
}

const getStyles = (theme) => {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.styles.bodyLarge,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorText: {
    ...theme.typography.styles.h4,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
    scrollContent: {
      paddingHorizontal: isTablet ? theme.spacing.xl : theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      maxWidth: isTablet ? 800 : '100%',
      alignSelf: isTablet ? 'center' : 'stretch',
      width: '100%',
    },
    actionSection: {
      paddingHorizontal: theme.spacing.sm,
      marginTop: theme.spacing.xl,
      maxWidth: isTablet ? 400 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
});
};