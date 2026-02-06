// src/lib/date.ts
// Date formatting utilities using date-fns

import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';

export function formatDisplayDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'MMM d');
}

export function getRelativeDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDateHeader(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'EEEE, MMMM d, yyyy');
}

export function groupByDate<T extends { releaseDate: string }>(
  items: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  
  for (const item of items) {
    const dateKey = item.releaseDate.split('T')[0]; // Get YYYY-MM-DD portion
    const existing = groups.get(dateKey) || [];
    existing.push(item);
    groups.set(dateKey, existing);
  }
  
  return groups;
}

export function formatEpisodeLabel(seasonNumber: number, episodeNumber: number): string {
  return `S${String(seasonNumber).padStart(2, '0')}E${String(episodeNumber).padStart(2, '0')}`;
}
