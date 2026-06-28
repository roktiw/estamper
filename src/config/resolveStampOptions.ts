import type { GenerateStampOptions } from '../core/types.js';
import type { CloudConfig, EnvConfig, EstamperConfig } from './defaultConfig.js';
import type { GitInfo } from '../git/getGitInfo.js';

const cloudEnvMap: Record<string, string> = {
  VERCEL: 'vcl',
  NETLIFY: 'ntl',
  GITHUB_ACTIONS: 'ghp',
  RAILWAY_ENVIRONMENT: 'rwy',
  FLY_APP_NAME: 'fly',
  RENDER: 'rndr',
  CF_PAGES: 'cfp',
  GOOGLE_CLOUD_PROJECT: 'gcp',
  AWS_REGION: 'aws',
  AZURE_CLIENT_ID: 'az',
  AZURE_SUBSCRIPTION_ID: 'az',
  ESTAMPER_CLOUD: 'loc',
};

function mapped(value: string | undefined, map: Record<string, string> | undefined, fallback: string | undefined): string | undefined {
  const raw = value?.trim() || fallback;
  return raw ? (map?.[raw] ?? raw) : undefined;
}

function envToken(config: string | EnvConfig, env: NodeJS.ProcessEnv): string {
  if (typeof config === 'string') return config;
  if (config.enabled === false) return config.fallback ?? 'dev';
  if (config.value && config.value !== 'auto') return mapped(config.value, config.map, config.fallback) ?? 'dev';
  if (config.auto || config.value === 'auto') {
    for (const source of config.sources ?? ['ESTAMPER_ENV', 'VITE_ENV', 'NODE_ENV', 'DEPLOY_ENV']) {
      const value = env[source];
      if (value) return mapped(value, config.map, config.fallback) ?? value;
    }
  }
  return config.fallback ?? 'dev';
}

function cloudToken(config: string | CloudConfig, env: NodeJS.ProcessEnv): string | false {
  if (typeof config === 'string') return config;
  if (config.enabled === false) return false;
  if (config.provider && config.provider !== 'auto') return mapped(config.provider, config.map, config.fallback) ?? config.provider;
  if (config.auto || config.provider === 'auto') {
    for (const source of config.sources ?? ['ESTAMPER_CLOUD', 'VERCEL', 'NETLIFY', 'GITHUB_ACTIONS']) {
      const value = env[source];
      if (value) return mapped(source === 'ESTAMPER_CLOUD' ? value : cloudEnvMap[source], config.map, config.fallback) ?? value;
    }
  }
  return config.fallback ?? 'loc';
}

function withoutTimePlaceholder(format: string): string {
  return format
    .replace(/\{time\}-?/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function modeFormat(config: EstamperConfig): string {
  const format = config.time.enabled ? config.format : withoutTimePlaceholder(config.format);
  if (config.mode !== 'ascii') return format;
  return format
    .replaceAll('{env}', '{envAscii}')
    .replaceAll('{cloud}', '{cloudAscii}')
    .replaceAll('{token', '{ascii');
}

export function resolveStampOptions(
  config: EstamperConfig,
  git: GitInfo,
  seed?: string,
  env: NodeJS.ProcessEnv = process.env,
): GenerateStampOptions {
  return {
    mode: config.mode,
    env: envToken(config.env, env),
    cloud: cloudToken(config.cloud, env),
    words: config.words.allow,
    emojis: config.emojis.allow,
    ascii: config.ascii.allow,
    tokens: config.tokens.enabled ? config.tokens.emoji?.allow : undefined,
    tokenCount: config.tokens.count,
    wordCount: config.words.count,
    format: modeFormat(config),
    user: git.user,
    commit: git.commit,
    commitLength: config.git.commitLength,
    branch: config.git.includeBranch ? git.branch : undefined,
    dirty: config.git.includeDirty ? git.dirty : undefined,
    dirtyMarker: config.git.dirtyMarker,
    dateFormat: config.date.format,
    dateTimezone: config.date.timezone,
    includeTime: config.time.enabled,
    timeFormat: config.time.format,
    timeTimezone: config.time.timezone,
    seed,
  };
}
