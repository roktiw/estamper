export type StampogPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface MountStampogOptions {
  stamp: string;
  target?: Element;
  position?: StampogPosition;
  theme?: 'light' | 'dark' | 'auto';
  copyOnClick?: boolean;
  details?: Record<string, unknown>;
  commitUrl?: string;
  jsonUrl?: string;
}

const css = `
.stampog{position:fixed;z-index:2147483647;font:12px/1.4 system-ui,sans-serif;color:#f8fafc}
.stampog[data-position="bottom-right"]{right:12px;bottom:12px}
.stampog[data-position="bottom-left"]{left:12px;bottom:12px}
.stampog[data-position="top-right"]{right:12px;top:12px}
.stampog[data-position="top-left"]{left:12px;top:12px}
.stampog__badge{max-width:min(80vw,520px);overflow:hidden;text-overflow:ellipsis;border:0;border-radius:999px;padding:8px 12px;background:#111827;color:#f8fafc;box-shadow:0 8px 24px #0004;cursor:pointer}
.stampog[data-theme="light"] .stampog__badge{background:#fff;color:#111827;border:1px solid #d1d5db}
.stampog__panel{display:none;margin-top:8px;max-width:min(80vw,520px);border-radius:12px;padding:10px;background:#111827;color:#f8fafc;box-shadow:0 8px 24px #0005;white-space:pre-wrap;overflow-wrap:anywhere}
.stampog__panel-title{font-weight:700;margin:0 0 8px}
.stampog__actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.stampog__action{border:1px solid #374151;border-radius:999px;background:#1f2937;color:inherit;padding:5px 8px;text-decoration:none;cursor:pointer;font:inherit}
.stampog[data-open="true"] .stampog__panel{display:block}
.stampog__close{float:right;margin-left:8px}
`;

function ensureStyle(doc: Document): void {
  if (doc.getElementById('stampog-style')) return;
  const style = doc.createElement('style');
  style.id = 'stampog-style';
  style.textContent = css;
  doc.head.append(style);
}

export async function copyStamp(stamp: string, nav?: Navigator): Promise<string> {
  const targetNavigator = nav ?? (typeof navigator === 'undefined' ? undefined : navigator);
  await targetNavigator?.clipboard?.writeText?.(stamp);
  return stamp;
}

function label(value: unknown, labels: Record<string, string>): string {
  return typeof value === 'string' ? (labels[value] ?? value) : String(value ?? '');
}

function appendLine(target: Element, name: string, value: unknown): void {
  if (value === undefined || value === '') return;
  target.append(`${name}: ${String(value)}\n`);
}

export function mountStampog(options: MountStampogOptions): HTMLElement {
  if (!options.stamp || options.stamp.length > 512) {
    throw new Error('Stampog requires a non-empty stamp up to 512 characters.');
  }
  const target = options.target ?? document.body;
  const doc = target.ownerDocument;
  ensureStyle(doc);

  const root = doc.createElement('div');
  root.className = 'stampog estamper';
  root.dataset.position = options.position ?? 'bottom-right';
  root.dataset.theme = options.theme ?? 'dark';
  root.dataset.open = 'false';

  const badge = doc.createElement('button');
  badge.className = 'stampog__badge estamper__badge';
  badge.type = 'button';
  badge.textContent = options.stamp;

  const panel = doc.createElement('div');
  panel.className = 'stampog__panel estamper__panel';
  const close = doc.createElement('button');
  close.className = 'stampog__close estamper__close';
  close.type = 'button';
  close.textContent = '×';
  const details = doc.createElement('div');
  const data = options.details ?? {};
  const title = doc.createElement('p');
  title.className = 'stampog__panel-title estamper__panel-title';
  title.textContent = 'Estamper build';
  details.append(title, `Stamp:\n${options.stamp}\n\n`);
  appendLine(details, 'Environment', label(data.env, { prd: 'production', pre: 'preview', dev: 'development', stg: 'staging' }));
  appendLine(details, 'Platform', label(data.cloud, { ghp: 'GitHub Pages', vcl: 'Vercel', ntl: 'Netlify', loc: 'local' }));
  appendLine(details, 'Commit', data.commit);
  appendLine(details, 'Branch', data.branch);
  appendLine(details, 'Actor', data.user);
  appendLine(details, 'Built', [data.date, data.time].filter(Boolean).join(' '));
  appendLine(details, 'Dirty', data.dirty);
  const actions = doc.createElement('div');
  actions.className = 'stampog__actions estamper__actions';
  const copy = doc.createElement('button');
  copy.className = 'stampog__action estamper__action';
  copy.type = 'button';
  copy.textContent = 'Copy';
  copy.addEventListener('click', () => void copyStamp(options.stamp));
  actions.append(copy);
  if (options.commitUrl) {
    const commit = doc.createElement('a');
    commit.className = 'stampog__action estamper__action';
    commit.href = options.commitUrl;
    commit.textContent = 'Open commit';
    actions.append(commit);
  }
  if (options.jsonUrl) {
    const json = doc.createElement('a');
    json.className = 'stampog__action estamper__action';
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
