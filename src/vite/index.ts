import type { IncomingMessage, ServerResponse } from 'node:http';
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { loadConfig } from '../config/loadConfig.js';
import { resolveStampOptions } from '../config/resolveStampOptions.js';
import { generateStamp } from '../core/generateStamp.js';
import { getGitInfo } from '../git/getGitInfo.js';
import { buildPublicStamp, checkRelease } from '../security/build.js';
import type { PublicStamp } from '../security/envelope.js';
export interface EstamperVitePluginOptions {
  config?: string;
  /** Legacy JSON output is development-only, with explicit public access. */
  out?: string;
  inject?: boolean;
  globalName?: string;
  meta?: boolean;
  /** Default false. Development-only with explicit public access. */
  emitAsset?: boolean;
}
function assertGlobalName(value: string): void {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value) || ['__proto__', 'constructor', 'prototype'].includes(value)) throw new Error('Estamper Vite plugin globalName must be a safe JavaScript identifier');
}
export function estamperVitePlugin(options: EstamperVitePluginOptions = {}) {
  let result: PublicStamp | undefined;
  let publicDir: string | false = false;
  let base = '/';
  let production = true; // build hooks used without Vite config fail closed
  return {
    name: 'estamper',
    configResolved(config: { command: string; publicDir?: string | false; base?: string }) { production = config.command === 'build'; publicDir = config.publicDir ?? false; base = config.base ?? '/'; },
    configureServer(server: { middlewares: { use: (handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        if (!options.inject || req.url?.split('?')[0] !== `${base}assets/estamper.js`) return next();
        assertGlobalName(options.globalName ?? '__ESTAMPER__');
        res.setHeader('Content-Type', 'text/javascript'); res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
        if (!result) { res.statusCode = 503; res.end('/* Estamper not ready */'); return; }
        res.end(`window.${options.globalName ?? '__ESTAMPER__'}=${JSON.stringify(result).replaceAll('<', '\\u003c')};`);
      });
    },
    async buildStart() {
      if (production && publicDir) {
        async function inspect(dir: string): Promise<void> {
          let entries;
          try { entries = await readdir(dir, { withFileTypes: true }); }
          catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return; throw error; }
          for (const entry of entries) {
            if (entry.isSymbolicLink()) throw new Error('Symlink in public directory requires review');
            if (/^(estamper(?:\.config)?\.(json|ya?ml)|\.env(?:\..*)?)$/i.test(entry.name)) throw new Error('Remove stale public Estamper metadata/config before building');
            if (entry.isDirectory()) await inspect(join(dir, entry.name));
          }
        }
        await inspect(publicDir);
      }
      const config = await loadConfig(options.config);
      if ((options.out || options.emitAsset) && (production || config.security.access !== 'min')) throw new Error('Public JSON output is forbidden for builds and protected reports');
      const git = getGitInfo(config.commit.length); checkRelease(config.security, git);
      result = await buildPublicStamp(generateStamp(resolveStampOptions(config, git)), config.security);
      if (options.out) { await mkdir(dirname(options.out), { recursive: true }); await writeFile(options.out, JSON.stringify(result)); }
    },
    generateBundle(this: { emitFile: (asset: { type: 'asset'; fileName: string; source: string }) => void }, _opts: unknown, bundle: Record<string, { fileName?: string }> = {}) {
      for (const name of Object.keys(bundle)) {
        if (/(^|\/)estamper(?:\.config)?\.(json|ya?ml)$/i.test(name)) throw new Error('Remove stale public Estamper metadata/config from the build');
      }
      if (options.emitAsset && result) this.emitFile({ type: 'asset', fileName: 'estamper.json', source: JSON.stringify(result) });
      if (options.inject) assertGlobalName(options.globalName ?? '__ESTAMPER__');
      if (options.inject && result) this.emitFile({ type: 'asset', fileName: 'assets/estamper.js', source: `window.${options.globalName ?? '__ESTAMPER__'}=${JSON.stringify(result).replaceAll('<', '\\u003c')};` });
    },
    transformIndexHtml(html: string) {
      const globalName = options.globalName ?? '__ESTAMPER__'; assertGlobalName(globalName);
      if (!result) return html;
      if (options.meta) html = html.replace('</head>', `<meta name="estamper" content="${result.stamp.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')}">\n</head>`);
      if (options.inject) html = html.replace('</head>', `<script src="${base.replaceAll('&', '&amp;').replaceAll('\"', '&quot;').replaceAll('<', '&lt;')}assets/estamper.js"></script>\n</head>`);
      return html;
    },
  };
}
export const estamperVite = estamperVitePlugin;
