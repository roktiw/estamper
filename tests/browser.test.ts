import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { copyStamp, mountEstamper } from '../src/browser/index.js';

describe('browser badge', () => {
  it('creates a safe badge', () => {
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
    const root = mountEstamper({
      stamp: '<img src=x onerror=alert(1)>',
      target: dom.window.document.body,
      copyOnClick: false,
    });
    expect(root.querySelector('.estamper__badge')?.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(root.querySelector('img')).toBeNull();
  });

  it('mounts the Estamper build panel', () => {
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
    const root = mountEstamper({
      stamp: 'prd-ghp-🏷️-✅-silver-river-2026-06-28-14:02-roktiw@a1b2c3d',
      target: dom.window.document.body,
      details: { env: 'prd', cloud: 'ghp', commit: 'a1b2c3d', branch: 'main', user: 'roktiw', date: '2026-06-28', time: '14:02', dirty: false },
      commitUrl: 'https://github.com/roktiw/estamper/commit/a1b2c3d',
      jsonUrl: '/estamper.json',
    });
    expect(root.querySelector('.estamper__badge')).toBeTruthy();
    expect(root.querySelector('.estamper__panel')?.textContent).toContain('Estamper build');
    expect(root.querySelector('.estamper__panel')?.textContent).toContain('GitHub Pages');
    expect(root.querySelector<HTMLAnchorElement>('a[href="/estamper.json"]')?.textContent).toBe('View JSON');
  });

  it('copy function returns the stamp', async () => {
    const copied: string[] = [];
    const nav = { clipboard: { writeText: async (value: string) => { copied.push(value); } } } as Navigator;
    await expect(copyStamp('stamp', nav)).resolves.toBe('stamp');
    expect(copied).toEqual(['stamp']);
  });

  it('mounts into a custom selector target', () => {
    const dom = new JSDOM('<!doctype html><html><head></head><body><main id="badge"></main></body></html>', {
      url: 'https://example.test',
    });
    const previousDocument = globalThis.document;
    globalThis.document = dom.window.document;
    try {
      const root = mountEstamper({
        stamp: 'custom-target',
        target: '#badge',
        position: 'custom',
      });
      expect(dom.window.document.querySelector('#badge > .estamper')).toBe(root);
      expect(root.dataset.position).toBe('custom');
    } finally {
      globalThis.document = previousDocument;
    }
  });
});
