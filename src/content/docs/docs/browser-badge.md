---
title: Browser Badge
description: Mount a visible Estamper badge in the browser.
---

```js
import { mountEstamper } from 'estamper/browser';

mountEstamper({
  stamp,
  details,
  position: 'bottom-right',
  theme: 'auto',
});
```

The badge renders text safely, supports copy-on-click, and can expose a details panel for QA workflows.

## DOM

The browser entry mounts a fixed badge element into `document.body`. The visible text is set with safe text content, not HTML.

## CSS classes

Use badge classes to customize placement, theme, and typography while keeping the stamp visible in screenshots:

- `.estamper-badge`
- `.estamper-badge--bottom-right`
- `.estamper-badge--bottom-left`
- `.estamper-badge--top-right`
- `.estamper-badge--top-left`

## API

```js
mountEstamper({
  stamp,
  details,
  position: 'bottom-right',
  theme: 'auto',
});
```
