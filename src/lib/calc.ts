import type {
  AppSettings,
  Budget,
  SavingContribution,
  SavingsGoal,
  Transaction,
  TransactionType,
} from '@/types';
import { getCategory } from '@/lib/categories';
import { currentMonth, dateToISO, monthOf, parseISODate } from '@/lib/format';

export interface Totals {
  income: number;
  expense: number;
}

/** Jumlahkan transaksi sesuai tipe; hanya menghitung transaksi valid. */
export function totalsOf(transactions: Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense };
}

/** Saldo = saldo awal + total pemasukan - total pengeluaran. */
export function currentBalance(
  transactions: Transaction[],
  settings: Pick<AppSettings, 'initialBalance'>,
): number {
  const { income, expense } = totalsOf(transactions);
  return settings.initialBalance + income - expense;
}

export function filterByType(
  transactions: Transaction[],
  type?: TransactionType | 'all',
): Transaction[] {
  if (!type || type === 'all') return transactions;
  return transactions.filter((t) => t.type === type);
}

export function filterByMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(month));
}

export function filterByCategory(transactions: Transaction[], categoryId?: string): Transaction[] {
  if (!categoryId || categoryId === 'all') return transactions;
  return transactions.filter((t) => t.categoryId === categoryId);
}

export function searchTransactions(
  transactions: Transaction[],
  query: string,
): Transaction[] {
  const q = query.trim().toLowerCase();
  if (!q) return transactions;
  return transactions.filter(
    (t) =>
      t.note.toLowerCase().includes(q) ||
      getCategory(t.categoryId).name.toLowerCase().includes(q),
  );
}

/** Urutkan dari terbaru (tanggal lalu createdAt). */
export function sortByNewest(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  /** 0..1, bisa > 1 ketika melebihi batas. */
  ratio: number;
  status: 'safe' | 'warn' | 'over';
}

export function budgetProgress(
  budgets: Budget[],
  transactions: Transaction[],
  month: string,
  warningThreshold: number,
): BudgetProgress[] {
  const monthTransactions = filterByMonth(transactions, month);
  return budgets
    .map((budget) => {
      const spent = monthTransactions
        .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      const ratio = budget.limitAmount > 0 ? spent / budget.limitAmount : 0;
      const status: BudgetProgress['status'] =
        ratio >= 1 ? 'over' : ratio >= warningThreshold ? 'warn' : 'safe';
      return {
        budget,
        spent,
        remaining: budget.limitAmount - spent,
        ratio,
        status,
      };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

/** Kategori pengeluaran terbesar dalam suatu bulan. */
export function topExpenseCategories(
  transactions: Transaction[],
  month: string,
): { categoryId: string; total: number }[] {
  const byCategory = new Map<string, number>();
  for (const t of filterByMonth(transactions, month)) {
    if (t.type !== 'expense') continue;
    byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? 0) + t.amount);
  }
  return [...byCategory.entries()]
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);
}

export function goalProgress(
  goal: SavingsGoal,
  contributions: SavingContribution[],
): { saved: number; ratio: number; remaining: number } {
  const saved = contributions
    .filter((c) => c.goalId === goal.id)
    .reduce((sum, c) => sum + c.amount, 0);
  const ratio = goal.targetAmount > 0 ? saved / goal.targetAmount : 0;
  return {
    saved,
    ratio: Math.min(ratio, 1),
    remaining: Math.max(goal.targetAmount - saved, 0),
  };
}

export interface CashflowPoint {
  label: string;
  income: number;
  expense: number;
}

/** Arus kas harian (7 hari terakhir), termasuk hari tanpa transaksi. */
export function cashflowLastDays(
  transactions: Transaction[],
  days = 7,
): CashflowPoint[] {
  const points: CashflowPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const iso = dateToISO(d);
    const dayTx = transactions.filter((t) => t.date === iso);
    const { income, expense } = totalsOf(dayTx);
    points.push({ label: String(d.getDate()), income, expense });
  }
  return points;
}

/** Arus kas 6 bulan terakhir berakhir di bulan yang diberikan. */
export function cashflowLastMonths(
  transactions: Transaction[],
  months = 6,
  endMonth = currentMonth(),
): CashflowPoint[] {
  const points: CashflowPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const [y, m] = endMonth.split('-').map(Number);
    const d = new Date(y, m - 1 - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const { income, expense } = totalsOf(filterByMonth(transactions, month));
    points.push({ label: month.slice(5), income, expense });
  }
  return points;
}

/** Sisa hari menuju deadline (positif = masih ada waktu). */
export function daysUntil(dateISO: string): number {
  const target = parseISODate(dateISO);
  if (Number.isNaN(target.getTime())) return 0;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

/** ID unik sederhana, cukup untuk data lokal. */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export { monthOf };
