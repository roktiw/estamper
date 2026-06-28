import { describe, expect, it } from 'vitest';
import { generateStamp } from '../src/index.js';

const date = new Date(2026, 5, 28, 4, 12, 9);

describe('generateStamp', () => {
  it('returns expected shape', () => {
    const result = generateStamp({ env: 'stg', cloud: 'az', date, user: 'roktiw', commit: 'a1b2c3d', seed: 'demo' });
    expect(result.stamp).toMatch(/^stg-az-.+-.+-2026-06-28-04:12-roktiw@a1b2c3d$/);
    expect(result.stamp).toContain('roktiw@a1b2c3d');
    expect(result.parts.env).toBe('stg');
    expect(result.parts.cloud).toBe('az');
    expect(result.parts.date).toBe('2026-06-28');
    expect(result.parts.time).toBe('04:12');
    expect(result.parts.mode).toBe('emoji');
  });

  it('uses deterministic seeds', () => {
    const first = generateStamp({ date, commit: 'abcdef1' });
    const second = generateStamp({ date, commit: 'abcdef1' });
    expect(first).toEqual(second);
  });

  it('supports ascii mode with uppercase env and cloud tokens', () => {
    const result = generateStamp({
      mode: 'ascii',
      env: 'stg',
      cloud: 'az',
      ascii: ['WM', 'TL'],
      words: ['silver', 'river'],
      date,
      user: 'roktiw',
      commit: 'a1b2c3d',
      seed: 'ascii',
    });
    expect(result.stamp).toMatch(/^STG-AZ-(WM|TL)-(WM|TL)-/);
    expect(result.stamp).not.toContain('🍉');
  });

  it('marks dirty commits and can omit cloud/time segments', () => {
    const result = generateStamp({
      cloud: false,
      includeTime: false,
      words: ['silver'],
      emojis: ['🍉'],
      date,
      user: 'roktiw',
      commit: 'a1b2c3d999',
      dirty: true,
    });
    expect(result.stamp).toBe('dev-🍉-🍉-silver-silver-2026-06-28-roktiw@a1b2c3d~');
  });

  it('supports custom formats', () => {
    const result = generateStamp({
      format: '{word1}/{commit}/{user}',
      words: ['silver'],
      date,
      user: 'roktiw',
      commit: 'a1b2c3d',
      seed: 'format',
    });
    expect(result.stamp).toBe('silver/a1b2c3d/roktiw');
  });

  it('supports configured date and time formats', () => {
    const result = generateStamp({
      date,
      dateFormat: 'yyyymmdd',
      timeFormat: 'hhmm',
      user: 'roktiw',
      commit: 'a1b2c3d',
    });
    expect(result.parts.date).toBe('20260628');
    expect(result.parts.time).toBe('0412');
  });
});
