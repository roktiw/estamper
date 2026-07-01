import {
  defaultAscii,
  defaultEmojis,
  defaultFormat,
  defaultTokenMappings,
  defaultWordAliases,
  defaultWords,
  presetFormats,
} from './defaults.js';
import { formatDate, formatStamp, formatTime } from './formatStamp.js';
import { createPicker, pickMany } from './pickTokens.js';
import type { GenerateStampOptions, StampParts, StampResult, WordCase } from './types.js';

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
  return Math.min(4, Math.max(0, Math.floor(value ?? fallback)));
}

function commitLength(value: number | undefined): number {
  return Math.min(64, Math.max(1, Math.floor(value ?? DEFAULT_COMMIT_LENGTH)));
}

function segment(value: string | undefined, fallback: string, maxLength = 20): string {
  const cleaned = (value?.trim() || fallback).replaceAll(/\s+/g, '-').replaceAll(/[^a-zA-Z0-9_-]/g, '');
  return (cleaned || fallback).slice(0, maxLength);
}

function title(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatWord(word: string, output: WordCase, aliases = defaultWordAliases): string {
  const alias = aliases.find((item) => item.word === word);
  if (output === 'code2') return alias?.code2 ?? word.slice(0, 2).toUpperCase();
  if (output === 'code3') return alias?.code3 ?? word.slice(0, 3).toUpperCase();
  if (output === 'upper') return word.toUpperCase();
  if (output === 'title') return title(word);
  return word.toLowerCase();
}

function assignIndexed(target: StampParts, prefix: string, values: string[]): void {
  const indexed = target as unknown as Record<string, string>;
  values.forEach((value, index) => {
    indexed[`${prefix}${index + 1}`] = value;
  });
}

function resolveMode(options: GenerateStampOptions): StampParts['mode'] {
  const requested = options.tokenMode && options.tokenMode !== 'auto' ? options.tokenMode : options.mode;
  if (requested === 'ascii') return 'ascii';
  if (requested === 'mixed') return 'mixed';
  if ((requested === 'auto' || options.mode === 'auto') && options.emojiSupported === false) return 'ascii';
  return 'emoji';
}

function tokenSources(options: GenerateStampOptions, mode: StampParts['mode']) {
  const mappings = options.tokenMappings?.length ? options.tokenMappings : defaultTokenMappings;
  const mappedEmojis = mappings.map((mapping) => mapping.emoji).filter(Boolean);
  const asciiKey = options.asciiLength === 3 ? 'ascii3' : 'ascii2';
  const mappedAscii = mappings.map((mapping) => mapping[asciiKey]).filter((value): value is string => Boolean(value));
  return {
    emojis: cleanList(options.tokens ?? options.emojis, mappedEmojis.length ? mappedEmojis : defaultEmojis),
    ascii: cleanList(options.ascii, mappedAscii.length ? mappedAscii : defaultAscii),
    mode,
  };
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
  let next = format;
  if (mode === 'ascii') {
    next = next
      .replaceAll('{env}', '{envAscii}')
      .replaceAll('{cloud}', '{cloudAscii}')
      .replaceAll(/\{emoji(\d+)\}/g, '{ascii$1}');
  }
  return next;
}

export function generateStamp(options: GenerateStampOptions = {}): StampResult {
  const mode = resolveMode(options);
  const dirtyMarker = options.dirtyMarker ?? '~';
  const commitHash = options.commit === null ? undefined : options.commit?.trim() || '0000000';
  const commit = commitHash === undefined ? null : `${commitHash.slice(0, commitLength(options.commitLength))}${options.dirty ? dirtyMarker : ''}`;
  const picker = createPicker(options.seed ?? commitHash);
  const tokenCount = count(options.tokenCount, 2);
  const wordCount = count(options.wordCount, 2);
  const denied = new Set(options.deniedWords ?? []);
  const words = cleanList(options.words, defaultWords).filter((word) => !denied.has(word));
  const pickedWords = pickMany(words, wordCount, picker).map((word) => formatWord(word, options.wordCase ?? 'lower', options.wordAliases));
  const sources = tokenSources(options, mode);
  const pickedEmojis = pickMany(sources.emojis, tokenCount, picker);
  const pickedAscii = pickMany(sources.ascii, tokenCount, picker);
  const tokens = pickedEmojis.map((token, index) => {
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
    date: options.dateFormat === null ? undefined : formatDate(date, options.dateFormat ?? undefined, dateTimezone),
    time: options.includeTime === false || options.timeFormat === null ? undefined : formatTime(date, options.timeFormat ?? undefined, timeTimezone),
    user: options.user === null ? undefined : segment(options.user, 'anonymous'),
    commit,
    branch: options.branch ? `${BRANCH_PREFIX}${segment(options.branch, '', 15)}` : undefined,
    buildNumber: options.buildNumber === undefined || options.buildNumber === null
      ? undefined
      : `${BUILD_NUMBER_PREFIX}${segment(String(options.buildNumber), '', MAX_BUILD_NUMBER_LENGTH)}`,
    dirty: options.dirty ? dirtyMarker : undefined,
    mode,
  };
  assignIndexed(parts, 'word', pickedWords);
  assignIndexed(parts, 'emoji', pickedEmojis);
  assignIndexed(parts, 'ascii', pickedAscii);
  assignIndexed(parts, 'token', tokens);

  const preset = options.preset && options.preset !== 'custom' ? presetFormats[options.preset] : undefined;
  const fallbackFormat = defaultStampFormat(mode, Boolean(cloud), options.includeTime !== false && options.timeFormat !== null, tokenCount, wordCount);
  const stamp = formatStamp(resolveFormat(mode, options.format ?? preset ?? defaultFormat ?? fallbackFormat), parts);
  const maxLength = options.maxLength ?? MAX_STAMP_LENGTH;
  if (stamp.length > maxLength) {
    throw new Error(`Estamper stamp is too long (${stamp.length}/${maxLength}).`);
  }
  return { stamp, parts };
}
