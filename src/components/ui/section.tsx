import React from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/lib/icons';
import { Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <ThemedView style={styles.header}>
      <ThemedText type="heading">{title}</ThemedText>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.7 : 1 }]}
        >
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            {actionLabel}
          </ThemedText>
          <Icon name="chevron-right" size={14} color={theme.primary} strokeWidth={2.2} />
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

type ScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Footer tipis untuk memberi ruang di bawah tabel/daftar. */
  bottomSpacer?: number;
};

/** Wrapper layar dengan scroll + padding aman di berbagai ukuran layar Android. */
export function Screen({ children, style, bottomSpacer = 24 }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          { paddingBottom: insets.bottom + bottomSpacer, paddingHorizontal: Spacing.four, paddingTop: insets.top + Spacing.three },
          style,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.maxWidth}>{children}</View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  maxWidth: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
});
