import type { ViewProps } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Radius } from '@/constants/theme';

type CardProps = ViewProps & {
  /** Container kartu utama; true = navy gelap, false = mengikuti tema. */
  navy?: boolean;
  elevated?: boolean;
};

export function Card({ navy, elevated = true, style, ...otherProps }: CardProps) {
  return (
    <ThemedView
      style={[styles.card, elevated && styles.elevated, navy && styles.navy, style]}
      {...otherProps}
    />
  );
}

const styles = {
  card: {
    borderRadius: Radius.lg,
    padding: 16,
  } as const,
  elevated: {
    shadowColor: '#0B1526',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  } as const,
  navy: {
    backgroundColor: '#0B1526',
  } as const,
};
