import type { TokenMapping, WordAlias } from './defaults.js';

export type StampogMode = 'emoji' | 'ascii' | 'mixed' | 'auto';
export type EstamperMode = StampogMode;
export type PresetName = 'minimal' | 'standard' | 'verbose' | 'games' | 'ci' | 'ascii' | 'custom';
export type WordCase = 'lower' | 'upper' | 'title' | 'code2' | 'code3';
export type TimezoneMode = 'local' | 'utc' | string;

export interface StampParts {
  env?: string;
  envAscii?: string;
  cloud?: string;
  cloudAscii?: string;
  token1?: string;
  token2?: string;
  token3?: string;
  token4?: string;
  emoji1?: string;
  emoji2?: string;
  emoji3?: string;
  emoji4?: string;
  ascii1?: string;
  ascii2?: string;
  ascii3?: string;
  ascii4?: string;
  word1?: string;
  word2?: string;
  word3?: string;
  word4?: string;
  date?: string;
  time?: string;
  user?: string | null;
  commit?: string | null;
  branch?: string;
  buildNumber?: string;
  dirty?: string | boolean;
  mode: 'emoji' | 'ascii' | 'mixed';
}

export interface StampResult {
  stamp: string;
  parts: StampParts;
}

export interface GenerateStampOptions {
  mode?: StampogMode;
  preset?: PresetName;
  words?: string[];
  deniedWords?: string[];
  wordAliases?: WordAlias[];
  wordCount?: number;
  wordCase?: WordCase;
  emojis?: string[];
  ascii?: string[];
  tokens?: string[];
  tokenMappings?: TokenMapping[];
  tokenCount?: number;
  tokenMode?: StampogMode;
  asciiLength?: 2 | 3;
  env?: string;
  cloud?: string | false;
  user?: string | null;
  commit?: string | null;
  commitLength?: number;
  branch?: string;
  buildNumber?: string | number | null;
  dirty?: boolean;
  dirtyMarker?: string;
  date?: Date;
  dateFormat?: string | null;
  dateTimezone?: TimezoneMode;
  includeTime?: boolean;
  timeFormat?: string | null;
  timeTimezone?: TimezoneMode;
  timezone?: TimezoneMode;
  seed?: string | number;
  format?: string;
  maxLength?: number;
  emojiSupported?: boolean;
}
