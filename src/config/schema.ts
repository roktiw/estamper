import type { EstamperConfig } from './defaultConfig.js';

const modes = new Set(['emoji', 'ascii', 'mixed', 'auto']);
const positions = new Set(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'custom']);
const dateFormats = new Set(['yyyy-mm-dd', 'yy-mm-dd', 'mmdd', 'yyyymmdd', 'iso-date']);
const timeFormats = new Set(['hh:mm', 'hh:mm:ss', 'hhmm', 'hhmmss', 'unix']);
const customDateFormat = /^[ymdhs:._/-]+$/;
const customTimeFormat = /^[hms:._/-]+$/;

function assertList(name: string, value: unknown): asserts value is string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Invalid Estamper config: ${name} must be a non-empty list.`);
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

export function validateConfig(config: EstamperConfig): EstamperConfig {
  if (!modes.has(config.mode)) {
    throw new Error('Invalid Estamper config: mode must be emoji, ascii, mixed, or auto.');
  }
  if (typeof config.format !== 'string' || !config.format.includes('{date}')) {
    throw new Error('Invalid Estamper config: format must be a string containing {date}.');
  }
  if (!dateFormats.has(config.date.format) && !customDateFormat.test(config.date.format)) {
    throw new Error('Invalid Estamper config: date.format is not supported.');
  }
  if (!timeFormats.has(config.time.format) && !customTimeFormat.test(config.time.format)) {
    throw new Error('Invalid Estamper config: time.format is not supported.');
  }
  if (!Number.isInteger(config.tokens.count) || config.tokens.count < 1 || config.tokens.count > 4) {
    throw new Error('Invalid Estamper config: tokens.count must be an integer from 1 to 4.');
  }
  if (!Number.isInteger(config.words.count) || config.words.count < 1 || config.words.count > 4) {
    throw new Error('Invalid Estamper config: words.count must be an integer from 1 to 4.');
  }
  assertList('words.allow', config.words.allow);
  assertList('emojis.allow', config.emojis.allow);
  assertList('ascii.allow', config.ascii.allow);
  if (config.tokens.enabled && config.tokens.emoji?.allow) {
    assertList('tokens.emoji.allow', config.tokens.emoji.allow);
  }
  if (config.tokens.enabled && config.tokens.ascii?.allow) {
    assertList('tokens.ascii.allow', config.tokens.ascii.allow);
  }
  if (!Number.isInteger(config.git.commitLength) || config.git.commitLength < 4 || config.git.commitLength > 40) {
    throw new Error('Invalid Estamper config: git.commitLength must be an integer from 4 to 40.');
  }
  if (typeof config.git.dirtyMarker !== 'string' || config.git.dirtyMarker.length !== 1) {
    throw new Error('Invalid Estamper config: git.dirtyMarker must be a single character.');
  }
  if (!positions.has(config.badge.position)) {
    throw new Error('Invalid Estamper config: badge.position is not supported.');
  }
  return config;
}
