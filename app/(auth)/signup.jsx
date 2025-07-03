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
  
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={theme.styles.text('h1')}>
              Çiftlik365
            </Text>
            <Text style={theme.styles.text('body', 'textSecondary')}>
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
              <>
                <AuthTextInput name="name" label="Ad Soyad *" placeholder="Adınız ve soyadınız" autoCapitalize="words" />
                <AuthTextInput name="email" label="E-posta *" placeholder="ornek@email.com" keyboardType="email-address" autoCapitalize="none" />
                <AuthTextInput name="farmName" label="Çiftlik Adı" placeholder="Çiftliğinizin adı" autoCapitalize="words" />
                <AuthTextInput name="phone" label="Telefon" placeholder="+90 555 123 45 67" keyboardType="phone-pad" />
                <AuthTextInput name="password" label="Şifre *" placeholder="En az 6 karakter" secureTextEntry />
                <AuthTextInput name="confirmPassword" label="Şifre Tekrar *" placeholder="Şifrenizi tekrar girin" secureTextEntry />
                <AuthButton title="Kayıt Ol" />
              </>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing['2xl'],
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  linkButtonText: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
}); 