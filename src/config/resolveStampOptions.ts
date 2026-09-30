import type { GenerateStampOptions } from '../core/types.js';
import type { EstamperConfig } from './defaultConfig.js';
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
  return raw ? (map?.[raw] ?? map?.[raw.toLowerCase()] ?? raw) : undefined;
}

function envToken(config: EstamperConfig['env'] | string, env: NodeJS.ProcessEnv): string | undefined {
  if (typeof config === 'string') return config;
  if (config.enabled === false) return undefined;
  const auto = (config as EstamperConfig['env'] & { auto?: boolean }).auto;
  if (config.value && config.value !== 'auto') return mapped(config.value, config.map, config.fallback);
  if (auto !== false || config.value === 'auto') {
    for (const source of config.sources ?? ['ESTAMPER_ENV', 'VITE_ENV', 'NODE_ENV', 'DEPLOY_ENV']) {
      const value = env[source];
      if (value) return mapped(value, config.map, config.fallback) ?? value;
    }
  }
  return config.fallback;
}

function cloudToken(config: EstamperConfig['cloud'] | string, env: NodeJS.ProcessEnv): string | false | undefined {
  if (typeof config === 'string') return config;
  if (config.enabled === false) return false;
  const auto = (config as EstamperConfig['cloud'] & { auto?: boolean; sources?: string[] }).auto;
  if (config.provider && config.provider !== 'auto') return mapped(config.provider, config.map, config.fallback) ?? config.provider;
  if (auto !== false || config.provider === 'auto') {
    const detection = config.detection ?? {};
    for (const [source, token] of Object.entries(detection)) {
      if (env[source]) return mapped(token, config.map, config.fallback) ?? token;
    }
    for (const source of (config as EstamperConfig['cloud'] & { sources?: string[] }).sources ?? []) {
      const value = env[source];
      if (value) return mapped(source === 'ESTAMPER_CLOUD' ? value : cloudEnvMap[source], config.map, config.fallback) ?? value;
    }
  }
  return config.fallback;
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

function firstEnv(names: string[], env: NodeJS.ProcessEnv): string | undefined {
  for (const name of names) {
    const value = env[name];
    if (value) return value;
  }
  return undefined;
}

function configDate(config: EstamperConfig, env: NodeJS.ProcessEnv): Date | undefined {
  const source = firstEnv(config.date.env, env);
  if (!source) return undefined;
  const parsed = /^\d{10}$/.test(source)
    ? new Date(Number(source) * 1000)
    : /^\d{13}$/.test(source)
      ? new Date(Number(source))
      : new Date(source);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function seedFor(config: EstamperConfig, commit: string, date: Date | undefined, cliSeed?: string): string | number | undefined {
  if (cliSeed !== undefined) return cliSeed;
  if (config.seed.strategy === 'fixed') return config.seed.fixed ?? undefined;
  if (config.seed.strategy === 'commit') return commit;
  if (config.seed.strategy === 'commit-date') return `${commit}:${(date ?? new Date()).toISOString().slice(0, 10)}`;
  return undefined;
}

export function resolveStampOptions(
  config: EstamperConfig,
  git: GitInfo,
  seed?: string,
  env: NodeJS.ProcessEnv = process.env,
): GenerateStampOptions {
  const date = configDate(config, env);
  return {
    mode: config.mode,
    preset: config.preset,
    env: envToken(config.env, env),
    cloud: cloudToken(config.cloud, env),
    words: config.words.allow,
    deniedWords: config.words.deny,
    wordAliases: config.words.aliases,
    wordCount: config.words.enabled ? config.words.count : 0,
    wordCase: config.words.output === 'full' ? config.words.case : config.words.output ?? config.words.case,
    emojis: config.tokens.emoji.allow.filter((token) => !config.tokens.emoji.deny.includes(token)),
    ascii: config.tokens.ascii.allow.filter((token) => !config.tokens.ascii.deny.includes(token)),
    tokenMappings: config.tokens.mappings,
    tokenCount: config.tokens.enabled ? config.tokens.count : 0,
    tokenMode: config.tokens.mode,
    asciiLength: config.tokens.asciiLength,
    format: modeFormat(config),
    user: config.user.enabled ? git.user : null,
    commit: config.commit.enabled ? git.commit || config.commit.fallback : null,
    commitLength: config.commit.length,
    branch: config.branch.enabled ? git.branch : undefined,
    buildNumber: config.buildNumber.enabled ? firstEnv(config.buildNumber.sources, env) ?? config.buildNumber.fallback : undefined,
    dirty: config.commit.includeDirty ? git.dirty : false,
    dirtyMarker: config.commit.dirtyMarker,
    date,
    dateFormat: config.date.enabled ? config.date.format : null,
    dateTimezone: config.date.timezone,
    includeTime: config.time.enabled,
    timeFormat: config.time.enabled ? config.time.format : null,
    timeTimezone: config.time.timezone,
    seed: seedFor(config, git.commit, date, seed),
    maxLength: config.validation.maxStampLength,
  };
}
