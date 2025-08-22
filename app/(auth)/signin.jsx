import { Link, router } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
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
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeScreen = width >= 1024;
  const isLandscape = width > height;

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

  const styles = getStyles(theme, { width, height, isTablet, isLargeScreen, isLandscape });

  return (
    <>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.contentContainer}>
          <View style={styles.contentWrapper}>
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
          </View>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const getStyles = (theme, { width, height, isTablet, isLargeScreen, isLandscape }) => {
  const containerPadding = isTablet ? theme.spacing['3xl'] : theme.spacing.xl;
  const formMaxWidth = isLargeScreen ? 420 : isTablet ? 380 : '100%';
  const logoSize = isTablet ? 80 : 60;
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentWrapper: {
      width: '100%',
      maxWidth: formMaxWidth,
      alignItems: 'stretch',
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: isLandscape && !isTablet ? theme.spacing.xl : theme.spacing['3xl'],
      paddingTop: isLandscape && !isTablet ? theme.spacing.lg : 0,
    },
    logo: {
      fontSize: logoSize,
      marginBottom: theme.spacing.md,
    },
    appName: {
      ...theme.typography.styles.h2,
      fontSize: isTablet ? 32 : 28,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    formContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.spacing.radius.xl,
      padding: formPadding,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.spacing.shadows.md,
      shadowColor: theme.colors.shadow,
      width: '100%',
    },
    formFields: {
      gap: isTablet ? theme.spacing.xl : theme.spacing.lg,
    },
    linkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
      flexWrap: 'wrap',
    },
    linkButtonText: {
      ...theme.typography.styles.body,
      color: theme.colors.primary,
      fontWeight: theme.typography.weights.bold,
    },
  });
}; 