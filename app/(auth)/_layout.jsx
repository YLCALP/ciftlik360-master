import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Dimensions } from 'react-native';
import { useTheme } from '../../themes';

export default function AuthLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { width } = Dimensions.get('window');

  const getContentStyle = () => ({
    backgroundColor: theme.colors.background,
    flex: 1,
    width: '100%',
    maxWidth: width > 768 ? 480 : '100%',
    alignSelf: 'center',
  });

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: getContentStyle(),
          presentation: 'card',
          animation: 'slide_from_right',
        }}>
        <Stack.Screen 
          name="signin" 
          options={{ 
            title: 'Giriş Yap',
            gestureEnabled: true,
          }} 
        />
        <Stack.Screen 
          name="signup" 
          options={{ 
            title: 'Kayıt Ol',
            gestureEnabled: true,
          }} 
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
    </>
  );
} 