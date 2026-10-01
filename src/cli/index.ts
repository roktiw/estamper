#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import YAML from 'yaml';
import { defaultConfig } from '../config/defaultConfig.js';
import { loadConfig } from '../config/loadConfig.js';
import { resolveStampOptions } from '../config/resolveStampOptions.js';
import { generateStamp } from '../core/generateStamp.js';
import { getGitInfo } from '../git/getGitInfo.js';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { buildPublicStamp, checkRelease } from '../security/build.js';

function argValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function has(args: string[], name: string): boolean {
  return args.includes(name);
}

function help(): void {
  console.log(`Estamper

Usage:
  estamper init
  estamper generate [--config estamper.config.yml] [--js dist/estamper.js] [--seed value]
  estamper print [--config estamper.config.yml]
  estamper validate-config [--config estamper.config.yml]
`);
}

async function buildStamp(args: string[]) {
  const config = await loadConfig(argValue(args, '--config'));
  const git = getGitInfo(config.commit.length);
  if (config.validation.requireGit && (git.commit === 'unknown' || /^0+$/.test(git.commit))) {
    throw new Error('Invalid Estamper runtime: git metadata is required but unavailable.');
  }
  if (config.validation.requireCommit && (git.commit === 'unknown' || /^0+$/.test(git.commit))) {
    throw new Error('Invalid Estamper runtime: commit metadata is required but unavailable.');
  }
  checkRelease(config.security, git);
  return { config, stamp: generateStamp(resolveStampOptions(config, git, argValue(args, '--seed'))) };
}

async function main(args: string[]): Promise<void> {
  const command = args[0] ?? '--help';
  if (command === '--help' || command === '-h') {
    help();
    return;
  }

  if (command === 'init') {
    const out = argValue(args, '--out') ?? 'estamper.config.yml';
    await writeFile(out, out.endsWith('.json') ? JSON.stringify(defaultConfig, null, 2) : YAML.stringify(defaultConfig), { flag: has(args, '--force') ? 'w' : 'wx' });
    console.log(`Created ${out}`);
    return;
  }

  if (command === 'validate-config') {
    await loadConfig(argValue(args, '--config'));
    console.log('Estamper config is valid.');
    return;
  }

  const { config, stamp } = await buildStamp(args);
  const payload = await buildPublicStamp(stamp, config.security);
  if (command === 'print') {
    console.log(payload.stamp);
    return;
  }
  if (command === 'json') {
    throw new Error('Raw JSON output removed; use generate --js with protected access');
  }
  if (command === 'html') throw new Error('Inline HTML export removed; load the generated JS module');
  if (command === 'generate') {
    if (argValue(args, '--out') || has(args, '--html')) throw new Error('Public JSON/HTML output removed; use --js');
    const path = argValue(args, '--js') ?? config.output.js;
    if (!path.endsWith('.js')) throw new Error('Protected output must use a .js extension');
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `export default ${JSON.stringify(payload).replaceAll('<', '\\u003c')};\n`, 'utf8');
    console.log(`Created protected build module: ${path}`);
    return;
  }

  help();
  process.exitCode = 1;
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
