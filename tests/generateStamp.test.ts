import { describe, expect, it } from 'vitest';
import { generateStamp } from '../src/index.js';

const date = new Date(2026, 5, 28, 4, 12, 9);

describe('generateStamp', () => {
  it('returns expected Estamper shape', () => {
    const result = generateStamp({ date, user: 'roktiw', commit: 'a1b2c3d', seed: 'demo' });
    expect(result.stamp).toContain('roktiw@a1b2c3d');
    expect(result.parts.date).toBe('2026-06-28');
    expect(result.parts.time).toBe('04:12');
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
    expect(result.stamp).not.toContain('🏷️');
  });

  it('uses emoji to ASCII mappings with requested length', () => {
    const result = generateStamp({
      mode: 'ascii',
      tokenCount: 2,
      asciiLength: 3,
      words: ['silver', 'river'],
      date,
      user: 'roktiw',
      commit: 'a1b2c3d',
      seed: 'mapping',
      format: '{token1}-{token2}',
    });
    expect(result.stamp).toMatch(/^[A-Z]{3,4}-[A-Z]{3,4}$/);
  });

  it('supports compact word aliases', () => {
    const result = generateStamp({
      words: ['silver', 'river'],
      wordCase: 'code3',
      tokenCount: 0,
      date,
      user: 'roktiw',
      commit: 'a1b2c3d',
      seed: 'words',
      format: '{word1}-{word2}',
    });
    expect(result.stamp).toMatch(/^(SLV|RVR)-(SLV|RVR)$/);
  });

  it('supports custom formats and removes missing separators', () => {
    const result = generateStamp({
      format: '{env}-{word1}/{commit}/{branch}-{user}',
      words: ['silver'],
      date,
      user: 'roktiw',
      commit: 'a1b2c3d',
      seed: 'format',
    });
    expect(result.stamp).toBe('silver/a1b2c3d/roktiw');
  });
});
