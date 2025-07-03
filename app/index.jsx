import { Redirect } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '../components/ThemedView';
import { useAuth } from '../contexts/AuthContext';
import { useColorScheme } from '../hooks/useColorScheme';

export default function Index() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();

  const indicatorColor = useMemo(() => 
    colorScheme === 'dark' ? '#ffffff' : '#000000',
    [colorScheme]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={indicatorColor}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/signin" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 