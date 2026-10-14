/** Format nominal Rupiah Indonesia: 1250000 -> "Rp1.250.000" */
export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const negative = rounded < 0;
  const abs = Math.abs(rounded);
  const text = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(abs);
  return `${negative ? '-' : ''}Rp${text}`;
}

/** Versi ringkas untuk tampilan kecil: 1.250.000 -> "Rp1,25 jt" */
export function formatRupiahCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}Rp${trimDecimals(abs / 1_000_000_000)} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp${trimDecimals(abs / 1_000_000)} jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp${trimDecimals(abs / 1_000)} rb`;
  }
  return `${sign}Rp${new Intl.NumberFormat('id-ID').format(abs)}`;
}

function trimDecimals(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '').replace('.', ',');
}

/** "2025-10-13" -> "13 Okt 2025" (ganti dengan parsing manual agar aman lintas timezone). */
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function parseISODate(date: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(date);
}

export function formatDateShort(date: string): string {
  const d = parseISODate(date);
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateLong(date: string): string {
  const d = parseISODate(date);
  if (Number.isNaN(d.getTime())) return date;
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMonthYear(month: string): string {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) return month;
  return `${MONTHS_LONG[m - 1]} ${y}`;
}

export function monthLabel(month: string): string {
  const [, m] = month.split('-').map(Number);
  return MONTHS_SHORT[(m ?? 1) - 1] ?? month;
}

/** Tanggal hari ini dalam format YYYY-MM-DD berdasarkan waktu lokal (bukan UTC). */
export function todayISO(): string {
  return dateToISO(new Date());
}

export function dateToISO(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/** Bulan berjalan "YYYY-MM" waktu lokal. */
export function currentMonth(): string {
  return dateToISO(new Date()).slice(0, 7);
}

export function monthOf(dateISO: string): string {
  return dateISO.slice(0, 7);
}
