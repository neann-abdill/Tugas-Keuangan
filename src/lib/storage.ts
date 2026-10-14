import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AppSettings,
  Budget,
  SavingContribution,
  SavingsGoal,
  Transaction,
} from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

const KEYS = {
  transactions: '@fintrack/transactions',
  budgets: '@fintrack/budgets',
  goals: '@fintrack/goals',
  contributions: '@fintrack/contributions',
  settings: '@fintrack/settings',
  onboarding: '@fintrack/onboarding-done',
} as const;

async function loadList<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (error) {
    console.warn(`[storage] gagal memuat ${key}`, error);
    return [];
  }
}

async function saveList<T>(key: string, list: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(list));
  } catch (error) {
    console.warn(`[storage] gagal menyimpan ${key}`, error);
    throw new Error('Gagal menyimpan data. Periksa penyimpanan perangkat Anda.');
  }
}

export const storage = {
  loadTransactions: () => loadList<Transaction>(KEYS.transactions),
  saveTransactions: (list: Transaction[]) => saveList(KEYS.transactions, list),

  loadBudgets: () => loadList<Budget>(KEYS.budgets),
  saveBudgets: (list: Budget[]) => saveList(KEYS.budgets, list),

  loadGoals: () => loadList<SavingsGoal>(KEYS.goals),
  saveGoals: (list: SavingsGoal[]) => saveList(KEYS.goals, list),

  loadContributions: () => loadList<SavingContribution>(KEYS.contributions),
  saveContributions: (list: SavingContribution[]) => saveList(KEYS.contributions, list),

  async loadSettings(): Promise<AppSettings> {
    try {
      const raw = await AsyncStorage.getItem(KEYS.settings);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (error) {
      console.warn('[storage] gagal memuat pengaturan', error);
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings: async (settings: AppSettings) => {
    try {
      await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
    } catch (error) {
      console.warn('[storage] gagal menyimpan pengaturan', error);
    }
  },

  async loadOnboardingDone(): Promise<boolean> {
    return (await AsyncStorage.getItem(KEYS.onboarding)) === 'true';
  },
  setOnboardingDone: () => AsyncStorage.setItem(KEYS.onboarding, 'true'),

  /** Hapus seluruh data aplikasi dengan aman. */
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
