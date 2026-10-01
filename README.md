# Estamper

Human-readable build stamps with protected diagnostics. Version **0.3.0** changes the default from public metadata to password-encrypted details.

## Start

Requires Node 22.12 or later. The public distribution is the GitHub Release tarball; npm registry publication is not available yet.

```sh
npm install -D https://github.com/roktiw/estamper/releases/download/v0.3.0/estamper-0.3.0.tgz
npx estamper init
# Supply ESTAMPER_PASSWORD from your local/CI secret store (16–1024 characters).
npx estamper generate --js public/estamper.js
```

```js
import { mountEstamper } from 'estamper/browser';
import payload from './estamper.js';
mountEstamper({ stamp: payload.stamp, payload });
```

The chip shows an opaque build identity. Clicking it requests the password; the report is decrypted only after success. Close/Escape discards the rendered report and locks it again. No password, key or unlocked report is stored in localStorage/sessionStorage. A missing password fails the build; a missing report remains locked.

## Settings panel and YAML / JSON

Run `npm ci && npm run site:dev`, then open `/settings/`. The panel has independent min/mid/max controls, presets, a complete configuration editor, validated file import and YAML/JSON downloads. It runs locally in the browser and never uploads your configuration. The playground also exports the same configuration schema. No secrets are accepted in config.

```yaml
security:
  access: mid
  disclosure: mid
  exports: mid
  release: mid
```

| Control | min | mid (default) | max |
| --- | --- | --- | --- |
| Access | Explicit public details | Password-encrypted report | Authenticated backend; no bundled report |
| Disclosure | Full report | Remove actor/branch, replace original stamp | Build identity only |
| Exports | TXT + JSON after unlock | TXT after unlock | No export controls |
| Release | Local experimentation | Require Git commit | Require Git commit and clean working tree |

Min is for deliberate public demos / YOLO experimentation. Max is a building block for an enterprise integration, not a Zero Trust certification. Export controls do not prevent an authorized reader from copying data. Disclosure policy is applied before encryption, so redacted fields never enter the artifact.

## Production boundary

No automatic `estamper.json` output in production builds. CLI `json`, `html` and `generate --out` are removed. Vite defaults `emitAsset` to false, rejects legacy JSON output during builds, and checks public directories for stale metadata/config. It injects an external script compatible with a same-origin script CSP. Integrators must also run `node scripts/check-public-artifact.mjs <output>` in this repository (or their equivalent final artifact inspection). Arbitrary files manually copied under other names are outside this guard.

```js
import { estamperVite } from 'estamper/vite';
export default { plugins: [estamperVite({ inject: true, meta: true })] };
// Browser: mountEstamper({ stamp: window.__ESTAMPER__.stamp, payload: window.__ESTAMPER__ });
```

Password delivery uses AES-256-GCM with random salt/nonce and PBKDF2-HMAC-SHA256 (600,000 iterations). Anyone with the artifact can attempt offline password guessing: use a strong unique generated passphrase. Password rotation requires a new artifact; old ciphertext cannot be revoked. Do not use shared-password encryption for high-sensitivity secrets.

With `security.access: max`, the build publishes only an opaque identity. Configure your backend to authenticate and authorize every report request, apply the disclosure policy, rate limits, session expiry and `Cache-Control: no-store`. Do not embed report data in this callback:

```js
mountEstamper({
  stamp: payload.stamp,
  payload,
  loadAuthorizedReport: async () => {
    const response = await fetch('/internal/build-report', {
      credentials: 'same-origin', cache: 'no-store',
    });
    if (!response.ok) throw new Error('Denied');
    return response.json();
  },
});
```

The backend is supplied by the host application; this static library does not create an identity provider or enforce server permissions. A browser callback returning true is not authentication. A protected widget rejects plaintext `details`, `commitUrl`, `jsonUrl` and embedded reports. Plain `stamp` is always public; never pass sensitive fields there.

## APIs and compatibility

`generateStamp()` remains the low-level raw generator. `estamper/config` exports `loadConfig`, `parseConfig`, `normalizeConfig`, `validateConfig` and policy helpers. JSON and YAML share validation (128 KiB cap, no aliases, bounded nesting, prototype-key rejection). Existing formatting/token options remain; legacy public widgets need explicit `security: { access: 'min' }`. CJS consumers remain supported for core, config and browser entry points. Vite/CLI are ESM.

`openEstamperDetails()` uses exactly the same protected flow as chip clicks. `closeEstamperDetails()` locks it. Clipboard failure is reported, links are not constructed from untrusted report fields, and all displayed values use text nodes.

## Development and release

```sh
npm ci
npm run security:check
npm run build
npm run site:build
npm run test:e2e -- --headed
npm pack
```

CI uses read-only permissions, pinned action SHAs, dependency audit, tests, artifact inspection and browser acceptance. Pages deployment permissions exist only on its deployment job. See [SECURITY.md](SECURITY.md), [RELEASES.md](RELEASES.md), and [CHANGELOG.md](CHANGELOG.md). A GitHub Release is separate from npm publication and website deployment.

MIT © Wiktor Świątkowski
