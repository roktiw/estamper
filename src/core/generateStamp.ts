import {
  defaultAscii,
  defaultEmojis,
  defaultWords,
} from './defaults.js';
import { formatDate, formatStamp, formatTime } from './formatStamp.js';
import { createPicker, pickMany } from './pickTokens.js';
import type { GenerateStampOptions, StampParts, StampResult } from './types.js';

const MAX_STAMP_LENGTH = 512;
const DEFAULT_COMMIT_LENGTH = 7;
const MAX_BUILD_NUMBER_LENGTH = 6;
const BRANCH_PREFIX = '~';
const BUILD_NUMBER_PREFIX = '#';

function cleanList(values: string[] | undefined, fallback: string[]): string[] {
  const list = (values?.length ? values : fallback)
    .map((value) => String(value).trim())
    .filter(Boolean)
    .slice(0, 256);
  if (list.some((value) => value.length > 64)) {
    throw new Error('Estamper token values must be 64 characters or shorter.');
  }
  return list;
}

function count(value: number | undefined, fallback: number): number {
  return Math.min(4, Math.max(1, Math.floor(value ?? fallback)));
}

function commitLength(value: number | undefined): number {
  return Math.min(40, Math.max(4, Math.floor(value ?? DEFAULT_COMMIT_LENGTH)));
}

function segment(value: string | undefined, fallback: string, maxLength = 20): string {
  const cleaned = (value?.trim() || fallback).replaceAll(/\s+/g, '-').replaceAll(/[^a-zA-Z0-9_-]/g, '');
  return (cleaned || fallback).slice(0, maxLength);
}

function assignIndexed(target: StampParts, prefix: string, values: string[]): void {
  const indexed = target as unknown as Record<string, string>;
  values.forEach((value, index) => {
    indexed[`${prefix}${index + 1}`] = value;
  });
}

function resolveMode(options: GenerateStampOptions): StampParts['mode'] {
  if (options.mode === 'ascii') return 'ascii';
  if (options.mode === 'mixed') return 'mixed';
  if (options.mode === 'auto' && options.emojiSupported === false) return 'ascii';
  return 'emoji';
}

function defaultStampFormat(mode: StampParts['mode'], hasCloud: boolean, hasTime: boolean, tokenCount: number, wordCount: number): string {
  const tokenPrefix = mode === 'ascii' ? 'ascii' : 'token';
  const fields = [
    mode === 'ascii' ? '{envAscii}' : '{env}',
    ...(hasCloud ? [mode === 'ascii' ? '{cloudAscii}' : '{cloud}'] : []),
    ...Array.from({ length: tokenCount }, (_value, index) => `{${tokenPrefix}${index + 1}}`),
    ...Array.from({ length: wordCount }, (_value, index) => `{word${index + 1}}`),
    '{date}',
    ...(hasTime ? ['{time}'] : []),
    '{user}@{commit}',
  ];
  return fields.join('-');
}

function resolveFormat(mode: StampParts['mode'], format: string): string {
  const hasAsciiPlaceholder = /\{ascii\d+\}/.test(format);
  const hasEmojiPlaceholder = /\{emoji\d+\}/.test(format);
  if (mode === 'ascii' && !hasAsciiPlaceholder && hasEmojiPlaceholder) {
    return format.replaceAll(/\{emoji(\d+)\}/g, '{ascii$1}');
  }
  return format;
}

export function generateStamp(options: GenerateStampOptions = {}): StampResult {
  const mode = resolveMode(options);
  const dirtyMarker = options.dirtyMarker ?? '~';
  const commitHash = options.commit?.trim() || '0000000';
  const commit = `${commitHash.slice(0, commitLength(options.commitLength))}${options.dirty ? dirtyMarker : ''}`;
  const picker = createPicker(options.seed ?? commitHash);
  const tokenCount = count(options.tokenCount, 2);
  const wordCount = count(options.wordCount, 2);
  const words = cleanList(options.words, defaultWords);
  const emojis = cleanList(options.emojis, defaultEmojis);
  const ascii = cleanList(options.ascii, defaultAscii);
  const tokenSource = cleanList(options.tokens, emojis);
  const pickedWords = pickMany(words, wordCount, picker);
  const pickedEmojis = pickMany(emojis, tokenCount, picker);
  const pickedAscii = pickMany(ascii, tokenCount, picker);
  const pickedTokens = pickMany(tokenSource, tokenCount, picker);
  const tokens = pickedTokens.map((token, index) => {
    if (mode === 'ascii') return pickedAscii[index];
    if (mode === 'mixed' && index % 2 === 1) return pickedAscii[index];
    return token;
  });
  const env = segment(options.env, 'dev', 4).toLowerCase();
  const cloud = options.cloud === false ? undefined : segment(options.cloud, 'loc', 4).toLowerCase();
  const date = options.date ?? new Date();
  const dateTimezone = options.dateTimezone ?? options.timezone ?? 'local';
  const timeTimezone = options.timeTimezone ?? options.timezone ?? 'local';

  const parts: StampParts = {
    env,
    envAscii: env.toUpperCase(),
    cloud,
    cloudAscii: cloud?.toUpperCase(),
    word1: pickedWords[0],
    date: formatDate(date, options.dateFormat, dateTimezone),
    time: options.includeTime === false ? undefined : formatTime(date, options.timeFormat, timeTimezone),
    user: segment(options.user, 'anonymous'),
    commit,
    branch: options.branch ? `${BRANCH_PREFIX}${segment(options.branch, '', 15)}` : undefined,
    buildNumber: options.buildNumber === undefined
      ? undefined
      : `${BUILD_NUMBER_PREFIX}${segment(String(options.buildNumber), '', MAX_BUILD_NUMBER_LENGTH)}`,
    dirty: options.dirty,
    mode,
  };
  assignIndexed(parts, 'word', pickedWords);
  assignIndexed(parts, 'emoji', pickedEmojis);
  assignIndexed(parts, 'ascii', pickedAscii);
  assignIndexed(parts, 'token', tokens);

  const fallbackFormat = defaultStampFormat(mode, Boolean(cloud), options.includeTime !== false, tokenCount, wordCount);
  const stamp = formatStamp(resolveFormat(mode, options.format ?? fallbackFormat), parts);
  const maxLength = options.maxLength ?? MAX_STAMP_LENGTH;
  if (stamp.length > maxLength) {
    throw new Error(`Estamper stamp is too long (${stamp.length}/${maxLength}).`);
  }

  return { stamp, parts };
}
