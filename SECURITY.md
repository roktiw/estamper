# Security model

Do not submit credentials or production reports in issues. For nonpublic vulnerability reports use GitHub's private vulnerability reporting when enabled, or contact the maintainer privately.

## Threat boundary

- Default mid access encrypts the report before shipping. AES-GCM authenticates the chip identity, policy and report. PBKDF2 cost is fixed to avoid accepting attacker-controlled work factors. Passwords must be 16–1024 characters; use a generated unique passphrase from a secret manager.
- Ciphertext permits offline guessing and cannot revoke prior downloads. Shared-password encryption does not provide individual identities, MFA, rate limiting or revocation. XSS or a malicious extension can read an unlocked report. No secrets should be included in build metadata at any level.
- Max access sends no report/ciphertext to static hosting. The host's authenticated backend must enforce per-request authorization, minimize fields, log access appropriately and use no-store. The library fetches again after every close/open and ignores stale responses. It does not claim to implement an enterprise identity system.
- Min access is explicitly public. All levels block automatic production JSON files. Downloading a JSON settings file from the editor is unrelated to publishing build diagnostics.
- Export levels control UI affordances, not DRM. There is no persistent unlock state. Reports are discarded on close; JavaScript memory cannot guarantee physical erasure.
- Config input never runs code. YAML aliases, dangerous object keys, secret-bearing keys and oversized/deep documents are rejected. Explicit missing config paths fail closed. Unknown security keys/levels fail closed.
- Production artifact guard detects named metadata/config, env files, source maps, embedded build password and PEM private keys. It is not a general-purpose DLP scanner and does not inspect data fetched by other application code.

## Development operations

Use a frozen lockfile (`npm ci`), run the full audit and security tests, and inspect the actual packed files. Deploy the tested artifact without rebuilding. Keep CI untrusted pull requests secretless. Workflow templates with encrypted build generation need an explicitly configured build secret; PR runs without it fail closed.

OWASP recommends PBKDF2-HMAC-SHA256 with at least 600,000 iterations: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html . Web Crypto primitives follow https://nodejs.org/api/webcrypto.html . This design has local automated tests, not an independent cryptographic audit or compliance certification.
