import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/store/data-context';
import {
  budgetProgress,
  totalsOf,
  topExpenseCategories,
} from '@/lib/calc';
import { categoriesFor, getCategory } from '@/lib/categories';
import {
  currentMonth,
  formatMonthYear,
  formatRupiah,
  formatRupiahCompact,
  todayISO,
} from '@/lib/format';
import { Icon } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen, SectionHeader } from '@/components/ui/section';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function BudgetScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { budgets, transactions, settings, upsertBudget, deleteBudget } = useData();

  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limitText, setLimitText] = useState('');
  const [formError, setFormError] = useState('');

  const progress = useMemo(
    () => budgetProgress(budgets, transactions, month, settings.budgetWarningThreshold),
    [budgets, transactions, month, settings.budgetWarningThreshold],
  );

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.startsWith(month) && t.type === 'expense'),
    [transactions, month],
  );
  const { income, expense } = totalsOf(transactions.filter((t) => t.date.startsWith(month)));
  const totalLimit = budgets
    .filter((b) => b.month === month)
    .reduce((sum, b) => sum + b.limitAmount, 0);
  const top = topExpenseCategories(transactions, month)[0];
  const warnList = progress.filter((p) => p.status !== 'safe');
  const expenseCategories = categoriesFor('expense').filter((c) => c.id !== 'lainnya');

  const openForm = (categoryId?: string, id?: string) => {
    const existing = budgets.find((b) => b.id === id);
    setSelectedCategory(categoryId ?? existing?.categoryId ?? '');
    setLimitText(existing ? String(existing.limitAmount) : '');
    setFormError('');
    setEditId(id);
    setFormOpen(true);
  };

  const saveBudget = async () => {
    const limit = Number(limitText.replace(/[^\d]/g, ''));
    if (!selectedCategory) {
      setFormError('Pilih kategori terlebih dahulu.');
      return;
    }
    if (!Number.isFinite(limit) || limit <= 0) {
      setFormError('Batas anggaran harus lebih dari nol.');
      return;
    }
    await upsertBudget({ id: editId, categoryId: selectedCategory, limitAmount: limit, month });
    setFormOpen(false);
  };

  const removeBudget = (id: string) => {
    Alert.alert('Hapus anggaran?', 'Anggaran untuk kategori ini akan dihapus.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => void deleteBudget(id) },
    ]);
  };

  return (
    <Screen>
      {/* Header + pemilih bulan */}
      <View style={styles.monthRow}>
        <Pressable accessibilityRole="button" onPress={() => setMonth(shiftMonth(month, -1))}>
          <Icon name="chevron-right" size={22} color={theme.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        <ThemedText type="heading">{formatMonthYear(month)}</ThemedText>
        <Pressable accessibilityRole="button" onPress={() => setMonth(shiftMonth(month, 1))}>
          <Icon name="chevron-right" size={22} color={theme.textSecondary} />
        </Pressable>
      </View>

      {/* Ringkasan pengeluaran bulan */}
      <Card navy style={styles.summary}>
        <ThemedText type="caption" style={{ color: '#A7B3C6' }}>
          Pengeluaran bulan {month === currentMonth() ? 'ini' : 'terpilih'}
        </ThemedText>
        <ThemedText
          type="title"
          style={{ color: '#FFFFFF', fontVariant: ['tabular-nums'] as never }}
        >
          {formatRupiah(expense)}
        </ThemedText>
        <ThemedText type="caption" style={{ color: '#A7B3C6' }}>
          Pemasukan {formatRupiah(income)} · Selisih {formatRupiah(income - expense)}
        </ThemedText>
      </Card>

      {/* Peringatan */}
      {warnList.length > 0 ? (
        <Card style={[styles.warning, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]} elevated={false}>
          <View style={styles.warningRow}>
            <Icon name="alert" size={20} color={theme.warning} />
            <ThemedText type="small" style={{ color: theme.warning, flex: 1 }}>
              {warnList
                .map(
                  (p) =>
                    `${getCategory(p.budget.categoryId).name} (${p.status === 'over' ? 'melebihi batas' : 'mendekati batas'})`,
                )
                .join(', ')}
            </ThemedText>
          </View>
        </Card>
      ) : null}

      {/* Ringkasan total anggaran */}
      {budgets.length > 0 ? (
        <Card>
          <View style={styles.totalRow}>
            <View style={styles.totalItem}>
              <ThemedText type="caption" themeColor="textSecondary">
                Total batas
              </ThemedText>
              <ThemedText type="value">{formatRupiah(totalLimit)}</ThemedText>
            </View>
            <View style={styles.totalItem}>
              <ThemedText type="caption" themeColor="textSecondary">
                Terpakai
              </ThemedText>
              <ThemedText type="value">{formatRupiah(monthTx.reduce((s, t) => s + t.amount, 0))}</ThemedText>
            </View>
            <View style={styles.totalItem}>
              <ThemedText type="caption" themeColor="textSecondary">
                Sisa
              </ThemedText>
              <ThemedText type="value">{formatRupiah(totalLimit - monthTx.reduce((s, t) => s + t.amount, 0))}</ThemedText>
            </View>
          </View>
          {top ? (
            <ThemedText type="small" themeColor="textSecondary">
              Pengeluaran terbesar: <ThemedText type="smallBold">{getCategory(top.categoryId).name}</ThemedText> — {formatRupiahCompact(top.total)}
            </ThemedText>
          ) : null}
        </Card>
      ) : null}

      {/* Daftar anggaran per kategori */}
      <SectionHeader title="Anggaran per kategori" actionLabel="+ Tambah" onAction={() => openForm()} />
      {progress.length === 0 ? (
        <EmptyState
          icon="budget"
          title="Belum ada anggaran"
          description="Tetapkan batas belanja per kategori supaya pengeluaran bulanan lebih terkendali."
          action={<Button title="Buat Anggaran" onPress={() => openForm()} />}
        />
      ) : (
        progress.map((item) => {
          const category = getCategory(item.budget.categoryId);
          return (
            <Card key={item.budget.id} style={styles.budgetCard}>
              <Pressable onPress={() => openForm(item.budget.categoryId, item.budget.id)}>
                <View style={styles.cardTop}>
                  <View style={styles.categoryWrap}>
                    <ThemedView type="backgroundSelected" style={styles.iconWrap}>
                      <Icon name={category.icon} size={18} color={category.color} />
                    </ThemedView>
                    <ThemedView style={{ backgroundColor: 'transparent' }}>
                      <ThemedText type="value">{category.name}</ThemedText>
                      <ThemedText type="caption" themeColor="textSecondary">
                        Batas {formatRupiah(item.budget.limitAmount)} · Sisa {formatRupiah(item.remaining)}
                      </ThemedText>
                    </ThemedView>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => removeBudget(item.budget.id)}
                    style={styles.trash}
                  >
                    <Icon name="trash" size={18} color={theme.danger} />
                  </Pressable>
                </View>
                <View style={styles.statusRow}>
                  <ProgressBar
                    ratio={item.ratio}
                    color={item.status === 'over' ? theme.danger : item.status === 'warn' ? theme.warning : theme.primary}
                  />
                  <ThemedText
                    type="caption"
                    style={{
                      color: item.status === 'over' ? theme.danger : item.status === 'warn' ? theme.warning : theme.textSecondary,
                      fontVariant: ['tabular-nums'] as never,
                      marginTop: 6,
                    }}
                  >
                    {Math.round(item.ratio * 100)}% terpakai
                  </ThemedText>
                </View>
              </Pressable>
            </Card>
          );
        })
      )}

      {/* Link ke tabungan */}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/savings')}
        style={({ pressed }) => [styles.savingsLink, { opacity: pressed ? 0.85 : 1 }]}
      >
        <ThemedView type="backgroundSelected" style={styles.savingsIcon}>
          <Icon name="target" size={22} color={theme.primary} />
        </ThemedView>
        <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <ThemedText type="value">Target Tabungan</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            Kelola tujuan menabung dan progresnya di menu terpisah.
          </ThemedText>
        </ThemedView>
        <Icon name="chevron-right" size={16} color={theme.textSecondary} />
      </Pressable>

      {/* Form modal anggaran */}
      <Modal visible={formOpen} transparent animationType="fade" onRequestClose={() => setFormOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: theme.overlay }]} onPress={() => setFormOpen(false)}>
          <Pressable onPress={() => {}} style={[styles.modalCard, { backgroundColor: theme.surface, marginBottom: insets.bottom }]}>
            <ThemedText type="heading">
              {editId ? 'Ubah Anggaran' : 'Buat Anggaran'}
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Berlaku untuk {formatMonthYear(month)}
            </ThemedText>

            <ThemedText type="smallBold" style={styles.modalLabel}>
              Kategori
            </ThemedText>
            <View style={styles.chipWrap}>
              {expenseCategories.map((c) => (
                <Pressable
                  key={c.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedCategory(c.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategory === c.id ? c.color : theme.surface,
                      borderColor: selectedCategory === c.id ? c.color : theme.border,
                    },
                  ]}
                >
                  <Icon name={c.icon} size={15} color={selectedCategory === c.id ? '#FFFFFF' : c.color} />
                  <ThemedText type="caption" style={{ color: selectedCategory === c.id ? '#FFFFFF' : theme.text, fontWeight: '600' }}>
                    {c.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText type="smallBold" style={styles.modalLabel}>
              Batas bulanan (Rp)
            </ThemedText>
            <TextInput
              value={limitText}
              onChangeText={(v) => setLimitText(v.replace(/[^\d]/g, ''))}
              keyboardType="number-pad"
              placeholder="mis. 1500000"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundElement }]}
              returnKeyType="done"
            />
            {formError ? (
              <ThemedText type="caption" themeColor="danger">
                {formError}
              </ThemedText>
            ) : null}

            <View style={styles.modalActions}>
              <Button title="Batal" variant="ghost" onPress={() => setFormOpen(false)} style={{ flex: 1 }} />
              <Button title="Simpan" onPress={() => void saveBudget()} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.three,
  },
  summary: {
    gap: Spacing.one,
  },
  warning: {
    marginVertical: Spacing.two,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  totalItem: {
    gap: 2,
  },
  budgetCard: {
    marginBottom: Spacing.three - 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  categoryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 4,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trash: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    gap: 2,
  },
  savingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 4,
    marginTop: Spacing.two,
    backgroundColor: 'transparent',
  },
  savingsIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalCard: {
    alignSelf: 'stretch',
    marginHorizontal: Spacing.three,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.two,
    marginBottom: 0,
  },
  modalLabel: {
    marginTop: Spacing.two,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.three - 4,
    marginTop: Spacing.three - 4,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing.two,
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
  },
});
