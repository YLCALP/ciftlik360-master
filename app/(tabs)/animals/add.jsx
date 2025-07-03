import { router } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import FormikSelectorGrid from '../../../components/forms/FormikSelectorGrid';
import FormSubmitButton from '../../../components/forms/FormSubmitButton';
import FormTextInput from '../../../components/forms/FormTextInput';
import { animalsAPI } from '../../../services/api';
import { useTheme } from '../../../themes';

const AnimalSchema = Yup.object().shape({
  name: Yup.string(),
  species: Yup.string().required(),
  gender: Yup.string().required(),
  birth_date: Yup.string().matches(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.\d{4}$/, 'Geçersiz tarih formatı. GG.AA.YYYY kullanın'),
  tag_number: Yup.string().required('Küpe numarası zorunludur'),
  breed: Yup.string(),
  weight: Yup.number().typeError('Ağırlık sayı olmalıdır'),
  status: Yup.string().required(),
  purchase_price: Yup.number().typeError('Fiyat sayı olmalıdır'),
  purchase_date: Yup.string().matches(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.\d{4}$/, 'Geçersiz tarih formatı. GG.AA.YYYY kullanın'),
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

export default function AddAnimalScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
        const { birth_date, purchase_date, ...rest } = values;

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

        const animalData = {
            ...rest,
            birth_date: formatDateForDB(birth_date),
            purchase_date: formatDateForDB(purchase_date) || new Date().toISOString().split('T')[0],
            purchase_price: values.purchase_price ? parseFloat(values.purchase_price) : 0,
            weight: values.weight ? parseFloat(values.weight) : null,
        };

        await animalsAPI.addAnimal(animalData);
        FlashMessageService.success('Başarılı', 'Hayvan başarıyla eklendi.');
        router.back();

    } catch (error) {
        console.error('Create animal error:', error);
        FlashMessageService.error('Hata', 'Hayvan eklenirken bir hata oluştu.');
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <Formik
            initialValues={{
                name: '',
                species: 'cattle',
                gender: 'female',
                birth_date: '',
                tag_number: '',
                breed: '',
                weight: '',
                status: 'active',
                purchase_price: '',
                purchase_date: '',
                notes: '',
            }}
            validationSchema={AnimalSchema}
            onSubmit={handleSubmit}
        >
        {({ values }) => (
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView 
                    style={styles.scrollView} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContentContainer}>

                    <View style={styles.header}>
                        <View style={styles.headerIcon}>
                            <Text style={styles.headerEmoji}>{speciesOptions.find(s => s.value === values.species)?.emoji || '🐾'}</Text>
                        </View>
                        <Text style={styles.headerTitle}>Yeni Hayvan Ekle</Text>
                        <Text style={styles.headerSubtitle}>Hayvan bilgilerini doldurun</Text>
                    </View>

                    <View style={styles.form}>
                        <FormikSelectorGrid name="species" label="Hayvan Türü" options={speciesOptions} />
                        
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
                            <FormTextInput name="tag_number" label="Küpe Numarası *" placeholder="Örn: TR001, A001" />
                            <FormTextInput name="name" label="Hayvan Adı" placeholder="Hayvan adı (opsiyonel)" />
                            <FormikSelectorGrid name="gender" label="Cinsiyet" options={genderOptions} />
                            <FormTextInput name="birth_date" label="Doğum Tarihi" placeholder="GG.AA.YYYY" />
                            <FormTextInput name="breed" label="Irk" placeholder="Hayvan ırkı" />
                            <FormTextInput name="weight" label="Ağırlık (kg)" placeholder="Ağırlık (kg)" keyboardType="numeric" />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Durum</Text>
                            <FormikSelectorGrid name="status" options={statusOptions} />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Alış Bilgileri</Text>
                            <FormTextInput name="purchase_price" label="Alış Fiyatı (₺)" placeholder="Hayvan alış fiyatı" keyboardType="numeric" />
                            <FormTextInput name="purchase_date" label="Alış Tarihi" placeholder="GG.AA.YYYY" />
                            <FormTextInput name="notes" label="Notlar" placeholder="Hayvan hakkında notlar" multiline numberOfLines={3} />
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                                <Text style={styles.cancelButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <FormSubmitButton title="Hayvan Ekle" style={styles.saveButton} />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: 40,
    },
    header: {
        backgroundColor: theme.colors.card,
        alignItems: 'center',
        paddingVertical: theme.spacing['2xl'],
        paddingHorizontal: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerIcon: {
        width: 64,
        height: 64,
        backgroundColor: theme.colors.surface,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    headerEmoji: {
        fontSize: 32,
    },
    headerTitle: {
        ...theme.typography.styles.h2,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
        ...theme.typography.styles.body,
        color: theme.colors.textSecondary,
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
    buttonContainer: {
        flexDirection: 'row',
        marginTop: theme.spacing.xl,
        gap: theme.spacing.md,
    },
    cancelButton: {
        ...theme.styles.button('secondary'),
        flex: 1,
    },
    cancelButtonText: {
        ...theme.styles.text('button'),
        color: theme.colors.text,
    },
    saveButton: {
        flex: 2,
    },
}); 