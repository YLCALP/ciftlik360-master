import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { FlashMessageService } from '../../../../components/common/FlashMessage';
import FormikSelectorGrid from '../../../../components/forms/FormikSelectorGrid';
import FormSubmitButton from '../../../../components/forms/FormSubmitButton';
import FormTextInput from '../../../../components/forms/FormTextInput';
import { feedAPI } from '../../../../services/api';
import { useTheme } from '../../../../themes';

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

export default function FeedDetailScreen() {
    const { id } = useLocalSearchParams();
    const [feed, setFeed] = useState(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const styles = getStyles(theme);

    const loadFeed = useCallback(async () => {
        try {
            setLoading(true);
            const data = await feedAPI.getFeeds();
            const foundFeed = data.find(f => f.id === id);
            if (foundFeed) {
                const formatDateForInput = (dateStr) => {
                    if (!dateStr) return '';
                    return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                };
                setFeed({
                    ...foundFeed,
                    purchase_date: formatDateForInput(foundFeed.purchase_date),
                    expiry_date: formatDateForInput(foundFeed.expiry_date),
                    quantity: String(foundFeed.quantity || ''),
                    price_per_unit: String(foundFeed.price_per_unit || ''),
                    min_stock_level: String(foundFeed.min_stock_level || ''),
                });
            } else {
                FlashMessageService.error('Hata', 'Yem bulunamadı.');
                router.back();
            }
        } catch (error) {
            FlashMessageService.error('Hata', 'Yem yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { loadFeed(); }, [loadFeed]);

    const handleSave = async (values, { setSubmitting }) => {
        try {
            const formatDateForDB = (dateStr) => {
                if (!dateStr || !dateStr.trim()) return null;
                const dateMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
                if (dateMatch) {
                    const [, day, month, year] = dateMatch;
                    return `${year}-${month}-${day}`;
                }
                return dateStr;
            };

            const updateData = {
                ...values,
                purchase_date: formatDateForDB(values.purchase_date),
                expiry_date: formatDateForDB(values.expiry_date),
                quantity: parseFloat(values.quantity || 0),
                price_per_unit: parseFloat(values.price_per_unit || 0),
                min_stock_level: parseFloat(values.min_stock_level || 0),
            };

            await feedAPI.updateFeed(id, updateData);
            FlashMessageService.success('Başarılı', 'Yem bilgileri güncellendi.');
            router.back();
        } catch (error) {
            FlashMessageService.error('Hata', 'Yem güncellenirken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <SafeAreaView style={styles.container}><View style={styles.loadingContainer}><ActivityIndicator color={theme.colors.primary} /></View></SafeAreaView>;
    }

    if (!feed) {
        return <SafeAreaView style={styles.container}><View style={styles.loadingContainer}><Text style={styles.loadingText}>Yem bulunamadı</Text></View></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Formik
                initialValues={feed}
                validationSchema={FeedSchema}
                onSubmit={handleSave}
                enableReinitialize
            >
                {() => (
                    <ScrollView style={styles.scrollView}>
                        <View style={styles.form}>
                            <FormikSelectorGrid name="feed_type" label="Yem Türü" options={feedTypeOptions} />
                            
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
                                <FormTextInput name="feed_name" label="Yem Adı *" />
                                <FormTextInput name="brand" label="Marka" />
                                <FormTextInput name="quantity" label="Miktar *" keyboardType="numeric" />
                                <FormikSelectorGrid name="unit" label="Birim" options={unitOptions} />
                                <FormTextInput name="price_per_unit" label="Birim Fiyat" keyboardType="numeric" />
                                <FormTextInput name="min_stock_level" label="Minimum Stok Seviyesi" keyboardType="numeric" />
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Tarihler</Text>
                                <FormTextInput name="purchase_date" label="Alış Tarihi" placeholder="GG.AA.YYYY" />
                                <FormTextInput name="expiry_date" label="Son Kullanma Tarihi" placeholder="GG.AA.YYYY" />
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Ek Bilgiler</Text>
                                <FormTextInput name="supplier" label="Tedarikçi" />
                                <FormTextInput name="storage_location" label="Depo Konumu" />
                                <FormTextInput name="notes" multiline numberOfLines={3} />
                            </View>

                            <FormSubmitButton title="Değişiklikleri Kaydet" />
                        </View>
                    </ScrollView>
                )}
            </Formik>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { ...theme.typography.styles.body, color: theme.colors.textSecondary },
    scrollView: { flex: 1 },
    form: { padding: theme.spacing.lg },
    section: { marginVertical: theme.spacing.lg },
    sectionTitle: { ...theme.typography.styles.h4, color: theme.colors.text, marginBottom: theme.spacing.lg },
}); 