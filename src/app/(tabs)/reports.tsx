import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useData } from '@/store/data-context';
import {
  cashflowLastMonths,
  sortByNewest,
  totalsOf,
  topExpenseCategories,
} from '@/lib/calc';
import { getCategory } from '@/lib/categories';
import {
  currentMonth,
  formatMonthYear,
  formatRupiah,
  formatRupiahCompact,
  formatDateShort,
} from '@/lib/format';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen, SectionHeader } from '@/components/ui/section';
import { Chip } from '@/components/ui/chip';
import { CategoryDonut, MonthlyCompare } from '@/components/charts';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ReportsScreen() {
  const theme = useTheme();
  const { transactions } = useData();
  const thisMonth = currentMonth();
  const [selectedMonth, setSelectedMonth] = useState(thisMonth);

  const monthOptions = useMemo(() => {
    const months = new Set<string>([thisMonth]);
    for (const t of transactions) months.add(t.date.slice(0, 7));
    return [...months].sort().reverse();
  }, [transactions, thisMonth]);

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth],
  );

  const { income, expense } = totalsOf(monthTx);
  const bars = useMemo(
    () => cashflowLastMonths(transactions, 6, selectedMonth),
    [transactions, selectedMonth],
  );
  const topCategories = useMemo(
    () => topExpenseCategories(transactions, selectedMonth).slice(0, 5),
    [transactions, selectedMonth],
  );
  const recentExpense = useMemo(
    () => sortByNewest(monthTx.filter((t) => t.type === 'expense')).slice(0, 3),
    [monthTx],
  );

  if (transactions.length === 0) {
    return (
      <Screen>
        <ThemedText type="title" style={{ fontSize: 32, lineHeight: 38, marginBottom: Spacing.three }}>
          Laporan
        </ThemedText>
        <EmptyState
          icon="chart"
          title="Belum ada data laporan"
          description="Grafik akan muncul setelah ada transaksi yang tercatat."
        />
      </Screen>
    );
  }

  const donutSlices = topCategories.map(({ categoryId, total }) => ({
    label: getCategory(categoryId).name,
    value: total,
    color: getCategory(categoryId).color,
  }));

  return (
    <Screen>
      <ThemedText type="title" style={{ fontSize: 32, lineHeight: 38, marginBottom: Spacing.three }}>
        Laporan
      </ThemedText>

      {/* Pemilih bulan */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.three }}>
        {monthOptions.slice(0, 6).map((m) => (
          <Chip key={m} label={formatMonthYear(m)} selected={selectedMonth === m} onPress={() => setSelectedMonth(m)} />
        ))}
      </View>

      {/* Ringkasan arus kas */}
      <SectionHeader title="Ringkasan arus kas" />
      <Card>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText type="caption" themeColor="textSecondary">
              Pemasukan
            </ThemedText>
            <ThemedText type="value" style={{ color: theme.income, fontVariant: ['tabular-nums'] as never }}>
              {formatRupiah(income)}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText type="caption" themeColor="textSecondary">
              Pengeluaran
            </ThemedText>
            <ThemedText type="value" style={{ color: theme.expense, fontVariant: ['tabular-nums'] as never }}>
              {formatRupiah(expense)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.netRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Selisih (net cash flow)
          </ThemedText>
          <ThemedText
            type="heading"
            style={{
              color: income - expense >= 0 ? theme.primary : theme.danger,
              fontVariant: ['tabular-nums'] as never,
            }}
          >
            {formatRupiah(income - expense)}
          </ThemedText>
        </View>
      </Card>

      {/* Perbandingan 6 bulan */}
      <SectionHeader title="Perbandingan 6 bulan terakhir" />
      <Card>
        <MonthlyCompare data={bars} />
        <View style={[styles.legendRow, { marginTop: Spacing.three }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.income }]} />
            <ThemedText type="caption" themeColor="textSecondary">
              Pemasukan
            </ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.expense }]} />
            <ThemedText type="caption" themeColor="textSecondary">
              Pengeluaran
            </ThemedText>
          </View>
        </View>
        <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
          Nilai tertinggi {formatRupiahCompact(Math.max(...bars.map((b) => Math.max(b.income, b.expense))))}
        </ThemedText>
      </Card>

      {/* Distribusi pengeluaran */}
      <SectionHeader title="Distribusi pengeluaran" />
      <Card>
        {donutSlices.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Tidak ada pengeluaran pada {formatMonthYear(selectedMonth)}.
          </ThemedText>
        ) : (
          <CategoryDonut slices={donutSlices} />
        )}
      </Card>

      {/* Pengeluaran terbesar bulan terpilih */}
      <SectionHeader title={`Pengeluaran terbesar — ${formatMonthYear(selectedMonth)}`} />
      {topCategories.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Belum ada pengeluaran bulan ini.
        </ThemedText>
      ) : (
        <Card style={{ paddingVertical: Spacing.two + 2 }}>
          {topCategories.map(({ categoryId, total }, index) => {
            const category = getCategory(categoryId);
            const share = expense > 0 ? total / expense : 0;
            return (
              <View key={`${categoryId}-${index}`} style={styles.rankRow}>
                <ThemedView type="backgroundSelected" style={styles.rankIcon}>
                  <ThemedText type="caption" style={{ color: category.color, fontWeight: '700' }}>
                    {index + 1}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={{ backgroundColor: 'transparent', flex: 1 }}>
                  <ThemedText type="smallBold">{category.name}</ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {Math.round(share * 100)}% dari total pengeluaran
                  </ThemedText>
                </ThemedView>
                <ThemedText type="value" style={{ fontVariant: ['tabular-nums'] as never }}>
                  {formatRupiahCompact(total)}
                </ThemedText>
              </View>
            );
          })}
        </Card>
      )}

      {/* Contoh transaksi pengeluaran terbaru bulan terpilih */}
      {recentExpense.length > 0 ? (
        <>
          <SectionHeader title="Pengeluaran terbaru" />
          <Card style={{ paddingVertical: Spacing.two + 2 }}>
            {recentExpense.map((t) => (
              <View key={t.id} style={styles.rankRow}>
                <ThemedView style={{ backgroundColor: 'transparent', flex: 1 }}>
                  <ThemedText type="smallBold">{t.note || getCategory(t.categoryId).name}</ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {formatDateShort(t.date)}
                  </ThemedText>
                </ThemedView>
                <ThemedText type="value" style={{ color: theme.expense, fontVariant: ['tabular-nums'] as never }}>
                  -{formatRupiah(t.amount)}
                </ThemedText>
              </View>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    gap: 2,
  },
  netRow: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 4,
    paddingVertical: 10,
  },
  rankIcon:	{
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
