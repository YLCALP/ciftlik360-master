import { Link, router } from 'expo-router';
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
    Dimensions,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';

import AuthButton from '../../components/auth/AuthButton';
import AuthTextInput from '../../components/auth/AuthTextInput';
import { FlashMessageService } from '../../components/common/FlashMessage';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../themes';

const SignUpValidationSchema = Yup.object().shape({
  name: Yup.string().required('Ad soyad gereklidir'),
  email: Yup.string().required('E-posta gereklidir').email('Geçersiz e-posta formatı'),
  farmName: Yup.string(),
  phone: Yup.string(),
  password: Yup.string().required('Şifre gereklidir').min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı gereklidir'),
});

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const theme = useTheme();
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;
  const isLandscape = width > height;

  async function handleSignUp(values, { setSubmitting }) {
    const { name, email, password, farmName, phone } = values;
    const { error } = await signUp(email, password, { name, farm_name: farmName, phone });

    if (error) {
      FlashMessageService.error('Kayıt Hatası', error.message);
    } else {
      FlashMessageService.success(
        'Başarılı!',
        'Hesabınız oluşturuldu. E-posta adresinizi doğruladıktan sonra giriş yapabilirsiniz.'
      );
      router.replace('/(auth)/signin');
    }
    setSubmitting(false);
  }
  
  const styles = getStyles(theme, { width, height, isTablet, isLargeScreen, isLandscape });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.contentContainer}>
          <View style={styles.contentWrapper}>
            <View style={styles.headerContainer}>
              <Text style={styles.appName}>
                Çiftlik365
              </Text>
              <Text style={styles.subtitle}>
                Hesap oluşturun ve başlayın
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                Kayıt Ol
              </Text>

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  farmName: '',
                  phone: '',
                }}
                validationSchema={SignUpValidationSchema}
                onSubmit={handleSignUp}>
                <View style={styles.formFields}>
                  <AuthTextInput name="name" label="Ad Soyad *" placeholder="Adınız ve soyadınız" autoCapitalize="words" />
                  <AuthTextInput name="email" label="E-posta *" placeholder="ornek@email.com" keyboardType="email-address" autoCapitalize="none" />
                  <AuthTextInput name="farmName" label="Çiftlik Adı" placeholder="Çiftliğinizin adı" autoCapitalize="words" />
                  <AuthTextInput name="phone" label="Telefon" placeholder="+90 555 123 45 67" keyboardType="phone-pad" />
                  <AuthTextInput name="password" label="Şifre *" placeholder="En az 6 karakter" secureTextEntry />
                  <AuthTextInput name="confirmPassword" label="Şifre Tekrar *" placeholder="Şifrenizi tekrar girin" secureTextEntry />
                  <AuthButton title="Kayıt Ol" />
                </View>
              </Formik>

              <View style={styles.linkContainer}>
                <Text style={theme.styles.text('bodySmall', 'textSecondary')}>
                  Zaten hesabınız var mı?{' '}
                </Text>
                <Link href="/signin" asChild>
                  <TouchableOpacity>
                    <Text style={styles.linkButtonText}>
                      Giriş Yap
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme, { width, height, isTablet, isLargeScreen, isLandscape }) => {
  const containerPadding = isTablet ? theme.spacing['3xl'] : theme.spacing.xl;
  const formMaxWidth = isLargeScreen ? 420 : isTablet ? 380 : '100%';
  const formPadding = isTablet ? theme.spacing['2xl'] : theme.spacing.xl;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: containerPadding,
      paddingVertical: isLandscape && !isTablet ? theme.spacing.lg : containerPadding,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentWrapper: {
      width: '100%',
      maxWidth: formMaxWidth,
      flex: 1,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: isLandscape && !isTablet ? theme.spacing.lg : theme.spacing['2xl'],
      paddingTop: isLandscape && !isTablet ? theme.spacing.sm : 0,
    },
    appName: {
      ...theme.typography.styles.h1,
      fontSize: isTablet ? 32 : 28,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.styles.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontSize: isTablet ? 16 : 14,
    },
    formContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.spacing.radius.xl,
      padding: formPadding,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.spacing.shadows.md,
      shadowColor: theme.colors.shadow,
      flex: 1,
    },
    formTitle: {
      ...theme.typography.styles.h3,
      fontSize: isTablet ? 24 : 20,
      color: theme.colors.text,
      marginBottom: isTablet ? theme.spacing['2xl'] : theme.spacing.xl,
      textAlign: 'center',
    },
    formFields: {
      gap: isTablet ? theme.spacing.lg : theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    linkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      flexWrap: 'wrap',
    },
    linkButtonText: {
      ...theme.typography.styles.bodySmall,
      color: theme.colors.primary,
      fontWeight: theme.typography.weights.bold,
    },
  });
}; 