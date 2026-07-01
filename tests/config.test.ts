import { mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config/index.js';
import { resolveStampOptions } from '../src/config/resolveStampOptions.js';
import { generateStamp } from '../src/index.js';

describe('config', () => {
  it('loads JSON config fallback', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'estamper-'));
    const path = join(dir, 'estamper.config.json');
    await writeFile(path, JSON.stringify({ mode: 'ascii' }), 'utf8');
    const config = await loadConfig(path);
    expect(config.mode).toBe('ascii');
    expect(config.schemaVersion).toBe(1);
    expect(config.tokens.mode).toBe('ascii');
  });

  it('accepts empty allow lists as editable contract defaults', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'estamper-'));
    const path = join(dir, 'estamper.config.yml');
    await writeFile(path, 'words:\n  allow: []\ntokens:\n  emoji:\n    allow: []\n', 'utf8');
    const config = await loadConfig(path);
    expect(config.words.allow).toEqual([]);
    expect(config.tokens.emoji.allow).toEqual([]);
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
    await writeFile(path, JSON.stringify({ mode: 'ascii', env: { value: 'stg' }, cloud: { provider: 'az' } }), 'utf8');
    const config = await loadConfig(path);
    const options = resolveStampOptions(config, { user: 'roktiw', commit: 'a1b2c3d', dirty: false });
    expect(generateStamp({ ...options, date: new Date(2026, 5, 28, 14, 2) }).stamp).toMatch(/^STG-AZ-/);
  });

  it('fails unsupported schemaVersion with a helpful error', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'estamper-'));
    const path = join(dir, 'estamper.config.yml');
    await writeFile(path, 'schemaVersion: 2\n', 'utf8');
    await expect(loadConfig(path)).rejects.toThrow('schemaVersion must be 1');
  });

  it('validates unknown placeholders and disabled token counts', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'estamper-'));
    const unknownPath = join(dir, 'unknown.yml');
    await writeFile(unknownPath, 'format: "{env}-{missing}"\n', 'utf8');
    await expect(loadConfig(unknownPath)).rejects.toThrow('unknown format placeholder {missing}');

    const tokenPath = join(dir, 'token.yml');
    await writeFile(tokenPath, 'tokens:\n  count: 1\nformat: "{token2}-{date}"\n', 'utf8');
    await expect(loadConfig(tokenPath)).rejects.toThrow('format uses {token2}');
  });
});
