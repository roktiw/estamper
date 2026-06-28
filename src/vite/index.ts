import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { loadConfig } from '../config/loadConfig.js';
import { resolveStampOptions } from '../config/resolveStampOptions.js';
import { generateStamp } from '../core/generateStamp.js';
import { getGitInfo } from '../git/getGitInfo.js';

export interface StampogVitePluginOptions {
  config?: string;
  out?: string;
  inject?: boolean;
  globalName?: string;
  meta?: boolean;
}

export function stampogVitePlugin(options: StampogVitePluginOptions = {}) {
  let stamp = '';
  return {
    name: 'stampog',
    async buildStart() {
      const config = await loadConfig(options.config);
      const git = getGitInfo(config.git.commitLength);
      const result = generateStamp(resolveStampOptions(config, git));
      stamp = result.stamp;
      const out = options.out ?? 'public/stampog.json';
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    },
    transformIndexHtml(html: string) {
      let next = html;
      if (options.meta) {
        next = next.replace('</head>', `<meta name="stampog" content="${stamp.replaceAll('"', '&quot;')}">\n</head>`);
      }
      if (options.inject) {
        const globalName = options.globalName ?? '__STAMPOG__';
        next = next.replace('</head>', `<script>window.${globalName}=${JSON.stringify({ stamp })}</script>\n</head>`);
      }
      return next;
    },
  };
}
