---
title: GitHub Actions
description: Ready-to-copy GitHub Actions templates.
---

## Generate only

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

## Deploy GitHub Pages

```yaml
- uses: actions/configure-pages@v5
- run: npx estamper generate --config estamper.config.yml --out public/estamper.json
- run: npm run site:build
- uses: actions/upload-pages-artifact@v3
  with:
    path: site-dist
- uses: actions/deploy-pages@v4
```

## Vercel

```yaml
- run: npx estamper generate --out public/estamper.json
- run: npx vercel deploy --prod --token "$VERCEL_TOKEN"
```

## Netlify

```yaml
- run: npx estamper generate --out public/estamper.json
- run: npx netlify deploy --prod --dir=dist
```

## Firebase

```yaml
- run: npx estamper generate --out public/estamper.json
- run: npx firebase deploy --only hosting
```

## Azure Static Web Apps

```yaml
- run: npx estamper generate --out public/estamper.json
- uses: Azure/static-web-apps-deploy@v1
```

## Deploy targets

Use the generated file before deploying to GitHub Pages, Vercel, Netlify, or Firebase so the hosted app displays the same build identity that CI produced.
