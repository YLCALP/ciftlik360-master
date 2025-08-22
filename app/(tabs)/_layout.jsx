import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { TabBarIcon } from '../../components/common/Icon';
import { getTabIcon } from '../../constants/iconMappings';
import { useTheme } from '../../themes/useTheme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarActiveTintColor: theme.colors.tabIconSelected,
        tabBarInactiveTintColor: theme.colors.tabIconDefault,
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: theme.colors.tabBackground,
          borderTopWidth: 0,
          ...theme.spacing.shadows.lg,
          shadowColor: theme.colors.primary,
        },
        tabBarLabelStyle: {
          ...theme.typography.styles.tabLabel,
          marginBottom: Platform.OS === 'android' ? 0 : 0,
          fontWeight: '700',
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => {
            const icon = getTabIcon('dashboard', focused);
            return (
              <TabBarIcon
                library={icon.library}
                name={icon.name}
                color={color}
                size={size}
                focused={focused}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="animals"
        options={{
          title: 'Hayvanlar',
          tabBarIcon: ({ color, size, focused }) => {
            const icon = getTabIcon('animals', focused);
            return (
              <TabBarIcon
                library={icon.library}
                name={icon.name}
                color={color}
                size={size}
                focused={focused}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="feeds"
        options={{
          title: 'Yemler',
          tabBarIcon: ({ color, size, focused }) => {
            const icon = getTabIcon('feeds', focused);
            return (
              <TabBarIcon
                library={icon.library}
                name={icon.name}
                color={color}
                size={size}
                focused={focused}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="finances"
        options={{
          title: 'Finans',
          tabBarIcon: ({ color, size, focused }) => {
            const icon = getTabIcon('finances', focused);
            return (
              <TabBarIcon
                library={icon.library}
                name={icon.name}
                color={color}
                size={size}
                focused={focused}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => {
            const icon = getTabIcon('profile', focused);
            return (
              <TabBarIcon
                library={icon.library}
                name={icon.name}
                color={color}
                size={size}
                focused={focused}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'android' ? 70 : 80,
    paddingBottom: Platform.OS === 'android' ? 15 : 20,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});


