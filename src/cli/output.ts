import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { StampResult } from '../core/types.js';

export async function writeJson(path: string, stamp: StampResult): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(stamp, null, 2)}\n`, 'utf8');
}

export async function writeJs(path: string, stamp: StampResult): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `export const estamper = ${JSON.stringify(stamp, null, 2)};\nexport default estamper;\n`, 'utf8');
}

export async function writeHtml(path: string, stamp: StampResult): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const html = `<script type="module">
  import { mountStampog } from './stampog-browser.js';

  mountStampog({
    stamp: ${JSON.stringify(stamp.stamp)}
  });
</script>
`;
  await writeFile(path, html, 'utf8');
}
