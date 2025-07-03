import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../themes/useTheme';

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();

  const handleAnimalsTabPress = () => {
    // Animals tab'ına basıldığında her zaman index sayfasına git
    router.replace('/animals');
  };

  const handleFeedsTabPress = () => {
    // Feeds tab'ına basıldığında her zaman index sayfasına git
    router.replace('/feeds');
  };

  const handleFinancesTabPress = () => {
    // Finances tab'ına basıldığında her zaman index sayfasına git
    router.replace('/finances');
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabIconSelected,
        tabBarInactiveTintColor: theme.colors.tabIconDefault,
        tabBarStyle: {
          ...theme.styles.tabBar?.base || styles.tabBar,
          backgroundColor: theme.colors.tabBackground,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          ...theme.typography.styles.tabLabel,
          marginBottom: Platform.OS === 'android' ? 2 : 0,
        },
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="animals"
        options={{
          title: 'Hayvanlar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw-outline" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleAnimalsTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="feeds"
        options={{
          title: 'Yemler',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleFeedsTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="finances"
        options={{
          title: 'Finans',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleFinancesTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'android' ? 75 : 85,
    paddingBottom: Platform.OS === 'android' ? 30 : 30,
    paddingTop: 8,
  },
});


