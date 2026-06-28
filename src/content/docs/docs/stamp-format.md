---
title: Stamp Format
description: Segment specification for Estamper stamps.
---

A full stamp is optimized for screenshots:

```text
stg-az-🍉-🛠️-silver-river-2026-06-28-14:02-roktiw@a1b2c3d
```

| Segment | Example | Notes |
| --- | --- | --- |
| ENV label | `stg` | Environment such as `dev`, `stg`, `prd`, or `ci`. |
| Cloud provider | `az` | Azure, AWS, GCP, Vercel, Netlify, Fly.io, or GitHub Actions. |
| Emoji tokens | `🍉-🛠️` | Memorable visual tokens. |
| ASCII tokens | `WM-TL` | Fallback for terminals and restricted fonts. |
| Words | `silver-river` | Human words that are easy to read aloud. |
| Date & time | `2026-06-28-14:02` | Local or CI-provided build timestamp. |
| User / actor | `roktiw` | GitHub actor or git user fallback. |
| Commit | `a1b2c3d` | Short commit hash. |
| Optional segments | `main-build-42-dirty` | Branch, build number, and dirty state. |
