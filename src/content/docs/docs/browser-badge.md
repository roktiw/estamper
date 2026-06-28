---
title: Browser Badge
description: Mount a visible Estamper badge in the browser.
---

```js
import { mountEstamper } from 'estamper/browser';

mountEstamper({
  stamp: '🍉-🛠️-silver-river-2026-06-28-14:02-roktiw@a1b2c3d',
  position: 'bottom-right',
  theme: 'dark',
});
```

The badge renders text safely, supports copy-on-click, and can expose a details panel for QA workflows.

## CSS classes

Use badge classes to customize placement, theme, and typography while keeping the stamp visible in screenshots.
