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

export async function loadConfig(path = 'stampog.config.yml'): Promise<StampogConfig> {
  let parsed: unknown = {};
  try {
    const source = await readFile(path, 'utf8');
    parsed = extname(path).toLowerCase() === '.json' ? JSON.parse(source) : YAML.parse(source);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw new Error(`Could not load Stampog config ${path}: ${(error as Error).message}`);
    }
  }

  if (!isObject(parsed)) {
    throw new Error('Invalid Stampog config: root value must be an object.');
  }

  return validateConfig(mergeDeep(defaultConfig as unknown as Record<string, unknown>, parsed) as unknown as StampogConfig);
}
