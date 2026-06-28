import { mountStampog } from '../../../dist/browser/index.js';

mountStampog({
  stamp: window.__STAMPOG__?.stamp ?? 'local-stampog-demo',
});
