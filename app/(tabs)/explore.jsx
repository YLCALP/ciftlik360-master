import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashMessageService } from '../../components/common/FlashMessage';
import { Icon } from '../../components/common/Icon';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';
import { useTheme } from '../../themes/useTheme';

const SettingsScreen = () => {
  const { user, signOut } = useAuth();
  const { themeMode, setTheme, isDark } = useTheme();
  const theme = useTheme();
  const [userProfile, setUserProfile] = useState({ name: '', farm_name: '' });

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const profile = await userAPI.getUserProfile();
        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Failed to load user profile", error);
      }
    }
    loadUserProfile();
  }, []);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    FlashMessageService.show({
      message: 'Çıkış Yap',
      description: 'Çıkış yapılıyor, lütfen bekleyin...',
      type: 'info',
      autoHide: false,
      hideOnPress: false,
    });

    try {
      await signOut();
      router.replace('/signin');
      FlashMessageService.hide();
      FlashMessageService.success('Başarıyla çıkış yaptınız');

    } catch (error) {
      FlashMessageService.error(
        'Hata',
        'Çıkış yapılırken bir hata oluştu.'
      );
    }
  };

  const menuItems = [
    {
      id: 'account',
      title: 'Hesap Bilgileri',
      description: 'Kişisel bilgilerinizi düzenleyin',
      icon: 'person-outline',
      action: () =>
        FlashMessageService.info(
          'Bilgi',
          'Hesap bilgileri sayfası geliştiriliyor...'
        ),
    },
    {
      id: 'farm',
      title: 'Çiftlik Bilgileri',
      description: 'Çiftlik adı ve lokasyon ayarları',
      icon: 'home-outline',
      action: () => router.push('/farm/info'),
    },
   
    {
      id: 'about',
      title: 'Uygulama Hakkında',
      description: 'Sürüm bilgileri ve yasal metin',
      icon: 'information-circle-outline',
      action: () =>
        FlashMessageService.info(
          'Çiftlik365',
          'Versiyon 1.0.0\n\nModern çiftlik yönetim uygulaması'
        ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{userProfile.name || user?.email}</Text>
          <Text style={styles.userEmail}>{userProfile.farm_name || user?.email}</Text>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>

          {/* Dark Mode */}
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Icon library="Feather" name="moon" size={24} color={theme.colors.text} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Karanlık Mod</Text>
              <Text style={styles.cardDescription}>
                Karanlık tema {isDark ? 'aktif' : 'pasif'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.card}
            />
          </View>

          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={item.action}
            >
              <View style={styles.cardIcon}>
                <Icon library="Ionicons" name={item.icon} size={24} color={theme.colors.text} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
              <Icon
                library="Feather"
                name="chevron-right"
                size={20}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 0,
    },
    userInfoSection: {
      alignItems: 'center',
      paddingVertical: 32,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 40,
      fontWeight: 'bold',
      color: theme.colors.primaryText,
    },
    userName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    userEmail: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    appInfoSection: {
      alignItems: 'center',
      paddingVertical: 32,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    appLogo: {
      fontSize: 40,
      marginBottom: 8,
    },
    appName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    appSlogan: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    settingsSection: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 16,
      textTransform: 'uppercase',
    },
    card: {
      backgroundColor: theme.colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    cardTextContainer: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    cardDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    signOutButton: {
      marginHorizontal: 16,
      marginTop: 24,
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    signOutButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.error,
    },
  });

export default SettingsScreen;
