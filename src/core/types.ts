export type EstamperMode = 'emoji' | 'ascii' | 'mixed' | 'auto';

export interface StampParts {
  env: string;
  envAscii: string;
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
  word1: string;
  word2?: string;
  word3?: string;
  word4?: string;
  date: string;
  time?: string;
  user: string;
  commit: string;
  branch?: string;
  buildNumber?: string;
  dirty?: boolean;
  mode: 'emoji' | 'ascii' | 'mixed';
}

export interface StampResult {
  stamp: string;
  parts: StampParts;
}

export interface GenerateStampOptions {
  mode?: EstamperMode;
  env?: string;
  cloud?: string | false;
  words?: string[];
  emojis?: string[];
  ascii?: string[];
  tokens?: string[];
  tokenCount?: number;
  wordCount?: number;
  user?: string;
  commit?: string;
  commitLength?: number;
  branch?: string;
  buildNumber?: string | number;
  dirty?: boolean;
  dirtyMarker?: string;
  date?: Date;
  dateFormat?: string;
  dateTimezone?: 'local' | 'utc';
  includeTime?: boolean;
  timeFormat?: string;
  timeTimezone?: 'local' | 'utc';
  timezone?: 'local' | 'utc';
  seed?: string | number;
  format?: string;
  maxLength?: number;
  emojiSupported?: boolean;
}
