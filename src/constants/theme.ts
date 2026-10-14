import { Platform } from 'react-native';

/**
 * Palette FinTrack:
 * - Emerald green sebagai warna aksen utama.
 * - Putih (light) / dark navy (dark) sebagai latar.
 */

export const Emerald = {
  50: '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981',
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
} as const;

export const Navy = {
  700: '#1E2A3B',
  800: '#14213D',
  900: '#0B1526',
  950: '#070D18',
} as const;

export const Colors = {
  light: {
    text: '#0B1526',
    background: '#F8FAF9',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#ECFDF5',
    textSecondary: '#5B6470',
    // Token tambahan
    surface: '#FFFFFF',
    border: '#E3E8E7',
    primary: '#10B981',
    primarySoft: '#D1FAE5',
    income: '#059669',
    expense: '#EF4444',
    warning: '#F59E0B',
    danger: '#EF4444',
    navyCard: '#0B1526',
    navyCardText: '#FFFFFF',
    navyCardSecondary: '#A7B3C6',
    overlay: 'rgba(11, 21, 38, 0.45)',
  },
  dark: {
    text: '#F1F5F9',
    background: '#070D18',
    backgroundElement: '#14213D',
    backgroundSelected: '#1E2A3B',
    textSecondary: '#8D97A8',
    // Token tambahan
    surface: '#14213D',
    border: '#233248',
    primary: '#10B981',
    primarySoft: '#0F3D2F',
    income: '#34D399',
    expense: '#F87171',
    warning: '#FBBF24',
    danger: '#F87171',
    navyCard: '#0B1526',
    navyCardText: '#FFFFFF',
    navyCardSecondary: '#A7B3C6',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
