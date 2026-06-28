import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { loadConfig } from '../config/loadConfig.js';
import { resolveStampOptions } from '../config/resolveStampOptions.js';
import { generateStamp } from '../core/generateStamp.js';
import { getGitInfo } from '../git/getGitInfo.js';

export interface EstamperVitePluginOptions {
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
    throw new Error('Estamper Vite plugin globalName must be a valid JavaScript identifier.');
  }
}

export function estamperVitePlugin(options: EstamperVitePluginOptions = {}) {
  let stamp = '';
  return {
    name: 'estamper',
    async buildStart() {
      const config = await loadConfig(options.config);
      const git = getGitInfo(config.git.commitLength);
      const result = generateStamp(resolveStampOptions(config, git));
      stamp = result.stamp;
      const out = options.out ?? 'public/estamper.json';
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    },
    transformIndexHtml(html: string) {
      let next = html;
      if (options.meta) {
        next = next.replace('</head>', `<meta name="estamper" content="${escapeHtmlAttribute(stamp)}">\n</head>`);
      }
      if (options.inject) {
        const globalName = options.globalName ?? '__ESTAMPER__';
        assertGlobalName(globalName);
        next = next.replace('</head>', `<script>window.${globalName}=${safeJsonForScript({ stamp })}</script>\n</head>`);
      }
      return next;
    },
  };
}

export const estamperVite = estamperVitePlugin;
