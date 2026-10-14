import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { getCategory, paymentLabel } from '@/lib/categories';
import { Icon } from '@/lib/icons';
import { formatDateShort, formatRupiah } from '@/lib/format';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Transaction } from '@/types';

type Props = {
  transaction: Transaction;
  onPress?: () => void;
  onPressIn?: () => void;
};

export function TransactionRow({ transaction, onPress, onPressIn }: Props) {
  const theme = useTheme();
  const category = getCategory(transaction.categoryId);
  const isIncome = transaction.type === 'income';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={onPressIn}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
    >
      <ThemedView type="backgroundSelected" style={styles.iconWrap}>
        <Icon name={category.icon} size={18} color={category.color} />
      </ThemedView>

      <ThemedView style={styles.center}>
        <ThemedText type="value" maxFontSizeMultiplier={1.3} style={styles.note}>
          {transaction.note || category.name}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          {category.name} · {paymentLabel(transaction.paymentMethod)} · {formatDateShort(transaction.date)}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.right}>
        <ThemedText
          type="value"
          style={{ color: isIncome ? theme.income : theme.expense }}
          maxFontSizeMultiplier={1.3}
        >
          {isIncome ? '+' : '-'}
          {formatRupiah(transaction.amount)}
        </ThemedText>
        <Icon name="chevron-right" size={14} color={theme.textSecondary} strokeWidth={2.2} />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 4,
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    gap: 2,
    backgroundColor: 'transparent',
  },
  note: {
    flexShrink: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
});
