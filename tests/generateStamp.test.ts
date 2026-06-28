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

  it('supports Estamper website dogfooding fields', () => {
    const result = generateStamp({
      format: '{env}-{cloud}-{token1}-{token2}-{word1}-{word2}-{date}-{time}-{user}@{commit}',
      env: 'prd',
      cloud: 'ghp',
      tokens: ['🏷️', '✅'],
      words: ['silver', 'river'],
      date: new Date(Date.UTC(2026, 5, 28, 14, 2, 9)),
      dateFormat: 'yyyy-mm-dd',
      timeFormat: 'hh:mm',
      timezone: 'utc',
      user: 'roktiw',
      commit: 'a1b2c3d',
      seed: 'dogfood',
    });
    expect(result.stamp).toMatch(/^prd-ghp-(🏷️|✅)-(🏷️|✅)-(silver|river)-(silver|river)-2026-06-28-14:02-roktiw@a1b2c3d$/);
    expect(result.parts).toMatchObject({ env: 'prd', cloud: 'ghp', date: '2026-06-28', time: '14:02' });
  });
});
