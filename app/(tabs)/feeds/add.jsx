import { router } from 'expo-router';
import { Formik } from 'formik';
import React, { useEffect } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import * as Yup from 'yup';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import DetailHeader from '../../../components/detail/DetailHeader';
import DetailSection from '../../../components/detail/DetailSection';
import DetailButton from '../../../components/forms/DetailButton';
import DetailTextInput from '../../../components/forms/DetailTextInput';
import FormikDatePickerField from '../../../components/forms/FormikDatePickerField';
import FormikSelectorGrid from '../../../components/forms/FormikSelectorGrid';
import { feedAPI } from '../../../services/api';
import { useTheme } from '../../../themes';

const FeedSchema = Yup.object().shape({
  feed_name: Yup.string().required('Yem adı zorunludur'),
  feed_type: Yup.string().required(),
  quantity: Yup.number().required('Miktar zorunludur').typeError('Miktar sayı olmalıdır'),
  unit: Yup.string().required(),
  purchase_price: Yup.number().typeError('Toplam alış fiyatı sayı olmalıdır'),
  price_per_unit: Yup.number().typeError('Birim fiyat sayı olmalıdır'),
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

// Component to handle automatic calculation
const PriceCalculator = ({ values, setFieldValue }) => {
    useEffect(() => {
        if (values.purchase_price && values.quantity) {
            const totalPrice = parseFloat(values.purchase_price);
            const quantity = parseFloat(values.quantity);
            if (quantity > 0 && !isNaN(totalPrice) && !isNaN(quantity)) {
                const unitPrice = (totalPrice / quantity).toFixed(2);
                setFieldValue('price_per_unit', unitPrice);
            }
        } else {
            setFieldValue('price_per_unit', '');
        }
    }, [values.purchase_price, values.quantity, setFieldValue]);
    
    return null;
};

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
                price_per_unit: values.price_per_unit ? parseFloat(values.price_per_unit) : 0,
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
        <View style={styles.container}>
            <DetailHeader
                title="Yeni Yem Ekle"
                subtitle="Yem bilgilerini doldurun"
                emoji="🌾"
                gradient={true}
            />

            <Formik
                initialValues={{
                    feed_name: '',
                    feed_type: 'concentrate',
                    brand: '',
                    quantity: '',
                    unit: 'kg',
                    purchase_price: '',
                    price_per_unit: '',
                    purchase_date: '',
                    expiry_date: '',
                    supplier: '',
                    storage_location: '',
                    notes: '',
                }}
                validationSchema={FeedSchema}
                onSubmit={handleSubmit}
            >
            {({ values, isSubmitting, handleSubmit, setFieldValue }) => (
                <>
                <PriceCalculator values={values} setFieldValue={setFieldValue} />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView 
                        style={styles.scrollView} 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Feed Type */}
                        <DetailSection
                            title="Yem Türü"
                            icon={{ library: 'MaterialCommunityIcons', name: 'grain' }}
                            showDivider={false}
                        >
                            <FormikSelectorGrid name="feed_type"  options={feedTypeOptions} />
                        </DetailSection>

                        {/* Basic Information */}
                        <DetailSection
                            title="Temel Bilgiler"
                            subtitle="Yem özellikleri"
                            icon={{ library: 'Feather', name: 'info' }}
                        >
                            <DetailTextInput 
                                name="feed_name" 
                                label="Yem Adı *" 
                                prefixIcon={{ library: 'Feather', name: 'type' }}
                                placeholder="Örn: Premium Süt Yemi"
                                clearable 
                            />
                            <DetailTextInput 
                                name="brand" 
                                label="Marka" 
                                prefixIcon={{ library: 'Feather', name: 'tag' }}
                                placeholder="Örn: Purina"
                                clearable 
                            />
                            <DetailTextInput 
                                name="quantity" 
                                label="Miktar *" 
                                keyboardType="numeric"
                                prefixIcon={{ library: 'Feather', name: 'hash' }}
                                placeholder="0"
                            />
                            <FormikSelectorGrid name="unit" label="Birim" options={unitOptions} />
                            <DetailTextInput 
                                name="purchase_price" 
                                label="Toplam Alış Fiyatı" 
                                keyboardType="numeric"
                                prefixIcon={{ library: 'FontAwesome5', name: 'lira-sign' }}
                                placeholder="0.00"
                                formatAsCurrency={true}
                            />
                            <View style={styles.calculatedField}>
                                <Text style={styles.calculatedLabel}>Birim Fiyat (Otomatik Hesaplanır)</Text>
                                <View style={styles.calculatedValue}>
                                    <Text style={styles.calculatedText}>
                                        {values.price_per_unit ? `${new Intl.NumberFormat('tr-TR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }).format(values.price_per_unit)} ₺/${unitOptions.find(u => u.value === values.unit)?.label || values.unit}` : '0,00 ₺'}
                                    </Text>
                                </View>
                            </View>
                        </DetailSection>

                        {/* Dates */}
                        <DetailSection
                            title="Tarih Bilgileri"
                            subtitle="Alış ve son kullanma tarihleri"
                            icon={{ library: 'Feather', name: 'calendar' }}
                            collapsible={true}
                        >
                            <FormikDatePickerField name="purchase_date" label="Alış Tarihi" asString />
                            <FormikDatePickerField name="expiry_date" label="Son Kullanma Tarihi" asString />
                        </DetailSection>

                        {/* Additional Info */}
                        <DetailSection
                            title="Ek Bilgiler"
                            subtitle="Tedarikçi ve depo bilgileri"
                            icon={{ library: 'Feather', name: 'more-horizontal' }}
                            collapsible={true}
                        >
                            <DetailTextInput 
                                name="supplier" 
                                label="Tedarikçi" 
                                prefixIcon={{ library: 'Feather', name: 'truck' }}
                                placeholder="Tedarikçi adı"
                                clearable 
                            />
                            <DetailTextInput 
                                name="storage_location" 
                                label="Depo Konumu" 
                                prefixIcon={{ library: 'Feather', name: 'map-pin' }}
                                placeholder="Depo bölümü"
                                clearable 
                            />
                            <DetailTextInput 
                                name="notes" 
                                label="Notlar"
                                multiline 
                                numberOfLines={4}
                                placeholder="Yem hakkında notlarınızı yazın..."
                                style={{ height: 100, textAlignVertical: 'top' }}
                            />
                        </DetailSection>

                        {/* Action Buttons */}
                        <View style={styles.actionSection}>
                            <DetailButton
                                title="Yemi Kaydet"
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
        calculatedField: {
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.md,
        },
        calculatedLabel: {
            ...theme.typography.styles.label,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm,
            fontWeight: '600',
        },
        calculatedValue: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.radius.lg,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderStyle: 'dashed',
        },
        calculatedText: {
            ...theme.typography.styles.bodyLarge,
            color: theme.colors.primary,
            fontWeight: '700',
            textAlign: 'center',
        },
    });
};