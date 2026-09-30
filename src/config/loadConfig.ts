import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import YAML from 'yaml';
import { defaultConfig, type StampogConfig } from './defaultConfig.js';
import { validateConfig } from './schema.js';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeDeep(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = output[key];
    output[key] = isObject(current) && isObject(value) ? mergeDeep(current, value) : value;
  }
  return output;
}

function applyLegacyAliases(config: StampogConfig, parsed: Record<string, unknown>): StampogConfig {
  const legacyEmojis = parsed.emojis;
  if (isObject(legacyEmojis) && Array.isArray(legacyEmojis.allow)) {
    config.tokens.emoji.allow = legacyEmojis.allow as string[];
  }
  const legacyAscii = parsed.ascii;
  if (isObject(legacyAscii) && Array.isArray(legacyAscii.allow)) {
    config.tokens.ascii.allow = legacyAscii.allow as string[];
  }
  const legacyGit = parsed.git;
  if (isObject(legacyGit)) {
    if (Number.isInteger(legacyGit.commitLength)) config.commit.length = legacyGit.commitLength as number;
    if (typeof legacyGit.includeBranch === 'boolean') config.branch.enabled = legacyGit.includeBranch;
    if (typeof legacyGit.includeDirty === 'boolean') config.commit.includeDirty = legacyGit.includeDirty;
  }
  if (parsed.mode === 'ascii') config.tokens.mode = 'ascii';
  return config;
}

async function readConfig(path: string): Promise<unknown> {
  const source = await readFile(path, 'utf8');
  return extname(path).toLowerCase() === '.json' ? JSON.parse(source) : YAML.parse(source);
}

export async function loadConfig(path = 'estamper.config.yml'): Promise<StampogConfig> {
  let parsed: unknown = {};
  let loadedPath = path;
  try {
    parsed = await readConfig(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' && path === 'estamper.config.yml') {
      try {
        loadedPath = 'stampog.config.yml';
        parsed = await readConfig(loadedPath);
      } catch (fallbackError) {
        if ((fallbackError as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw new Error(`Could not load Estamper config ${loadedPath}: ${(fallbackError as Error).message}`);
        }
      }
    } else if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw new Error(`Could not load Estamper config ${path}: ${(error as Error).message}`);
    }
  }

  if (!isObject(parsed)) {
    throw new Error('Invalid Estamper config: root value must be an object.');
  }

  const merged = mergeDeep(defaultConfig as unknown as Record<string, unknown>, parsed) as unknown as StampogConfig;
  return validateConfig(applyLegacyAliases(merged, parsed));
}
