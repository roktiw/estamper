import { defaultAscii, defaultEmojis, defaultFormat, defaultWords } from '../core/defaults.js';
import type { EstamperMode } from '../core/types.js';

export interface EnvConfig {
  enabled?: boolean;
  value?: string;
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
  map?: Record<string, string>;
  fallback?: string;
}

export interface EstamperConfig {
  schemaVersion?: number;
  name: string;
  mode: EstamperMode;
  preset?: string;
  format: string;
  env: string | EnvConfig;
  cloud: string | CloudConfig;
  tokens: {
    enabled?: boolean;
    count: number;
    mode?: string;
    asciiLength?: number;
    emoji?: { allow?: string[] };
    ascii?: { allow?: string[] };
    mappings?: unknown[];
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
    dirtyMarker: string;
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
  schemaVersion: 1,
  name: 'estamper',
  mode: 'emoji',
  format: defaultFormat,
  env: {
    enabled: true,
    value: 'auto',
    auto: true,
    sources: ['VITE_ENV', 'NODE_ENV', 'DEPLOY_ENV', 'ESTAMPER_ENV'],
    map: {
      production: 'prd',
      preview: 'pre',
      staging: 'stg',
      development: 'dev',
      test: 'tst',
    },
    fallback: 'dev',
  },
  cloud: {
    enabled: true,
    provider: 'auto',
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
      'ESTAMPER_CLOUD',
    ],
    map: {
      'github-pages': 'ghp',
      vercel: 'vcl',
      netlify: 'ntl',
      railway: 'rwy',
      fly: 'fly',
      render: 'rndr',
      cloudflare: 'cfp',
      gcp: 'gcp',
      aws: 'aws',
      azure: 'az',
    },
    fallback: 'loc',
  },
  tokens: {
    enabled: true,
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
    json: 'dist/estamper.json',
    js: 'dist/estamper.js',
    htmlSnippet: 'dist/estamper-snippet.html',
  },
};
