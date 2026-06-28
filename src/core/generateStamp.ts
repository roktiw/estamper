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
import { createPicker } from './pickTokens.js';
import type { GenerateStampOptions, StampParts, StampResult, WordCase } from './types.js';

const MAX_STAMP_LENGTH = 512;

function cleanList(values: string[] | undefined, fallback: string[], allowEmpty = false): string[] {
  const source = values?.length ? values : fallback;
  const list = source.map((value) => String(value).trim()).filter(Boolean).slice(0, 256);
  if (!allowEmpty && list.length === 0) {
    throw new Error('Estamper needs at least one token to pick from.');
  }
  if (list.some((value) => value.length > 64)) {
    throw new Error('Estamper token values must be 64 characters or shorter.');
  }
  return list;
}

function pickMany<T>(items: T[], count: number, pick: (length: number) => number): T[] {
  if (count === 0) return [];
  if (items.length === 0) throw new Error('Estamper needs at least one token to pick from.');
  return Array.from({ length: count }, () => items[pick(items.length)]);
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

function resolveMode(mode: GenerateStampOptions['mode'], tokenMode: GenerateStampOptions['tokenMode']): StampParts['mode'] {
  const requested = tokenMode === 'auto' || tokenMode === undefined ? mode : tokenMode;
  if (requested === 'ascii') return 'ascii';
  if (requested === 'emoji') return 'emoji';
  if (requested === 'auto') {
    const processLike = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined>; stdout?: { isTTY?: boolean } } };
    if (processLike.process?.env?.CI || processLike.process?.stdout?.isTTY === false) return 'ascii';
  }
  return 'emoji';
}

function tokenLists(options: GenerateStampOptions, mode: StampParts['mode']): string[] {
  const mappings = options.tokenMappings?.length ? options.tokenMappings : defaultTokenMappings;
  if (mode === 'ascii') {
    const asciiLength = options.asciiLength === 3 ? 'ascii3' : options.asciiLength === 2 ? 'ascii2' : 'ascii2';
    const mapped = mappings.map((mapping) => mapping[asciiLength]).filter((value): value is string => Boolean(value));
    return cleanList(options.ascii, mapped.length ? mapped : defaultAscii);
  }
  return cleanList(options.emojis, mappings.map((mapping) => mapping.emoji).length ? mappings.map((mapping) => mapping.emoji) : defaultEmojis);
}

export function generateStamp(options: GenerateStampOptions = {}): StampResult {
  const mode = resolveMode(options.mode, options.tokenMode);
  const picker = createPicker(options.seed);
  const tokenCount = Math.min(Math.max(options.tokenCount ?? 2, 0), 4);
  const wordCount = Math.min(Math.max(options.wordCount ?? 2, 0), 4);
  const denied = new Set(options.deniedWords ?? []);
  const words = cleanList(options.words, defaultWords).filter((word) => !denied.has(word));
  const wordAliases = options.wordAliases?.length ? options.wordAliases : defaultWordAliases;
  const selectedWords = pickMany(words, wordCount, picker).map((word) => formatWord(word, options.wordCase ?? 'lower', wordAliases));
  const selectedTokens = pickMany(tokenLists(options, mode), tokenCount, picker);
  const date = options.date ?? new Date();

  const parts: StampParts = {
    mode,
    env: options.env,
    cloud: options.cloud,
    date: options.dateFormat === null ? undefined : formatDate(date, options.dateFormat, options.timezone),
    time: options.timeFormat === null ? undefined : formatTime(date, options.timeFormat, options.timezone),
    user: options.user === null ? undefined : options.user?.trim() || 'unknown',
    commit: options.commit === null ? undefined : (options.commit?.trim() || 'unknown').slice(0, 64),
    branch: options.branch,
    buildNumber: options.buildNumber === null || options.buildNumber === undefined ? undefined : String(options.buildNumber),
    dirty: options.dirty ? options.dirtyMarker ?? '~' : undefined,
  };

  selectedTokens.forEach((token, index) => {
    const dynamicParts = parts as unknown as Record<string, string | undefined>;
    dynamicParts[`token${index + 1}`] = token;
    if (mode === 'emoji') dynamicParts[`emoji${index + 1}`] = token;
    else dynamicParts[`ascii${index + 1}`] = token;
  });
  selectedWords.forEach((word, index) => {
    (parts as unknown as Record<string, string | undefined>)[`word${index + 1}`] = word;
  });

  const preset = options.preset && options.preset !== 'custom' ? presetFormats[options.preset] : undefined;
  const stamp = formatStamp(options.format ?? preset ?? defaultFormat, parts);
  const maxLength = options.maxLength ?? MAX_STAMP_LENGTH;
  if (stamp.length > maxLength) {
    throw new Error(`Estamper stamp is too long (${stamp.length}/${maxLength}).`);
  }

  return { stamp, parts };
}
