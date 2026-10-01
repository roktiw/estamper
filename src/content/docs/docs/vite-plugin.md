---
title: Vite Plugin
description: Inject Estamper data during Vite builds.
---

```js
import { defineConfig } from 'vite';
import { estamperVite } from 'estamper/vite';

export default defineConfig({
  plugins: [
    estamperVite({
      config: './estamper.config.yml',
      inject: true,
      globalName: '__estamper__',
    }),
  ],
});
```

The plugin emits an external protected JS payload, never raw JSON in a production build. Supply ESTAMPER_PASSWORD through the build secret store. Use the global as mountEstamper({ stamp: window.__estamper__.stamp, payload: window.__estamper__ }).
