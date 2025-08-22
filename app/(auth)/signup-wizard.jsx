import { Link, router } from 'expo-router';
import { Formik } from 'formik';
import React, { useState, useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';

import AuthButton from '../../components/auth/AuthButton';
import AuthTextInput from '../../components/auth/AuthTextInput';
import DetailButton from '../../components/forms/DetailButton';
import FormikSelectorGrid from '../../components/forms/FormikSelectorGrid';
import { FlashMessageService } from '../../components/common/FlashMessage';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../themes';

// Validation schemas for each step
const stepValidationSchemas = {
  1: Yup.object().shape({
    name: Yup.string().required('Ad soyad gereklidir').min(3, 'En az 3 karakter olmalıdır'),
    email: Yup.string().required('E-posta gereklidir').email('Geçersiz e-posta formatı'),
  }),
  2: Yup.object().shape({
    farmName: Yup.string().required('Çiftlik adı zorunludur').min(3, 'En az 3 karakter olmalıdır'),
    farmType: Yup.string().required('Çiftlik türü seçmelisiniz'),
  }),
  3: Yup.object().shape({
    phone: Yup.string(),
    city: Yup.string(),
  }),
  4: Yup.object().shape({
    password: Yup.string().required('Şifre gereklidir').min(6, 'Şifre en az 6 karakter olmalıdır'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
      .required('Şifre tekrarı gereklidir'),
  }),
};

const farmTypeOptions = [
  { value: 'dairy', label: 'Süt Çiftliği', emoji: '🥛' },
  { value: 'livestock', label: 'Besi Çiftliği', emoji: '🐄' },
  { value: 'poultry', label: 'Tavukçuluk', emoji: '🐔' },
  { value: 'mixed', label: 'Karma', emoji: '🏡' },
  { value: 'other', label: 'Diğer', emoji: '🌾' },
];

export default function SignUpWizardScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const theme = useTheme();
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;
  const isLandscape = width > height;
  const totalSteps = 4;

  const styles = useMemo(
    () => getStyles(theme, { width, height, isTablet, isLargeScreen, isLandscape }),
    [theme, width, height, isTablet, isLargeScreen, isLandscape]
  );

  const initialValues = {
    name: '',
    email: '',
    farmName: '',
    farmType: 'mixed',
    phone: '',
    city: '',
    password: '',
    confirmPassword: '',
  };

  const validateCurrentStep = useCallback(async (values) => {
    try {
      await stepValidationSchemas[currentStep].validate(
        values,
        { abortEarly: false }
      );
      return true;
    } catch (error) {
      if (error.errors && error.errors.length > 0) {
        FlashMessageService.error('Hata', error.errors[0]);
      }
      return false;
    }
  }, [currentStep]);

  const handleNextStep = useCallback(async (values) => {
    const isValid = await validateCurrentStep(values);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps, validateCurrentStep]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSignUp = useCallback(async (values) => {
    try {
      setIsSubmitting(true);
      
      const { name, email, password, farmName, farmType, phone, city } = values;
      
      // Create auth user with metadata (trigger will handle the rest)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            farmName,
            farmType,
            city,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      // Success - now create user profile and farm manually with RPC
      if (authData?.user) {
        // Create user and farm using RPC (no triggers)
        try {
          const { data: profileResult, error: profileError } = await supabase.rpc('create_user_and_farm_manual', {
            p_user_id: authData.user.id,
            p_email: email,
            p_user_name: name,
            p_farm_name: farmName || null,
            p_farm_type: farmType || 'mixed',
            p_phone: phone || null,
            p_city: city || null,
          });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            FlashMessageService.error('Profil Hatası', 'Kullanıcı profili oluşturulamadı, lütfen tekrar deneyin.');
            return;
          }

          console.log('Profile created successfully:', profileResult);
        } catch (rpcError) {
          console.error('RPC error:', rpcError);
          FlashMessageService.error('Profil Hatası', 'Kullanıcı profili oluşturulamadı, lütfen tekrar deneyin.');
          return;
        }
        
        FlashMessageService.success(
          'Başarılı!',
          'Hesabınız oluşturuldu. E-posta adresinizi doğruladıktan sonra giriş yapabilirsiniz.'
        );
        router.replace('/(auth)/signin');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      FlashMessageService.error('Kayıt Hatası', error.message || 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepWrapper}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= step && styles.stepCircleActive,
              currentStep === step && styles.stepCircleCurrent,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep >= step && styles.stepNumberActive,
              ]}
            >
              {currentStep > step ? '✓' : step}
            </Text>
          </View>
          {step < totalSteps && (
            <View
              style={[
                styles.stepLine,
                currentStep > step && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStepContent = (values, errors, touched) => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepEmoji}>👤</Text>
              <Text style={styles.stepTitle}>Kişisel Bilgiler</Text>
              <Text style={styles.stepSubtitle}>
                Adınızı ve e-posta adresinizi girin
              </Text>
            </View>
            
            <View style={styles.formFields}>
              <AuthTextInput
                name="name"
                label="Ad Soyad *"
                placeholder="Adınız ve soyadınız"
                autoCapitalize="words"
                autoFocus
              />
              <AuthTextInput
                name="email"
                label="E-posta *"
                placeholder="ornek@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepEmoji}>🚜</Text>
              <Text style={styles.stepTitle}>Çiftlik Bilgileri</Text>
              <Text style={styles.stepSubtitle}>
                Çiftliğinizin temel bilgilerini girin
              </Text>
            </View>

            <View style={styles.formFields}>
              <AuthTextInput
                name="farmName"
                label="Çiftlik Adı *"
                placeholder="Çiftliğinizin adı"
                autoCapitalize="words"
                autoFocus
              />
              
              <View style={styles.selectorContainer}>
                <Text style={styles.selectorLabel}>Çiftlik Türü *</Text>
                <FormikSelectorGrid
                  name="farmType"
                  options={farmTypeOptions}
                  columns={2}
                />
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepEmoji}>📍</Text>
              <Text style={styles.stepTitle}>İletişim Bilgileri</Text>
              <Text style={styles.stepSubtitle}>
                İletişim bilgilerinizi girin (opsiyonel)
              </Text>
            </View>

            <View style={styles.formFields}>
              <AuthTextInput
                name="phone"
                label="Telefon"
                placeholder="+90 555 123 45 67"
                keyboardType="phone-pad"
                autoFocus
              />
              <AuthTextInput
                name="city"
                label="Şehir"
                placeholder="Örn: Ankara"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.skipInfo}>
              <Text style={styles.skipInfoText}>
                Bu bilgileri daha sonra da ekleyebilirsiniz
              </Text>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepEmoji}>🔐</Text>
              <Text style={styles.stepTitle}>Güvenlik</Text>
              <Text style={styles.stepSubtitle}>
                Hesabınız için güçlü bir şifre belirleyin
              </Text>
            </View>

            <View style={styles.formFields}>
              <AuthTextInput
                name="password"
                label="Şifre *"
                placeholder="En az 6 karakter"
                secureTextEntry
                autoFocus
              />
              <AuthTextInput
                name="confirmPassword"
                label="Şifre Tekrar *"
                placeholder="Şifrenizi tekrar girin"
                secureTextEntry
              />
            </View>

            <View style={styles.passwordHint}>
              <Text style={styles.passwordHintText}>
                💡 Güçlü bir şifre için büyük/küçük harf, rakam ve özel karakter kullanın
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.appName}>Çiftlik365</Text>
              <Text style={styles.headerSubtitle}>Hesap Oluşturma</Text>
            </View>

            {renderStepIndicator()}

            <Formik
              initialValues={initialValues}
              onSubmit={handleSignUp}
              validateOnChange={false}
              validateOnBlur={true}
            >
              {({ values, errors, touched, handleSubmit }) => (
                <>
                  {renderStepContent(values, errors, touched)}

                  <View style={styles.buttonContainer}>
                    {currentStep > 1 && (
                      <DetailButton
                        title="Geri"
                        onPress={handlePreviousStep}
                        variant="outline"
                        size="lg"
                        style={styles.backButton}
                      />
                    )}

                    {currentStep < totalSteps ? (
                      <DetailButton
                        title="İleri"
                        onPress={() => handleNextStep(values)}
                        leadingIcon={{ library: 'Feather', name: 'arrow-right' }}
                        size="lg"
                        style={styles.nextButton}
                      />
                    ) : (
                      <DetailButton
                        title="Hesap Oluştur"
                        onPress={handleSubmit}
                        loading={isSubmitting}
                        leadingIcon={{ library: 'Feather', name: 'check' }}
                        size="lg"
                        style={styles.submitButton}
                      />
                    )}
                  </View>
                </>
              )}
            </Formik>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Zaten hesabınız var mı?{' '}
              </Text>
              <Link href="/signin" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Giriş Yap</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const getStyles = (theme, { width, height, isTablet, isLargeScreen, isLandscape }) => {
  const containerPadding = isTablet ? theme.spacing['2xl'] : theme.spacing.lg;
  const maxContentWidth = isLargeScreen ? 500 : isTablet ? 450 : '100%';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: containerPadding,
      paddingVertical: containerPadding,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    appName: {
      ...theme.typography.styles.h1,
      fontSize: isTablet ? 36 : 32,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
      ...theme.typography.styles.body,
      color: theme.colors.textSecondary,
      fontSize: isTablet ? 16 : 14,
    },
    stepIndicatorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing['2xl'],
      paddingHorizontal: theme.spacing.md,
    },
    stepWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepCircle: {
      width: isTablet ? 40 : 36,
      height: isTablet ? 40 : 36,
      borderRadius: isTablet ? 20 : 18,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    stepCircleActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    stepCircleCurrent: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      ...theme.spacing.shadows.md,
      shadowColor: theme.colors.primary,
    },
    stepNumber: {
      ...theme.typography.styles.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.weights.bold,
      fontSize: isTablet ? 14 : 12,
    },
    stepNumberActive: {
      color: theme.colors.card,
    },
    stepLine: {
      width: isTablet ? 60 : 40,
      height: 2,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.xs,
    },
    stepLineActive: {
      backgroundColor: theme.colors.primary,
    },
    stepContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.spacing.radius.xl,
      padding: isTablet ? theme.spacing['2xl'] : theme.spacing.xl,
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.spacing.shadows.sm,
      shadowColor: theme.colors.shadow,
      maxWidth: maxContentWidth,
      alignSelf: 'center',
      width: '100%',
    },
    stepHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    stepEmoji: {
      fontSize: isTablet ? 48 : 40,
      marginBottom: theme.spacing.sm,
    },
    stepTitle: {
      ...theme.typography.styles.h2,
      fontSize: isTablet ? 26 : 22,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    stepSubtitle: {
      ...theme.typography.styles.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontSize: isTablet ? 15 : 13,
      paddingHorizontal: theme.spacing.md,
    },
    formFields: {
      gap: theme.spacing.md,
    },
    selectorContainer: {
      marginTop: theme.spacing.sm,
    },
    selectorLabel: {
      ...theme.typography.styles.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      fontSize: isTablet ? 14 : 12,
    },
    skipInfo: {
      backgroundColor: theme.colors.primaryLight + '10',
      borderRadius: theme.spacing.radius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    skipInfoText: {
      ...theme.typography.styles.bodySmall,
      color: theme.colors.primary,
      textAlign: 'center',
      fontSize: isTablet ? 13 : 11,
    },
    passwordHint: {
      backgroundColor: theme.colors.warningLight + '10',
      borderRadius: theme.spacing.radius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    passwordHintText: {
      ...theme.typography.styles.bodySmall,
      color: theme.colors.warning,
      fontSize: isTablet ? 13 : 11,
      lineHeight: 18,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
      maxWidth: maxContentWidth,
      alignSelf: 'center',
      width: '100%',
    },
    backButton: {
      flex: 1,
    },
    nextButton: {
      flex: 2,
    },
    submitButton: {
      flex: 1,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
    footerText: {
      ...theme.typography.styles.body,
      color: theme.colors.textSecondary,
      fontSize: isTablet ? 14 : 12,
    },
    footerLink: {
      ...theme.typography.styles.body,
      color: theme.colors.primary,
      fontWeight: theme.typography.weights.bold,
      fontSize: isTablet ? 14 : 12,
    },
  });
};