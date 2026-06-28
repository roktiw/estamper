import { mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { stampogVitePlugin } from '../src/vite/index.js';

describe('Vite plugin', () => {
  it('escapes injected meta/script values', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'stampog-vite-'));
    const config = join(dir, 'stampog.config.json');
    await writeFile(config, JSON.stringify({
      format: '<"{date}',
      words: { allow: ['silver'] },
      emojis: { allow: ['🍉'] },
      ascii: { allow: ['WM'] },
    }), 'utf8');

    const plugin = stampogVitePlugin({
      config,
      out: join(dir, 'stampog.json'),
      inject: true,
      meta: true,
    }) as {
      buildStart: () => Promise<void>;
      transformIndexHtml: (html: string) => string;
    };

    await plugin.buildStart();
    const html = plugin.transformIndexHtml('<html><head></head><body></body></html>');
    expect(html).toContain('content="&lt;&quot;');
    expect(html).toContain('window.__STAMPOG__={"stamp":"\\u003c\\"');
  });

  it('rejects unsafe global names', () => {
    const plugin = stampogVitePlugin({
      inject: true,
      globalName: 'bad;alert(1)',
    }) as { transformIndexHtml: (html: string) => string };

    expect(() => plugin.transformIndexHtml('<html><head></head></html>')).toThrow('globalName');
  });
});
