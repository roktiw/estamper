---
title: GitHub Actions
description: Ready-to-copy GitHub Actions templates.
---

## Generate stamp

```yaml
- run: npx estamper generate --out public/estamper.json
```

## Build with stamp

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npm ci
- run: npx estamper generate --out public/estamper.json
- run: npm run build
```

## Deploy targets

Use the generated file before deploying to GitHub Pages, Vercel, Netlify, or Firebase so the hosted app displays the same build identity that CI produced.
