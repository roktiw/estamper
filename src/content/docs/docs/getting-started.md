---
title: Getting Started
description: Install Estamper and show your first deploy stamp.
---

## Requirements

- Node.js 18+
- Git repository recommended

## Installation

```bash
npm install -D estamper
```

## Init config

```bash
npx estamper init
```

Creates `estamper.config.yml` in your project root.

## Quick Start

```bash
npx estamper generate --out public/estamper.json
```

## Add to your app

```js
import { mountEstamper } from 'estamper/browser';
import stamp from './estamper.json' assert { type: 'json' };

mountEstamper({ stamp: stamp.stamp, position: 'bottom-right' });
```
