import { describe, expect, it } from 'vitest';
import {
  applyPlaygroundPreset,
  buildPlaygroundJson,
  buildPlaygroundSnippet,
  buildPlaygroundStamp,
  buildPlaygroundYaml,
  defaultPlaygroundConfig,
} from '../../src/site/playground.js';

describe('website playground helpers', () => {
  it('builds the requested demo stamp shape', () => {
    expect(buildPlaygroundStamp(defaultPlaygroundConfig)).toBe('stg-az-🍉-🛠️-silver-river-2026-06-28-14:02-roktiw@a1b2c3d');
  });

  it('switches presets and ascii mode', () => {
    const config = applyPlaygroundPreset('ascii');
    expect(config.mode).toBe('ascii');
    expect(buildPlaygroundStamp(config)).toContain('stg-az-WM-TL');
  });

  it('exports yaml, json, and browser snippet', () => {
    expect(buildPlaygroundYaml(defaultPlaygroundConfig)).toContain('mode: emoji');
    expect(buildPlaygroundJson(defaultPlaygroundConfig)).toContain('"stamp"');
    expect(buildPlaygroundSnippet(defaultPlaygroundConfig)).toContain('mountEstamper');
  });
});
