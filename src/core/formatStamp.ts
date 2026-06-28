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

export function formatDate(date: Date, format = 'yyyy-mm-dd', timezone: Timezone = 'local'): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const parts = dateParts(date, timezone);
  if (format === 'yy-mm-dd') return [String(parts.year).slice(-2), pad(parts.month), pad(parts.day)].join('-');
  if (format === 'mmdd') return `${pad(parts.month)}${pad(parts.day)}`;
  if (format === 'yyyymmdd') return `${parts.year}${pad(parts.month)}${pad(parts.day)}`;
  return [parts.year, pad(parts.month), pad(parts.day)].join('-');
}

export function formatTime(date: Date, format = 'hh:mm', timezone: Timezone = 'local'): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const parts = dateParts(date, timezone);
  if (format === 'hh:mm:ss') return [pad(parts.hours), pad(parts.minutes), pad(parts.seconds)].join(':');
  if (format === 'hhmm') return `${pad(parts.hours)}${pad(parts.minutes)}`;
  if (format === 'hhmmss') return `${pad(parts.hours)}${pad(parts.minutes)}${pad(parts.seconds)}`;
  if (format === 'unix') return String(Math.floor(date.getTime() / 1000));
  return [pad(parts.hours), pad(parts.minutes)].join(':');
}

export function formatStamp(format: string, parts: StampParts): string {
  return format.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: keyof StampParts) => {
    const value = parts[key];
    return value === undefined ? '' : String(value);
  });
}
