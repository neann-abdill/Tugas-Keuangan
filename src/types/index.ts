export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'cash'
  | 'debit'
  | 'e-wallet'
  | 'transfer'
  | 'qris'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Nominal dalam Rupiah (bisa desimal, dibulatkan ke rupiah penuh saat simpan). */
  amount: number;
  categoryId: string;
  /** Tanggal transaksi (umumnya YYYY-MM-DD dari toISOString lokal via helper). */
  date: string;
  /** Catatan / deskripsi transaksi. */
  note: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  /** Batas belanja bulanan untuk kategori ini, dalam Rupiah. */
  limitAmount: number;
  /** Periode "YYYY-MM". */
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface AppSettings {
  userName: string;
  /** Saldo awal rekening/dompet sebelum ada transaksi. */
  initialBalance: number;
  theme: ThemePreference;
  currency: 'IDR';
  notificationsEnabled: boolean;
  budgetWarningThreshold: number; // 0..1, mis. 0.8 -> peringatan di 80%
}

export const DEFAULT_SETTINGS: AppSettings = {
  userName: '',
  initialBalance: 0,
  theme: 'system',
  currency: 'IDR',
  notificationsEnabled: false,
  budgetWarningThreshold: 0.8,
};
