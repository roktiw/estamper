import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('Estamper branding', () => {
  it('uses Estamper package metadata for launch discoverability', async () => {
    const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
      name: string;
      description: string;
      bin: Record<string, string>;
      keywords: string[];
    };

    expect(packageJson.name).toBe('estamper');
    expect(packageJson.bin).toHaveProperty('estamper');
    expect(packageJson.description).toContain('web apps, staging, QA and screenshots');
    expect(packageJson.keywords).toEqual(expect.arrayContaining(['build', 'vite', 'qa', 'web-games']));
  });

  it('opens the README with the visible build stamp pitch', async () => {
    const readme = await readFile('README.md', 'utf8');

    expect(readme).toContain('# Estamper');
    expect(readme).toContain('Tiny visible build stamps for web apps and games.');
    expect(readme).toContain('When QA sends a screenshot');
    expect(readme).toContain('🍉-🛠️-silver-river-2026-06-28-04:12:09-roktiw@a1b2c3d');
  });
});
