# Local Mac mini GitHub Actions CI

Runner: `mac-mini-m4`, labels `[mac-mini-m4, macos-arm64]`, native macOS ARM64.
Workflow: `.github/workflows/mac-mini-ci.yml`. Runs on pushes to main/master or the trusted setup branch and via workflow_dispatch; no pull_request/fork trigger on this user-account host.

Scope: **TypeScript, unit tests, library/site builds, Chromium E2E**.

Commands:
```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run check
npm test
npm run build
npm run site:build
npx playwright install chromium
npm run test:e2e -- --headed
```

No deploy, publishing, host installer/apply, Apple Notes automation or signing is performed. Failures are preserved; jobs do not use continue-on-error. A source/data check is not a native application or hardware test. Initial run results belong to the actual GitHub job links, not this plan.

Each repository registration can run one job; GitLab concurrent=3 does not cap aggregate GitHub work. Initial rollout is dispatched in batches of at most three repositories.
