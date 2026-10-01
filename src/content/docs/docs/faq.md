---
title: FAQ
description: Common Estamper questions.
---

## Is the stamp secret?

No. Treat stamps as public build metadata. Do not include tokens, credentials, or private customer data.

## Emoji or ASCII?

Use `mode: auto` when possible. Emoji stamps are memorable in screenshots; ASCII is useful in terminals, logs, and restricted fonts.

## Where should the generated file live?

For browser apps, write `public/estamper.js` during CI before the app build.

## Can I hide the badge in production?

Yes, but Estamper is designed to be visible in screenshots. Many teams keep a small copyable badge in production for support and incident triage.
