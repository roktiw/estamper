import { describe, expect, it } from 'vitest';
import { generateStamp } from '../src/index.js';

const date = new Date(2026, 5, 28, 4, 12, 9);

describe('generateStamp', () => {
  it('returns expected shape', () => {
    const result = generateStamp({ date, user: 'roktiw', commit: 'a1b2c3d', seed: 'demo' });
    expect(result.stamp).toContain('roktiw@a1b2c3d');
    expect(result.parts.date).toBe('2026-06-28-04:12:09');
    expect(result.parts.mode).toBe('emoji');
  });

  it('uses deterministic seeds', () => {
    const first = generateStamp({ date, seed: 'same' });
    const second = generateStamp({ date, seed: 'same' });
    expect(first).toEqual(second);
  });

  it('supports ascii mode without emoji tokens in the stamp', () => {
    const result = generateStamp({
      mode: 'ascii',
      ascii: ['WM', 'TL'],
      words: ['silver', 'river'],
      date,
      user: 'roktiw',
      commit: 'a1b2c3d',
      seed: 'ascii',
    });
    expect(result.stamp).toMatch(/^(WM|TL)-(WM|TL)-/);
    expect(result.stamp).not.toContain('🍉');
  });

  it('uses ascii tokens for auto mode when emoji support is disabled', () => {
    const result = generateStamp({
      mode: 'auto',
      emojiSupported: false,
      format: '{emoji1}-{emoji2}-{word1}-{word2}-{date}-{user}@{commit}',
      ascii: ['WM', 'TL'],
      words: ['silver', 'river'],
      date,
      user: 'roktiw',
      commit: 'a1b2c3d',
      seed: 'auto-ascii',
    });
    expect(result.parts.mode).toBe('ascii');
    expect(result.stamp).toMatch(/^(WM|TL)-(WM|TL)-/);
  });

  it('supports UTC date formatting', () => {
    const result = generateStamp({
      date: new Date('2026-06-28T04:12:09Z'),
      dateTimezone: 'utc',
      format: '{date}',
    });
    expect(result.stamp).toBe('2026-06-28-04:12:09');
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
});
