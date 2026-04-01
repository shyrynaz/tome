import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export const NAV_THEME = {
  light: {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      background: '#fafaf9',
      border: '#e5e5e5',
      card: '#ffffff',
      notification: '#ef4444',
      primary: '#22c55e',
      text: '#0f0f0f',
    },
  },
  dark: {
    ...DarkTheme,
    dark: true,
    colors: {
      ...DarkTheme.colors,
      background: '#0f0f0f',
      border: '#2a2a2a',
      card: '#1a1a1a',
      notification: '#ef4444',
      primary: '#22c55e',
      text: '#fafaf9',
    },
  },
} as const;
