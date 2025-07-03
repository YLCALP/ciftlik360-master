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

const SignInValidationSchema = Yup.object().shape({
  email: Yup.string().required('E-posta gereklidir').email('Geçersiz e-posta formatı'),
  password: Yup.string().required('Şifre gereklidir'),
});

export default function SignInScreen() {
  const { signIn } = useAuth();
  const theme = useTheme();

  async function handleSignIn(values, { setSubmitting }) {
    const { error } = await signIn(values.email, values.password);

    if (error) {
      FlashMessageService.error('Giriş Hatası', error.message);
    } else {
      FlashMessageService.success('Başarıyla giriş yaptınız!');
      router.replace('/(tabs)');
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
            <Text style={styles.logo}>🐄</Text>
            <Text style={styles.appName}>Çiftlik360'a Hoş Geldiniz</Text>
           
          </View>

          <View style={styles.formContainer}>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={SignInValidationSchema}
              onSubmit={handleSignIn}>
              <View style={styles.formFields}>
                <AuthTextInput
                  name="email"
                  label="E-posta"
                  placeholder="ornek@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <AuthTextInput
                  name="password"
                  label="Şifre"
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <AuthButton title="Giriş Yap" />
              </View>
            </Formik>
          </View>

          <View style={styles.linkContainer}>
            <Text style={theme.styles.text('bodySmall', 'textSecondary')}>
              Hesabınız yok mu?{' '}
            </Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.linkButtonText}>Kayıt Ol</Text>
              </TouchableOpacity>
            </Link>
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
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  logo: {
    fontSize: 60,
    marginBottom: theme.spacing.md,
  },
  appName: {
    ...theme.typography.styles.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  formContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.radius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.spacing.shadows.md,
    shadowColor: theme.colors.shadow,
  },
  formFields: {
    gap: theme.spacing.lg,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  linkButtonText: {
    ...theme.typography.styles.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
  },
}); 