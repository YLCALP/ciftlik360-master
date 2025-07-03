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
          headerShown: true,
          headerBackTitle: 'Geri'
        }} 
      />
      <Stack.Screen 
        name="detail/[id]" 
        options={{ 
          title: 'Yem Detayı',
          headerShown: true,
          headerBackTitle: 'Geri'
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Tüketim Ayarları',
          headerShown: true,
          headerBackTitle: 'Geri'
        }} 
      />
      <Stack.Screen 
        name="consumption-reports" 
        options={{ 
          title: 'Tüketim Raporları',
          headerShown: true,
          headerBackTitle: 'Geri'
        }} 
      />
    </Stack>
  );
} 