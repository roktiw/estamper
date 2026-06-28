import {
  applyPlaygroundPreset,
  buildPlaygroundJson,
  buildPlaygroundSnippet,
  buildPlaygroundStamp,
  buildPlaygroundYaml,
  type PlaygroundConfig,
  type PlaygroundPreset,
} from './playground.js';

const storageKey = 'estamper-playground';
// Regenerate four choices so the two-token/two-word default can show variety without making exported YAML noisy.
const regeneratedTokenCount = 4;

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function shuffle<T>(values: T[]): T[] {
  const output = [...values];
  // Fisher-Yates keeps demo regeneration unbiased while preserving the original lists.
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

export function mountPlayground(defaults: PlaygroundConfig): void {
  const root = document.querySelector<HTMLElement>('[data-playground]');
  if (!root) return;

  const field = (name: keyof PlaygroundConfig): FieldElement | null => root.querySelector(`[data-field="${name}"]`);
  const output = (name: string): HTMLElement | null => root.querySelector(`[data-output="${name}"]`);
  const action = (name: string): HTMLButtonElement | null => root.querySelector(`[data-action="${name}"]`);
  const list = (name: keyof PlaygroundConfig): string[] => String(field(name)?.value || '').split('\n').map((value) => value.trim()).filter(Boolean);
  const copy = (text: string | null | undefined) => navigator.clipboard?.writeText(text ?? '').catch((error: unknown) => {
    console.warn('Could not copy Estamper playground output. Check browser clipboard permissions or copy manually.', error);
  });

  function readConfig(): PlaygroundConfig {
    const modeValue = field('mode')?.value;
    const asciiLengthValue = Number(field('asciiLength')?.value || defaults.asciiLength);
    let asciiLength: 2 | 3 = 2;
    if (asciiLengthValue === 3) asciiLength = 3;
    return {
      env: field('env')?.value || defaults.env,
      cloud: field('cloud')?.value || defaults.cloud,
      mode: modeValue === 'ascii' || modeValue === 'auto' ? modeValue : 'emoji',
      emojis: list('emojis'),
      ascii: list('ascii'),
      words: list('words'),
      date: field('date')?.value || defaults.date,
      time: field('time')?.value || defaults.time,
      user: field('user')?.value || defaults.user,
      commit: field('commit')?.value || defaults.commit,
      dirty: Boolean((field('dirty') as HTMLInputElement | null)?.checked),
      branch: Boolean((field('branch') as HTMLInputElement | null)?.checked),
      build: Boolean((field('build') as HTMLInputElement | null)?.checked),
      preset: (field('preset')?.value || 'standard') as PlaygroundPreset,
      tokenCount: Number(field('tokenCount')?.value || defaults.tokenCount),
      wordCount: Number(field('wordCount')?.value || defaults.wordCount),
      asciiLength,
      commitLength: Number(field('commitLength')?.value || defaults.commitLength),
      badgePosition: (field('badgePosition')?.value || defaults.badgePosition) as PlaygroundConfig['badgePosition'],
      theme: (field('theme')?.value || defaults.theme) as PlaygroundConfig['theme'],
    };
  }

  function setList(name: keyof PlaygroundConfig, values: string[]): void {
    const element = field(name);
    if (element) element.value = values.join('\n');
  }

  function writeConfig(config: PlaygroundConfig): void {
    for (const [key, value] of Object.entries(config) as [keyof PlaygroundConfig, PlaygroundConfig[keyof PlaygroundConfig]][]) {
      const element = field(key);
      if (!element) continue;
      if (element instanceof HTMLInputElement && element.type === 'checkbox') element.checked = Boolean(value);
      else if (Array.isArray(value)) element.value = value.join('\n');
      else element.value = String(value);
    }
  }

  function render(): void {
    const config = readConfig();
    const stamp = buildPlaygroundStamp(config);
    const stampOutput = output('stamp');
    const badgeOutput = output('badge');
    const yamlOutput = output('yaml');
    const jsonOutput = output('json');
    const snippetOutput = output('snippet');
    if (stampOutput) stampOutput.textContent = stamp;
    if (badgeOutput) badgeOutput.textContent = stamp;
    if (yamlOutput) yamlOutput.textContent = buildPlaygroundYaml(config);
    if (jsonOutput) jsonOutput.textContent = buildPlaygroundJson(config);
    if (snippetOutput) snippetOutput.textContent = buildPlaygroundSnippet(config);
    localStorage.setItem(storageKey, JSON.stringify(config));
  }

  root.querySelectorAll<FieldElement>('input, select, textarea').forEach((element) => element.addEventListener('input', render));
  field('preset')?.addEventListener('change', (event) => {
    const preset = (event.target as HTMLSelectElement).value as PlaygroundPreset;
    writeConfig(applyPlaygroundPreset(preset, readConfig()));
    render();
  });
  action('regenerate')?.addEventListener('click', () => {
    setList('words', shuffle(defaults.words).slice(0, regeneratedTokenCount));
    setList('emojis', shuffle(defaults.emojis).slice(0, regeneratedTokenCount));
    render();
  });
  action('copy-stamp')?.addEventListener('click', () => copy(output('stamp')?.textContent));
  action('copy-yaml')?.addEventListener('click', () => copy(output('yaml')?.textContent));
  action('copy-json')?.addEventListener('click', () => copy(output('json')?.textContent));
  action('copy-snippet')?.addEventListener('click', () => copy(output('snippet')?.textContent));
  action('download-yaml')?.addEventListener('click', () => {
    const blob = new Blob([output('yaml')?.textContent ?? ''], { type: 'text/yaml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'estamper.config.yml';
    link.click();
    URL.revokeObjectURL(link.href);
  });

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null') as PlaygroundConfig | null;
    if (saved) writeConfig(saved);
  } catch {
    localStorage.removeItem(storageKey);
  }
  render();
}
