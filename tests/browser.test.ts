import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { closeEstamperDetails, copyStamp, mountEstamper, openEstamperDetails } from '../src/browser/index.js';

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
      security: { access: 'min', disclosure: 'min' },
      stamp: 'prd-ghp-🏷️-✅-silver-river-2026-06-28-14:02-roktiw@a1b2c3d',
      target: dom.window.document.body,
      details: { env: 'prd', cloud: 'ghp', commit: 'a1b2c3d', branch: 'main', user: 'roktiw', date: '2026-06-28', time: '14:02', dirty: false },
      commitUrl: 'https://github.com/roktiw/estamper/commit/a1b2c3d',
      jsonUrl: '/estamper.json',
    });
    openEstamperDetails('estamper-root', dom.window.document);
    expect(root.querySelector('.estamper__badge')).toBeTruthy();
    expect(root.querySelector('.estamper__panel')?.textContent).toContain('Stamp:');
    expect(root.querySelector('.estamper__panel')?.textContent).toContain('GitHub Pages');
    expect(root.querySelector('a')).toBeNull();
  });

  it('shows Firebase as platform label for cloud=fb', () => {
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
    const root = mountEstamper({
      security: { access: 'min', disclosure: 'min' },
      stamp: 'stg-fb-🚀-🧪-ocean-spark-2026-09-30-12:00-roktiw@abc1234',
      target: dom.window.document.body,
      details: { env: 'stg', cloud: 'fb' },
      rootId: 'estamper-fb-test',
    });
    openEstamperDetails('estamper-fb-test', dom.window.document);
    expect(root.querySelector('.estamper__panel')?.textContent).toContain('Firebase');
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
        rootId: 'estamper-custom',
      });
      expect(dom.window.document.querySelector('#badge > .estamper')).toBe(root);
      expect(root.dataset.position).toBe('custom');
    } finally {
      globalThis.document = previousDocument;
    }
  });

  it('deduplicates: calling mountEstamper twice with the same rootId replaces the widget', () => {
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
    const body = dom.window.document.body;
    mountEstamper({ stamp: 'first-stamp', target: body, rootId: 'estamper-dedup' });
    mountEstamper({ stamp: 'second-stamp', target: body, rootId: 'estamper-dedup' });
    const roots = body.querySelectorAll('#estamper-dedup');
    expect(roots.length).toBe(1);
    expect(roots[0]?.querySelector('.estamper__badge')?.textContent).toBe('second-stamp');
  });

  it('openEstamperDetails / closeEstamperDetails control the panel via rootId', () => {
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
    const root = mountEstamper({
      stamp: 'ctrl-stamp',
      target: dom.window.document.body,
      rootId: 'estamper-ctrl',
    });
    expect(root.dataset.open).toBe('false');
    openEstamperDetails('estamper-ctrl', dom.window.document);
    expect(root.dataset.open).toBe('true');
    closeEstamperDetails('estamper-ctrl', dom.window.document);
    expect(root.dataset.open).toBe('false');
  });

  it('openEstamperDetails returns false when element not found', () => {
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
    const result = openEstamperDetails('nonexistent', dom.window.document);
    expect(result).toBe(false);
  });
});

describe('protected panel', () => {
  it('rejects pretending plaintext options are protected', () => {
    const dom = new JSDOM('<body></body>');
    expect(() => mountEstamper({ stamp:'build-id', details:{ user:'private' }, target:dom.window.document.body })).toThrow('must not be embedded');
  });
  it('requires authorization on every open and discards late results after close', async () => {
    const dom = new JSDOM('<body></body>'); let calls = 0; let complete!: (value: any) => void;
    const root = mountEstamper({ stamp:'build-id', target:dom.window.document.body, security:{ access:'max' }, loadAuthorizedReport: () => { calls++; return new Promise(resolve => { complete = resolve; }); } });
    openEstamperDetails(undefined, dom.window.document); await Promise.resolve();
    closeEstamperDetails(undefined, dom.window.document);
    complete({ stamp:'private-report', parts:{ mode:'emoji', user:'private' } }); await new Promise(resolve => setTimeout(resolve, 0));
    expect(root.textContent).not.toContain('private-report');
    openEstamperDetails(undefined, dom.window.document); await Promise.resolve(); expect(calls).toBe(2);
  });
  it('programmatic open does not bypass default protection', () => {
    const dom = new JSDOM('<body></body>'); const root = mountEstamper({ stamp:'build-id', target:dom.window.document.body });
    openEstamperDetails(undefined, dom.window.document); expect(root.textContent).toContain('not configured'); expect(root.querySelector('.estamper__report')).toBeNull();
  });
});
