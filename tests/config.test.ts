import { mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config/index.js';
import { resolveStampOptions } from '../src/config/resolveStampOptions.js';
import { generateStamp } from '../src/index.js';

describe('config', () => {
  it('loads JSON config fallback', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'stampog-'));
    const path = join(dir, 'stampog.config.json');
    await writeFile(path, JSON.stringify({ mode: 'ascii' }), 'utf8');
    const config = await loadConfig(path);
    expect(config.mode).toBe('ascii');
  });

  it('resolves env and cloud auto-detection for stamp options', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'stampog-'));
    const path = join(dir, 'stampog.config.json');
    await writeFile(path, JSON.stringify({ env: { auto: true }, cloud: { auto: true } }), 'utf8');
    const config = await loadConfig(path);
    const options = resolveStampOptions(
      config,
      { user: 'roktiw', commit: 'a1b2c3d', dirty: false },
      undefined,
      { NODE_ENV: 'production', VERCEL: '1' },
    );
    expect(options.env).toBe('prd');
    expect(options.cloud).toBe('vcl');
  });

  it('uses uppercase env and cloud aliases for ascii config output', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'stampog-'));
    const path = join(dir, 'stampog.config.json');
    await writeFile(path, JSON.stringify({ mode: 'ascii', env: 'stg', cloud: { provider: 'az' } }), 'utf8');
    const config = await loadConfig(path);
    const options = resolveStampOptions(config, { user: 'roktiw', commit: 'a1b2c3d', dirty: false });
    expect(generateStamp({ ...options, date: new Date(2026, 5, 28, 14, 2) }).stamp).toMatch(/^STG-AZ-/);
  });

  it('fails invalid config with a helpful error', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'stampog-'));
    const path = join(dir, 'stampog.config.yml');
    await writeFile(path, 'words:\n  allow: []\n', 'utf8');
    await expect(loadConfig(path)).rejects.toThrow('words.allow');
  });
});
