---
title: API Reference
description: JavaScript API exported by Estamper.
---

## `generateStamp(options)`

```js
import { generateStamp } from 'estamper';

const result = generateStamp({
  mode: 'emoji',
  user: 'roktiw',
  commit: 'a1b2c3d',
});
```

Returns `{ stamp, parts }`.

## `mountEstamper(options)`

```js
import { mountEstamper } from 'estamper/browser';
mountEstamper({ stamp: result.stamp });
```

## `loadConfig(path)`

```js
import { loadConfig } from 'estamper/config';
const config = await loadConfig('./estamper.config.yml');
```
