# Stampog

Stampog is a tiny ESM-first package for human-friendly build/version stamps in web apps and games.

Example stamp:

```text
stg-az-🍉-🛠️-silver-river-2026-06-28-04:12-roktiw@a1b2c3d
```

ASCII fallback:

```text
STG-AZ-WM-TL-silver-river-2026-06-28-04:12-roktiw@a1b2c3d
```

It answers: “Which exact build am I looking at?” without DevTools or guessing commit IDs.

## Quick start

```bash
npm install -D stampog
npx stampog init
npx stampog generate --out public/stampog.json
```

```js
import { mountStampog } from 'stampog/browser';
import stamp from './stampog.json' assert { type: 'json' };

mountStampog({ stamp: stamp.stamp, position: 'bottom-right' });
```

## Core API

```js
import { generateStamp } from 'stampog';

const result = generateStamp({
  mode: 'emoji',
  env: 'stg',
  cloud: 'az',
  words: ['silver', 'river', 'melon', 'orbit'],
  emojis: ['🍉', '🛠️', '🚀', '🐶'],
  ascii: ['WM', 'TL', 'RX', 'DG'],
  user: 'roktiw',
  commit: 'a1b2c3d',
  date: new Date(),
  seed: 'repeatable-build',
});
```

Default stamps follow:

```text
[env]-[cloud]-[token1]-[token2]-[word1]-[word2]-[yyyy-mm-dd]-[hh:mm]-[user]@[commit]
```

`seed` makes token selection deterministic; without it, token selection is derived from the commit.

## CLI

```bash
stampog --help
stampog init
stampog validate-config --config stampog.config.yml
stampog generate --config stampog.config.yml --out public/stampog.json
stampog generate --out public/stampog.json --js public/stampog.js --html public/stampog.html
stampog print
stampog json
stampog html --out public/stampog.html
```

The CLI reads `GITHUB_SHA`, `GITHUB_ACTOR`, and `GITHUB_REF_NAME` in GitHub Actions. Outside CI it falls back to local `git` and `git config user.name`; if git is unavailable, safe `unknown` values are used.

## Config

The default config lives in `stampog.config.yml`. YAML and JSON config files are supported.

Important fields:

- `mode`: `emoji`, `ascii`, or `auto`
- `env`: explicit token or auto-detection from `VITE_ENV`, `NODE_ENV`, or `DEPLOY_ENV`
- `cloud`: explicit provider or auto-detection from deployment environment variables such as `VERCEL`, `NETLIFY`, `AWS_REGION`, or `AZURE_CLIENT_ID`
- `format`: token template, e.g. `{env}-{cloud}-{token1}-{token2}-{word1}-{word2}-{date}-{time}-{user}@{commit}`
- `tokens.count`, `words.count`: 1–4 generated token/word segments
- `date.format`: `yyyy-mm-dd`, `yy-mm-dd`, `mmdd`, `yyyymmdd`, or `iso-date`
- `time.format`: `hh:mm`, `hh:mm:ss`, `hhmm`, `hhmmss`, or `unix`
- `words.allow`, `emojis.allow`, `ascii.allow`: dictionaries used by the generator
- `git.commitLength`: short commit length
- `git.includeBranch`: opt-in branch suffix support; disabled by default
- `git.includeDirty`: adds `~` to dirty local commits
- `badge.position`: `top-left`, `top-right`, `bottom-left`, `bottom-right`
- `output`: default output paths

Config is validated with clear errors and capped token lists to avoid oversized output.

## Browser badge

```js
import { mountStampog } from 'stampog/browser';

mountStampog({
  stamp: 'stg-az-🍉-🛠️-silver-river-2026-06-28-04:12-roktiw@a1b2c3d',
  position: 'bottom-right',
  theme: 'dark',
});
```

The widget has no framework dependency, renders with `textContent` instead of unsafe HTML injection, supports copy-on-click, and includes a small details panel.

## Vite

```js
import { defineConfig } from 'vite';
import { stampogVitePlugin } from 'stampog/vite';

export default defineConfig({
  plugins: [
    stampogVitePlugin({
      config: './stampog.config.yml',
      inject: true,
      globalName: '__STAMPOG__',
      meta: true,
    }),
  ],
});
```

## GitHub Actions

Copy a template from `.github/workflow-templates/`, or add:

```yaml
- run: npx stampog generate --out public/stampog.json
```

## Examples

- `examples/basic-html` — plain HTML badge
- `examples/vite` — Vite plugin setup
- `examples/panel` — static config panel that previews and exports YAML/JSON

## Security notes

Stampog does not execute code from config, does not send data externally, limits config sizes and stamp length, and avoids unsafe DOM rendering for user-controlled strings.

## Relation to Debugog

Stampog can be passed into tools such as Debugog:

```js
new Debugog({ build: stampog.stamp });
```
