export type EstamperPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface MountEstamperOptions {
  stamp: string;
  target?: Element;
  position?: EstamperPosition;
  theme?: 'light' | 'dark';
  copyOnClick?: boolean;
  details?: Record<string, unknown>;
}

const css = `
.estamper{position:fixed;z-index:2147483647;font:12px/1.4 system-ui,sans-serif;color:#f8fafc}
.estamper[data-position="bottom-right"]{right:12px;bottom:12px}
.estamper[data-position="bottom-left"]{left:12px;bottom:12px}
.estamper[data-position="top-right"]{right:12px;top:12px}
.estamper[data-position="top-left"]{left:12px;top:12px}
.estamper__badge{max-width:min(80vw,520px);overflow:hidden;text-overflow:ellipsis;border:0;border-radius:999px;padding:8px 12px;background:#111827;color:#f8fafc;box-shadow:0 8px 24px #0004;cursor:pointer}
.estamper[data-theme="light"] .estamper__badge{background:#fff;color:#111827;border:1px solid #d1d5db}
.estamper__panel{display:none;margin-top:8px;max-width:min(80vw,520px);border-radius:12px;padding:10px;background:#111827;color:#f8fafc;box-shadow:0 8px 24px #0005;white-space:pre-wrap;overflow-wrap:anywhere}
.estamper[data-open="true"] .estamper__panel{display:block}
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

export function mountEstamper(options: MountEstamperOptions): HTMLElement {
  if (!options.stamp || options.stamp.length > 512) {
    throw new Error('Estamper requires a non-empty stamp up to 512 characters.');
  }
  const target = options.target ?? document.body;
  const doc = target.ownerDocument;
  ensureStyle(doc);

  const root = doc.createElement('div');
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
  details.textContent = JSON.stringify({ stamp: options.stamp, ...(options.details ?? {}) }, null, 2);
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
