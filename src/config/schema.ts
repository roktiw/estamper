import type { StampogConfig } from './defaultConfig.js';

const modes = new Set(['emoji', 'ascii', 'auto']);
const positions = new Set(['top-left', 'top-right', 'bottom-left', 'bottom-right']);

function assertList(name: string, value: unknown): asserts value is string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Invalid Stampog config: ${name} must be a non-empty list.`);
  }
  if (value.length > 256) {
    throw new Error(`Invalid Stampog config: ${name} cannot contain more than 256 items.`);
  }
  for (const item of value) {
    if (typeof item !== 'string' || item.trim() === '') {
      throw new Error(`Invalid Stampog config: ${name} must contain only non-empty strings.`);
    }
    if (item.length > 64) {
      throw new Error(`Invalid Stampog config: ${name} items must be 64 characters or shorter.`);
    }
  }
}

export function validateConfig(config: StampogConfig): StampogConfig {
  if (!modes.has(config.mode)) {
    throw new Error('Invalid Stampog config: mode must be emoji, ascii, or auto.');
  }
  if (typeof config.format !== 'string' || !config.format.includes('{date}')) {
    throw new Error('Invalid Stampog config: format must be a string containing {date}.');
  }
  assertList('words.allow', config.words.allow);
  assertList('emojis.allow', config.emojis.allow);
  assertList('ascii.allow', config.ascii.allow);
  if (!Number.isInteger(config.git.commitLength) || config.git.commitLength < 1 || config.git.commitLength > 64) {
    throw new Error('Invalid Stampog config: git.commitLength must be an integer from 1 to 64.');
  }
  if (!positions.has(config.badge.position)) {
    throw new Error('Invalid Stampog config: badge.position is not supported.');
  }
  return config;
}
