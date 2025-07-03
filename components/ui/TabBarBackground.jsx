import { BlurView } from 'expo-blur';
import { useColorScheme } from '../../hooks/useColorScheme';

export function BlurTabBarBackground() {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <BlurView
      tint={colorScheme}
      intensity={100}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return 16; // Default bottom spacing
} 