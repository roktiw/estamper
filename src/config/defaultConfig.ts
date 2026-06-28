import { defaultAscii, defaultEmojis, defaultFormat, defaultWords } from '../core/defaults.js';
import type { EstamperMode } from '../core/types.js';

export interface EstamperConfig {
  schemaVersion?: number;
  name: string;
  mode: EstamperMode;
  preset?: string;
  format: string;
  env?: {
    enabled?: boolean;
    value?: string;
    fallback?: string;
    map?: Record<string, string>;
  };
  cloud?: {
    enabled?: boolean;
    provider?: string;
    fallback?: string;
    map?: Record<string, string>;
  };
  date: {
    format: string;
    timezone: 'local' | 'utc';
  };
  time?: {
    enabled?: boolean;
    format?: string;
    timezone?: 'local' | 'utc';
  };
  tokens?: {
    enabled?: boolean;
    count?: number;
    mode?: string;
    asciiLength?: number;
    emoji?: { allow?: string[] };
    ascii?: { allow?: string[] };
    mappings?: unknown[];
  };
  words: {
    allow: string[];
    count?: number;
    case?: string;
    output?: string;
    aliases?: unknown[];
  };
  emojis: {
    allow: string[];
  };
  ascii: {
    allow: string[];
  };
  git: {
    commitLength: number;
    includeBranch: boolean;
    includeDirty: boolean;
    usernameSource: string;
    fallbackUsernameSource: string;
  };
  badge: {
    enabled: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
    startVisible: boolean;
    copyOnClick: boolean;
    showDetailsOnClick: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  output: {
    json: string;
    js: string;
    htmlSnippet: string;
  };
}

export const defaultConfig: EstamperConfig = {
  name: 'estamper',
  mode: 'emoji',
  format: defaultFormat,
  env: {
    enabled: false,
    value: 'auto',
    fallback: 'dev',
    map: {
      production: 'prd',
      preview: 'pre',
      development: 'dev',
    },
  },
  cloud: {
    enabled: false,
    provider: 'auto',
    fallback: 'loc',
    map: {
      'github-pages': 'ghp',
      vercel: 'vcl',
      netlify: 'ntl',
    },
  },
  date: {
    format: 'yyyy-mm-dd-hh:mm:ss',
    timezone: 'local',
  },
  time: {
    enabled: false,
    format: 'hh:mm',
    timezone: 'local',
  },
  tokens: {
    enabled: false,
    count: 2,
    mode: 'auto',
    asciiLength: 2,
    emoji: {
      allow: defaultEmojis,
    },
    ascii: {
      allow: defaultAscii,
    },
    mappings: [],
  },
  words: {
    allow: defaultWords,
  },
  emojis: {
    allow: defaultEmojis,
  },
  ascii: {
    allow: defaultAscii,
  },
  git: {
    commitLength: 7,
    includeBranch: true,
    includeDirty: true,
    usernameSource: 'github',
    fallbackUsernameSource: 'git-config',
  },
  badge: {
    enabled: true,
    position: 'bottom-right',
    startVisible: true,
    copyOnClick: true,
    showDetailsOnClick: true,
    theme: 'dark',
  },
  output: {
    json: 'dist/estamper.json',
    js: 'dist/estamper.js',
    htmlSnippet: 'dist/estamper-snippet.html',
  },
};
