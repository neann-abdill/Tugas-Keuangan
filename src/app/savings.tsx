import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/store/data-context';
import { daysUntil, goalProgress } from '@/lib/calc';
import { formatDateShort, formatRupiah, todayISO } from '@/lib/format';
import { Icon } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SavingContribution } from '@/types';

export default function SavingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { goals, contributions, addGoal, updateGoal, deleteGoal, addContribution, deleteContribution } = useData();

  // Form target
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalEditId, setGoalEditId] = useState<string | undefined>();
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDeadline, setGoalDeadline] = useState(todayISO());
  const [goalError, setGoalError] = useState('');

  // Modal kontribusi (berisi riwayat)
  const [contribGoalId, setContribGoalId] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribNote, setContribNote] = useState('');
  const [contribError, setContribError] = useState('');

  const goalsList = useMemo(() => goals, [goals]);

  const openGoalForm = (goalId?: string) => {
    const existing = goals.find((g) => g.id === goalId);
    setGoalEditId(goalId);
    setGoalName(existing?.name ?? '');
    setGoalAmount(existing ? String(existing.targetAmount) : '');
    setGoalDeadline(existing?.deadline ?? todayISO());
    setGoalError('');
    setGoalOpen(true);
  };

  const submitGoal = async () => {
    const target = Number(goalAmount.replace(/[^\d]/g, ''));
    if (!goalName.trim()) {
      setGoalError('Nama target wajib diisi.');
      return;
    }
    if (!Number.isFinite(target) || target <= 0) {
      setGoalError('Nominal target harus lebih dari nol.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(goalDeadline)) {
      setGoalError('Tanggal tenggat tidak valid.');
      return;
    }
    try {
      if (goalEditId) {
        await updateGoal(goalEditId, { name: goalName.trim(), targetAmount: target, deadline: goalDeadline });
      } else {
        await addGoal({ name: goalName.trim(), targetAmount: target, deadline: goalDeadline });
      }
      setGoalOpen(false);
    } catch {
      setGoalError('Gagal menyimpan target. Coba lagi.');
    }
  };

  const removeGoal = (id: string) => {
    Alert.alert('Hapus target?', 'Target dan riwayat kontribusinya akan hilang.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => void deleteGoal(id),
      },
    ]);
  };

  const openContrib = (goalId: string) => {
    setContribGoalId(goalId);
    setContribAmount('');
    setContribNote('');
    setContribError('');
  };

  const submitContrib = async () => {
    if (!contribGoalId) return;
    const amount = Number(contribAmount.replace(/[^\d]/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      setContribError('Nominal kontribusi harus lebih dari nol.');
      return;
    }
    await addContribution({ goalId: contribGoalId, amount, date: todayISO(), note: contribNote.trim() });
    setContribGoalId(null);
  };

  const contribGoal = goals.find((g) => g.id === contribGoalId);
  const contribHistory: SavingContribution[] = contribGoal
    ? contributions
        .filter((c) => c.goalId === contribGoal.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    : [];

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
          <Icon name="chevron-right" size={22} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        <ThemedText type="heading">Target Tabungan</ThemedText>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.four, gap: Spacing.three, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {goalsList.length === 0 ? (
          <EmptyState
            icon="target"
            title="Belum ada target"
            description="Buat target menabung pertama Anda — dana darurat, gadget baru, atau rencana jalan-jalan."
            action={<Button title="+ Buat Target" onPress={() => openGoalForm()} />}
          />
        ) : (
          <>
            <Button title="+ Buat Target Baru" variant="secondary" onPress={() => openGoalForm()} />
            {goalsList.map((goal) => {
              const { saved, ratio } = goalProgress(goal, contributions);
              const days = daysUntil(goal.deadline);
              const color = ratio >= 1 ? theme.primary : ratio >= 0.5 ? '#0EA5E9' : theme.warning;
              return (
                <Card key={goal.id}>
                  <View style={styles.cardTop}>
                    <ThemedView style={{ backgroundColor: 'transparent', flex: 1 }}>
                      <ThemedText type="heading" maxFontSizeMultiplier={1.3}>
                        {goal.name}
                      </ThemedText>
                      <ThemedText type="caption" themeColor="textSecondary">
                        Tenggat {formatDateShort(goal.deadline)}
                        {days > 0 ? ` · ${days} hari lagi` : days === 0 ? ' · hari ini' : ' · telah lewat'}
                      </ThemedText>
                    </ThemedView>
                    <Pressable accessibilityRole="button" onPress={() => openGoalForm(goal.id)} style={styles.iconButtonSmall}>
                      <Icon name="edit" size={18} color={theme.textSecondary} />
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={() => removeGoal(goal.id)} style={styles.iconButtonSmall}>
                      <Icon name="trash" size={18} color={theme.danger} />
                    </Pressable>
                  </View>

                  <View style={styles.progressTop}>
                    <ThemedText type="smallBold" style={{ color, fontVariant: ['tabular-nums'] as never }}>
                      {formatRupiah(saved)}
                    </ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      dari {formatRupiah(goal.targetAmount)} · {Math.round(Math.min(ratio, 1) * 100)}%
                    </ThemedText>
                  </View>
                  <ProgressBar ratio={saved / goal.targetAmount} color={color} />
                  <Button title="+ Catat Kontribusi" size="sm" onPress={() => openContrib(goal.id)} style={{ alignSelf: 'flex-start', marginTop: Spacing.three - 4 }} />
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Modal form target */}
      <Modal visible={goalOpen} transparent animationType="fade" onRequestClose={() => setGoalOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: theme.overlay }]} onPress={() => setGoalOpen(false)}>
          <Pressable onPress={() => {}} style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <ThemedText type="heading">{goalEditId ? 'Ubah Target' : 'Target Baru'}</ThemedText>

            <ThemedText type="smallBold" style={styles.label}>
              Nama target
            </ThemedText>
            <TextInput
              value={goalName}
              onChangeText={setGoalName}
              placeholder="mis. Dana darurat"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundElement }]}
            />

            <ThemedText type="smallBold" style={styles.label}>
              Nominal target (Rp)
            </ThemedText>
            <TextInput
              value={goalAmount}
              onChangeText={(v) => setGoalAmount(v.replace(/[^\d]/g, ''))}
              keyboardType="number-pad"
              placeholder="mis. 5000000"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundElement }]}
            />

            <ThemedText type="smallBold" style={styles.label}>
              Tenggat (YYYY-MM-DD)
            </ThemedText>
            <TextInput
              value={goalDeadline}
              onChangeText={setGoalDeadline}
              keyboardType="numbers-and-punctuation"
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundElement }]}
            />

            {goalError ? (
              <ThemedText type="caption" themeColor="danger">
                {goalError}
              </ThemedText>
            ) : null}

            <View style={styles.modalActions}>
              <Button title="Batal" variant="ghost" onPress={() => setGoalOpen(false)} style={{ flex: 1 }} />
              <Button title="Simpan" onPress={() => void submitGoal()} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal kontribusi + riwayat */}
      <Modal visible={contribGoalId !== null} transparent animationType="fade" onRequestClose={() => setContribGoalId(null)}>
        <Pressable style={[styles.overlay, { backgroundColor: theme.overlay }]} onPress={() => setContribGoalId(null)}>
          <Pressable onPress={() => {}} style={styles.overlayInner}>
            <Pressable onPress={() => {}} style={[styles.modalCard, { backgroundColor: theme.surface }]}>
              {contribGoal ? (
                <>
                  <ThemedText type="heading">Kontribusi — {contribGoal.name}</ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary">
                    Progres dihitung dari kontribusi yang benar-benar tercatat.
                  </ThemedText>

                  <ThemedText type="smallBold" style={styles.label}>
                    Nominal (Rp)
                  </ThemedText>
                  <TextInput
                    value={contribAmount}
                    onChangeText={(v) => setContribAmount(v.replace(/[^\d]/g, ''))}
                    keyboardType="number-pad"
                    placeholder="mis. 250000"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundElement }]}
                  />
                  <TextInput
                    value={contribNote}
                    onChangeText={setContribNote}
                    placeholder="Catatan (opsional)"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundElement }]}
                  />
                  {contribError ? (
                    <ThemedText type="caption" themeColor="danger" style={{ textAlign: 'center' }}>
                      {contribError}
                    </ThemedText>
                  ) : null}
                  <Button title="Simpan Kontribusi" onPress={() => void submitContrib()} />

                  <ThemedText type="smallBold" style={styles.label}>
                    Riwayat
                  </ThemedText>
                  {contribHistory.length === 0 ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      Belum ada kontribusi.
                    </ThemedText>
                  ) : (
                    contribHistory.map((c) => (
                      <View key={c.id} style={styles.contribRow}>
                        <ThemedView style={{ backgroundColor: 'transparent', flex: 1 }}>
                          <ThemedText type="small" style={{ fontVariant: ['tabular-nums'] as never }}>
                            {formatRupiah(c.amount)}
                          </ThemedText>
                          <ThemedText type="caption" themeColor="textSecondary">
                            {formatDateShort(c.date)}
                            {c.note ? ` · ${c.note}` : ''}
                          </ThemedText>
                        </ThemedView>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => void deleteContribution(c.id)}
                          style={styles.iconButtonSmall}
                        >
                          <Icon name="trash" size={16} color={theme.danger} />
                        </Pressable>
                      </View>
                    ))
                  )}
                </>
              ) : null}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  },
  iconButtonSmall: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayInner: {
    maxWidth: 480,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.three,
    maxHeight: '90%' as never,
  },
  modalCard: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.one,
    maxHeight: '100%' as never,
  },
  label: {
    marginTop: Spacing.two,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.three - 4,
    marginTop: Spacing.three - 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
  },
  contribRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
});
