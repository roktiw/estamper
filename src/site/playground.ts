import YAML from 'yaml';
import { defaultAscii, defaultEmojis, defaultWords } from '../core/defaults.js';

export type PlaygroundMode = 'emoji' | 'ascii';
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

export function applyPlaygroundPreset(preset: PlaygroundPreset, config: PlaygroundConfig = defaultPlaygroundConfig): PlaygroundConfig {
  return { ...config, ...presets[preset], preset };
}

export function buildPlaygroundStamp(config: PlaygroundConfig): string {
  const words = cleanList(config.words, defaultPlaygroundConfig.words);
  const visualTokens = config.mode === 'ascii'
    ? cleanList(config.ascii, defaultPlaygroundConfig.ascii)
    : cleanList(config.emojis, defaultPlaygroundConfig.emojis);
  const segments = [
    config.env.trim() || defaultPlaygroundConfig.env,
    config.cloud.trim() || defaultPlaygroundConfig.cloud,
    visualTokens[0] ?? defaultPlaygroundConfig.emojis[0],
    visualTokens[1] ?? visualTokens[0] ?? defaultPlaygroundConfig.emojis[1],
    words[0] ?? defaultPlaygroundConfig.words[0],
    words[1] ?? words[0] ?? defaultPlaygroundConfig.words[1],
    `${config.date || defaultPlaygroundConfig.date}-${config.time || defaultPlaygroundConfig.time}`,
  ];
  const suffixes = [
    `${config.user.trim() || defaultPlaygroundConfig.user}@${(config.commit.trim() || defaultPlaygroundConfig.commit).slice(0, 12)}`,
  ];
  if (config.branch) suffixes.push('main');
  if (config.build) suffixes.push('build-42');
  if (config.dirty) suffixes.push('dirty');
  return `${segments.join('-')}-${suffixes.join('-')}`;
}

export function buildPlaygroundYaml(config: PlaygroundConfig): string {
  return YAML.stringify({
    name: 'estamper',
    env: config.env,
    cloud: config.cloud,
    mode: config.mode,
    words: { allow: cleanList(config.words, defaultPlaygroundConfig.words) },
    emojis: { allow: cleanList(config.emojis, defaultPlaygroundConfig.emojis) },
    ascii: { allow: cleanList(config.ascii, defaultPlaygroundConfig.ascii) },
    git: {
      user: config.user,
      commit: config.commit,
      includeBranch: config.branch,
      includeDirty: config.dirty,
    },
    build: { includeNumber: config.build },
    badge: { enabled: true, position: 'bottom-right', copyOnClick: true },
  });
}

export function buildPlaygroundJson(config: PlaygroundConfig): string {
  return `${JSON.stringify({ stamp: buildPlaygroundStamp(config), config }, null, 2)}\n`;
}

export function buildPlaygroundSnippet(config: PlaygroundConfig): string {
  return `import { mountEstamper } from 'estamper/browser';\n\nmountEstamper({\n  stamp: ${JSON.stringify(buildPlaygroundStamp(config))},\n  position: 'bottom-right',\n});\n`;
}
