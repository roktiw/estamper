---
title: Configuration
description: Full YAML configuration reference for Estamper.
---

Estamper reads YAML or JSON config and validates token list sizes before generation.

```yaml
name: estamper
mode: emoji
format: "{emoji1}-{emoji2}-{word1}-{word2}-{date}-{user}@{commit}"
words:
  allow: [silver, river, melon, orbit]
emojis:
  allow: [🍉, 🛠️, 🚀, 🧪]
ascii:
  allow: [WM, TL, RX, CI]
git:
  commitLength: 7
  includeBranch: true
  includeDirty: true
badge:
  enabled: true
  position: bottom-right
  copyOnClick: true
output:
  js: public/estamper.js
  js: public/estamper.js
  htmlSnippet: public/estamper.html
```

## All options

| Option | Purpose |
| --- | --- |
| `mode` | `emoji`, `ascii`, or `auto` fallback behavior. |
| `format` | Token template used to format the final stamp. |
| `words.allow` | Human-readable words used in pairs. |
| `emojis.allow` | Emoji allowlist used in emoji mode. |
| `ascii.allow` | ASCII tokens used when emoji is not desired. |
| `git.*` | Commit, branch, dirty-state, and user settings. |
| `badge.*` | Browser badge visibility, theme, placement, and copy behavior. |
| `output.*` | JSON, JS, and HTML output paths. |
