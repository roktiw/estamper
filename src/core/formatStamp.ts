import type { StampParts } from './types.js';

function read(date: Date, timezone: 'local' | 'utc', part: 'FullYear' | 'Month' | 'Date' | 'Hours' | 'Minutes' | 'Seconds'): number {
  const prefix = timezone === 'utc' ? 'getUTC' : 'get';
  return (date[`${prefix}${part}` as keyof Date] as () => number).call(date);
}

export function formatDate(date: Date, format = 'yyyy-mm-dd-hh:mm:ss', timezone: 'local' | 'utc' = 'local'): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const values = {
    yyyy: String(read(date, timezone, 'FullYear')),
    mm: pad(read(date, timezone, 'Month') + 1),
    dd: pad(read(date, timezone, 'Date')),
    hh: pad(read(date, timezone, 'Hours')),
    min: pad(read(date, timezone, 'Minutes')),
    ss: pad(read(date, timezone, 'Seconds')),
  };
  if (format === 'yyyy-mm-dd-hh:mm:ss') {
    return `${values.yyyy}-${values.mm}-${values.dd}-${values.hh}:${values.min}:${values.ss}`;
  }
  return format
    .replaceAll('yyyy', values.yyyy)
    .replaceAll('mm', values.mm)
    .replaceAll('dd', values.dd)
    .replaceAll('hh', values.hh)
    .replaceAll('ss', values.ss)
    .replaceAll('min', values.min);
}

export function formatStamp(format: string, parts: StampParts): string {
  return format.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: keyof StampParts) => {
    const value = parts[key];
    return value === undefined ? '' : String(value);
  });
}
