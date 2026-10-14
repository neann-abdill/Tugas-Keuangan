import React from 'react';

import { Icon, type IconName } from '@/lib/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type EmptyStateProps = {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon = 'wallet', title, description, action }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedView type="backgroundSelected" style={styles.iconWrap}>
        <Icon name={icon} size={26} color={theme.primary} />
      </ThemedView>
      <ThemedText type="heading" style={styles.title}>
        {title}
      </ThemedText>
      {description ? (
        <ThemedText themeColor="textSecondary" style={styles.description}>
          {description}
        </ThemedText>
      ) : null}
      {action}
    </ThemedView>
  );
}

const styles = {
  container: {
    alignItems: 'center' as const,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.lg,
    gap: Spacing.two,
  } as const,
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: Spacing.one,
  } as const,
  title: {
    textAlign: 'center' as const,
  } as const,
  description: {
    textAlign: 'center' as const,
    marginBottom: Spacing.two,
  } as const,
};
