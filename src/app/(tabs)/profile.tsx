import React from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useData } from '@/store/data-context';
import { currentBalance, totalsOf } from '@/lib/calc';
import { currentMonth, formatRupiah } from '@/lib/format';
import { Icon, type IconName } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen, SectionHeader } from '@/components/ui/section';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ThemePreference } from '@/types';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Sistem' },
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const { transactions, budgets, goals, contributions, settings, saveSettings, resetAllData } = useData();

  const balance = currentBalance(transactions, settings);
  const month = currentMonth();
  const { income, expense } = totalsOf(transactions.filter((t) => t.date.startsWith(month)));
  const totalGoalsSaved = contributions.reduce((sum, c) => sum + c.amount, 0);

  const confirmReset = () => {
    Alert.alert(
      'Hapus seluruh data?',
      'Semua transaksi, anggaran, target tabungan, dan saldo awal akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Lanjut',
          onPress: () => {
            Alert.alert('Konfirmasi terakhir', 'Yakin menghapus seluruh data?', [
              { text: 'Batal', style: 'cancel' },
              { text: 'Ya, hapus', style: 'destructive', onPress: () => void resetAllData() },
            ]);
          },
        },
      ],
    );
  };

  const setInitialBalance = (value: string) => {
    const clean = value.replace(/[^\d]/g, '');
    void saveSettings({ initialBalance: Number(clean || 0) });
  };

  return (
    <Screen>
      <ThemedText type="title" style={{ fontSize: 32, lineHeight: 38, marginBottom: Spacing.three }}>
        Profil
      </ThemedText>

      {/* Kartu profil */}
      <Card navy style={styles.profileCard}>
        <ThemedView type="backgroundSelected" style={styles.avatar}>
          <ThemedText type="heading" style={{ color: theme.primary }}>
            {(settings.userName || 'F').slice(0, 1).toUpperCase()}
          </ThemedText>
        </ThemedView>
        <ThemedView style={{ backgroundColor: 'transparent', flex: 1 }}>
          <ThemedText type="heading" style={{ color: '#FFFFFF' }} maxFontSizeMultiplier={1.3}>
            {settings.userName || 'Pengguna FinTrack'}
          </ThemedText>
          <ThemedText type="caption" style={{ color: '#A7B3C6' }}>
            Data tersimpan lokal di perangkat
          </ThemedText>
        </ThemedView>
      </Card>

      {/* Statistik */}
      <SectionHeader title="Statistik keuangan" />
      <Card style={styles.card}>
        <View style={styles.statsRow}>
          <StatItem label="Saldo total" value={formatRupiah(balance)} />
          <StatItem label={`Pemasukan ${month.slice(5)}`} value={formatRupiah(income)} color={theme.income} />
        </View>
        <View style={[styles.statsRow, { marginTop: Spacing.three }]}>
          <StatItem label={`Pengeluaran ${month.slice(5)}`} value={formatRupiah(expense)} color={theme.expense} />
          <StatItem label="Jumlah transaksi" value={String(transactions.length)} />
        </View>
      </Card>

      {/* Pengaturan */}
      <SectionHeader title="Pengaturan" />

      {/* Nama */}
      <Card style={styles.settingCard}>
        <ThemedText type="smallBold">Nama pengguna</ThemedText>
        <TextInput
          value={settings.userName}
          onChangeText={(v) => void saveSettings({ userName: v })}
          placeholder="mis. Andi"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundElement }]}
        />
      </Card>

      {/* Saldo awal */}
      <Card style={styles.settingCard}>
        <ThemedText type="smallBold">Saldo awal</ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          Rumus saldo: saldo awal + pemasukan − pengeluaran.
        </ThemedText>
        <TextInput
          value={settings.initialBalance ? String(settings.initialBalance) : ''}
          onChangeText={setInitialBalance}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundElement }]}
        />
      </Card>

      {/* Mata uang */}
      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold">Mata uang</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Nominal ditampilkan dengan format Rupiah (Rp1.250.000).
            </ThemedText>
          </View>
          <ThemedView type="backgroundSelected" style={styles.badge}>
            <ThemedText type="caption" style={{ color: theme.primary, fontWeight: '700' }}>
              IDR
            </ThemedText>
          </ThemedView>
        </View>
      </Card>

      {/* Tema */}
      <Card style={styles.settingCard}>
        <ThemedText type="smallBold">Tema tampilan</ThemedText>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((option) => {
            const active = settings.theme === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => void saveSettings({ theme: option.value })}
                style={[
                  styles.themeButton,
                  { backgroundColor: active ? theme.primary : theme.backgroundElement, borderColor: theme.border },
                ]}
              >
                <ThemedText
                  type="caption"
                  style={{ color: active ? '#FFFFFF' : theme.textSecondary, fontWeight: '600' }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Notifikasi/pemberitahuan */}
      <Card style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold">Peringatan anggaran</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Tampilkan pemberitahuan di tab Anggaran saat pengeluaran mendekati batas.
            </ThemedText>
          </View>
          <Toggle
            on={settings.notificationsEnabled}
            onPress={() => void saveSettings({ notificationsEnabled: !settings.notificationsEnabled })}
          />
        </View>
        <View style={[styles.settingRow, { marginTop: Spacing.three, alignItems: 'flex-start' }]}>
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold">Ambang peringatan</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Pemakaian anggaran berapa persen, peringatan mulai muncul.
            </ThemedText>
          </View>
          <View style={styles.thresholdRow}>
            {[60, 80, 95].map((pct) => {
              const active = settings.budgetWarningThreshold === pct / 100;
              return (
                <Pressable
                  key={pct}
                  accessibilityRole="button"
                  onPress={() => void saveSettings({ budgetWarningThreshold: pct / 100 })}
                  style={[
                    styles.thresholdChip,
                    { backgroundColor: active ? theme.primary : theme.backgroundElement, borderColor: theme.border },
                  ]}
                >
                  <ThemedText
                    type="caption"
                    style={{ color: active ? '#FFFFFF' : theme.textSecondary, fontWeight: '700' }}
                  >
                    {pct}%
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>

      {/* Data tersimpan */}
      <SectionHeader title="Data tersimpan" />
      <Card style={styles.card}>
        <DataLine icon="transactions" label={`${transactions.length} transaksi tercatat`} />
        <DataLine icon="budget" label={`${budgets.length} anggaran`} />
        <DataLine icon="target" label={`${goals.length} target tabungan · ${formatRupiah(totalGoalsSaved)} terkumpul`} />
      </Card>

      {/* Hapus data */}
      <Button title="Hapus Seluruh Data" variant="danger" onPress={confirmReset} style={styles.resetButton} />
    </Screen>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.statItem}>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="value" style={{ color, fontVariant: ['tabular-nums'] as never }}>
        {value}
      </ThemedText>
    </View>
  );
}

function DataLine({ icon, label }: { icon: IconName; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.dataLine}>
      <Icon name={icon} size={18} color={theme.primary} />
      <ThemedText type="small" maxFontSizeMultiplier={1.2}>
        {label}
      </ThemedText>
    </View>
  );
}

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.toggle, { backgroundColor: on ? theme.primary : theme.border }]}
    >
      <View style={[styles.knob, { alignSelf: on ? 'flex-end' : 'flex-start' }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  statItem: {
    flex: 1,
    gap: 2,
  },
  card: {
    marginBottom: Spacing.three - 4,
  },
  settingCard: {
    marginBottom: Spacing.three - 4,
    gap: Spacing.two,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  themeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  thresholdRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  thresholdChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  dataLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 6,
  },
  resetButton: {
    marginTop: Spacing.four,
  },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 3,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
  },
});
