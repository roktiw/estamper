export type StampogMode = 'emoji' | 'ascii' | 'auto';

export interface StampParts {
  emoji1?: string;
  emoji2?: string;
  ascii1?: string;
  ascii2?: string;
  word1: string;
  word2: string;
  date: string;
  user: string;
  commit: string;
  branch?: string;
  dirty?: boolean;
  mode: 'emoji' | 'ascii';
}

export interface StampResult {
  stamp: string;
  parts: StampParts;
}

export interface GenerateStampOptions {
  mode?: StampogMode;
  words?: string[];
  emojis?: string[];
  ascii?: string[];
  user?: string;
  commit?: string;
  branch?: string;
  dirty?: boolean;
  date?: Date;
  seed?: string | number;
  format?: string;
  maxLength?: number;
}
