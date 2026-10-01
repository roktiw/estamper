# Releases

## 0.3.0 — 2026-10-01

- Candidate: protected diagnostics, settings YAML/JSON, four independent min/mid/max policies and DevSecOps hardening.
- Source: public PR #1 merged as `45bf010bacebdf4e463c702d29a4e3fe17b37900`; tag `v0.3.0`. The merge tree matches tested packaging source `9fa97144eef0f56affb4692118713ac2a968d0bf`.
- Local verification: 47 tests, TypeScript, ESM/CJS, Astro artifact guard, zero dependency advisories and 3 headed Chromium scenarios PASS.
- Distribution: [public GitHub Release](https://github.com/roktiw/estamper/releases/tag/v0.3.0) published 2026-10-01 09:12:49 UTC. Tarball 42,386 bytes / 97 files, SHA-256 `fa01827548d4c37c96ac7a79610c15b667a0e229a81425f9e612733dabd610c1`. Anonymous HTTP download and uploaded checksum file PASS. npm publication has not occurred (no registry authentication).
- Website: no manual deployment; automatic provider integrations may react to merges and must be verified separately. Splitolo production is outside this release.
- Breaking defaults: password encryption, no raw production JSON, Node >=22.12. Existing explicit public widgets must select min access. Backend/max mode requires a host-provided authenticated service.

- Additional evidence: 97-file package allowlist and clean-directory ESM/CJS install PASS. Public GitHub CI run 36840926048 could not start due to account billing lock (zero steps), not a test failure. Private CI startup_failure and Netlify preview failure are separate from the successful local checks.

- Machine-readable record: [releases/0.3.0.json](releases/0.3.0.json). Package and release tag remain unchanged; this record does not rebuild or redeploy them.
