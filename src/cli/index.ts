#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import YAML from 'yaml';
import { defaultConfig } from '../config/defaultConfig.js';
import { loadConfig } from '../config/loadConfig.js';
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
  console.log(`Stampog

Usage:
  stampog init
  stampog generate [--config stampog.config.yml] [--out public/stampog.json] [--js dist/stampog.js] [--html dist/stampog.html] [--seed value]
  stampog print [--config stampog.config.yml]
  stampog json [--config stampog.config.yml]
  stampog html --out public/stampog.html
  stampog validate-config [--config stampog.config.yml]
`);
}

async function buildStamp(args: string[]) {
  const config = await loadConfig(argValue(args, '--config'));
  const git = getGitInfo(config.git.commitLength);
  return generateStamp({
    mode: config.mode,
    words: config.words.allow,
    emojis: config.emojis.allow,
    ascii: config.ascii.allow,
    format: config.mode === 'ascii' ? config.format.replaceAll('emoji', 'ascii') : config.format,
    user: git.user,
    commit: git.commit,
    branch: config.git.includeBranch ? git.branch : undefined,
    dirty: config.git.includeDirty ? git.dirty : undefined,
    seed: argValue(args, '--seed'),
  });
}

async function main(args: string[]): Promise<void> {
  const command = args[0] ?? '--help';
  if (command === '--help' || command === '-h') {
    help();
    return;
  }

  if (command === 'init') {
    const out = argValue(args, '--out') ?? 'stampog.config.yml';
    await writeFile(out, YAML.stringify(defaultConfig), { flag: has(args, '--force') ? 'w' : 'wx' });
    console.log(`Created ${out}`);
    return;
  }

  if (command === 'validate-config') {
    await loadConfig(argValue(args, '--config'));
    console.log('Stampog config is valid.');
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
    await writeHtml(argValue(args, '--out') ?? 'dist/stampog-snippet.html', stamp);
    return;
  }
  if (command === 'generate') {
    await writeJson(argValue(args, '--out') ?? 'dist/stampog.json', stamp);
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
