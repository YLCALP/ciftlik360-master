import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CustomFlashMessage } from '../components/common/FlashMessage';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

const fonts = {
  SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
};

function RootLayoutNav() {
  const { theme, isThemeLoading } = useTheme();

  const navigationTheme = useMemo(
    () => (theme === 'dark' ? DarkTheme : DefaultTheme),
    [theme]
  );

  if (isThemeLoading) {
    return null; // or a loading indicator
  }

  return (
    <NavThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="+not-found"
          options={{
            title: 'Sayfa Bulunamadı',
            headerShown: true,
          }}
        />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <CustomFlashMessage />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(fonts);

  // Handle font loading error
  if (error) {
    console.error('Font loading error:', error);
  }

  // Show loading state only in development
  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
