import { defaultSecurity, type SecurityPolicy } from '../security/policy.js';
import {
  defaultAscii,
  defaultEmojis,
  defaultFormat,
  defaultTokenMappings,
  defaultWordAliases,
  defaultWords,
} from '../core/defaults.js';
import type { PresetName, StampogMode, WordCase } from '../core/types.js';
import type { TokenMapping, WordAlias } from '../core/defaults.js';

export interface EstamperConfig {
  security: SecurityPolicy;
  schemaVersion: 1;
  name: string;
  mode: StampogMode;
  preset: PresetName;
  format: string;
  seed: {
    strategy: 'random' | 'commit' | 'commit-date' | 'fixed';
    fixed: string | number | null;
  };
  env: {
    enabled: boolean;
    value: string;
    fallback: string;
    map: Record<string, string>;
    sources: string[];
  };
  cloud: {
    enabled: boolean;
    provider: string;
    fallback: string;
    map: Record<string, string>;
    detection: Record<string, string>;
  };
  tokens: {
    enabled: boolean;
    count: number;
    mode: StampogMode;
    separator: string;
    asciiLength: 2 | 3;
    emoji: { allow: string[]; deny: string[] };
    ascii: { allow: string[]; deny: string[] };
    mappings: TokenMapping[];
  };
  words: {
    enabled: boolean;
    count: number;
    case: WordCase;
    output?: 'full' | 'code2' | 'code3';
    separator: string;
    allow: string[];
    deny: string[];
    aliases: WordAlias[];
  };
  date: {
    enabled: boolean;
    format: string;
    timezone: string;
    source: string;
    env: string[];
  };
  time: {
    enabled: boolean;
    format: string;
    timezone: string;
  };
  user: {
    enabled: boolean;
    source: string;
    fallback: string;
    maxLength: number;
    sanitize: boolean;
    sources: string[];
  };
  commit: {
    enabled: boolean;
    length: number;
    prefix: string;
    includeDirty: boolean;
    dirtyMarker: string;
    fallback: string;
    sources: string[];
  };
  branch: {
    enabled: boolean;
    prefix: string;
    maxLength: number;
    sanitize: boolean;
    fallback: string | null;
    sources: string[];
  };
  buildNumber: {
    enabled: boolean;
    prefix: string;
    source: string;
    fallback: string | null;
    sources: string[];
  };
  badge: {
    enabled: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline' | 'custom';
    theme: 'auto' | 'dark' | 'light' | 'minimal';
    copyOnClick: boolean;
    showDetailsOnClick: boolean;
    persistPosition: boolean;
    draggable: boolean;
    zIndex: number;
    startVisible?: boolean;
  };
  output: {
    json: string;
    js: string;
    htmlSnippet: string;
    css: string;
    meta: boolean;
  };
  validation: {
    maxStampLength: number;
    failOnUnknownEmoji: boolean;
    failOnUnknownWord: boolean;
    requireGit: boolean;
    requireCommit: boolean;
    allowUnsafeChars: boolean;
  };
  /** @deprecated legacy Stampog config shape */
  emojis?: { allow: string[] };
  /** @deprecated legacy Stampog config shape */
  ascii?: { allow: string[] };
  /** @deprecated legacy Stampog config shape */
  git?: {
    commitLength: number;
    includeBranch: boolean;
    includeDirty: boolean;
    usernameSource: string;
    fallbackUsernameSource: string;
  };
}

export type StampogConfig = EstamperConfig;

export const defaultConfig: StampogConfig = {
  security: { ...defaultSecurity },
  schemaVersion: 1,
  name: 'estamper',
  mode: 'auto',
  preset: 'standard',
  format: defaultFormat,
  seed: { strategy: 'commit', fixed: null },
  env: {
    enabled: true,
    value: 'auto',
    fallback: 'dev',
    map: {
      production: 'prd', prod: 'prd', staging: 'stg', stage: 'stg', development: 'dev', dev: 'dev',
      test: 'tst', qa: 'qat', ci: 'ci', local: 'loc',
    },
    sources: ['ESTAMPER_ENV', 'DEPLOY_ENV', 'APP_ENV', 'VITE_ENV', 'NODE_ENV', 'VERCEL_ENV', 'NETLIFY_CONTEXT'],
  },
  cloud: {
    enabled: true,
    provider: 'auto',
    fallback: 'loc',
    map: { azure: 'az', gcp: 'gcp', 'google-cloud': 'gcp', aws: 'aws', vercel: 'vcl', netlify: 'ntl', firebase: 'fb' },
    detection: {
      VERCEL: 'vcl', NETLIFY: 'ntl', FIREBASE_CONFIG: 'fb', GITHUB_ACTIONS: 'ghp', CF_PAGES: 'cfp',
      FLY_APP_NAME: 'fly', RAILWAY_ENVIRONMENT: 'rwy', RENDER: 'rndr', GOOGLE_CLOUD_PROJECT: 'gcp',
      AWS_REGION: 'aws', AZURE_CLIENT_ID: 'az',
    },
  },
  tokens: {
    enabled: true,
    count: 2,
    mode: 'auto',
    separator: '-',
    asciiLength: 2,
    emoji: { allow: defaultEmojis, deny: [] },
    ascii: { allow: defaultAscii, deny: [] },
    mappings: defaultTokenMappings,
  },
  words: {
    enabled: true,
    count: 2,
    case: 'lower',
    separator: '-',
    allow: defaultWords,
    deny: [],
    aliases: defaultWordAliases,
  },
  date: { enabled: true, format: 'yyyy-mm-dd', timezone: 'local', source: 'auto', env: ['ESTAMPER_DATE', 'BUILD_DATE', 'SOURCE_DATE_EPOCH'] },
  time: { enabled: true, format: 'hh:mm', timezone: 'local' },
  user: {
    enabled: true,
    source: 'auto',
    fallback: 'anonymous',
    maxLength: 20,
    sanitize: true,
    sources: ['GITHUB_ACTOR', 'GITLAB_USER_LOGIN', 'CIRCLE_USERNAME', 'BUILD_USER', 'USER'],
  },
  commit: {
    enabled: true,
    length: 7,
    prefix: '@',
    includeDirty: true,
    dirtyMarker: '~',
    fallback: '0000000',
    sources: ['GITHUB_SHA', 'VERCEL_GIT_COMMIT_SHA', 'NETLIFY_COMMIT_REF', 'CI_COMMIT_SHA'],
  },
  branch: {
    enabled: false,
    prefix: '~',
    maxLength: 20,
    sanitize: true,
    fallback: null,
    sources: ['GITHUB_REF_NAME', 'VERCEL_GIT_COMMIT_REF', 'BRANCH', 'CI_COMMIT_BRANCH'],
  },
  buildNumber: {
    enabled: false,
    prefix: '#',
    source: 'auto',
    fallback: null,
    sources: ['GITHUB_RUN_NUMBER', 'BUILD_NUMBER', 'CI_PIPELINE_IID', 'VERCEL_GIT_COMMIT_SHA'],
  },
  badge: {
    enabled: true,
    position: 'bottom-right',
    theme: 'auto',
    copyOnClick: true,
    showDetailsOnClick: true,
    persistPosition: true,
    draggable: false,
    zIndex: 999999,
    startVisible: true,
  },
  output: {
    json: 'dist/estamper.json',
    js: 'dist/estamper.js',
    htmlSnippet: 'dist/estamper-snippet.html',
    css: 'dist/estamper.css',
    meta: true,
  },
  validation: {
    maxStampLength: 96,
    failOnUnknownEmoji: false,
    failOnUnknownWord: false,
    requireGit: false,
    requireCommit: false,
    allowUnsafeChars: false,
  },
};
