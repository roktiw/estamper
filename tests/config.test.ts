import { mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config/index.js';

describe('config', () => {
  it('loads JSON config fallback', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'estamper-'));
    const path = join(dir, 'estamper.config.json');
    await writeFile(path, JSON.stringify({ mode: 'ascii' }), 'utf8');
    const config = await loadConfig(path);
    expect(config.mode).toBe('ascii');
  });

  it('fails invalid config with a helpful error', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'estamper-'));
    const path = join(dir, 'estamper.config.yml');
    await writeFile(path, 'words:\n  allow: []\n', 'utf8');
    await expect(loadConfig(path)).rejects.toThrow('words.allow');
  });
});
