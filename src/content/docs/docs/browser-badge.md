---
title: Browser Badge
description: Password-protected build diagnostics.
---

```js
import { mountEstamper } from 'estamper/browser';
import payload from './estamper.js';
mountEstamper({ stamp: payload.stamp, payload, position: 'bottom-right' });
```

Click the chip, enter the password, then read or export the report. Close or Escape locks it again. Programmatic opening follows the same authentication flow. Plaintext details are rejected with protected access; passing a password or a password hash to the browser is not supported.

Default exports include TXT. Set `security.exports: min` for an unlocked JSON download, or `max` to hide export controls. Rendering always uses text nodes. This does not prevent an authorized reader from copying text.

For backend access set `security.access: max` and provide `loadAuthorizedReport`, an asynchronous function that fetches a report from your authenticated server on every open. The server must enforce authorization and disclosure. Missing configuration fails closed. See the package README and SECURITY.md for the full contract.
