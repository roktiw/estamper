#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import YAML from 'yaml';
import { defaultConfig } from '../config/defaultConfig.js';
import { loadConfig } from '../config/loadConfig.js';
import { resolveStampOptions } from '../config/resolveStampOptions.js';
import { generateStamp } from '../core/generateStamp.js';
import { getGitInfo } from '../git/getGitInfo.js';
import { writeHtml, writeJs, writeJson } from './output.js';

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
  estamper generate [--config estamper.config.yml] [--out public/estamper.json] [--js dist/estamper.js] [--html dist/estamper.html] [--seed value]
  estamper print [--config estamper.config.yml]
  estamper json [--config estamper.config.yml]
  estamper html --out public/estamper.html
  estamper validate-config [--config estamper.config.yml]
`);
}

async function buildStamp(args: string[]) {
  const config = await loadConfig(argValue(args, '--config'));
  const git = getGitInfo(config.git.commitLength);
  return generateStamp(resolveStampOptions(config, git, argValue(args, '--seed')));
}

async function main(args: string[]): Promise<void> {
  const command = args[0] ?? '--help';
  if (command === '--help' || command === '-h') {
    help();
    return;
  }

  if (command === 'init') {
    const out = argValue(args, '--out') ?? 'estamper.config.yml';
    await writeFile(out, YAML.stringify(defaultConfig), { flag: has(args, '--force') ? 'w' : 'wx' });
    console.log(`Created ${out}`);
    return;
  }

  if (command === 'validate-config') {
    await loadConfig(argValue(args, '--config'));
    console.log('Estamper config is valid.');
    return;
  }

  const stamp = await buildStamp(args);
  if (command === 'print') {
    console.log(stamp.stamp);
    return;
  }
  if (command === 'json') {
    console.log(JSON.stringify(stamp, null, 2));
    return;
  }
  if (command === 'html') {
    await writeHtml(argValue(args, '--out') ?? 'dist/estamper-snippet.html', stamp);
    return;
  }
  if (command === 'generate') {
    await writeJson(argValue(args, '--out') ?? 'dist/estamper.json', stamp);
    if (argValue(args, '--js')) await writeJs(argValue(args, '--js')!, stamp);
    if (argValue(args, '--html')) await writeHtml(argValue(args, '--html')!, stamp);
    console.log(stamp.stamp);
    return;
  }

  help();
  process.exitCode = 1;
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
