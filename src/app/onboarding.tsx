import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/store/data-context';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Icon, type IconName } from '@/lib/icons';
import { Radius, Spacing } from '@/constants/theme';

const SLIDES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'transactions',
    title: 'Catat, tanpa ribet',
    body: 'Rekam pemasukan dan pengeluaran dalam hitungan detik. Laporan otomatis terbentuk dari setiap catatan Anda.',
  },
  {
    icon: 'budget',
    title: 'Anggaran yang mengawal',
    body: 'Tetapkan batas belanja per kategori dan dapatkan peringatan sebelum pengeluaran melebihi rencana.',
  },
  {
    icon: 'target',
    title: 'Wujudkan target',
    body: 'Simpan uang secara terarah untuk dana darurat, liburan, atau apapun tujuan Anda — progres terlihat jelas.',
  },
];

function Onboarding() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, saveSettings, completeOnboarding } = useData();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(settings.userName);
  const [initialBalance, setInitialBalance] = useState(
    settings.initialBalance ? String(settings.initialBalance) : '',
  );

  const isLast = step === SLIDES.length;
  const totalSteps = SLIDES.length + 1;

  const handleNext = async () => {
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    const parsedBalance = Number(initialBalance.replace(/[^\d]/g, ''));
    await saveSettings({
      userName: name.trim(),
      initialBalance: Number.isFinite(parsedBalance) ? parsedBalance : 0,
    });
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const pageIndicator = (
    <View style={styles.dots}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i === step ? theme.primary : theme.backgroundSelected },
          ]}
        />
      ))}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {!isLast ? (
        <Pressable style={styles.skip} onPress={() => setStep(isLast ? step : SLIDES.length)}>
          <ThemedText type="small" themeColor="textSecondary">
            Lewati
          </ThemedText>
        </Pressable>
      ) : null}

      {step < SLIDES.length ? (
        <View style={styles.content}>
          <ThemedView type="backgroundSelected" style={styles.iconWrap}>
            <Icon name={SLIDES[step].icon} size={48} color={theme.primary} strokeWidth={1.6} />
          </ThemedView>
          <ThemedText type="title" style={styles.title}>
            {SLIDES[step].title}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.body}>
            {SLIDES[step].body}
          </ThemedText>
        </View>
      ) : (
        <View style={[styles.content, styles.profileContent]}>
          <ThemedView type="backgroundSelected" style={styles.iconWrap}>
            <Icon name="profile" size={48} color={theme.primary} strokeWidth={1.6} />
          </ThemedView>
          <ThemedText type="title" style={styles.title}>
            Mulai dari awal
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.body}>
            Data Anda tersimpan aman di dalam perangkat. Tanpa akun, tanpa berbagi data.
          </ThemedText>

          <View style={styles.form}>
            <ThemedText type="smallBold">Siapa nama Anda?</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="mis. Andi"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
              returnKeyType="done"
            />
            <ThemedText type="smallBold">Saldo awal (opsional)</ThemedText>
            <TextInput
              value={initialBalance}
              onChangeText={(v) => setInitialBalance(v.replace(/[^\d]/g, ''))}
              placeholder="mis. 1000000"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
              returnKeyType="done"
            />
            <ThemedText type="caption" themeColor="textSecondary">
              Saldo ini menjadi titik nol sebelum transaksi pertama Anda.
            </ThemedText>
          </View>
        </View>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
        {pageIndicator}
        <Button
          title={isLast ? 'Selesaikan' : 'Lanjut'}
          onPress={() => void handleNext()}
          style={styles.next}
        />
      </View>
    </ThemedView>
  );
}

export default function OnboardingScreen() {
  return <Onboarding />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  profileContent: {
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 40,
  },
  body: {
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 460,
  },
  form: {
    alignSelf: 'stretch',
    maxWidth: 420,
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
  },
  next: {
    alignSelf: 'stretch',
    maxWidth: 460,
  },
  skip: {
    alignSelf: 'flex-end',
    padding: Spacing.three,
  },
});
