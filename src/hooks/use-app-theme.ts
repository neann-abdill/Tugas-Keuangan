import { useColorScheme } from 'react-native';

import type { ThemePreference } from '@/types';

/** Resolve preferensi tema ('system' | 'light' | 'dark') ke 'light' | 'dark'. */
export function useAppTheme(preference: ThemePreference): 'light' | 'dark' {
  const scheme = useColorScheme();
  if (preference === 'system') {
    return scheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}
