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

export function stampogVitePlugin(options: StampogVitePluginOptions = {}) {
  let stamp = '';
  return {
    name: 'stampog',
    async buildStart() {
      const config = await loadConfig(options.config);
      const git = getGitInfo(config.commit.length);
      const result = generateStamp({
        mode: config.mode,
        words: config.words.allow,
        emojis: config.tokens.emoji.allow,
        ascii: config.tokens.ascii.allow,
        tokenMappings: config.tokens.mappings,
        tokenCount: config.tokens.enabled ? config.tokens.count : 0,
        tokenMode: config.tokens.mode,
        asciiLength: config.tokens.asciiLength,
        wordCount: config.words.enabled ? config.words.count : 0,
        wordCase: config.words.output === 'full' ? config.words.case : config.words.output ?? config.words.case,
        format: config.format,
        user: git.user,
        commit: git.commit,
        branch: config.branch.enabled ? git.branch : undefined,
        dirty: config.commit.includeDirty ? git.dirty : false,
        maxLength: config.validation.maxStampLength,
      });
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
