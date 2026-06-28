---
title: YAML Contracts
description: Complete Estamper YAML contract for stamps, mappings, badges, and outputs.
---

Estamper config is intentionally explicit so CI, local builds, screenshots, and docs all describe the same build identity.

```yaml
schemaVersion: 1
name: estamper-www
mode: auto
preset: standard
format: "{env}-{cloud}-{token1}-{token2}-{word1}-{word2}-{date}-{time}-{user}@{commit}"
seed: auto

env:
  enabled: true
  value: auto
  fallback: dev

cloud:
  enabled: true
  provider: auto
  fallback: ghp

tokens:
  enabled: true
  count: 2
  mode: auto
  asciiLength: 2
  emoji:
    allow: [🏷️, ✅, 🛠️, 🚀, 🧪]
  ascii:
    allow: [ST, OK, TL, RX, QA]
  mappings:
    - emoji: 🏷️
      ascii2: ST
      ascii3: TAG
      name: tag
    - emoji: ✅
      ascii2: OK
      ascii3: CHK
      name: check

words:
  enabled: true
  count: 2
  case: lower
  output: full
  allow: [stamp, seal, mark, badge, build, deploy, release, silver, river, pixel, orbit]
  aliases:
    - word: silver
      code2: SV
      code3: SLV
    - word: river
      code2: RV
      code3: RVR

date:
  enabled: true
  format: yyyy-mm-dd
  timezone: utc

time:
  enabled: true
  format: hh:mm
  timezone: utc

user:
  enabled: true
  source: auto
  fallback: github-actions

commit:
  enabled: true
  length: 7
  prefix: "@"
  includeDirty: true
  dirtyMarker: "~"

branch:
  enabled: false

buildNumber:
  enabled: false

badge:
  enabled: true
  position: bottom-right
  theme: auto
  copyOnClick: true
  showDetailsOnClick: true

output:
  json: public/estamper.json
  js: public/estamper.js
  htmlSnippet: public/estamper.html

validation:
  maxStampLength: 160
  requireEnv: true
  requireCommit: true
```

## Contract notes

- `mode` chooses `emoji`, `ascii`, or `auto` fallback behavior.
- `preset` may be `standard`, `minimal`, `verbose`, `games`, `ci`, `ascii`, or `custom`.
- `tokens.mappings` defines emoji to ASCII fallbacks for restricted terminals.
- `words.aliases` defines `code2` and `code3` forms for compact stamps.
- `output.json` is the canonical file for browser badges and dogfooding.
