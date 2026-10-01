export { defaultConfig } from './defaultConfig.js';
export type { EstamperConfig } from './defaultConfig.js';
export { loadConfig } from './loadConfig.js';
export { resolveStampOptions } from './resolveStampOptions.js';
export { validateConfig } from './schema.js';

export { resolveSecurity, defaultSecurity } from '../security/policy.js';
export type { SecurityPolicy, SecurityLevel } from '../security/policy.js';
export { parseConfig, normalizeConfig } from './parseConfig.js';
