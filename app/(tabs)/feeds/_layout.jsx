import { Stack } from 'expo-router';

export default function FeedsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Yemler',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="add" 
        options={{ 
          title: 'Yem Ekle',
          headerShown: false,
          tabBarStyle: { display: 'none' }
        }} 
      />
      <Stack.Screen 
        name="detail/[id]" 
        options={{ 
          title: 'Yem Detayı',
          headerShown: false,
          tabBarStyle: { display: 'none' }
        }} 
      />
    </Stack>
  );
} 