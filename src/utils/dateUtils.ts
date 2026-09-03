/**
 * Date and calculation helper functions
 */

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDate(
  dateStr: string | undefined,
  format: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'YYYY-MM-DD'
): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const [year, month, day] = parts;
  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  }
  if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  }
  return `${year}-${month}-${day}`;
}

export function formatDatePretty(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts.map(Number);
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timeStr: string | undefined, format: '12h' | '24h' = '12h'): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return timeStr;

  if (format === '24h') {
    return timeStr;
  }

  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${mStr || '00'} ${ampm}`;
}

export function formatCurrency(amount: number, currency: string = '₹'): string {
  const locale = currency === '₹' ? 'en-IN' : 'en-US';
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return `${currency}${formatted}`;
}

export function getDaysDiff(targetDateStr: string): number {
  if (!targetDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getRelativeDayLabel(dateStr: string): { label: string; isOverdue: boolean; isToday: boolean } {
  const diff = getDaysDiff(dateStr);
  if (diff < 0) {
    const days = Math.abs(diff);
    return {
      label: days === 1 ? 'Overdue by 1 day' : `Overdue by ${days} days`,
      isOverdue: true,
      isToday: false,
    };
  }
  if (diff === 0) {
    return { label: 'Today', isOverdue: false, isToday: true };
  }
  if (diff === 1) {
    return { label: 'Tomorrow', isOverdue: false, isToday: false };
  }
  if (diff <= 7) {
    return { label: `In ${diff} days`, isOverdue: false, isToday: false };
  }
  return { label: dateStr, isOverdue: false, isToday: false };
}

export function isDateInMonth(dateStr: string, year: number, monthIndex: number): boolean {
  if (!dateStr) return false;
  const [y, m] = dateStr.split('-').map(Number);
  return y === year && m - 1 === monthIndex;
}

export function isDateInYear(dateStr: string, year: number): boolean {
  if (!dateStr) return false;
  const [y] = dateStr.split('-').map(Number);
  return y === year;
}

export function isDateInWeek(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay(); // 0 is Sunday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);

  return target >= startOfWeek && target <= endOfWeek;
}

export function getNextOccurrence(dateStr: string, frequency: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'half_yearly':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setDate(date.getDate() + 1);
  }

  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, '0');
  const nd = String(date.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}
