import { Stack } from 'expo-router';

export default function AnimalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Hayvanlar',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="add" 
        options={{ 
          title: 'Hayvan Ekle',
          headerShown: false,
          headerBackTitle: 'Geri'
        }} 
      />
      <Stack.Screen 
        name="detail/[id]" 
        options={{ 
          title: 'Hayvan Detayı',
          headerShown: false,
          tabBarStyle: { display: 'none' }
        }} 
      />
    </Stack>
  );
} 