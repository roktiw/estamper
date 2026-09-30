import { mountEstamper } from '../../../dist/browser/index.js';

mountEstamper({
  stamp: window.__ESTAMPER__?.stamp ?? 'local-estamper-demo',
});
