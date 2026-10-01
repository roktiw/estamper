import { rm } from 'node:fs/promises';
// Only generated compiler outputs; prevent removed source modules surviving npm pack.
for (const path of ['dist', 'dist-cjs']) await rm(new URL(`../${path}`, import.meta.url), { recursive: true, force: true });
