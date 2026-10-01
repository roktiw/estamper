import { resolveSecurity } from '../security/policy.js';
import type { StampogConfig } from './defaultConfig.js';
import { validateFormat } from '../core/formatStamp.js';
import { defaultEmojis, defaultWords } from '../core/defaults.js';

const modes = new Set(['emoji', 'ascii', 'mixed', 'auto']);
const presets = new Set(['minimal', 'standard', 'verbose', 'games', 'ci', 'ascii', 'custom']);
const positions = new Set(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'inline', 'custom']);
const themes = new Set(['auto', 'dark', 'light', 'minimal']);
const wordCases = new Set(['lower', 'upper', 'title', 'code2', 'code3']);
const seedStrategies = new Set(['random', 'commit', 'commit-date', 'fixed']);
const dateFormats = new Set(['yyyy-mm-dd', 'yy-mm-dd', 'yyyymmdd', 'mmdd', 'iso-date', 'unix', 'yyyy-mm-dd-hh:mm:ss']);
const timeFormats = new Set(['hh:mm', 'hh:mm:ss', 'hhmm', 'hhmmss', 'unix']);

function assertList(name: string, value: unknown, options: { allowEmpty?: boolean } = {}): asserts value is string[] {
  if (!Array.isArray(value) || (!options.allowEmpty && value.length === 0)) {
    throw new Error(`Invalid Estamper config: ${name} must be ${options.allowEmpty ? 'a list' : 'a non-empty list'}.`);
  }
  if (value.length > 256) {
    throw new Error(`Invalid Estamper config: ${name} cannot contain more than 256 items.`);
  }
  for (const item of value) {
    if (typeof item !== 'string' || item.trim() === '') {
      throw new Error(`Invalid Estamper config: ${name} must contain only non-empty strings.`);
    }
    if (item.length > 64) {
      throw new Error(`Invalid Estamper config: ${name} items must be 64 characters or shorter.`);
    }
  }
}

function assertBoolean(name: string, value: unknown): void {
  if (typeof value !== 'boolean') throw new Error(`Invalid Estamper config: ${name} must be a boolean.`);
}

function assertCount(name: string, value: unknown): void {
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 4) {
    throw new Error(`Invalid Estamper config: ${name} must be an integer from 0 to 4.`);
  }
}

function assertEnum(name: string, value: unknown, allowed: Set<string>): void {
  if (typeof value !== 'string' || !allowed.has(value)) {
    throw new Error(`Invalid Estamper config: ${name} is not supported.`);
  }
}

function validatePlaceholderCounts(config: StampogConfig): void {
  const matches = [...config.format.matchAll(/\{(token|word)([1-4])\}/g)];
  for (const match of matches) {
    const index = Number(match[2]);
    if (match[1] === 'token' && (!config.tokens.enabled || index > config.tokens.count)) {
      const reason = config.tokens.enabled ? `tokens.count is ${config.tokens.count}` : 'tokens are disabled';
      throw new Error(`Invalid Estamper config: format uses {token${index}} but ${reason}.`);
    }
    if (match[1] === 'word' && (!config.words.enabled || index > config.words.count)) {
      throw new Error(`Invalid Estamper config: format uses {word${index}} but words.count is ${config.words.enabled ? config.words.count : 0}.`);
    }
  }
}

export function validateConfig(config: StampogConfig): StampogConfig {
  config.security = resolveSecurity(config.security);
  if (config.schemaVersion !== 1) {
    throw new Error('Invalid Estamper config: schemaVersion must be 1.');
  }
  if (typeof config.name !== 'string' || config.name.trim() === '') {
    throw new Error('Invalid Estamper config: name must be a non-empty string.');
  }
  assertEnum('mode', config.mode, modes);
  assertEnum('preset', config.preset, presets);
  if (typeof config.format !== 'string' || config.format.trim() === '') {
    throw new Error('Invalid Estamper config: format must be a non-empty string.');
  }
  validateFormat(config.format);
  assertEnum('seed.strategy', config.seed.strategy, seedStrategies);

  assertBoolean('env.enabled', config.env.enabled);
  assertList('env.sources', config.env.sources, { allowEmpty: true });
  assertBoolean('cloud.enabled', config.cloud.enabled);
  assertList('cloud.detection keys', Object.keys(config.cloud.detection), { allowEmpty: true });

  assertBoolean('tokens.enabled', config.tokens.enabled);
  assertCount('tokens.count', config.tokens.count);
  assertEnum('tokens.mode', config.tokens.mode, modes);
  if (config.tokens.asciiLength !== 2 && config.tokens.asciiLength !== 3) {
    throw new Error('Invalid Estamper config: tokens.asciiLength must be 2 or 3.');
  }
  assertList('tokens.emoji.allow', config.tokens.emoji.allow, { allowEmpty: true });
  assertList('tokens.emoji.deny', config.tokens.emoji.deny, { allowEmpty: true });
  assertList('tokens.ascii.allow', config.tokens.ascii.allow, { allowEmpty: true });
  assertList('tokens.ascii.deny', config.tokens.ascii.deny, { allowEmpty: true });
  for (const [index, mapping] of config.tokens.mappings.entries()) {
    if (typeof mapping.emoji !== 'string' || mapping.emoji.trim() === '') {
      throw new Error(`Invalid Estamper config: tokens.mappings[${index}].emoji must be a non-empty string.`);
    }
    if (typeof mapping.name !== 'string' || mapping.name.trim() === '') {
      throw new Error(`Invalid Estamper config: tokens.mappings[${index}].name must be a non-empty string.`);
    }
  }

  assertBoolean('words.enabled', config.words.enabled);
  assertCount('words.count', config.words.count);
  assertEnum('words.case', config.words.case, wordCases);
  assertList('words.allow', config.words.allow, { allowEmpty: true });
  assertList('words.deny', config.words.deny, { allowEmpty: true });
  for (const [index, alias] of config.words.aliases.entries()) {
    if (typeof alias.word !== 'string' || alias.word.trim() === '') {
      throw new Error(`Invalid Estamper config: words.aliases[${index}].word must be a non-empty string.`);
    }
  }
  if (config.validation.failOnUnknownEmoji) {
    const known = new Set([...defaultEmojis, ...config.tokens.mappings.map((mapping) => mapping.emoji)]);
    for (const emoji of config.tokens.emoji.allow) {
      if (!known.has(emoji)) throw new Error(`Invalid Estamper config: unknown emoji token ${emoji}.`);
    }
  }
  if (config.validation.failOnUnknownWord) {
    const known = new Set([...defaultWords, ...config.words.aliases.map((alias) => alias.word)]);
    for (const word of config.words.allow) {
      if (!known.has(word)) throw new Error(`Invalid Estamper config: unknown word ${word}.`);
    }
  }

  assertBoolean('date.enabled', config.date.enabled);
  assertEnum('date.format', config.date.format, dateFormats);
  assertBoolean('time.enabled', config.time.enabled);
  assertEnum('time.format', config.time.format, timeFormats);
  if (!Number.isInteger(config.user.maxLength) || config.user.maxLength < 1 || config.user.maxLength > 128) {
    throw new Error('Invalid Estamper config: user.maxLength must be an integer from 1 to 128.');
  }
  if (!Number.isInteger(config.commit.length) || config.commit.length < 1 || config.commit.length > 64) {
    throw new Error('Invalid Estamper config: commit.length must be an integer from 1 to 64.');
  }
  if (!Number.isInteger(config.branch.maxLength) || config.branch.maxLength < 1 || config.branch.maxLength > 128) {
    throw new Error('Invalid Estamper config: branch.maxLength must be an integer from 1 to 128.');
  }
  if (!positions.has(config.badge.position)) {
    throw new Error('Invalid Estamper config: badge.position is not supported.');
  }
  if (!themes.has(config.badge.theme)) {
    throw new Error('Invalid Estamper config: badge.theme is not supported.');
  }
  if (!Number.isInteger(config.validation.maxStampLength) || config.validation.maxStampLength < 1) {
    throw new Error('Invalid Estamper config: validation.maxStampLength must be a positive integer.');
  }
  validatePlaceholderCounts(config);
  return config;
}
