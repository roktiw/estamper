import type { GenerateStampOptions } from '../core/types.js';
import type { CloudConfig, EnvConfig, StampogConfig } from './defaultConfig.js';
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
};

function envToken(config: string | EnvConfig, env: NodeJS.ProcessEnv): string {
  if (typeof config === 'string') return config;
  if (config.auto) {
    for (const source of config.sources ?? []) {
      const value = env[source];
      if (value) return config.map?.[value] ?? value;
    }
  }
  return config.fallback ?? 'dev';
}

function cloudToken(config: string | CloudConfig, env: NodeJS.ProcessEnv): string | false {
  if (typeof config === 'string') return config;
  if (config.enabled === false) return false;
  if (config.provider) return config.provider;
  if (config.auto) {
    for (const source of config.sources ?? []) {
      if (env[source]) return cloudEnvMap[source] ?? source.toLowerCase();
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

function modeFormat(config: StampogConfig): string {
  const format = config.time.enabled ? config.format : withoutTimePlaceholder(config.format);
  if (config.mode !== 'ascii') return format;
  return format
    .replaceAll('{env}', '{envAscii}')
    .replaceAll('{cloud}', '{cloudAscii}')
    .replaceAll('{token', '{ascii');
}

export function resolveStampOptions(
  config: StampogConfig,
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
