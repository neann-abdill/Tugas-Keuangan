import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/store/data-context';
import {
  PAYMENT_METHODS,
  categoriesFor,
} from '@/lib/categories';
import {
  dateToISO,
  formatDateLong,
  formatRupiah,
  parseISODate,
  todayISO,
} from '@/lib/format';
import { Icon } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PaymentMethod, TransactionType } from '@/types';

export default function TransactionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; type?: string }>();

  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useData();
  const existing = useMemo(
    () => transactions.find((t) => t.id === params.id),
    [transactions, params.id],
  );

  const [type, setType] = useState<TransactionType>(
    (existing?.type as TransactionType) ?? (params.type === 'income' ? 'income' : 'expense'),
  );
  const [amountText, setAmountText] = useState(
    existing ? String(existing.amount) : '',
  );
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    existing?.paymentMethod ?? 'cash',
  );
  const [note, setNote] = useState(existing?.note ?? '');
  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const categories = categoriesFor(type);

  const amountNumber = Number(amountText.replace(/\./g, '').replace(',', '.').replace(/[^\d]/g, ''));
  const prettyAmount = amountText ? formatRupiah(Number(amountText.replace(/[^\d]/g, ''))) : '';

  const switchType = (next: TransactionType) => {
    setType(next);
    if (categoryId && !categories.some((c) => c.id === categoryId || c.id === 'lainnya')) {
      setCategoryId('');
    }
  };

  const changeDate = (delta: number) => {
    const parsed = parseISODate(date);
    if (Number.isNaN(parsed.getTime())) return;
    parsed.setDate(parsed.getDate() + delta);
    setDate(dateToISO(parsed));
  };

  const submit = async () => {
    const nextErrors: typeof errors = {};
    const amount = Number(amountText.replace(/[^\d]/g, ''));
    if (!amountText.trim()) {
      nextErrors.amount = 'Nominal wajib diisi.';
    } else if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = 'Nominal harus lebih dari nol.';
    }
    if (!categoryId) nextErrors.category = 'Pilih satu kategori.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parseISODate(date).getTime())) {
      nextErrors.date = 'Format tanggal YYYY-MM-DD.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      if (existing) {
        await updateTransaction(existing.id, {
          type,
          amount,
          categoryId,
          date,
          note: note.trim(),
          paymentMethod,
        });
      } else {
        await addTransaction({ type, amount, categoryId, date, note: note.trim(), paymentMethod });
      }
      setSaved(true);
      setTimeout(() => router.back(), 600);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Hapus transaksi?', 'Tindakan ini tidak dapat dibatalkan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (existing) await deleteTransaction(existing.id);
            router.back();
          })();
        },
      },
    ]);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Icon name="close" size={20} color={theme.text} />
        </Pressable>
        <ThemedText type="heading">
          {existing ? 'Edit Transaksi' : 'Tambah Transaksi'}
        </ThemedText>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + Spacing.four }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Pilih tipe */}
        <View style={styles.typeRow}>
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <Pressable
              key={t}
              accessibilityRole="button"
              onPress={() => switchType(t)}
              style={[
                styles.typeButton,
                {
                  backgroundColor: type === t ? (t === 'income' ? theme.income : theme.expense) : theme.surface,
                  borderColor: type === t ? 'transparent' : theme.border,
                },
              ]}
            >
              <ThemedText
                type="value"
                style={{ color: type === t ? '#FFFFFF' : theme.textSecondary }}
              >
                {t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Nominal */}
        <ThemedText type="smallBold" style={styles.label}>
          Nominal
        </ThemedText>
        <ThemedView
          type="backgroundElement"
          style={[styles.amountCard, errors.amount && { borderColor: theme.danger, borderWidth: 1 }]}
        >
          <ThemedText type="title" themeColor="textSecondary" style={styles.rp}>
            Rp
          </ThemedText>
          <TextInput
            value={amountText ? String(Number(amountText.replace(/[^\d]/g, ''))) : ''}
            onChangeText={(v) => setAmountText(v.replace(/[^\d]/g, ''))}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            style={[styles.amountInput, { color: theme.text }]}
            returnKeyType="done"
            autoFocus={!existing}
          />
        </ThemedView>
        {prettyAmount && amountNumber > 0 ? (
          <ThemedText type="caption" themeColor="textSecondary">
            {prettyAmount}
          </ThemedText>
        ) : null}
        {errors.amount ? (
          <ThemedText type="caption" themeColor="danger">
            {errors.amount}
          </ThemedText>
        ) : null}

        {/* Kategori */}
        <ThemedText type="smallBold" style={styles.label}>
          Kategori
        </ThemedText>
        <View style={styles.chipWrap}>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              onPress={() => setCategoryId(c.id)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: categoryId === c.id ? c.color : theme.surface,
                  borderColor: categoryId === c.id ? c.color : theme.border,
                },
              ]}
            >
              <Icon name={c.icon} size={16} color={categoryId === c.id ? '#FFFFFF' : c.color} />
              <ThemedText
                type="caption"
                style={{ color: categoryId === c.id ? '#FFFFFF' : theme.text, fontWeight: '600' }}
              >
                {c.name}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {errors.category ? (
          <ThemedText type="caption" themeColor="danger">
            {errors.category}
          </ThemedText>
        ) : null}

        {/* Tanggal */}
        <ThemedText type="smallBold" style={styles.label}>
          Tanggal
        </ThemedText>
        <View style={styles.dateRow}>
          <Pressable accessibilityRole="button" onPress={() => changeDate(-1)}>
            <Icon name="chevron-right" size={20} color={theme.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>
          <TextInput
            value={date}
            onChangeText={(v) => setDate(v)}
            keyboardType="numbers-and-punctuation"
            style={[styles.dateInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface, flex: 1, textAlign: 'center' }]}
            returnKeyType="done"
          />
          <Pressable accessibilityRole="button" onPress={() => changeDate(1)}>
            <Icon name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
        <ThemedText type="caption" themeColor="textSecondary">
          {/^\d{4}-\d{2}-\d{2}$/.test(date)
            ? formatDateLong(date)
            : 'Gunakan format YYYY-MM-DD'}
        </ThemedText>
        {errors.date ? (
          <ThemedText type="caption" themeColor="danger">
            {errors.date}
          </ThemedText>
        ) : null}

        {/* Metode pembayaran */}
        <ThemedText type="smallBold" style={styles.label}>
          Metode pembayaran
        </ThemedText>
        <View style={styles.chipWrap}>
          {PAYMENT_METHODS.map((m) => (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              onPress={() => setPaymentMethod(m.id as PaymentMethod)}
              style={[
                styles.methodChip,
                {
                  backgroundColor: paymentMethod === m.id ? theme.primary : theme.surface,
                  borderColor: paymentMethod === m.id ? theme.primary : theme.border,
                },
              ]}
            >
              <ThemedText
                type="caption"
                style={{
                  color: paymentMethod === m.id ? '#FFFFFF' : theme.textSecondary,
                  fontWeight: '600',
                }}
              >
                {m.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Catatan */}
        <ThemedText type="smallBold" style={styles.label}>
          Catatan
        </ThemedText>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="mis. Makan siang di kantin"
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[styles.noteInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
          returnKeyType="done"
        />

        {/* Aksi */}
        {saved ? (
          <ThemedText type="smallBold" style={{ color: theme.primary, textAlign: 'center' }}>
            Berhasil disimpan ✓
          </ThemedText>
        ) : null}
        <Button
          title={existing ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          onPress={() => void submit()}
          disabled={saving}
          style={{ marginTop: Spacing.two }}
        />
        {existing ? (
          <Button title="Hapus Transaksi" variant="danger" onPress={confirmDelete} style={{ marginTop: Spacing.two }} />
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  form: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.three - 4,
    marginVertical: Spacing.two,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  label: {
    marginTop: Spacing.two + 2,
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    gap: 4,
  },
  rp: {
    fontWeight: '700',
  },
  amountInput: {
    flex: 1,
    fontSize: 34,
    fontWeight: '700',
    fontVariant: ['tabular-nums'] as never,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.one,
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
  methodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing.two,
    marginBottom: Spacing.two,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginVertical: Spacing.one,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: 10,
    fontSize: 15,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  modalCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
