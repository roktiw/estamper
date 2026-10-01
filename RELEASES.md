# Releases

## 0.3.0 — 2026-10-01

- Candidate: protected diagnostics, settings YAML/JSON, four independent min/mid/max policies and DevSecOps hardening.
- Source: branch `codex/public-security-settings`; commit, public tag and release URL pending publication.
- Local verification: 47 tests, TypeScript, ESM/CJS, Astro artifact guard, zero dependency advisories and 3 headed Chromium scenarios PASS.
- Distribution: public GitHub Release tarball planned. npm publication has not occurred (no registry authentication).
- Website: no manual deployment; automatic provider integrations may react to merges and must be verified separately. Splitolo production is outside this release.
- Breaking defaults: password encryption, no raw production JSON, Node >=22.12. Existing explicit public widgets must select min access. Backend/max mode requires a host-provided authenticated service.

- Additional evidence: 97-file package allowlist and clean-directory ESM/CJS install PASS. Public GitHub CI run 36840926048 could not start due to account billing lock (zero steps), not a test failure. Private CI startup_failure and Netlify preview failure are separate from the successful local checks.
