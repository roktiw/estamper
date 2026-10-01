---
title: Getting Started
description: Install Estamper and show your first deploy stamp.
---

## Requirements

- Node.js 22.12+
- Git repository recommended

## Installation

```bash
npm install -D https://github.com/roktiw/estamper/releases/download/v0.3.0/estamper-0.3.0.tgz
```

## Init config

```bash
npx estamper init
```

Creates `estamper.config.yml` in your project root.

## Quick Start

```bash
npx estamper generate --js public/estamper.js
```

## Add to your app

```js
import { mountEstamper } from 'estamper/browser';
import payload from './estamper.js';

mountEstamper({ stamp: payload.stamp, payload, position: 'bottom-right' });
```

Version 0.3.0: supply `ESTAMPER_PASSWORD` (a strong unique passphrase of at least 16 characters) through your build secret store. Never put it in config or `VITE_*` variables. See [security settings](/settings/) for min/mid/max controls.
