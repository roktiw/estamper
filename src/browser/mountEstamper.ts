import { resolveSecurity, type SecurityPolicy } from '../security/policy.js';
import { unlockReport, validateReport, redactReport, type PublicStamp } from '../security/envelope.js';
import type { StampResult } from '../core/types.js';
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
  rootId?: string;
  payload?: PublicStamp;
  security?: Partial<SecurityPolicy>;
  /** Must fetch details from your authenticated server on EVERY open. Never embed them in the callback. */
  loadAuthorizedReport?: () => Promise<StampResult>;
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

const controllers = new WeakMap<Element, { open: () => void; close: () => void }>();
export async function copyStamp(stamp: string, nav?: Navigator): Promise<string> {
  const target = nav ?? globalThis.navigator;
  if (!target?.clipboard?.writeText) throw new Error('Clipboard unavailable');
  await target.clipboard.writeText(stamp);
  return stamp;
}
export function openEstamperDetails(rootId = 'estamper-root', doc: Document = globalThis.document): boolean {
  const controller = controllers.get(doc?.getElementById(rootId)!);
  controller?.open();
  return Boolean(controller);
}
export function closeEstamperDetails(rootId = 'estamper-root', doc: Document = globalThis.document): boolean {
  const controller = controllers.get(doc?.getElementById(rootId)!);
  controller?.close();
  return Boolean(controller);
}
export function mountEstamper(options: MountEstamperOptions): HTMLElement {
  const security = resolveSecurity(options.payload?.security ?? options.security);
  if (!options.stamp || options.stamp.length > 512) throw new Error('Estamper requires a non-empty stamp up to 512 characters');
  if (security.access !== 'min' && (options.details || options.commitUrl || options.jsonUrl || options.payload?.report)) throw new Error('Protected details must not be embedded in browser options');
  if (security.access === 'max' && options.payload?.sealed) throw new Error('Backend access must not embed a sealed report');
  const target = typeof options.target === 'string' ? document.querySelector(options.target) : options.target ?? document.body;
  if (!target) throw new Error('Estamper target was not found');
  const doc = target.ownerDocument;
  if (!doc.getElementById('estamper-style')) {
    const style = doc.createElement('style'); style.id = 'estamper-style';
    style.textContent = css + '\n.estamper button,.estamper input,.estamper a{min-height:44px;box-sizing:border-box}.estamper__panel{max-height:70vh;overflow:auto}.estamper input{max-width:100%;display:block}.estamper__close{min-width:44px}@media(prefers-reduced-motion:reduce){.estamper[data-open="true"] .estamper__panel{animation:none}}';
    doc.head.append(style);
  }
  const rootId = options.rootId ?? 'estamper-root';
  const existing = doc.getElementById(rootId);
  if (existing) { controllers.get(existing)?.close(); existing.remove(); }
  const root = doc.createElement('div'); root.id = rootId; root.className = 'estamper';
  root.dataset.position = options.position ?? 'bottom-right'; root.dataset.theme = options.theme ?? 'dark'; root.dataset.open = 'false';
  const button = (text: string) => { const b = doc.createElement('button'); b.type = 'button'; b.className = 'estamper__action'; b.textContent = text; return b; };
  const badge = button(options.payload?.stamp ?? options.stamp); badge.className = 'estamper__badge';
  badge.setAttribute('aria-expanded', 'false'); badge.setAttribute('aria-controls', `${rootId}-panel`);
  const panel = doc.createElement('section'); panel.className = 'estamper__panel'; panel.id = `${rootId}-panel`; panel.setAttribute('aria-label', 'Estamper build');
  const close = button('×'); close.className = 'estamper__close'; close.setAttribute('aria-label', 'Close Estamper');
  const content = doc.createElement('div');
  const status = doc.createElement('p'); status.setAttribute('role', 'status');
  panel.append(close, content, status); root.append(badge, panel); target.append(root);
  let generation = 0;
  let returnFocus: Element | null = null;
  function lock() {
    generation++; root.dataset.open = 'false'; badge.setAttribute('aria-expanded', 'false');
    content.replaceChildren(); status.textContent = '';
    const focus = returnFocus as HTMLElement | null;
    (focus?.isConnected && focus !== doc.body ? focus : badge).focus();
  }
  function render(report: StampResult) {
    report = redactReport(report, security, options.payload?.stamp ?? options.stamp);
    content.replaceChildren(); status.textContent = '';
    const pre = doc.createElement('div'); pre.className = 'estamper__report';
    const labels: Record<string, string> = { cloud: 'Platform', env: 'Environment', commit: 'Commit', branch: 'Branch', user: 'Actor', date: 'Date', time: 'Time', dirty: 'Dirty' };
    const lines = [`Stamp: ${report.stamp}`];
    for (const [key, label] of Object.entries(labels)) {
      if (Object.hasOwn(report.parts, key)) {
        const value = report.parts[key as keyof typeof report.parts];
        lines.push(`${label}: ${key === 'cloud' ? ({ fb: 'Firebase', ghp: 'GitHub Pages' } as Record<string, string>)[String(value)] ?? value : value}`);
      }
    }
    const text = lines.join('\n'); pre.textContent = text; content.append(pre);
    if (security.exports !== 'max') {
      const actions = doc.createElement('div'); actions.className = 'estamper__actions';
      const copy = button('Copy report'); copy.onclick = () => {
        const current = generation;
        void copyStamp(text).then(() => { if (generation === current) status.textContent = 'Copied'; }, () => { if (generation === current) status.textContent = 'Clipboard unavailable; select the report to copy'; });
      }; actions.append(copy);
      function download(name: string, body: string, type: string) {
        const url = URL.createObjectURL(new Blob([body], { type })); const a = doc.createElement('a');
        a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      const txt = button('Download TXT'); txt.onclick = () => download('estamper.txt', text, 'text/plain'); actions.append(txt);
      if (security.exports === 'min') { const json = button('Download JSON'); json.onclick = () => download('estamper.json', JSON.stringify(report, null, 2), 'application/json'); actions.append(json); }
      content.append(actions);
    }
  }
  function open() {
    if (root.dataset.open === 'true') return;
    returnFocus = doc.activeElement; root.dataset.open = 'true'; badge.setAttribute('aria-expanded', 'true');
    content.replaceChildren(); status.textContent = ''; const current = ++generation;
    if (security.access === 'min') {
      render(options.payload?.report ?? { stamp: options.stamp, parts: { mode: 'emoji', ...options.details } } as StampResult); close.focus(); return;
    }
    if (security.access === 'max') {
      status.textContent = 'Authorizing…'; close.focus();
      if (!options.loadAuthorizedReport) { status.textContent = 'Authenticated report service is not configured'; return; }
      void Promise.resolve().then(() => options.loadAuthorizedReport!()).then(report => {
        if (generation === current && root.isConnected) render(report);
      }).catch(() => { if (generation === current) status.textContent = 'Access denied or report unavailable'; }); return;
    }
    if (!options.payload?.sealed) { status.textContent = 'Password-protected report is not configured'; close.focus(); return; }
    const form = doc.createElement('form'); const label = doc.createElement('label'); label.textContent = 'Estamper password';
    const input = doc.createElement('input'); input.type = 'password'; input.autocomplete = 'current-password'; input.maxLength = 1024; input.required = true;
    label.append(input); const submit = button('Unlock'); submit.type = 'submit'; form.append(label, submit); content.append(form); input.focus();
    form.onsubmit = async event => {
      event.preventDefault(); if (submit.disabled) return;
      submit.disabled = true; status.textContent = 'Unlocking…'; const password = input.value; input.value = '';
      try {
        const report = await unlockReport(options.payload!, password);
        if (generation === current && root.isConnected) render(report);
      } catch { if (generation === current) { status.textContent = 'Unable to unlock report'; input.focus(); } }
      finally { submit.disabled = false; }
    };
  }
  controllers.set(root, { open, close: lock });
  badge.onclick = () => root.dataset.open === 'true' ? lock() : open(); close.onclick = lock;
  root.addEventListener('keydown', event => { if (event.key === 'Escape' && root.dataset.open === 'true') { event.preventDefault(); lock(); } });
  return root;
}
