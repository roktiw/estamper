import YAML from 'yaml';
import { sealReport, type PublicStamp } from '../security/envelope.js';
import { defaultConfig } from '../config/defaultConfig.js';
import { parseConfig, normalizeConfig } from '../config/parseConfig.js';
import { securityChoices, type SecurityLevel, type SecurityPolicy } from '../security/policy.js';
import { mountEstamper } from '../browser/mountEstamper.js';
export function mountSettings(): void {
  const root = document.querySelector<HTMLElement>('[data-settings]'); if (!root) return;
  let config = structuredClone(defaultConfig);
  const editor = root.querySelector<HTMLTextAreaElement>('[data-config]')!;
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const selectors = root.querySelectorAll<HTMLSelectElement>('[data-security]');
  let renderGeneration = 0;
  function render() {
    const current = ++renderGeneration;
    editor.value = YAML.stringify(config);
    selectors.forEach(select => select.value = config.security[select.dataset.security as keyof SecurityPolicy]);
    root!.querySelector('[data-policy]')!.textContent = Object.entries(config.security).map(([key, level]) => `${key}: ${level} — ${securityChoices[key as keyof SecurityPolicy][['min','mid','max'].indexOf(level)]}`).join('\n');
    const policy = structuredClone(config.security);
    const report = { stamp: 'build-demo', parts: { mode: 'emoji' as const, env: 'synthetic-demo', commit: 'aabbccd' } };
    const payload: PublicStamp = { stamp: 'build-demo', security: policy };
    const mount = () => { if (current === renderGeneration) mountEstamper({ stamp: payload.stamp, payload, target: root!.querySelector('[data-preview]')!, position: 'custom', rootId: 'settings-preview' }); };
    root!.querySelector('[data-preview]')!.replaceChildren();
    if (policy.access === 'mid') void sealReport(report, 'estamper-demo-only', payload.stamp, policy).then(sealed => { payload.sealed = sealed; mount(); }).catch(() => { if (current === renderGeneration) status.textContent = 'Preview requires HTTPS or localhost Web Crypto'; });
    else { if (policy.access === 'min') payload.report = report; mount(); }
  }
  selectors.forEach(select => select.onchange = () => { config.security[select.dataset.security as keyof SecurityPolicy] = select.value as SecurityLevel; render(); status.textContent = 'Settings updated'; });
  root.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(button => button.onclick = () => {
    const level = button.dataset.preset as SecurityLevel;
    config.security = { access: level, disclosure: level, exports: level, release: level }; render();
    status.textContent = level === 'min' ? 'Public access selected: details will be exposed.' : 'Preset applied';
  });
  root.querySelector<HTMLButtonElement>('[data-action="apply"]')!.onclick = () => {
    try { config = parseConfig(editor.value); render(); status.textContent = 'Valid configuration applied'; }
    catch (error) { status.textContent = (error as Error).message; }
  };
  root.querySelector<HTMLButtonElement>('[data-action="reset"]')!.onclick = () => { config = structuredClone(defaultConfig); render(); status.textContent = 'Defaults restored'; };
  root.querySelector<HTMLInputElement>('[data-import]')!.onchange = async event => {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    try {
      if (file.size > 131072) throw new Error('Config exceeds 128 KiB');
      config = parseConfig(await file.text(), file.name.endsWith('.json') ? 'json' : 'yaml'); render(); status.textContent = 'Configuration imported';
    } catch (error) { status.textContent = (error as Error).message; }
  };
  root.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(button => button.onclick = () => {
    const format = button.dataset.export; const checked = normalizeConfig(config);
    const body = format === 'json' ? JSON.stringify(checked, null, 2) : YAML.stringify(checked);
    const url = URL.createObjectURL(new Blob([body], { type: format === 'json' ? 'application/json' : 'text/yaml' }));
    const link = document.createElement('a'); link.href = url; link.download = `estamper.config.${format === 'json' ? 'json' : 'yml'}`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); status.textContent = 'Settings downloaded';
  });
  render();
}
