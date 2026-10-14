import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/lib/icons';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'transactions', title: 'Transaksi', icon: 'transactions' },
  { name: 'budget', title: 'Anggaran', icon: 'budget' },
  { name: 'reports', title: 'Laporan', icon: 'chart' },
  { name: 'profile', title: 'Profil', icon: 'profile' },
];

function FAB() {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Tambah transaksi"
      onPress={() => router.push('/transaction')}
      style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.9 : 1 }]}
    >
      <Icon name="plus" size={26} color="#FFFFFF" strokeWidth={2.4} />
    </Pressable>
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarLabelStyle: styles.label,
          tabBarStyle: [
            styles.tabBar,
            { backgroundColor: theme.surface, borderTopColor: theme.border },
            { paddingBottom: insets.bottom ? insets.bottom : Spacing.two },
          ],
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color, focused }) => (
                <Icon
                  name={tab.icon}
                  size={22}
                  color={String(color)}
                  strokeWidth={focused ? 2.2 : 1.8}
                />
              ),
            }}
          />
        ))}
      </Tabs>
      <FAB />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 60 + 12,
    paddingTop: Spacing.two,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: -2,
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: 92,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
