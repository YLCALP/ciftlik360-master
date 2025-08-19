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
        return (
            <View style={styles.container}>
                <DetailHeader title="Yükleniyor..." />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={theme.colors.primary} size="large" />
                    <Text style={styles.loadingText}>Yem bilgileri yükleniyor...</Text>
                </View>
            </View>
        );
    }

    if (!feed) {
        return (
            <View style={styles.container}>
                <DetailHeader title="Hata" />
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Yem bulunamadı</Text>
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

    const feedEmoji = feedTypeOptions.find(f => f.value === feed.feed_type)?.emoji || '🌾';
    const stockPercentage = Math.max(0, Math.min(100, (feed.quantity / 100) * 100)); // Assuming 100 as max stock
    const isLowStock = stockPercentage < 25;
    const isOutOfStock = stockPercentage <= 0;
    
    const getStockStatus = () => {
        if (isOutOfStock) return { status: 'error', label: 'Tükendi' };
        if (isLowStock) return { status: 'warning', label: 'Düşük Stok' };
        return { status: 'success', label: 'Uygun Stok' };
    };

    return (
        <View style={styles.container}>
            <Formik
                initialValues={feed}
                validationSchema={FeedSchema}
                onSubmit={handleSave}
                enableReinitialize
            >
                {({ values, isSubmitting, handleSubmit }) => (
                    <>
                        <DetailHeader
                            title={values.feed_name || 'Yem Detayı'}
                            subtitle={values.brand ? `${values.brand}` : 'Yem Bilgileri'}
                            emoji={feedEmoji}
                            statusBadge={getStockStatus()}
                            rightActions={[
                                {
                                    icon: { library: 'Feather', name: 'shopping-cart' },
                                    onPress: () => {} // Add reorder functionality
                                }
                            ]}
                            gradient={true}
                        />

                        <ScrollView 
                            style={styles.scrollView} 
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                        >
                            {/* Stock Status */}
                            <DetailSection
                                title="Stok Durumu"
                                subtitle={`Mevcut: ${values.quantity} ${values.unit}`}
                                icon={{ library: 'Feather', name: 'package' }}
                                showDivider={false}
                            >
                                <View style={styles.stockContainer}>
                                    <View style={styles.stockBar}>
                                        <View 
                                            style={[
                                                styles.stockProgress,
                                                { 
                                                    width: `${stockPercentage}%`,
                                                    backgroundColor: isOutOfStock ? theme.colors.error : isLowStock ? theme.colors.warning : theme.colors.success
                                                }
                                            ]} 
                                        />
                                    </View>
                                    <Text style={styles.stockText}>
                                        {stockPercentage.toFixed(0)}% Stok Seviyesi
                                    </Text>
                                </View>
                            </DetailSection>

                            {/* Feed Type */}
                            <DetailSection
                                title="Yem Türü"
                                icon={{ library: 'MaterialCommunityIcons', name: 'grain' }}
                                showDivider={false}
                            >
                                <FormikSelectorGrid name="feed_type" label="Yem Türü" options={feedTypeOptions} />
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
                                />
                                <FormikSelectorGrid name="unit" label="Birim" options={unitOptions} />
                                <DetailTextInput 
                                    name="price_per_unit" 
                                    label="Birim Fiyat" 
                                    keyboardType="numeric"
                                    prefixIcon={{ library: 'Feather', name: 'dollar-sign' }}
                                    placeholder="₺"
                                />
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
                                    title="Değişiklikleri Kaydet"
                                    onPress={handleSubmit}
                                    loading={isSubmitting}
                                    leadingIcon={{ library: 'Feather', name: 'save' }}
                                    fullWidth
                                    size="lg"
                                />

                                <DetailButton
                                    title="Yeniden Sipariş"
                                    variant="outline"
                                    onPress={() => {}} // Add reorder functionality
                                    leadingIcon={{ library: 'Feather', name: 'shopping-cart' }}
                                    fullWidth
                                    style={{ marginTop: theme.spacing.md }}
                                />
                            </View>
                        </ScrollView>
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
    stockContainer: {
        marginTop: theme.spacing.md,
    },
    stockBar: {
        height: 8,
        backgroundColor: theme.colors.border,
        borderRadius: theme.spacing.radius.sm,
        overflow: 'hidden',
        marginBottom: theme.spacing.sm,
    },
    stockProgress: {
        height: '100%',
        borderRadius: theme.spacing.radius.sm,
    },
    stockText: {
        ...theme.typography.styles.caption,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontWeight: '600',
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