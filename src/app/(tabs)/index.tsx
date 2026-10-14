import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useData } from '@/store/data-context';
import {
  budgetProgress,
  cashflowLastDays,
  currentBalance,
  sortByNewest,
  totalsOf,
} from '@/lib/calc';
import { getCategory } from '@/lib/categories';
import { currentMonth, formatRupiah, formatRupiahCompact } from '@/lib/format';
import { Icon } from '@/lib/icons';
import { Screen, SectionHeader } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CashflowBars } from '@/components/charts';
import { TransactionRow } from '@/components/transaction-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { transactions, budgets, settings, error } = useData();

  const balance = currentBalance(transactions, settings);
  const month = currentMonth();
  const monthTx = transactions.filter((t) => t.date.startsWith(month));
  const { income, expense } = totalsOf(monthTx);
  const progress = budgetProgress(budgets, transactions, month, settings.budgetWarningThreshold);
  const topCategories = progress.filter((p) => p.spent > 0).slice(0, 3);
  const recent = sortByNewest(transactions).slice(0, 5);
  const hasData = transactions.length > 0;

  const quickAdd = (type: 'income' | 'expense') => {
    router.push({ pathname: '/transaction', params: { type } });
  };

  return (
    <Screen>
      {/* Header sapaan */}
      <ThemedText themeColor="textSecondary" type="small">
        {greeting()}
        {settings.userName ? `, ${settings.userName}!` : '!'}
      </ThemedText>
      <ThemedText type="title" style={styles.title}>
        Ringkasan Anda
      </ThemedText>

      {/* Kartu saldo */}
      <Card navy style={styles.balanceCard}>
        <ThemedText type="small" style={{ color: '#A7B3C6' }}>
          Total Saldo
        </ThemedText>
        <Text style={styles.balanceText}>{formatRupiah(balance)}</Text>
        <ThemedView style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <View style={[styles.miniBadge, { backgroundColor: 'rgba(52,211,153,0.2)' }]}>
              <Icon name="arrow-up" size={14} color="#34D399" />
            </View>
            <View>
              <ThemedText type="caption" style={{ color: '#A7B3C6' }}>
                Pemasukan {month.slice(5)}
              </ThemedText>
              <ThemedText type="value" style={{ color: '#34D399' }}>
                {formatRupiahCompact(income)}
              </ThemedText>
            </View>
          </View>
          <View style={styles.balanceItem}>
            <View style={[styles.miniBadge, { backgroundColor: 'rgba(248,113,113,0.2)' }]}>
              <Icon name="arrow-down" size={14} color="#F87171" />
            </View>
            <View>
              <ThemedText type="caption" style={{ color: '#A7B3C6' }}>
                Pengeluaran {month.slice(5)}
              </ThemedText>
              <ThemedText type="value" style={{ color: '#F87171' }}>
                {formatRupiahCompact(expense)}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </Card>

      {/* Tombol cepat */}
      <View style={styles.quickRow}>
        <Button title="+ Pemasukan" variant="secondary" onPress={() => quickAdd('income')} style={{ flex: 1 }} />
        <Button title="+ Pengeluaran" variant="primary" onPress={() => quickAdd('expense')} style={{ flex: 1 }} />
      </View>

      {error ? (
        <Card style={styles.errorBanner}>
          <ThemedText themeColor="danger">{error}</ThemedText>
        </Card>
      ) : null}

      {!hasData ? (
        <EmptyState
          icon="cash"
          title="Mulai catat transaksi pertama"
          description="Rekam pemasukan atau pengeluaran, dan lihat kondisi keuangan Anda terbentuk dengan sendirinya."
          action={
            <Button
              title="Tambah Transaksi"
              onPress={() => quickAdd('expense')}
              style={{ marginTop: Spacing.two }}
            />
          }
        />
      ) : null}

      {/* Grafik arus kas 7 hari */}
      {hasData ? (
        <>
          <SectionHeader title={`Arus Kas ${currentMonth() === month ? '7 Hari Terakhir' : ''}`} />
          <Card>
            <CashflowBars data={cashflowLastDays(transactions, 7)} />
            <View style={styles.legendRow}>
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
          </Card>

          {/* Ringkasan anggaran */}
          {budgets.length > 0 ? (
            <>
              <SectionHeader
                title="Anggaran bulanan"
                actionLabel="Kelola"
                onAction={() => router.push('/(tabs)/budget')}
              />
              <Card>
                {topCategories.map((item) => {
                  const category = getCategory(item.budget.categoryId);
                  return (
                    <View key={item.budget.id} style={styles.budgetRow}>
                      <ThemedView style={styles.budgetTop}>
                        <ThemedText type="smallBold">{category.name}</ThemedText>
                        <ThemedText
                          type="small"
                          style={{
                            color: item.status === 'over' ? theme.danger : theme.textSecondary,
                          }}
                        >
                          {formatRupiahCompact(item.spent)} / {formatRupiahCompact(item.budget.limitAmount)}
                        </ThemedText>
                      </ThemedView>
                      <ProgressBar
                        ratio={item.ratio}
                        color={
                          item.status === 'over'
                            ? theme.danger
                            : item.status === 'warn'
                              ? theme.warning
                              : theme.primary
                        }
                      />
                    </View>
                  );
                })}
              </Card>
            </>
          ) : (
            <Card>
              <ThemedText type="heading">Atur anggaran pertama</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Kategori dengan batas belanja membantu keputusan harian Anda menjaga ritme.
              </ThemedText>
              <Button
                title="Buat Anggaran"
                variant="secondary"
                onPress={() => router.push('/(tabs)/budget')}
                style={{ marginTop: Spacing.three }}
              />
            </Card>
          )}

          {/* Transaksi terbaru */}
          <SectionHeader
            title="Transaksi terbaru"
            actionLabel="Lihat semua"
            onAction={() => router.push('/(tabs)/transactions')}
          />
          <Card style={styles.recentCard}>
            {recent.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                onPress={() => router.push({ pathname: '/transaction', params: { id: t.id } })}
              />
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    lineHeight: 38,
    marginBottom: Spacing.three,
    marginTop: 2,
  },
  balanceCard: {
    gap: Spacing.two,
    marginVertical: Spacing.three,
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'] as never,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.three - 4,
    marginBottom: Spacing.three,
  },
  legendRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginTop: Spacing.three,
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
  budgetRow: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  budgetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  recentCard: {
    paddingVertical: Spacing.two + 2,
  },
  errorBanner: {
    marginBottom: Spacing.three,
  },
});
