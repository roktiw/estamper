import YAML from 'yaml';
import { normalizeConfig } from '../config/parseConfig.js';
import { defaultAscii, defaultEmojis, defaultWords } from '../core/defaults.js';

export type PlaygroundMode = 'emoji' | 'ascii' | 'auto';
export type PlaygroundPreset = 'standard' | 'minimal' | 'verbose' | 'games' | 'ascii' | 'ci' | 'custom';

export interface PlaygroundConfig {
  env: string;
  cloud: string;
  mode: PlaygroundMode;
  emojis: string[];
  ascii: string[];
  words: string[];
  date: string;
  time: string;
  user: string;
  commit: string;
  dirty: boolean;
  branch: boolean;
  build: boolean;
  preset: PlaygroundPreset;
  tokenCount: number;
  wordCount: number;
  asciiLength: 2 | 3;
  commitLength: number;
  badgePosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme: 'auto' | 'light' | 'dark';
}

export const defaultPlaygroundConfig: PlaygroundConfig = {
  env: 'stg',
  cloud: 'az',
  mode: 'emoji',
  emojis: ['🍉', '🛠️', ...defaultEmojis.filter((emoji) => emoji !== '🍉' && emoji !== '🛠️')],
  ascii: ['WM', 'TL', ...defaultAscii.filter((token) => token !== 'WM' && token !== 'TL')],
  words: ['silver', 'river', ...defaultWords.filter((word) => word !== 'silver' && word !== 'river')],
  date: '2026-06-28',
  time: '14:02',
  user: 'roktiw',
  commit: 'a1b2c3d',
  dirty: false,
  branch: false,
  build: false,
  preset: 'standard',
  tokenCount: 2,
  wordCount: 2,
  asciiLength: 2,
  commitLength: 7,
  badgePosition: 'bottom-right',
  theme: 'auto',
};

const presets: Record<PlaygroundPreset, Partial<PlaygroundConfig>> = {
  standard: {},
  minimal: { emojis: ['🍉'], ascii: ['WM'], words: ['silver'], branch: false, build: false, dirty: false },
  verbose: { branch: true, build: true, dirty: true },
  games: { emojis: ['🎮', '✨', '🍉', '🚀'], ascii: ['GM', 'XP', 'UI', 'FX'], words: ['arcade', 'pixel', 'quest', 'orbit'] },
  ascii: { mode: 'ascii', ascii: ['WM', 'TL', 'RX', 'DG'] },
  ci: { env: 'ci', cloud: 'gha', branch: true, build: true },
  custom: {},
};

function cleanList(values: string[], fallback: string[]): string[] {
  const cleaned = values.map((value) => value.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : fallback;
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

export function applyPlaygroundPreset(preset: PlaygroundPreset, config: PlaygroundConfig = defaultPlaygroundConfig): PlaygroundConfig {
  return { ...config, ...presets[preset], preset };
}

export function buildPlaygroundStamp(config: PlaygroundConfig): string {
  const words = cleanList(config.words, defaultPlaygroundConfig.words);
  const visualTokens = config.mode === 'ascii'
    ? cleanList(config.ascii, defaultPlaygroundConfig.ascii)
    : cleanList(config.emojis, defaultPlaygroundConfig.emojis);
  const tokenCount = clampInteger(config.tokenCount, 0, 4);
  const wordCount = clampInteger(config.wordCount, 0, 4);
  const segments = [
    config.env.trim() || defaultPlaygroundConfig.env,
    config.cloud.trim() || defaultPlaygroundConfig.cloud,
    ...Array.from({ length: tokenCount }, (_, index) => visualTokens[index % visualTokens.length]),
    ...Array.from({ length: wordCount }, (_, index) => words[index % words.length]),
    `${config.date || defaultPlaygroundConfig.date}-${config.time || defaultPlaygroundConfig.time}`,
  ];
  const suffixes = [
    `${config.user.trim() || defaultPlaygroundConfig.user}@${(config.commit.trim() || defaultPlaygroundConfig.commit).slice(0, clampInteger(config.commitLength, 4, 12))}`,
  ];
  if (config.branch) suffixes.push('main');
  if (config.build) suffixes.push('build-42');
  if (config.dirty) suffixes.push('dirty');
  return `${segments.join('-')}-${suffixes.join('-')}`;
}

export function buildPlaygroundYaml(config: PlaygroundConfig): string {
  return YAML.stringify(normalizeConfig({
    schemaVersion: 1,
    name: 'estamper',
    preset: config.preset,
    format: ['{env}', '{cloud}', ...Array.from({length: clampInteger(config.tokenCount,0,4)}, (_,i) => `{token${i+1}}`), ...Array.from({length: clampInteger(config.wordCount,0,4)}, (_,i) => `{word${i+1}}`), '{date}', '{time}', '{user}@{commit}'].join('-'),
    env: { value: config.env },
    cloud: { provider: config.cloud },
    mode: config.mode,
    tokens: {
      enabled: config.tokenCount > 0,
      count: clampInteger(config.tokenCount, 0, 4),
      mode: config.mode,
      asciiLength: config.asciiLength,
      emoji: { allow: cleanList(config.emojis, defaultPlaygroundConfig.emojis) },
      ascii: { allow: cleanList(config.ascii, defaultPlaygroundConfig.ascii) },
    },
    words: { enabled: config.wordCount > 0, count: clampInteger(config.wordCount, 0, 4), allow: cleanList(config.words, defaultPlaygroundConfig.words) },
    date: { enabled: true, format: 'yyyy-mm-dd', timezone: 'utc' },
    time: { enabled: true, format: 'hh:mm', timezone: 'utc' },
    git: {
      user: config.user,
      commit: config.commit,
      commitLength: clampInteger(config.commitLength, 4, 12),
      includeBranch: config.branch,
      includeDirty: config.dirty,
    },
    buildNumber: { enabled: config.build },
    badge: { enabled: true, position: config.badgePosition, theme: config.theme, copyOnClick: true },
  }));
}

export function buildPlaygroundJson(config: PlaygroundConfig): string {
  return `${JSON.stringify(YAML.parse(buildPlaygroundYaml(config)), null, 2)}\n`;
}

export function buildPlaygroundSnippet(config: PlaygroundConfig): string {
  return `import { mountEstamper } from 'estamper/browser';\nimport payload from './estamper.js';\n\nmountEstamper({\n  stamp: payload.stamp,\n  payload,\n  position: ${JSON.stringify(config.badgePosition)},\n  theme: ${JSON.stringify(config.theme)},\n});\n`;
}
