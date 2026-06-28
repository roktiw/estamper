# estamper

estamper is a tiny ESM-first package for human-friendly build/version stamps in web apps and games.

Example stamp:

```text
🍉-🛠️-silver-river-2026-06-28-04:12:09-roktiw@a1b2c3d
```

ASCII fallback:

```text
WM-TL-silver-river-2026-06-28-04:12:09-roktiw@a1b2c3d
```

It answers: “Which exact build am I looking at?” without DevTools or guessing commit IDs.

## Quick start

```bash
npm install -D estamper
npx estamper init
npx estamper generate --out public/estamper.json
```

## Website

The documentation site is an Astro app with a custom landing page at `/`, Starlight docs under `/docs`, an interactive playground at `/playground`, examples at `/examples`, changelog at `/changelog`, and LLM-first text files at `/llms.txt` and `/llms-full.txt`.

```bash
npm ci
npm run site:dev
npm run check
npm test
npm run site:build
```

The site dogfoods Estamper with `estamper.config.yml` and `public/estamper.json`; deploy workflows regenerate that file before building.

```js
import { mountEstamper } from 'estamper/browser';
import stamp from './estamper.json' assert { type: 'json' };

mountEstamper({ stamp: stamp.stamp, position: 'bottom-right' });
```

## Core API

```js
import { generateStamp } from 'estamper';

const result = generateStamp({
  mode: 'emoji',
  words: ['silver', 'river', 'melon', 'orbit'],
  emojis: ['🍉', '🛠️', '🚀', '🐶'],
  ascii: ['WM', 'TL', 'RX', 'DG'],
  user: 'roktiw',
  commit: 'a1b2c3d',
  date: new Date(),
  seed: 'repeatable-build',
});
```

`seed` makes token selection deterministic; omit it for random stamps.
Use `mode: 'auto'` with `emojiSupported: false` to produce the ASCII fallback with the same format placeholders.

## CLI

```bash
estamper --help
estamper init
estamper validate-config --config estamper.config.yml
estamper generate --config estamper.config.yml --out public/estamper.json
estamper generate --out public/estamper.json --js public/estamper.js --html public/estamper.html
estamper print
estamper json
estamper html --out public/estamper.html
```

The CLI reads `GITHUB_SHA`, `GITHUB_ACTOR`, and `GITHUB_REF_NAME` in GitHub Actions. Outside CI it falls back to local `git` and `git config user.name`; if git is unavailable, safe `unknown` values are used.

## Config

The default config lives in `estamper.config.yml`. YAML and JSON config files are supported.

Important fields:

- `mode`: `emoji`, `ascii`, or `auto`
- `format`: token template, e.g. `{emoji1}-{emoji2}-{word1}-{word2}-{date}-{user}@{commit}`
- `words.allow`, `emojis.allow`, `ascii.allow`: dictionaries used by the generator
- `git.commitLength`: short commit length
- `badge.position`: `top-left`, `top-right`, `bottom-left`, `bottom-right`
- `output`: default output paths

Config is validated with clear errors and capped token lists to avoid oversized output.

## Browser badge

```js
import { mountEstamper } from 'estamper/browser';

mountEstamper({
  stamp: '🍉-🛠️-silver-river-2026-06-28-04:12:09-roktiw@a1b2c3d',
  position: 'bottom-right',
  theme: 'dark',
});
```

The widget has no framework dependency, renders with `textContent` instead of unsafe HTML injection, supports copy-on-click, and includes a small details panel.
Pass `target: '#selector'` with `position: 'custom'` to mount the badge inside a specific element instead of a fixed viewport corner.

## Vite

```js
import { defineConfig } from 'vite';
import { estamperVitePlugin } from 'estamper/vite';

export default defineConfig({
  plugins: [
    estamperVitePlugin({
      config: './estamper.config.yml',
      inject: true,
      globalName: '__estamper__',
      meta: true,
    }),
  ],
});
```

## GitHub Actions

Copy a template from `.github/workflow-templates/`, or add:

```yaml
- run: npx estamper generate --out public/estamper.json
```

## Examples

- `examples/basic-html` — plain HTML badge
- `examples/vite` — Vite plugin setup
- `examples/panel` — static config panel that previews and exports YAML/JSON

## Security notes

estamper does not execute code from config, does not send data externally, limits config sizes and stamp length, and avoids unsafe DOM rendering for user-controlled strings.

## Relation to Debugog

estamper can be passed into tools such as Debugog:

```js
new Debugog({ build: estamper.stamp });
```
