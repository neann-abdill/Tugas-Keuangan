import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';

import { Colors } from '@/constants/theme';

export { DarkTheme, DefaultTheme, ThemeProvider };

type NavColors = {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
};

/** Tema navigasi yang mengikuti palet FinTrack (emerald / navy). */
export function navThemeFor(resolved: 'light' | 'dark') {
  const c = Colors[resolved];
  const colors: NavColors = {
    primary: c.primary,
    background: c.background,
    card: c.surface,
    text: c.text,
    border: c.border,
    notification: c.primary,
  };
  if (resolved === 'dark') {
    return { ...DarkTheme, colors: { ...DarkTheme.colors, ...colors } };
  }
  return { ...DefaultTheme, colors: { ...DefaultTheme.colors, ...colors } };
}
