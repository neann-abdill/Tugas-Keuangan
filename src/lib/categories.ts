import type { TransactionType } from '@/types';
import type { IconName } from '@/lib/icons';

export interface CategoryDef {
  id: string;
  name: string;
  type: TransactionType;
  icon: IconName;
  /** Warna aksen kategori. */
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  // Expense
  { id: 'makanan', name: 'Makanan & Minuman', type: 'expense', icon: 'restaurant', color: '#F97316' },
  { id: 'transportasi', name: 'Transportasi', type: 'expense', icon: 'bus', color: '#0EA5E9' },
  { id: 'pendidikan', name: 'Pendidikan', type: 'expense', icon: 'school', color: '#8B5CF6' },
  { id: 'belanja', name: 'Belanja', type: 'expense', icon: 'bag', color: '#EC4899' },
  { id: 'tagihan', name: 'Tagihan', type: 'expense', icon: 'receipt', color: '#EF4444' },
  { id: 'hiburan', name: 'Hiburan', type: 'expense', icon: 'gamepad', color: '#F59E0B' },
  { id: 'kesehatan', name: 'Kesehatan', type: 'expense', icon: 'medkit', color: '#10B981' },
  // Income
  { id: 'gaji', name: 'Gaji', type: 'income', icon: 'briefcase', color: '#10B981' },
  { id: 'uang-saku', name: 'Uang Saku', type: 'income', icon: 'wallet', color: '#14B8A6' },
  // Shared
  { id: 'lainnya', name: 'Lainnya', type: 'income', icon: 'dots', color: '#64748B' },
];

/** Kategori "Lainnya" digunakan oleh kedua tipe transaksi. */
export function categoriesFor(type: TransactionType): CategoryDef[] {
  return CATEGORIES.filter((c) => c.type === type || c.id === 'lainnya');
}

export function getCategory(id: string): CategoryDef {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export const PAYMENT_METHODS: { id: string; label: string }[] = [
  { id: 'cash', label: 'Tunai' },
  { id: 'debit', label: 'Kartu Debit' },
  { id: 'e-wallet', label: 'E-Wallet' },
  { id: 'transfer', label: 'Transfer Bank' },
  { id: 'qris', label: 'QRIS' },
  { id: 'other', label: 'Lainnya' },
];

export function paymentLabel(id: string): string {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label ?? 'Lainnya';
}
