import { Stack } from 'expo-router';

export default function FinancesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="add" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="detail/[id]" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="reports" 
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
} 