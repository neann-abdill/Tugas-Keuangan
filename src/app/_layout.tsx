import { Stack, ThemeProvider, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DataProvider, useData } from '@/store/data-context';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/hooks/use-app-theme';
import { navThemeFor } from '@/lib/nav-theme';

function Gate({ children }: { children: React.ReactNode }) {
  const { loading, error, onboardingDone, reload } = useData();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !error && !onboardingDone && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [loading, error, onboardingDone, pathname, router]);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
        <ThemedText themeColor="textSecondary" style={styles.loadingText}>
          Memuat data keuangan…
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="heading">Terjadi kendala</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.loadingText}>
          {error}
        </ThemedText>
        <Button title="Coba lagi" onPress={() => void reload()} />
      </ThemedView>
    );
  }

  return <>{children}</>;
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const { settings } = useData();
  const resolved = useAppTheme(settings.theme);
  return (
    <ThemeProvider value={navThemeFor(resolved)}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  );
}

function Root() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <AppProviders>
          <Gate>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            >
              <Stack.Screen name="onboarding" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="transaction" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="savings" options={{ animation: 'slide_from_right' }} />
            </Stack>
          </Gate>
        </AppProviders>
      </DataProvider>
    </SafeAreaProvider>
  );
}

export default Root;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  loadingText: {
    textAlign: 'center',
  },
});
