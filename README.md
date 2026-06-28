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

```js
import { mountestamper } from 'estamper/browser';
import stamp from './estamper.json' assert { type: 'json' };

mountestamper({ stamp: stamp.stamp, position: 'bottom-right' });
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
- `preset`: `minimal`, `standard`, `verbose`, `games`, `ci`, `ascii`, or `custom`
- `format`: token template, e.g. `{env}-{cloud}-{token1}-{token2}-{word1}-{word2}-{date}-{time}-{user}@{commit}`
- `tokens.emoji.allow`, `tokens.ascii.allow`, `tokens.mappings`: emoji/ASCII dictionaries and emoji-to-ASCII mappings
- `tokens.asciiLength`: `2` or `3` for mapped ASCII replacements
- `words.allow`, `words.deny`, `words.aliases`, `words.case`: word dictionaries and `code2`/`code3` compact output
- `env` and `cloud`: auto-detected deployment tokens with configurable maps/fallbacks
- `date`, `time`, `user`, `commit`, `branch`, `buildNumber`: build metadata segments
- `badge`: render position/theme/click behavior
- `output`: JSON, ESM, HTML snippet, optional CSS, and meta output targets
- `validation`: max stamp length and strictness settings

Config is validated with clear errors and capped token lists to avoid oversized output.
The default config file is `estamper.config.yml`; `stampog.config.yml` remains readable for older projects.

Supported placeholders are `{env}`, `{cloud}`, `{token1}`–`{token4}`, `{word1}`–`{word4}`, `{date}`, `{time}`, `{user}`, `{commit}`, `{branch}`, `{buildNumber}`, and `{dirty}`. Literal `@`, `#`, and `~` are supported in formats.

Preset formats:

- `minimal`: env, two words, date, user, commit
- `standard`: env, cloud, two tokens, two words, date/time, user, commit
- `verbose`: standard plus dirty, branch, and build number segments
- `games`: two tokens, two words, compact time, user, commit
- `ci`: env, cloud, tokens, date/time, user, commit, build number
- `ascii`: standard layout intended for ASCII mode
- `custom`: use the provided `format` unchanged

## Browser badge

```js
import { mountestamper } from 'estamper/browser';

mountestamper({
  stamp: '🍉-🛠️-silver-river-2026-06-28-04:12:09-roktiw@a1b2c3d',
  position: 'bottom-right',
  theme: 'dark',
});
```

The widget has no framework dependency, renders with `textContent` instead of unsafe HTML injection, supports copy-on-click, and includes a small details panel.

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
