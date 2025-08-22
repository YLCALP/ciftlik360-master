import { Stack } from 'expo-router';

export default function FarmLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        presentation: 'card',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="info" 
        options={{
          title: 'Çiftlik Bilgileri',
          headerShown: false,
        }}
      />
    </Stack>
  );
}