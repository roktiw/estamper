export async function GET() {
  return new Response(`# Estamper

Estamper is a tiny visible build stamp generator for web apps and games.

## Key pages

- /docs/getting-started
- /docs/config
- /docs/yaml-contracts
- /docs/stamp-format
- /docs/github-actions
- /playground

## Example stamp

stg-az-🏷️-✅-silver-river-2026-06-28-14:02-roktiw@a1b2c3d
`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
