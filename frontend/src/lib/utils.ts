import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatDate(timestamp: { seconds: number; nanoseconds: number } | Date | null | undefined): string {
  if (!timestamp) return 'Just now';
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(value: number | string, unit?: string): string {
  if (typeof value === 'string') return `${value}${unit ? ` ${unit}` : ''}`;
  if (unit === '$') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value) + (unit ? ` ${unit}` : '');
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'complete':
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'processing':
      return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20 animate-pulse';
    case 'pending':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'error':
      return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  }
}
