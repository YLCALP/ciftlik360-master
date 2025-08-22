import { Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import * as Yup from 'yup';
import { FlashMessageService } from '../../components/common/FlashMessage';
import DetailHeader from '../../components/detail/DetailHeader';
import DetailSection from '../../components/detail/DetailSection';
import DetailButton from '../../components/forms/DetailButton';
import DetailTextInput from '../../components/forms/DetailTextInput';
import FormikDatePickerField from '../../components/forms/FormikDatePickerField';
import FormikSelectorGrid from '../../components/forms/FormikSelectorGrid';
import { farmAPI } from '../../services/api';
import { useTheme } from '../../themes';
import { useFarm } from '../../contexts/FarmContext';

const FarmInfoSchema = Yup.object().shape({
  farm_name: Yup.string().required('Çiftlik adı zorunludur'),
  owner_name: Yup.string(),
  farm_type: Yup.string(),
  address: Yup.string(),
  city: Yup.string(),
  province: Yup.string(),
  postal_code: Yup.string(),
  phone: Yup.string(),
  email: Yup.string(),
  established_date: Yup.mixed(),
  total_area: Yup.string(),
  livestock_capacity: Yup.string(),
  notes: Yup.string(),
});

const farmTypeOptions = [
    { value: 'dairy', label: 'Süt Çiftliği', emoji: '🥛' },
    { value: 'livestock', label: 'Besi Çiftliği', emoji: '🐄' },
    { value: 'poultry', label: 'Tavukçuluk', emoji: '🐔' },
    { value: 'mixed', label: 'Karma Çiftlik', emoji: '🏡' },
    { value: 'other', label: 'Diğer', emoji: '🌾' },
];


export default function FarmInfoScreen() {
    const [farmInfo, setFarmInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const theme = useTheme();
    const { farm: activeFarm, permissions = {}, refreshFarm } = useFarm();
    const styles = getStyles(theme);

    const loadFarmInfo = useCallback(async () => {
        try {
            setLoading(true);
            // Basitleştirilmiş API - getUserFarm() kullan (parametre yok)
            const data = await farmAPI.getUserFarm();
            if (data) {
                setFarmInfo({
                    ...data,
                    established_date: data.established_date ? new Date(data.established_date) : new Date(),
                    total_area: String(data.total_area || ''),
                    livestock_capacity: String(data.livestock_capacity || ''),
                });
                setIsEditing(false);
            } else {
                // Çiftlik bilgisi yoksa yeni oluşturma modunda başla
                setFarmInfo(getInitialValues());
                setIsEditing(true); // Yeni oluşturma için otomatik edit modu
            }
        } catch (error) {
            console.error('Load farm info error:', error);
            FlashMessageService.error('Hata', 'Çiftlik bilgileri yüklenirken hata oluştu.');
            setFarmInfo(getInitialValues());
            setIsEditing(true); // Hata durumunda da edit modu
        } finally {
            setLoading(false);
        }
    }, [permissions?.canEditFarm]);

    useEffect(() => { loadFarmInfo(); }, [loadFarmInfo]);

    const getInitialValues = () => ({
        farm_name: activeFarm?.farm_name || '',
        owner_name: '',
        farm_type: 'mixed',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        phone: '',
        email: '',
        established_date: new Date(),
        total_area: '',
        livestock_capacity: '',
        notes: '',
    });

    const handleSave = async (values, { setSubmitting }) => {
        console.log('handleSave çağrıldı, values:', values);
        console.log('farmInfo:', farmInfo);
        
        try {
            const farmData = {
                ...values,
                established_date: values.established_date ? new Date(values.established_date).toISOString().split('T')[0] : null,
                total_area: values.total_area && values.total_area !== '' ? parseFloat(values.total_area) : null,
                livestock_capacity: values.livestock_capacity && values.livestock_capacity !== '' ? parseInt(values.livestock_capacity) : null,
            };

            console.log('Gönderilecek farmData:', farmData);

            let result;
            if (farmInfo && farmInfo.id) {
                // Güncelleme - basitleştirilmiş API
                console.log('Güncelleme yapılıyor...');
                result = await farmAPI.updateFarm(farmData);
                FlashMessageService.success('Başarılı', 'Çiftlik bilgileri güncellendi.');
            } else {
                // Yeni oluşturma - basitleştirilmiş API
                console.log('Yeni çiftlik oluşturuluyor...');
                result = await farmAPI.createFarm(farmData);
                FlashMessageService.success('Başarılı', 'Çiftlik bilgileri oluşturuldu.');
            }

            console.log('API sonucu:', result);
            await loadFarmInfo(); // Verileri yeniden yükle
            if (refreshFarm) {
                await refreshFarm(); // Context'teki aktif çiftliği de güncelle
            }
        } catch (error) {
            console.error('Save farm info error:', error);
            FlashMessageService.error('Hata', 'Çiftlik bilgileri kaydedilirken hata oluştu: ' + error.message);
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
                    <Text style={styles.loadingText}>Çiftlik bilgileri yükleniyor...</Text>
                </View>
            </View>
        );
    }

   

    if (!farmInfo) {
        return (
            <View style={styles.container}>
                <DetailHeader title="Veri Yok" />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Çiftlik bilgileri bulunamadı.</Text>
                </View>
            </View>
        );
    }

    const farmEmoji = farmTypeOptions.find(f => f.value === farmInfo?.farm_type)?.emoji || '🏡';

    return (
        <View style={styles.container}>
            <Formik
                initialValues={farmInfo}
                onSubmit={handleSave}
                enableReinitialize
                validate={(values) => {
                    const errors = {};
                    if (!values.farm_name || values.farm_name.trim() === '') {
                        errors.farm_name = 'Çiftlik adı zorunludur';
                    }
                    console.log('Validation errors:', errors);
                    return errors;
                }}
            >
                {({ values, isSubmitting, handleSubmit }) => (
                    <>
                        <DetailHeader
                            title={values.farm_name || 'Çiftlik Bilgileri'}
                            subtitle={values.owner_name ? `Sahip: ${values.owner_name}` : 'Çiftlik bilgilerinizi yönetin'}
                            emoji={farmEmoji}
                            rightActions={[
                                {
                                    icon: { library: 'Feather', name: isEditing ? 'eye' : 'edit-3' },
                                    onPress: () => setIsEditing(!isEditing)
                                }
                            ]}
                            gradient={true}
                        />

                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        >
                            <ScrollView 
                                style={styles.scrollView} 
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContent}
                            >
                                {/* Çiftlik Türü */}
                                <DetailSection
                                    title="Çiftlik Türü"
                                    icon={{ library: 'MaterialCommunityIcons', name: 'barn' }}
                                    showDivider={false}
                                >
                                    <FormikSelectorGrid 
                                        name="farm_type" 
                                        options={farmTypeOptions} 
                                        disabled={!isEditing}
                                    />
                                </DetailSection>

                                {/* Temel Bilgiler */}
                                <DetailSection
                                    title="Temel Bilgiler"
                                    subtitle="Çiftlik kimlik bilgileri"
                                    icon={{ library: 'Feather', name: 'info' }}
                                >
                                    <DetailTextInput 
                                        name="farm_name" 
                                        label="Çiftlik Adı *" 
                                        prefixIcon={{ library: 'Feather', name: 'home' }}
                                        placeholder="Örn: Mutlu Çiftlik"
                                        clearable
                                        editable={isEditing}
                                    />
                                    <DetailTextInput 
                                        name="owner_name" 
                                        label="Sahip Adı" 
                                        prefixIcon={{ library: 'Feather', name: 'user' }}
                                        placeholder="Çiftlik sahibinin adı"
                                        clearable
                                        editable={isEditing}
                                    />
                                    <FormikDatePickerField 
                                        name="established_date" 
                                        label="Kuruluş Tarihi"
                                        disabled={!isEditing}
                                    />
                                </DetailSection>

                                {/* Lokasyon Bilgileri */}
                                <DetailSection
                                    title="Lokasyon"
                                    subtitle="Adres ve konum bilgileri"
                                    icon={{ library: 'Feather', name: 'map-pin' }}
                                    collapsible={true}
                                >
                                    <DetailTextInput 
                                        name="address" 
                                        label="Adres" 
                                        prefixIcon={{ library: 'Feather', name: 'map-pin' }}
                                        placeholder="Tam adres"
                                        multiline
                                        numberOfLines={3}
                                        style={{ height: 80, textAlignVertical: 'top' }}
                                        editable={isEditing}
                                    />
                                    <DetailTextInput 
                                        name="city" 
                                        label="İlçe/İl" 
                                        prefixIcon={{ library: 'Feather', name: 'map' }}
                                        placeholder="Örn: Merkez/Ankara"
                                        clearable
                                        editable={isEditing}
                                    />
                                  
                                    <DetailTextInput 
                                        name="postal_code" 
                                        label="Posta Kodu" 
                                        prefixIcon={{ library: 'Feather', name: 'hash' }}
                                        placeholder="12345"
                                        keyboardType="numeric"
                                        editable={isEditing}
                                    />
                                </DetailSection>

                                {/* İletişim Bilgileri */}
                                <DetailSection
                                    title="İletişim"
                                    subtitle="Telefon ve e-posta"
                                    icon={{ library: 'Feather', name: 'phone' }}
                                    collapsible={true}
                                >
                                    <DetailTextInput 
                                        name="phone" 
                                        label="Telefon" 
                                        prefixIcon={{ library: 'Feather', name: 'phone' }}
                                        placeholder="+90 5XX XXX XX XX"
                                        keyboardType="phone-pad"
                                        clearable
                                        editable={isEditing}
                                    />
                                    <DetailTextInput 
                                        name="email" 
                                        label="E-posta" 
                                        prefixIcon={{ library: 'Feather', name: 'mail' }}
                                        placeholder="ornek@email.com"
                                        keyboardType="email-address"
                                        clearable
                                        editable={isEditing}
                                    />
                                </DetailSection>

                                {/* Teknik Bilgiler */}
                                <DetailSection
                                    title="Teknik Bilgiler"
                                    subtitle="Kapasite ve alan bilgileri"
                                    icon={{ library: 'Feather', name: 'trending-up' }}
                                    collapsible={true}
                                >
                                    <DetailTextInput 
                                        name="total_area" 
                                        label="Toplam Alan (Hektar)" 
                                        prefixIcon={{ library: 'Feather', name: 'square' }}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        editable={isEditing}
                                    />
                                    <DetailTextInput 
                                        name="livestock_capacity" 
                                        label="Hayvan Kapasitesi" 
                                        prefixIcon={{ library: 'MaterialCommunityIcons', name: 'cow' }}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        editable={isEditing}
                                    />
                                </DetailSection>

                                {/* Notlar */}
                                <DetailSection
                                    title="Notlar"
                                    subtitle="Ek bilgiler ve notlar"
                                    icon={{ library: 'Feather', name: 'edit-3' }}
                                    collapsible={true}
                                >
                                    <DetailTextInput 
                                        name="notes" 
                                        label="Notlar"
                                        multiline 
                                        numberOfLines={4}
                                        placeholder="Çiftliğiniz hakkında ek bilgiler..."
                                        style={{ height: 100, textAlignVertical: 'top' }}
                                        editable={isEditing}
                                    />
                                </DetailSection>

                                {/* Action Buttons - Sadece düzenleme modundayken ve yetki varken göster */}
                                {isEditing && (
                                    <View style={styles.actionSection}>
                                        <DetailButton
                                            title="Kaydet"
                                            onPress={() => {
                                                console.log('Kaydet butonuna tıklandı');
                                                handleSubmit();
                                            }}
                                            loading={isSubmitting}
                                            leadingIcon={{ library: 'Feather', name: 'save' }}
                                            fullWidth
                                            size="lg"
                                        />

                                    </View>
                                )}
                            
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