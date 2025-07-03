/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useMemo } from 'react';
import { Colors } from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

export function useThemeColor(props, colorName) {
  const theme = useColorScheme() ?? 'light';
  
  return useMemo(() => {
    const colorFromProps = props[theme];
    
    if (colorFromProps) {
      return colorFromProps;
    }
    
    return Colors[theme][colorName];
  }, [props, theme, colorName]);
} 