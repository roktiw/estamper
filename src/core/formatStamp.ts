import type { StampParts } from './types.js';

export function formatDate(date: Date, timezone: 'local' | 'utc' = 'local'): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const components = timezone === 'utc'
    ? {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth(),
        day: date.getUTCDate(),
        hours: date.getUTCHours(),
        minutes: date.getUTCMinutes(),
        seconds: date.getUTCSeconds(),
      }
    : {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
      };
  return [
    components.year,
    pad(components.month + 1),
    pad(components.day),
  ].join('-') + '-' + [
    pad(components.hours),
    pad(components.minutes),
    pad(components.seconds),
  ].join(':');
}

export function formatStamp(format: string, parts: StampParts): string {
  return format.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: keyof StampParts) => {
    const value = parts[key];
    return value === undefined ? '' : String(value);
  });
}
