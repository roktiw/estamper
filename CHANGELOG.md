# Changelog

## 2026-10-01 — 0.3.0 publicly released

- Public PR #1 merged as `45bf010bacebdf4e463c702d29a4e3fe17b37900`, tag `v0.3.0`. [GitHub Release](https://github.com/roktiw/estamper/releases/tag/v0.3.0) published at 09:12:49 UTC with package and SHA256SUMS.txt. Anonymous download matches SHA-256; source merge tree matches the tested packaging tree. Full identifiers in RELEASES.md and releases/0.3.0.json.
- Acceptance: 47 local tests, TypeScript, ESM/CJS, clean package install, compiled CLI encrypt/decrypt/raw-output rejection, artifact guard, zero dependency advisories and 3 headed browser scenarios PASS. Hosted CI did not run because the account is billing-locked; this remains separate from local PASS.
- npm is not published (registry authentication unavailable). No manual website or Splitolo deploy. The existing Vercel integration reports successful production deployment, but its URL redirects unauthenticated requests to login, so public panel acceptance is not claimed. Netlify preview failed; no provider setup was changed to bypass these conditions.
- This is a release-record update only; published package/tag are immutable. Shared-password offline guessing and the host-supplied backend/MFA/authorization requirements remain documented in SECURITY.md.


## 0.3.0 — 2026-10-01 — Protected diagnostics and public settings

- Add `/settings/` with independent min/mid/max controls for access, disclosure, exports and release checks, complete config editing, YAML/JSON import/export and a synthetic password demo. Playground exports the same validated schema.
- Default access now requires a build-time secret and AES-256-GCM encrypted report. PBKDF2-SHA256 uses 600,000 iterations; random salt/nonce and authenticated policy prevent silent tampering. Closing locks again; no persistent credentials. Max access ships no report and requires the host's authorized backend on every open. No claim of enterprise certification or server-side Auth implementation.
- Block production JSON output in CLI/Vite, remove tracked public diagnostics, check stale public assets and reject unsafe/oversized/aliased config. External Vite metadata script; clean compiler output prevents obsolete exporters entering the package. Update docs, workflows and provider header configuration.
- DevSecOps: pinned action SHAs, read-only build permissions, isolated deployment permissions, no checkout credential persistence, audit and headed E2E. Dependency audit changed from 10 findings (including one critical) to zero. Node minimum is 22.12.
- Local validation: 47 unit/integration tests including a real Vite build, TypeScript, clean ESM/CJS build, Astro build/artifact guard, dependency audit and 3 headed Chromium scenarios PASS. Browser checks cover wrong/correct password, download identity, Escape/focus/re-lock, invalid config, import/export and widths 320/402/1440. Mobile screenshot inspected. No physical device or independent security audit.
- Package validation: isolated installation of the 97-file tarball and ESM/CJS core/config/browser entrypoints PASS; obsolete raw exporter and public metadata absent. GitHub Actions did not execute tests: public CI annotation confirms an account billing lock; private CI reports startup_failure. Vercel preview succeeded; Netlify preview failed, and website acceptance is not claimed.
- Merge: pending; work on `codex/public-security-settings`. Public GitHub release preparation is separate from private repository history. Release identities and publication results will be recorded in RELEASES.md after verification.
- Deployment/npm: no manual website or Splitolo deployment in this package. npm login is unavailable and the registry currently returns 404 for this package; GitHub Release tarball is the publication target. Existing automatic website integrations are tracked separately.


All notable changes to this project will be documented in this file.

## 0.2.0 — 2026-09-30

### Source: integration findings from Splitolo (splitolo-firebase)

This release incorporates all lessons learned while integrating Estamper into
the Splitolo Firebase project. Ten concrete gaps were identified and addressed.

### Breaking changes

- **`inject` now sends full `StampResult`** (`{stamp, parts}`) into
  `window.__ESTAMPER__` instead of just `{stamp}`. Any code that typed the
  global as `{stamp: string}` must be updated to `StampResult`.

### New features

#### Browser (`estamper/browser`)

- **`openEstamperDetails(rootId?, doc?)`** — exported helper to programmatically
  open the details panel. Use from menu items, footer buttons, keyboard
  shortcuts, etc. without coupling to DOM internals.
- **`closeEstamperDetails(rootId?, doc?)`** — paired close helper.
- **ID-based deduplication** — `mountEstamper` now assigns `root.id` from the
  new `rootId` option (default `'estamper-root'`) and removes any existing
  element with the same id before mounting. Prevents duplicates on hot-reload
  or React re-renders.
- **Firebase platform label** — `Platform:` in the details panel now maps
  `cloud: 'fb'` → `'Firebase'`. Previously only `ghp`, `vcl`, `ntl`, `loc`
  were mapped.
- **CSS animation** — the details panel now fades in with a
  `@keyframes estamper-fade-in` animation (opacity + translateY) for a
  polished feel instead of an instant `display:none` toggle.

#### Vite plugin (`estamper/vite`)

- **Full `StampResult` injection** — `window.__ESTAMPER__` now contains
  `{stamp, parts}` so client-side widgets can display environment, cloud,
  commit, branch, user, date etc. without needing a separate `fetch`.
- **`generateBundle` asset emission** — the plugin now calls
  `this.emitFile({type:'asset', fileName:'estamper.json', ...})` in the
  `generateBundle` hook in addition to (or instead of) the legacy `writeFile`
  approach. This places `estamper.json` in the Rollup/Vite output directory and
  makes it appear in the build manifest. Controlled by the new `emitAsset`
  option (default `true`). The legacy `out` path still works when specified.
- **Eager `globalName` validation** — `assertGlobalName` now runs at
  `transformIndexHtml` time even before `buildStart` is called, so invalid
  global names are caught immediately in tests.

#### CJS dual output

- **`dist-cjs/`** — New CommonJS build via `tsconfig.cjs.json`, targeting
  `module: CommonJS`. Covers `core`, `git`, `config`, `browser`. The Vite
  plugin and CLI remain ESM-only.
- **`package.json` exports map** updated with `"require"` conditions pointing to
  `dist-cjs/`. `"types"` condition placed first per Node.js/bundler convention.
- **`"main"` field** set to `./dist-cjs/index.js` for legacy `require()` tools
  that don't read `exports`.
- **`dist-cjs/package.json`** (`{"type":"commonjs"}`) auto-generated by the
  build script so that Node treats the output as CJS even though the root
  package has `"type": "module"`.
- **`build:esm` and `build:cjs`** scripts added for targeted rebuilds.

### Tests

- `tests/browser.test.ts`: grew from 4 → 8 tests. New: Firebase label, dedup,
  `openEstamperDetails` / `closeEstamperDetails` control, graceful false return.
- All 34 tests pass (`vitest run`).

### Build

- `npm run build` now runs `tsc && tsc -p tsconfig.cjs.json` and writes the
  CJS package marker.
- `.gitignore` updated to exclude `dist-cjs/`.

### Keywords

Added `firebase` to `package.json` keywords.

---

## 0.1.0

### Features

- **Core Generator**: Generate human-friendly build stamps combining environment, cloud provider, emoji/ASCII tokens, dictionary words, timestamp, user, and commit hash.
- **Config & Contracts**: Declarative `estamper.config.yml` with schema validation, custom allow/deny lists, format templates, and token mappings.
- **CLI**: Comprehensive commands including `estamper init`, `generate`, `validate-config`, `print`, `json`, and `html`.
- **Browser Badge**: Zero-dependency browser component with copy-on-click, theme support, custom positioning, and build details overlay.
- **Vite Plugin**: Seamless Vite integration with HTML meta injection and build hook support.
- **CI / GitHub Actions**: Out-of-the-box GitHub Actions detection and reusable workflow templates.
- **Documentation & Playground**: Interactive Astro + Starlight documentation website with live playground and presets.
