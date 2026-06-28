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
    throw new Error('Stampog token values must be 64 characters or shorter.');
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

function defaultStampFormat(mode: StampParts['mode'], hasCloud: boolean, hasTime: boolean): string {
  const tokenFields = mode === 'ascii' ? ['{ascii1}', '{ascii2}'] : ['{token1}', '{token2}'];
  const fields = [
    mode === 'ascii' ? '{envAscii}' : '{env}',
    ...(hasCloud ? [mode === 'ascii' ? '{cloudAscii}' : '{cloud}'] : []),
    ...tokenFields,
    '{word1}',
    '{word2}',
    '{date}',
    ...(hasTime ? ['{time}'] : []),
    '{user}@{commit}',
  ];
  return fields.join('-');
}

export function generateStamp(options: GenerateStampOptions = {}): StampResult {
  const mode: StampParts['mode'] = options.mode === 'ascii' ? 'ascii' : options.mode === 'mixed' ? 'mixed' : 'emoji';
  const dirtyMarker = options.dirtyMarker ?? '~';
  const commitHash = options.commit?.trim() || '0000000';
  const commit = `${commitHash.slice(0, commitLength(options.commitLength))}${options.dirty ? dirtyMarker : ''}`;
  const picker = createPicker(options.seed ?? commitHash);
  const words = cleanList(options.words, defaultWords);
  const emojis = cleanList(options.emojis, defaultEmojis);
  const ascii = cleanList(options.ascii, defaultAscii);
  const pickedWords = pickMany(words, count(options.wordCount, 2), picker);
  const pickedEmojis = pickMany(emojis, count(options.tokenCount, 2), picker);
  const pickedAscii = pickMany(ascii, count(options.tokenCount, 2), picker);
  const tokens = pickedEmojis.map((emoji, index) => {
    if (mode === 'ascii') return pickedAscii[index];
    if (mode === 'mixed' && index % 2 === 1) return pickedAscii[index];
    return emoji;
  });
  const env = segment(options.env, 'dev', 4).toLowerCase();
  const cloud = options.cloud === false ? undefined : segment(options.cloud, 'loc', 4).toLowerCase();
  const date = options.date ?? new Date();

  const parts: StampParts = {
    env,
    envAscii: env.toUpperCase(),
    cloud,
    cloudAscii: cloud?.toUpperCase(),
    word1: pickedWords[0],
    date: formatDate(date, options.dateFormat, options.dateTimezone),
    time: options.includeTime === false ? undefined : formatTime(date, options.timeFormat, options.timeTimezone),
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

  const fallbackFormat = defaultStampFormat(mode, Boolean(cloud), options.includeTime !== false);
  const stamp = formatStamp(options.format ?? fallbackFormat, parts);
  const maxLength = options.maxLength ?? MAX_STAMP_LENGTH;
  if (stamp.length > maxLength) {
    throw new Error(`Stampog stamp is too long (${stamp.length}/${maxLength}).`);
  }

  return { stamp, parts };
}
