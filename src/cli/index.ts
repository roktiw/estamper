#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import YAML from 'yaml';
import { defaultConfig, type StampogConfig } from '../config/defaultConfig.js';
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

function firstEnv(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

function sanitize(value: string, maxLength: number): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, maxLength);
}

function mapped(value: string | undefined, map: Record<string, string>, fallback: string): string {
  if (!value) return fallback;
  return map[value] ?? map[value.toLowerCase()] ?? value;
}

function detectEnv(config: StampogConfig): string | undefined {
  if (!config.env.enabled) return undefined;
  const raw = config.env.value === 'auto' ? firstEnv(config.env.sources) : config.env.value;
  return mapped(raw, config.env.map, config.env.fallback);
}

function detectCloud(config: StampogConfig): string | undefined {
  if (!config.cloud.enabled) return undefined;
  if (config.cloud.provider !== 'auto') return mapped(config.cloud.provider, config.cloud.map, config.cloud.fallback);
  for (const [name, token] of Object.entries(config.cloud.detection)) {
    if (process.env[name]) return token;
  }
  return config.cloud.fallback;
}

function configDate(config: StampogConfig): Date {
  const source = firstEnv(config.date.env);
  if (!source) return new Date();
  const parsed = /^\d{10}$/.test(source)
    ? new Date(Number(source) * 1000)
    : /^\d{13}$/.test(source)
      ? new Date(Number(source))
      : new Date(source);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function seedFor(config: StampogConfig, commit: string, date: Date, cliSeed?: string): string | number | undefined {
  if (cliSeed !== undefined) return cliSeed;
  if (config.seed.strategy === 'fixed') return config.seed.fixed ?? undefined;
  if (config.seed.strategy === 'commit') return commit;
  if (config.seed.strategy === 'commit-date') return `${commit}:${date.toISOString().slice(0, 10)}`;
  return undefined;
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
  const git = getGitInfo(config.commit.length);
  if (config.validation.requireGit && git.commit === 'unknown') {
    throw new Error('Invalid Estamper runtime: git metadata is required but unavailable.');
  }
  if (config.validation.requireCommit && git.commit === 'unknown') {
    throw new Error('Invalid Estamper runtime: commit metadata is required but unavailable.');
  }
  const date = configDate(config);
  const user = config.user.enabled ? sanitize(git.user || config.user.fallback, config.user.maxLength) || config.user.fallback : undefined;
  const branch = config.branch.enabled && git.branch ? `${config.branch.prefix}${sanitize(git.branch, config.branch.maxLength)}` : undefined;
  const buildNumber = config.buildNumber.enabled ? firstEnv(config.buildNumber.sources) ?? config.buildNumber.fallback : undefined;
  const commit = config.commit.enabled ? git.commit || config.commit.fallback : null;
  const stamp = generateStamp({
    mode: config.mode,
    preset: config.preset,
    words: config.words.allow,
    deniedWords: config.words.deny,
    wordAliases: config.words.aliases,
    wordCount: config.words.enabled ? config.words.count : 0,
    wordCase: config.words.output === 'full' ? config.words.case : config.words.output ?? config.words.case,
    emojis: config.tokens.emoji.allow.filter((token) => !config.tokens.emoji.deny.includes(token)),
    ascii: config.tokens.ascii.allow.filter((token) => !config.tokens.ascii.deny.includes(token)),
    tokenMappings: config.tokens.mappings,
    tokenCount: config.tokens.enabled ? config.tokens.count : 0,
    tokenMode: config.tokens.mode,
    asciiLength: config.tokens.asciiLength,
    format: config.mode === 'ascii' ? config.format.replaceAll('emoji', 'ascii') : config.format,
    env: detectEnv(config),
    cloud: detectCloud(config),
    date,
    dateFormat: config.date.enabled ? config.date.format : null,
    timeFormat: config.time.enabled ? config.time.format : null,
    timezone: config.date.timezone,
    user,
    commit,
    branch,
    buildNumber: buildNumber ? `${config.buildNumber.prefix}${buildNumber}` : undefined,
    dirty: config.commit.includeDirty ? git.dirty : false,
    dirtyMarker: config.commit.dirtyMarker,
    seed: seedFor(config, git.commit, date, argValue(args, '--seed')),
    maxLength: config.validation.maxStampLength,
  });
  return { config, stamp };
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

  const { config, stamp } = await buildStamp(args);
  if (command === 'print') {
    console.log(stamp.stamp);
    return;
  }
  if (command === 'json') {
    console.log(JSON.stringify(stamp, null, 2));
    return;
  }
  if (command === 'html') {
    await writeHtml(argValue(args, '--out') ?? config.output.htmlSnippet, stamp);
    return;
  }
  if (command === 'generate') {
    await writeJson(argValue(args, '--out') ?? config.output.json, stamp);
    if (argValue(args, '--js')) await writeJs(argValue(args, '--js') ?? config.output.js, stamp);
    if (argValue(args, '--html')) await writeHtml(argValue(args, '--html') ?? config.output.htmlSnippet, stamp);
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
