import { asciiFormat, defaultAscii, defaultEmojis, defaultFormat, defaultWords } from './defaults.js';
import { formatDate, formatStamp } from './formatStamp.js';
import { createPicker, pickTwo } from './pickTokens.js';
import type { GenerateStampOptions, StampParts, StampResult } from './types.js';

const MAX_STAMP_LENGTH = 512;

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

function resolveMode(options: GenerateStampOptions): StampParts['mode'] {
  if (options.mode === 'ascii') return 'ascii';
  if (options.mode === 'auto' && options.emojiSupported === false) return 'ascii';
  return 'emoji';
}

function resolveFormat(mode: StampParts['mode'], format?: string): string {
  if (!format) return mode === 'ascii' ? asciiFormat : defaultFormat;
  const hasAsciiPlaceholder = format.includes('{ascii1}') || format.includes('{ascii2}');
  if (mode === 'ascii' && !hasAsciiPlaceholder && format.includes('{emoji')) {
    return format.replaceAll('{emoji1}', '{ascii1}').replaceAll('{emoji2}', '{ascii2}');
  }
  return format;
}

export function generateStamp(options: GenerateStampOptions = {}): StampResult {
  const mode = resolveMode(options);
  const picker = createPicker(options.seed);
  const words = cleanList(options.words, defaultWords);
  const emojis = cleanList(options.emojis, defaultEmojis);
  const ascii = cleanList(options.ascii, defaultAscii);
  const [word1, word2] = pickTwo(words, picker);
  const [emoji1, emoji2] = pickTwo(emojis, picker);
  const [ascii1, ascii2] = pickTwo(ascii, picker);

  const parts: StampParts = {
    emoji1,
    emoji2,
    ascii1,
    ascii2,
    word1,
    word2,
    date: formatDate(options.date ?? new Date(), options.dateTimezone),
    user: options.user?.trim() || 'unknown',
    commit: (options.commit?.trim() || 'unknown').slice(0, 64),
    branch: options.branch,
    dirty: options.dirty,
    mode,
  };

  const stamp = formatStamp(resolveFormat(mode, options.format), parts);
  const maxLength = options.maxLength ?? MAX_STAMP_LENGTH;
  if (stamp.length > maxLength) {
    throw new Error(`Stampog stamp is too long (${stamp.length}/${maxLength}).`);
  }

  return { stamp, parts };
}
