import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

export const ThemeContext = createContext({
  theme: 'light',
  isThemeLoading: true,
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme) {
          setTheme(storedTheme);
        } else {
          setTheme(Appearance.getColorScheme() ?? 'light');
        }
      } catch (error) {
        console.error('Failed to load theme from storage', error);
        setTheme(Appearance.getColorScheme() ?? 'light');
      } finally {
        setIsThemeLoading(false);
      }
    };

    loadTheme();
  }, []);

  const updateTheme = useCallback(async (newTheme) => {
    try {
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme to storage', error);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isThemeLoading, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext); 