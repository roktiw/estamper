import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import YAML from 'yaml';
import type { StampogConfig } from './defaultConfig.js';
import { normalizeConfig } from './parseConfig.js';

async function readConfig(path: string): Promise<unknown> {
  const source = await readFile(path, 'utf8');
  if (Buffer.byteLength(source) > 131072) throw new Error('Config exceeds 128 KiB');
  return extname(path).toLowerCase() === '.json' ? JSON.parse(source) : YAML.parse(source, { maxAliasCount: 0 });
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
    } else {
      throw new Error(`Could not load Estamper config ${path}: ${(error as Error).message}`);
    }
  }

  return normalizeConfig(parsed);
}
