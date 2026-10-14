import { Colors, type ThemeColor } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useData } from '@/store/data-context';

/**
 * Warna aktif aplikasi dengan urutan:
 * preferensi pengguna di pengaturan > skema sistem.
 */
export function useTheme() {
  const { settings } = useData();
  const resolved = useAppTheme(settings.theme);
  return Colors[resolved];
}

export type { ThemeColor };
