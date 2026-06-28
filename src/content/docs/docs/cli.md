---
title: CLI
description: Estamper command-line reference.
---

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

The CLI reads `GITHUB_SHA`, `GITHUB_ACTOR`, and `GITHUB_REF_NAME` in GitHub Actions. Outside CI it falls back to local git and safe `unknown` values when git is unavailable.
