import type { TokenMapping, WordAlias } from './defaults.js';

export type StampogMode = 'emoji' | 'ascii' | 'auto';
export type PresetName = 'minimal' | 'standard' | 'verbose' | 'games' | 'ci' | 'ascii' | 'custom';
export type WordCase = 'lower' | 'upper' | 'title' | 'code2' | 'code3';
export type TimezoneMode = 'local' | 'utc' | string;

export interface StampParts {
  env?: string;
  cloud?: string;
  token1?: string;
  token2?: string;
  token3?: string;
  token4?: string;
  emoji1?: string;
  emoji2?: string;
  ascii1?: string;
  ascii2?: string;
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
  dirty?: string;
  mode: 'emoji' | 'ascii';
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
  tokenMappings?: TokenMapping[];
  tokenCount?: number;
  tokenMode?: StampogMode;
  asciiLength?: 2 | 3;
  env?: string;
  cloud?: string;
  user?: string | null;
  commit?: string | null;
  branch?: string;
  buildNumber?: string | number | null;
  dirty?: boolean;
  dirtyMarker?: string;
  date?: Date;
  dateFormat?: string | null;
  timeFormat?: string | null;
  timezone?: TimezoneMode;
  seed?: string | number;
  format?: string;
  maxLength?: number;
}
