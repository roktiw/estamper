import type { StampParts } from './types.js';

type Timezone = 'local' | 'utc';

interface DateParts {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function dateParts(date: Date, timezone: Timezone): DateParts {
  return timezone === 'utc'
    ? {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hours: date.getUTCHours(),
        minutes: date.getUTCMinutes(),
        seconds: date.getUTCSeconds(),
      }
    : {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
      };
}

function customDateFormat(format: string, parts: DateParts): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return format
    .replaceAll('yyyy', String(parts.year))
    .replaceAll('yy', String(parts.year).slice(-2))
    .replaceAll('mm', pad(parts.month))
    .replaceAll('dd', pad(parts.day))
    .replaceAll('hh', pad(parts.hours));
}

function customTimeFormat(format: string, parts: DateParts): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return format
    .replaceAll('hh', pad(parts.hours))
    .replaceAll('mm', pad(parts.minutes))
    .replaceAll('ss', pad(parts.seconds));
}

export function formatDate(date: Date, format = 'yyyy-mm-dd', timezone: Timezone = 'local'): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const parts = dateParts(date, timezone);
  if (format === 'iso-date') return date.toISOString().slice(0, 10);
  if (format === 'yy-mm-dd') return [String(parts.year).slice(-2), pad(parts.month), pad(parts.day)].join('-');
  if (format === 'mmdd') return `${pad(parts.month)}${pad(parts.day)}`;
  if (format === 'yyyymmdd') return `${parts.year}${pad(parts.month)}${pad(parts.day)}`;
  if (format === 'yyyy-mm-dd') return [parts.year, pad(parts.month), pad(parts.day)].join('-');
  if (format === 'yyyy-mm-dd-hh:mm:ss') {
    return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}-${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
  }
  return customDateFormat(format, parts);
}

export function formatTime(date: Date, format = 'hh:mm', timezone: Timezone = 'local'): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const parts = dateParts(date, timezone);
  if (format === 'hh:mm:ss') return [pad(parts.hours), pad(parts.minutes), pad(parts.seconds)].join(':');
  if (format === 'hhmm') return `${pad(parts.hours)}${pad(parts.minutes)}`;
  if (format === 'hhmmss') return `${pad(parts.hours)}${pad(parts.minutes)}${pad(parts.seconds)}`;
  if (format === 'unix') return String(Math.floor(date.getTime() / 1000));
  if (format === 'hh:mm') return [pad(parts.hours), pad(parts.minutes)].join(':');
  return customTimeFormat(format, parts);
}

export function formatStamp(format: string, parts: StampParts): string {
  return format.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: keyof StampParts) => {
    const value = parts[key];
    return value === undefined ? '' : String(value);
  });
}
