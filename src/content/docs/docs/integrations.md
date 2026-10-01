---
title: Integrations
description: Ways to use Estamper with app frameworks, deploy providers, and CI.
---

Estamper works anywhere that can read a generated JSON file or render a string.

## Web apps

- Astro, Vite, React, Vue, Svelte, SvelteKit, Next.js, and plain HTML can mount the browser badge from `estamper/browser`.
- Server-rendered apps can read `public/estamper.js` and print the stamp in a footer, debug panel, or response header.

## Deploy providers

Generate `public/estamper.js` before the build step on GitHub Pages, Vercel, Netlify, Firebase Hosting, Azure Static Web Apps, AWS, GCP, or Fly.io.

## Games and QA builds

Canvas/WebGL games can place the stamp in a corner overlay. QA can copy it from screenshots or bug reports and map it back to the exact commit, actor, and build time.
