export type EstamperPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';

export interface MountEstamperOptions {
  stamp: string;
  target?: Element | string;
  position?: EstamperPosition;
  theme?: 'light' | 'dark' | 'auto';
  copyOnClick?: boolean;
  details?: Record<string, unknown>;
  commitUrl?: string;
  jsonUrl?: string;
  /** Unique DOM id for the root element. Defaults to 'estamper-root'.
   *  If an element with this id already exists it is removed before mounting,
   *  preventing duplicates on hot-reload or React re-renders. */
  rootId?: string;
}

const css = `
@keyframes estamper-fade-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.estamper{position:fixed;z-index:2147483647;font:12px/1.4 system-ui,sans-serif;color:#f8fafc}
.estamper[data-position="bottom-right"]{right:12px;bottom:12px}
.estamper[data-position="bottom-left"]{left:12px;bottom:12px}
.estamper[data-position="top-right"]{right:12px;top:12px}
.estamper[data-position="top-left"]{left:12px;top:12px}
.estamper[data-position="custom"]{position:static;display:inline-block}
.estamper__badge{max-width:min(80vw,520px);overflow:hidden;text-overflow:ellipsis;border:0;border-radius:999px;padding:8px 12px;background:#111827;color:#f8fafc;box-shadow:0 8px 24px #0004;cursor:pointer}
.estamper[data-theme="light"] .estamper__badge{background:#fff;color:#111827;border:1px solid #d1d5db}
.estamper__panel{display:none;margin-top:8px;max-width:min(80vw,520px);border-radius:12px;padding:10px;background:#111827;color:#f8fafc;box-shadow:0 8px 24px #0005;white-space:pre-wrap;overflow-wrap:anywhere}
.estamper__panel-title{font-weight:700;margin:0 0 8px}
.estamper__actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.estamper__action{border:1px solid #374151;border-radius:999px;background:#1f2937;color:inherit;padding:5px 8px;text-decoration:none;cursor:pointer;font:inherit}
.estamper[data-open="true"] .estamper__panel{display:block;animation:estamper-fade-in .18s ease}
.estamper__close{float:right;margin-left:8px}
`;

function ensureStyle(doc: Document): void {
  if (doc.getElementById('estamper-style')) return;
  const style = doc.createElement('style');
  style.id = 'estamper-style';
  style.textContent = css;
  doc.head.append(style);
}

export async function copyStamp(stamp: string, nav?: Navigator): Promise<string> {
  const targetNavigator = nav ?? (typeof navigator === 'undefined' ? undefined : navigator);
  await targetNavigator?.clipboard?.writeText?.(stamp);
  return stamp;
}

function resolveTarget(target?: Element | string): { element: Element | null; selector?: string } {
  if (typeof target === 'string') {
    return { element: document.querySelector(target), selector: target };
  }
  return { element: target ?? document.body };
}

function label(value: unknown, labels: Record<string, string>): string {
  return typeof value === 'string' ? (labels[value] ?? value) : String(value ?? '');
}

function appendLine(target: Element, name: string, value: unknown): void {
  if (value === undefined || value === '') return;
  target.append(`${name}: ${String(value)}\n`);
}

/** Programmatically open the Estamper details panel.
 *
 *  Looks up the panel by `rootId` (default `'estamper-root'`) and sets
 *  `data-open="true"` on it, exactly as clicking the badge does.
 *  Call this from menu items, footer buttons, keyboard shortcuts, etc.
 *
 *  @param rootId - The id of the mounted root element (matches `MountEstamperOptions.rootId`).
 *  @param doc    - Defaults to `globalThis.document`.
 *  @returns `true` if the element was found and toggled, `false` otherwise.
 */
export function openEstamperDetails(rootId = 'estamper-root', doc: Document = globalThis.document): boolean {
  const root = doc?.getElementById(rootId);
  if (!root) return false;
  root.dataset.open = 'true';
  return true;
}

/** Programmatically close the Estamper details panel. */
export function closeEstamperDetails(rootId = 'estamper-root', doc: Document = globalThis.document): boolean {
  const root = doc?.getElementById(rootId);
  if (!root) return false;
  root.dataset.open = 'false';
  return true;
}

export function mountEstamper(options: MountEstamperOptions): HTMLElement {
  if (!options.stamp || options.stamp.length > 512) {
    throw new Error('Estamper requires a non-empty stamp up to 512 characters.');
  }
  const { element: target, selector: targetSelector } = resolveTarget(options.target);
  if (!target) {
    throw new Error(targetSelector ? `Estamper target was not found: ${targetSelector}` : 'Estamper target was not found.');
  }
  const doc = target.ownerDocument;
  ensureStyle(doc);

  // Deduplication: remove any existing widget with the same id before mounting.
  const rootId = options.rootId ?? 'estamper-root';
  const existing = doc.getElementById(rootId);
  if (existing) existing.remove();

  const root = doc.createElement('div');
  root.id = rootId;
  root.className = 'estamper';
  root.dataset.position = options.position ?? 'bottom-right';
  root.dataset.theme = options.theme ?? 'dark';
  root.dataset.open = 'false';

  const badge = doc.createElement('button');
  badge.className = 'estamper__badge';
  badge.type = 'button';
  badge.textContent = options.stamp;

  const panel = doc.createElement('div');
  panel.className = 'estamper__panel';
  const close = doc.createElement('button');
  close.className = 'estamper__close';
  close.type = 'button';
  close.textContent = '×';
  const details = doc.createElement('div');
  const data = options.details ?? {};
  const title = doc.createElement('p');
  title.className = 'estamper__panel-title';
  title.textContent = 'Estamper build';
  details.append(title, `Stamp:\n${options.stamp}\n\n`);
  appendLine(details, 'Environment', label(data.env, { prd: 'production', pre: 'preview', dev: 'development', stg: 'staging' }));
  appendLine(details, 'Platform', label(data.cloud, { ghp: 'GitHub Pages', vcl: 'Vercel', ntl: 'Netlify', fb: 'Firebase', loc: 'local' }));
  appendLine(details, 'Commit', data.commit);
  appendLine(details, 'Branch', data.branch);
  appendLine(details, 'Actor', data.user);
  appendLine(details, 'Built', [data.date, data.time].filter(Boolean).join(' '));
  appendLine(details, 'Dirty', data.dirty);
  const actions = doc.createElement('div');
  actions.className = 'estamper__actions';
  const copy = doc.createElement('button');
  copy.className = 'estamper__action';
  copy.type = 'button';
  copy.textContent = 'Copy';
  copy.addEventListener('click', () => void copyStamp(options.stamp));
  actions.append(copy);
  if (options.commitUrl) {
    const commit = doc.createElement('a');
    commit.className = 'estamper__action';
    commit.href = options.commitUrl;
    commit.textContent = 'Open commit';
    actions.append(commit);
  }
  if (options.jsonUrl) {
    const json = doc.createElement('a');
    json.className = 'estamper__action';
    json.href = options.jsonUrl;
    json.textContent = 'View JSON';
    actions.append(json);
  }
  details.append(actions);
  panel.append(close, details);

  badge.addEventListener('click', () => {
    root.dataset.open = root.dataset.open === 'true' ? 'false' : 'true';
    if (options.copyOnClick !== false) void copyStamp(options.stamp);
  });
  close.addEventListener('click', () => {
    root.dataset.open = 'false';
  });

  root.append(badge, panel);
  target.append(root);
  return root;
}
