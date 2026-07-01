import type { StampParts, TimezoneMode } from './types.js';

const placeholders = new Set([
  'env', 'envAscii', 'cloud', 'cloudAscii', 'token1', 'token2', 'token3', 'token4',
  'emoji1', 'emoji2', 'emoji3', 'emoji4', 'ascii1', 'ascii2', 'ascii3', 'ascii4',
  'word1', 'word2', 'word3', 'word4', 'date', 'time', 'user', 'commit', 'branch', 'buildNumber', 'dirty',
]);

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function unixTime(date: Date): string {
  return String(Math.floor(date.getTime() / 1000));
}

function dateParts(date: Date, timezone: TimezoneMode = 'local') {
  const utc = timezone === 'utc';
  if (timezone !== 'local' && timezone !== 'utc') {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      }).formatToParts(date);
      const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      return {
        year: Number(values.year),
        month: Number(values.month),
        day: Number(values.day),
        hour: Number(values.hour),
        minute: Number(values.minute),
        second: Number(values.second),
      };
    } catch {
      // Fall back to local time for invalid or unsupported timezone names.
    }
  }
  return {
    year: utc ? date.getUTCFullYear() : date.getFullYear(),
    month: (utc ? date.getUTCMonth() : date.getMonth()) + 1,
    day: utc ? date.getUTCDate() : date.getDate(),
    hour: utc ? date.getUTCHours() : date.getHours(),
    minute: utc ? date.getUTCMinutes() : date.getMinutes(),
    second: utc ? date.getUTCSeconds() : date.getSeconds(),
  };
}

export function formatDate(date: Date, format = 'yyyy-mm-dd', timezone: TimezoneMode = 'local'): string {
  const part = dateParts(date, timezone);
  const custom = () => format
    .replaceAll('yyyy', String(part.year))
    .replaceAll('yy', String(part.year).slice(-2))
    .replaceAll('mm', pad(part.month))
    .replaceAll('dd', pad(part.day))
    .replaceAll('hh', pad(part.hour));
  switch (format) {
    case 'yy-mm-dd':
      return `${String(part.year).slice(-2)}-${pad(part.month)}-${pad(part.day)}`;
    case 'yyyymmdd':
      return `${part.year}${pad(part.month)}${pad(part.day)}`;
    case 'mmdd':
      return `${pad(part.month)}${pad(part.day)}`;
    case 'iso-date':
    case 'yyyy-mm-dd':
      return `${part.year}-${pad(part.month)}-${pad(part.day)}`;
    case 'unix':
      return unixTime(date);
    // Legacy Stampog date format; new Estamper configs should prefer separate {date} and {time} placeholders.
    case 'yyyy-mm-dd-hh:mm:ss':
      return `${part.year}-${pad(part.month)}-${pad(part.day)}-${pad(part.hour)}:${pad(part.minute)}:${pad(part.second)}`;
    default:
      return custom();
  }
}

export function formatTime(date: Date, format = 'hh:mm', timezone: TimezoneMode = 'local'): string {
  const part = dateParts(date, timezone);
  const custom = () => format
    .replaceAll('hh', pad(part.hour))
    .replaceAll('mm', pad(part.minute))
    .replaceAll('ss', pad(part.second));
  switch (format) {
    case 'hh:mm:ss':
      return `${pad(part.hour)}:${pad(part.minute)}:${pad(part.second)}`;
    case 'hhmm':
      return `${pad(part.hour)}${pad(part.minute)}`;
    case 'hhmmss':
      return `${pad(part.hour)}${pad(part.minute)}${pad(part.second)}`;
    case 'unix':
      return unixTime(date);
    case 'hh:mm':
      return `${pad(part.hour)}:${pad(part.minute)}`;
    default:
      return custom();
  }
}

export function validateFormat(format: string): void {
  for (const match of format.matchAll(/\{([a-zA-Z0-9_]+)\}/g)) {
    if (!placeholders.has(match[1])) {
      throw new Error(`Invalid Estamper config: unknown format placeholder {${match[1]}}.`);
    }
  }
}

export function formatStamp(format: string, parts: StampParts): string {
  validateFormat(format);
  return format
    .replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: keyof StampParts) => {
      const value = parts[key];
      return value === undefined || value === null ? '' : String(value);
    })
    .replace(/-{2,}/g, '-')
    .replace(/([/_.])-+/g, '$1')
    .replace(/(^-|-$)/g, '')
    .replace(/([@#~])-+/g, '$1')
    .replace(/[@#]$/g, '');
}
