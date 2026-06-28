---
title: Stamp Format
description: Segment specification for Estamper stamps.
---

A full stamp is optimized for screenshots:

```text
[env]-[cloud]-[token1]-[token2]-[word1]-[word2]-[date]-[time]-[user]@[commit]
```

Example:

```text
stg-az-🏷️-✅-silver-river-2026-06-28-14:02-roktiw@a1b2c3d
```

| Segment | Example | Required |
|---|---|---|
| env | `stg` | yes |
| cloud | `az` | optional |
| token1 | `🏷️` | optional |
| token2 | `✅` | optional |
| word1 | `silver` | optional |
| word2 | `river` | optional |
| date | `2026-06-28` | yes |
| time | `14:02` | optional |
| user | `roktiw` | yes |
| commit | `a1b2c3d` | yes |

Optional branch, build number, and dirty marker segments can be appended when enabled.
