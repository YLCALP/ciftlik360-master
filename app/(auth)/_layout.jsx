import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#ffffff',
          },
        }}>
        <Stack.Screen name="signin" options={{ title: 'Giriş Yap' }} />
        <Stack.Screen name="signup" options={{ title: 'Kayıt Ol' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
} 