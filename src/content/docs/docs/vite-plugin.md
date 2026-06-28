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

The plugin can write JSON output and expose a global value for app code or badges.
