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

  it('documents the protected default and separate release destinations', async () => {
    const readme = await readFile('README.md', 'utf8');

    expect(readme).toContain('# Estamper');
    expect(readme).toContain('password-encrypted details');
    expect(readme).toContain('No automatic `estamper.json`');
    expect(readme).toContain('A GitHub Release is separate from npm publication');
  });
});
