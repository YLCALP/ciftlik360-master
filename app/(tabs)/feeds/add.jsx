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
import { feedAPI } from '../../../services/api';
import { useTheme } from '../../../themes';

const FeedSchema = Yup.object().shape({
  feed_name: Yup.string().required('Yem adı zorunludur'),
  feed_type: Yup.string().required(),
  quantity: Yup.number().required('Miktar zorunludur').typeError('Miktar sayı olmalıdır'),
  unit: Yup.string().required(),
  purchase_price: Yup.number().typeError('Fiyat sayı olmalıdır'),
  purchase_date: Yup.string().matches(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.\d{4}$/, 'Geçersiz tarih formatı. GG.AA.YYYY kullanın'),
  expiry_date: Yup.string().matches(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.\d{4}$/, 'Geçersiz tarih formatı. GG.AA.YYYY kullanın'),
});

const feedTypeOptions = [
    { value: 'concentrate', label: 'Konsantre Yem', emoji: '🌾' },
    { value: 'roughage', label: 'Kaba Yem', emoji: '🌿' },
    { value: 'supplement', label: 'Takviye', emoji: '💊' },
    { value: 'other', label: 'Diğer', emoji: '🥜' },
];

const unitOptions = [
    { value: 'kg', label: 'Kilogram' },
    { value: 'ton', label: 'Ton' },
    { value: 'bag', label: 'Çuval' },
    { value: 'liter', label: 'Litre' },
];

export default function AddFeedScreen() {
    const theme = useTheme();
    const styles = getStyles(theme);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const { purchase_date, expiry_date, ...rest } = values;

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

            const feedData = {
                ...rest,
                quantity: parseFloat(values.quantity),
                purchase_price: values.purchase_price ? parseFloat(values.purchase_price) : 0,
                purchase_date: formatDateForDB(purchase_date),
                expiry_date: formatDateForDB(expiry_date),
            };

            await feedAPI.addFeed(feedData);
            FlashMessageService.success('Başarılı', 'Yem başarıyla eklendi.');
            router.back();
        } catch (error) {
            FlashMessageService.error('Hata', 'Yem eklenirken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Formik
                initialValues={{
                    feed_name: '',
                    feed_type: 'concentrate',
                    brand: '',
                    quantity: '',
                    unit: 'kg',
                    purchase_price: '',
                    purchase_date: '',
                    expiry_date: '',
                    supplier: '',
                    storage_location: '',
                    notes: '',
                }}
                validationSchema={FeedSchema}
                onSubmit={handleSubmit}
            >
            {() => (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.form}>
                            <FormikSelectorGrid name="feed_type" label="Yem Türü" options={feedTypeOptions} />
                            
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
                                <FormTextInput name="feed_name" label="Yem Adı *" placeholder="Örn: Dana Büyütme Yemi" />
                                <FormTextInput name="brand" label="Marka" placeholder="Yem markası (opsiyonel)" />
                                <FormTextInput name="quantity" label="Miktar *" placeholder="0" keyboardType="numeric" />
                                <FormikSelectorGrid name="unit" label="Birim" options={unitOptions} />
                                <FormTextInput name="purchase_price" label="Toplam Alış Fiyatı (₺)" placeholder="Toplam ödenen tutar" keyboardType="numeric" />
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Tarihler</Text>
                                <FormTextInput name="purchase_date" label="Alış Tarihi" placeholder="GG.AA.YYYY" />
                                <FormTextInput name="expiry_date" label="Son Kullanma Tarihi" placeholder="GG.AA.YYYY" />
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Ek Bilgiler</Text>
                                <FormTextInput name="supplier" label="Tedarikçi" placeholder="Tedarikçi firma adı" />
                                <FormTextInput name="storage_location" label="Depo Konumu" placeholder="Depolandığı yer" />
                                <FormTextInput name="notes" label="Notlar" placeholder="Yem hakkında notlar..." multiline numberOfLines={3} />
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                                    <Text style={styles.cancelButtonText}>İptal</Text>
                                </TouchableOpacity>
                                <FormSubmitButton title="Yem Ekle" style={styles.submitButton}/>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    form: {
        padding: theme.spacing.lg,
    },
    section: {
        marginVertical: theme.spacing.lg,
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
    submitButton: {
        flex: 2,
    },
}); 