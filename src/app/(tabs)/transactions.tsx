import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { useData } from '@/store/data-context';
import {
  filterByCategory,
  filterByMonth,
  filterByType,
  searchTransactions,
  sortByNewest,
} from '@/lib/calc';
import { CATEGORIES, categoriesFor } from '@/lib/categories';
import { formatMonthYear, monthOf, todayISO } from '@/lib/format';
import { Icon } from '@/lib/icons';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import type { TransactionType } from '@/types';
import { TransactionRow } from '@/components/transaction-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TYPE_FILTERS: { value: TransactionType | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
];

const PERIOD_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Sepanjang waktu' },
  { value: 'this-month', label: 'Bulan ini' },
  { value: 'last-month', label: 'Bulan lalu' },
];

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function TransactionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { transactions } = useData();

  const [type, setType] = useState<TransactionType | 'all'>('all');
  const [categoryId, setCategoryId] = useState('all');
  const [period, setPeriod] = useState('');
  const [query, setQuery] = useState('');

  const thisMonth = todayISO().slice(0, 7);
  const categoryOptions = useMemo(
    () =>
      type === 'all'
        ? CATEGORIES
        : categoriesFor(type === 'income' ? 'income' : 'expense'),
    [type],
  );

  const filtered = useMemo(() => {
    let list = filterByType(transactions, type);
    if (period === 'this-month') list = filterByMonth(list, thisMonth);
    else if (period === 'last-month') list = filterByMonth(list, shiftMonth(thisMonth, -1));
    list = filterByCategory(list, categoryId);
    list = searchTransactions(list, query);
    return sortByNewest(list);
  }, [transactions, type, period, categoryId, thisMonth, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const t of filtered) {
      const key = monthOf(t.date);
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const renderItem = ({ item }: { item: [string, typeof filtered] }) => (
    <View style={styles.group}>
      <ThemedText type="caption" themeColor="textSecondary" style={styles.groupLabel}>
        {item[0] === thisMonth ? 'Bulan ini' : formatMonthYear(item[0])}
      </ThemedText>
      {item[1].map((t) => (
        <TransactionRow
          key={t.id}
          transaction={t}
          onPress={() => router.push({ pathname: '/transaction', params: { id: t.id } })}
        />
      ))}
    </View>
  );

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        data={grouped}
        keyExtractor={([key]) => key}
        renderItem={renderItem}
        contentContainerStyle={[styles.content, grouped.length === 0 && styles.flexGrow]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <ThemedText type="title" style={styles.title}>
              Transaksi
            </ThemedText>

            {/* Pencarian */}
            <View
              style={[
                styles.searchBar,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Icon name="search" size={18} color={theme.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Cari catatan…"
                placeholderTextColor={theme.textSecondary}
                style={[styles.searchInput, { color: theme.text }]}
                returnKeyType="search"
              />
              {query ? (
                <ThemedText
                  themeColor="textSecondary"
                  onPress={() => setQuery('')}
                  style={styles.clear}
                  accessibilityRole="button"
                >
                  Batal
                </ThemedText>
              ) : null}
            </View>

            {/* Filter tipe */}
            <View style={styles.chipWrap}>
              {TYPE_FILTERS.map((f) => (
                <Chip
                  key={f.value}
                  label={f.label}
                  selected={type === f.value}
                  onPress={() => {
                    setType(f.value);
                    setCategoryId('all');
                  }}
                />
              ))}
            </View>

            {/* Filter periode */}
            <View style={styles.chipWrap}>
              {PERIOD_FILTERS.map((f) => (
                <Chip
                  key={f.value}
                  label={f.label}
                  selected={period === f.value}
                  onPress={() => setPeriod(f.value)}
                />
              ))}
            </View>

            {/* Filter kategori */}
            <View style={styles.chipWrap}>
              <Chip label="Semua kategori" selected={categoryId === 'all'} onPress={() => setCategoryId('all')} />
              {categoryOptions.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  color={c.color}
                  selected={categoryId === c.id}
                  onPress={() => setCategoryId(c.id)}
                />
              ))}
            </View>

            <ThemedText type="small" themeColor="textSecondary" style={styles.count}>
              {filtered.length} transaksi
            </ThemedText>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="filter"
            title="Tidak ada transaksi"
            description={
              transactions.length === 0
                ? 'Belum ada catatan. Tekan tombol tambah di kanan bawah untuk memulai.'
                : 'Tidak ada hasil sesuai filter. Coba ubah filter atau kata pencarian.'
            }
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: 80,
  },
  flexGrow: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    marginBottom: Spacing.three,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    marginBottom: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  clear: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipWrap: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: Spacing.one,
  },
  count: {
    marginVertical: Spacing.two + 2,
  },
  group: {
    marginBottom: Spacing.three,
  },
  groupLabel: {
    textTransform: 'capitalize',
    marginBottom: Spacing.one,
  },
});
