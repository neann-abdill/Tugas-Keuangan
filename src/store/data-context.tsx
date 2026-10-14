import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  AppSettings,
  Budget,
  SavingContribution,
  SavingsGoal,
  Transaction,
} from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { generateId } from '@/lib/calc';
import { storage } from '@/lib/storage';

interface DataState {
  loading: boolean;
  error: string | null;
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  contributions: SavingContribution[];
  settings: AppSettings;
  onboardingDone: boolean;
}

interface DataActions {
  reload: () => Promise<void>;
  addTransaction: (
    input: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<void>;
  updateTransaction: (id: string, input: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  upsertBudget: (
    input: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (input: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, input: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (input: Omit<SavingContribution, 'id' | 'createdAt'>) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;
  saveSettings: (input: Partial<AppSettings>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const EMPTY: DataState = {
  loading: true,
  error: null,
  transactions: [],
  budgets: [],
  goals: [],
  contributions: [],
  settings: DEFAULT_SETTINGS,
  onboardingDone: false,
};

const DataContext = createContext<(DataState & DataActions) | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DataState>(EMPTY);

  const reload = useCallback(async () => {
    try {
      const [transactions, budgets, goals, contributions, settings, onboardingDone] =
        await Promise.all([
          storage.loadTransactions(),
          storage.loadBudgets(),
          storage.loadGoals(),
          storage.loadContributions(),
          storage.loadSettings(),
          storage.loadOnboardingDone(),
        ]);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: null,
        transactions,
        budgets,
        goals,
        contributions,
        settings,
        onboardingDone,
      }));
    } catch (error) {
      console.warn('[data] gagal memuat data awal', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Tidak dapat memuat data tersimpan. Coba buka kembali aplikasi.',
      }));
    }
  }, []);

  useEffect(() => {
    // Tangguhkan pemanggilan ke callback agar render pertama tidak berantai.
    const timer = setTimeout(() => void reload(), 0);
    return () => clearTimeout(timer);
  }, [reload]);

  const withPersist = useCallback(
    async <T,>(
      key: 'transactions' | 'budgets' | 'goals' | 'contributions',
      next: (prev: T[]) => T[],
      tag: string,
    ) => {
      try {
        let list: T[] = [];
        setState((prev) => {
          const current = (
            prev[key] as unknown
          ) as T[];
          list = next(current);
          return { ...prev, [key]: list };
        });
        switch (key) {
          case 'transactions':
            await storage.saveTransactions(list as Transaction[]);
            break;
          case 'budgets':
            await storage.saveBudgets(list as Budget[]);
            break;
          case 'goals':
            await storage.saveGoals(list as SavingsGoal[]);
            break;
          case 'contributions':
            await storage.saveContributions(list as SavingContribution[]);
            break;
        }
        setState((prev) => ({ ...prev, error: null }));
      } catch {
        setState((prev) => ({
          ...prev,
          error: `Gagal menyimpan ${tag}. Perubahan mungkin tidak tersimpan.`,
        }));
        await reload();
      }
    },
    [reload],
  );

  const addTransaction: DataActions['addTransaction'] = useCallback(
    (input) =>
      withPersist<Transaction>('transactions', (prev) => {
        const now = new Date().toISOString();
        return [{ ...input, id: generateId(), createdAt: now, updatedAt: now }, ...prev];
      }, 'transaksi'),
    [withPersist],
  );

  const updateTransaction: DataActions['updateTransaction'] = useCallback(
    (id, input) =>
      withPersist<Transaction>('transactions', (prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...input, updatedAt: new Date().toISOString() } : t,
        ),
      'transaksi'),
    [withPersist],
  );

  const deleteTransaction: DataActions['deleteTransaction'] = useCallback(
    (id) =>
      withPersist<Transaction>('transactions', (prev) => prev.filter((t) => t.id !== id), 'transaksi'),
    [withPersist],
  );

  const upsertBudget: DataActions['upsertBudget'] = useCallback(
    (input) =>
      withPersist<Budget>('budgets', (prev) => {
        const now = new Date().toISOString();
        const existing = input.id
          ? prev.find((b) => b.id === input.id)
          : prev.find((b) => b.month === input.month && b.categoryId === input.categoryId);
        if (existing) {
          return prev.map((b) =>
            b.id === existing.id ? { ...b, limitAmount: input.limitAmount, updatedAt: now } : b,
          );
        }
        return [{ ...input, id: generateId(), createdAt: now, updatedAt: now }, ...prev];
      }, 'anggaran'),
    [withPersist],
  );

  const deleteBudget: DataActions['deleteBudget'] = useCallback(
    (id) =>
      withPersist<Budget>('budgets', (prev) => prev.filter((b) => b.id !== id), 'anggaran'),
    [withPersist],
  );

  const addGoal: DataActions['addGoal'] = useCallback(
    (input) =>
      withPersist<SavingsGoal>('goals', (prev) => {
        const now = new Date().toISOString();
        return [{ ...input, id: generateId(), createdAt: now, updatedAt: now }, ...prev];
      }, 'target tabungan'),
    [withPersist],
  );

  const updateGoal: DataActions['updateGoal'] = useCallback(
    (id, input) =>
      withPersist<SavingsGoal>('goals', (prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, ...input, updatedAt: new Date().toISOString() } : g,
        ),
      'target tabungan'),
    [withPersist],
  );

  const deleteGoal: DataActions['deleteGoal'] = useCallback(
    (id) =>
      withPersist<SavingsGoal>('goals', (prev) => prev.filter((g) => g.id !== id), 'target tabungan'),
    [withPersist],
  );

  const addContribution: DataActions['addContribution'] = useCallback(
    (input) =>
      withPersist<SavingContribution>('contributions', (prev) => [
        { ...input, id: generateId(), createdAt: new Date().toISOString() },
        ...prev,
      ], 'kontribusi tabungan'),
    [withPersist],
  );

  const deleteContribution: DataActions['deleteContribution'] = useCallback(
    (id) =>
      withPersist<SavingContribution>('contributions', (prev) =>
        prev.filter((c) => c.id !== id),
      'kontribusi tabungan'),
    [withPersist],
  );

  const saveSettings: DataActions['saveSettings'] = useCallback((input) => {
    let next: AppSettings = DEFAULT_SETTINGS;
    setState((prev) => {
      next = { ...prev.settings, ...input };
      return { ...prev, settings: next };
    });
    return storage.saveSettings(next);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await storage.setOnboardingDone();
    setState((prev) => ({ ...prev, onboardingDone: true }));
  }, []);

  const resetAllData: DataActions['resetAllData'] = useCallback(async () => {
    await storage.clearAll();
    const settings = await storage.loadSettings();
    setState((prev) => ({
      ...prev,
      transactions: [],
      budgets: [],
      goals: [],
      contributions: [],
      settings,
      error: null,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      reload,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      upsertBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,
      addContribution,
      deleteContribution,
      saveSettings,
      completeOnboarding,
      resetAllData,
    }),
    [
      state,
      reload,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      upsertBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,
      addContribution,
      deleteContribution,
      saveSettings,
      completeOnboarding,
      resetAllData,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataState & DataActions {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData harus dipakai di dalam <DataProvider>');
  }
  return ctx;
}
