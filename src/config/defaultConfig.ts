import { defaultAscii, defaultEmojis, defaultFormat, defaultWords } from '../core/defaults.js';
import type { StampogMode } from '../core/types.js';

export interface EnvConfig {
  auto?: boolean;
  sources?: string[];
  map?: Record<string, string>;
  fallback?: string;
}

export interface CloudConfig {
  enabled?: boolean;
  provider?: string;
  auto?: boolean;
  sources?: string[];
  fallback?: string;
}

export interface StampogConfig {
  name: string;
  mode: StampogMode;
  format: string;
  env: string | EnvConfig;
  cloud: string | CloudConfig;
  tokens: {
    count: number;
  };
  date: {
    format: string;
    timezone: 'local' | 'utc';
  };
  time: {
    enabled: boolean;
    format: string;
    timezone: 'local' | 'utc';
  };
  words: {
    count: number;
    allow: string[];
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
    dirtyMarker: string;
    usernameSource: string;
    fallbackUsernameSource: string;
  };
  badge: {
    enabled: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    startVisible: boolean;
    copyOnClick: boolean;
    showDetailsOnClick: boolean;
    theme: 'light' | 'dark';
  };
  output: {
    json: string;
    js: string;
    htmlSnippet: string;
  };
}

export const defaultConfig: StampogConfig = {
  name: 'stampog',
  mode: 'emoji',
  format: defaultFormat,
  env: {
    auto: true,
    sources: ['VITE_ENV', 'NODE_ENV', 'DEPLOY_ENV'],
    map: {
      production: 'prd',
      staging: 'stg',
      development: 'dev',
      test: 'tst',
    },
    fallback: 'dev',
  },
  cloud: {
    enabled: true,
    auto: true,
    sources: [
      'VERCEL',
      'NETLIFY',
      'GITHUB_ACTIONS',
      'RAILWAY_ENVIRONMENT',
      'FLY_APP_NAME',
      'RENDER',
      'CF_PAGES',
      'GOOGLE_CLOUD_PROJECT',
      'AWS_REGION',
      'AZURE_CLIENT_ID',
      'AZURE_SUBSCRIPTION_ID',
    ],
    fallback: 'loc',
  },
  tokens: {
    count: 2,
  },
  date: {
    format: 'yyyy-mm-dd',
    timezone: 'local',
  },
  time: {
    enabled: true,
    format: 'hh:mm',
    timezone: 'local',
  },
  words: {
    count: 2,
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
    includeBranch: false,
    includeDirty: true,
    dirtyMarker: '~',
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
    json: 'dist/stampog.json',
    js: 'dist/stampog.js',
    htmlSnippet: 'dist/stampog-snippet.html',
  },
};
