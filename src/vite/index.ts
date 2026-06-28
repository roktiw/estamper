import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { loadConfig } from '../config/loadConfig.js';
import { generateStamp } from '../core/generateStamp.js';
import { getGitInfo } from '../git/getGitInfo.js';

export interface StampogVitePluginOptions {
  config?: string;
  out?: string;
  inject?: boolean;
  globalName?: string;
  meta?: boolean;
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function assertGlobalName(value: string): void {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error('Stampog Vite plugin globalName must be a valid JavaScript identifier.');
  }
}

export function stampogVitePlugin(options: StampogVitePluginOptions = {}) {
  let stamp = '';
  return {
    name: 'stampog',
    async buildStart() {
      const config = await loadConfig(options.config);
      const git = getGitInfo(config.git.commitLength);
      const result = generateStamp({
        mode: config.mode,
        words: config.words.allow,
        emojis: config.emojis.allow,
        ascii: config.ascii.allow,
        format: config.format,
        user: git.user,
        commit: git.commit,
        branch: git.branch,
        dirty: git.dirty,
        dateTimezone: config.date.timezone,
      });
      stamp = result.stamp;
      const out = options.out ?? 'public/stampog.json';
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    },
    transformIndexHtml(html: string) {
      let next = html;
      if (options.meta) {
        next = next.replace('</head>', `<meta name="stampog" content="${escapeHtmlAttribute(stamp)}">\n</head>`);
      }
      if (options.inject) {
        const globalName = options.globalName ?? '__STAMPOG__';
        assertGlobalName(globalName);
        next = next.replace('</head>', `<script>window.${globalName}=${safeJsonForScript({ stamp })}</script>\n</head>`);
      }
      return next;
    },
  };
}
