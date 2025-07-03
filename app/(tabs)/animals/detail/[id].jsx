import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { FlashMessageService } from '../../../../components/common/FlashMessage';
import FormikSelectorGrid from '../../../../components/forms/FormikSelectorGrid';
import FormSubmitButton from '../../../../components/forms/FormSubmitButton';
import FormTextInput from '../../../../components/forms/FormTextInput';
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

  const handleSave = async (values, { setSubmitting }) => {
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
    }
  };
  
  const getStatusText = (status) => (statusOptions.find(s => s.value === status)?.label || status);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}><ActivityIndicator color={theme.colors.primary}/></View>
      </SafeAreaView>
    );
  }

  if (!animal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}><Text style={styles.loadingText}>Hayvan bulunamadı</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Formik
        initialValues={animal}
        validationSchema={AnimalSchema}
        onSubmit={handleSave}
        enableReinitialize
      >
        {({ values }) => (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerEmoji}>{speciesOptions.find(s => s.value === values.species)?.emoji || '🐾'}</Text>
                    <Text style={styles.headerTitle}>{values.name || values.tag_number}</Text>
                    <Text style={styles.headerSubtitle}>{getStatusText(values.status)}</Text>
                </View>

                <View style={styles.form}>
                    <FormikSelectorGrid name="species" label="Hayvan Türü" options={speciesOptions} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
                        <FormTextInput name="tag_number" label="Küpe Numarası *" />
                        <FormTextInput name="name" label="Hayvan Adı" />
                        <FormikSelectorGrid name="gender" label="Cinsiyet" options={genderOptions} />
                        <FormTextInput name="birth_date" label="Doğum Tarihi" placeholder="GG.AA.YYYY" />
                        <FormTextInput name="breed" label="Irk" />
                        <FormTextInput name="weight" label="Ağırlık (kg)" keyboardType="numeric" />
                    </View>
                    
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Durum</Text>
                        <FormikSelectorGrid name="status" options={statusOptions} />
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Alış Bilgileri</Text>
                      <FormTextInput name="purchase_price" label="Alış Fiyatı (₺)" keyboardType="numeric" />
                      <FormTextInput name="purchase_date" label="Alış Tarihi" placeholder="GG.AA.YYYY" />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notlar</Text>
                        <FormTextInput name="notes" multiline numberOfLines={4} />
                    </View>

                    <FormSubmitButton title="Değişiklikleri Kaydet" />

                    <View style={styles.financialSection}>
                        <Text style={styles.sectionTitle}>Finansal İşlemler</Text>
                        <TouchableOpacity style={styles.financialButton} onPress={() => router.push(`/finances?animalId=${id}`)}>
                            <Text style={styles.financialButtonText}>Bu Hayvana Ait İşlemleri Görüntüle</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        )}
      </Formik>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...theme.typography.styles.body,
        color: theme.colors.textSecondary,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: theme.colors.card,
        alignItems: 'center',
        paddingVertical: theme.spacing['2xl'],
        paddingHorizontal: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerEmoji: {
        fontSize: 48,
        marginBottom: theme.spacing.md,
    },
    headerTitle: {
        ...theme.typography.styles.h3,
        color: theme.colors.text,
    },
    headerSubtitle: {
        ...theme.typography.styles.body,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    form: {
        padding: theme.spacing.lg,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.styles.h4,
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
    },
    financialSection: {
      marginTop: theme.spacing['2xl'],
      paddingTop: theme.spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    financialButton: {
      ...theme.styles.button('outline'),
    },
    financialButtonText: {
      ...theme.styles.text('button', 'primary'),
    },
});
