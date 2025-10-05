import { router } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import * as Yup from 'yup';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import DetailHeader from '../../../components/detail/DetailHeader';
import DetailSection from '../../../components/detail/DetailSection';
import DetailTextInput from '../../../components/forms/DetailTextInput';
import DetailButton from '../../../components/forms/DetailButton';
import FormikDatePickerField from '../../../components/forms/FormikDatePickerField';
import FormikSelectorGrid from '../../../components/forms/FormikSelectorGrid';
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
    <View style={styles.container}>
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
        {({ values, isSubmitting, handleSubmit }) => (
            <>
                <DetailHeader
                    title="Yeni Hayvan Ekle"
                    subtitle="Hayvan bilgilerini doldurun"
                    emoji={speciesOptions.find(s => s.value === values.species)?.emoji || '🐾'}
                    gradient={true}
                />

                <KeyboardAvoidingView 
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
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
                            <FormikSelectorGrid name="species" label="Hayvan Türü" options={speciesOptions} />
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
                                placeholder="Örn: TR001, A001"
                                clearable 
                            />
                            <DetailTextInput 
                                name="name" 
                                label="Hayvan Adı" 
                                prefixIcon={{ library: 'Feather', name: 'type' }}
                                placeholder="Örn: Papatya"
                                clearable 
                            />
                            <FormikSelectorGrid name="gender" label="Cinsiyet" options={genderOptions} />
                            <FormikDatePickerField name="birth_date" label="Doğum Tarihi" asString />
                            <DetailTextInput 
                                name="breed" 
                                label="Irk" 
                                prefixIcon={{ library: 'Feather', name: 'award' }}
                                placeholder="Örn: Holstein"
                                clearable 
                            />
                            <DetailTextInput 
                                name="weight" 
                                label="Ağırlık" 
                                keyboardType="numeric"
                                suffixIcon={{ library: 'Feather', name: 'trending-up' }}
                                placeholder="kg"
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
                            />
                            <FormikDatePickerField name="purchase_date" label="Alış Tarihi" asString />
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
                            />
                        </DetailSection>

                        {/* Action Buttons */}
                        <View style={styles.actionSection}>
                            <DetailButton
                                title="Hayvanı Kaydet"
                                onPress={handleSubmit}
                                loading={isSubmitting}
                                leadingIcon={{ library: 'Feather', name: 'save' }}
                                fullWidth
                                size="lg"
                            />

                            <DetailButton
                                title="İptal"
                                variant="outline"
                                onPress={() => router.back()}
                                leadingIcon={{ library: 'Feather', name: 'x' }}
                                fullWidth
                                style={{ marginTop: theme.spacing.md }}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </>
        )}
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
        keyboardAvoidingView: {
            flex: 1,
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