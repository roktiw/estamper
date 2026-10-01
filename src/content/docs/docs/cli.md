---
title: CLI
description: Estamper command-line reference.
---

```bash
estamper --help
estamper init
estamper validate-config --config estamper.config.yml
estamper generate --config estamper.config.yml --js public/estamper.js
estamper generate --js public/estamper.js
estamper print
```

The CLI reads `GITHUB_SHA`, `GITHUB_ACTOR`, and `GITHUB_REF_NAME` in GitHub Actions. Outside CI it falls back to local git and safe `unknown` values when git is unavailable.

Version 0.3.0: supply `ESTAMPER_PASSWORD` (a strong unique passphrase of at least 16 characters) through your build secret store. Never put it in config or `VITE_*` variables. See [security settings](/settings/) for min/mid/max controls.
