import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { loadConfig } from '../config/loadConfig.js';
import { resolveStampOptions } from '../config/resolveStampOptions.js';
import { generateStamp } from '../core/generateStamp.js';
import type { StampResult } from '../core/types.js';
import { getGitInfo } from '../git/getGitInfo.js';

export interface EstamperVitePluginOptions {
  config?: string;
  /** Write `estamper.json` to this path at build start (legacy approach).
   *  When omitted the file is also emitted as a Rollup asset so it appears
   *  in the manifest and is correctly placed in the output directory. */
  out?: string;
  /** Inject `window.__ESTAMPER__` (full StampResult) into the HTML. */
  inject?: boolean;
  globalName?: string;
  /** Inject `<meta name="estamper" content="...">` into the HTML. */
  meta?: boolean;
  /** Emit estamper.json as a Rollup asset (recommended). Defaults to `true`. */
  emitAsset?: boolean;
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
  let result: StampResult | undefined;
  const emitAsset = options.emitAsset !== false; // default true

  return {
    name: 'estamper',
    async buildStart() {
      const config = await loadConfig(options.config);
      const git = getGitInfo(config.commit.length);
      result = generateStamp(resolveStampOptions(config, git));

      // Legacy: also write to a fixed path when `out` is specified.
      if (options.out) {
        const out = options.out ?? config.output.json;
        await mkdir(dirname(out), { recursive: true });
        await writeFile(out, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
      }
    },
    generateBundle() {
      // Emit as a proper Rollup/Vite asset so it lands in the output dir
      // and appears in the build manifest.
      if (emitAsset && result) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any).emitFile({
          type: 'asset',
          fileName: 'estamper.json',
          source: `${JSON.stringify(result, null, 2)}\n`,
        });
      }
    },
    transformIndexHtml(html: string) {
      // Always validate globalName eagerly, even before the stamp is available.
      if (options.inject) {
        const globalName = options.globalName ?? '__ESTAMPER__';
        assertGlobalName(globalName);
      }
      if (!result) return html;
      let next = html;
      if (options.meta) {
        next = next.replace('</head>', `<meta name="estamper" content="${escapeHtmlAttribute(result.stamp)}">\n</head>`);
      }
      if (options.inject) {
        const globalName = options.globalName ?? '__ESTAMPER__';
        // Inject the full StampResult (stamp + parts) so client-side widgets
        // can display environment, cloud, commit, branch etc. without a fetch.
        next = next.replace('</head>', `<script>window.${globalName}=${safeJsonForScript(result)}</script>\n</head>`);
      }
      return next;
    },
  };
}

export const estamperVite = estamperVitePlugin;
