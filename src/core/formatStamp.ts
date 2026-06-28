import type { StampParts } from './types.js';

export function formatDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + '-' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join(':');
}

export function formatStamp(format: string, parts: StampParts): string {
  return format.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: keyof StampParts) => {
    const value = parts[key];
    return value === undefined ? '' : String(value);
  });
}
