import { describe, it, expect } from 'vitest';
import { buildPublicStamp, checkRelease } from '../src/security/build.js';
import { unlockReport } from '../src/security/envelope.js';
import { defaultSecurity, resolveSecurity } from '../src/security/policy.js';
import { parseConfig } from '../src/config/parseConfig.js';
import { defaultConfig } from '../src/config/defaultConfig.js';
import { loadConfig } from '../src/config/loadConfig.js';
import YAML from 'yaml';
const password = 'synthetic-test-passphrase-42';
const report = { stamp: 'prd-roktiw@aabbccd~private-branch', parts: { mode: 'emoji' as const, user: 'private-actor', branch: 'private-branch', commit: 'aabbccd', cloud: 'fb' } };
describe('security boundary', () => {
  it('encrypts default details and authenticates both content and policy', async () => {
    const payload = await buildPublicStamp(report, defaultSecurity, password);
    const wire = JSON.stringify(payload);
    expect(wire).not.toContain('private-actor'); expect(wire).not.toContain('aabbccd'); expect(wire).not.toContain(password);
    const decoded = await unlockReport(payload, password);
    expect(decoded.parts.commit).toBe('aabbccd'); expect(decoded.parts.user).toBeUndefined(); expect(decoded.parts.branch).toBeUndefined(); expect(decoded.stamp).not.toContain('roktiw');
    await expect(unlockReport(payload, 'different-test-passphrase')).rejects.toThrow();
    await expect(unlockReport({ ...payload, stamp: 'tampered' }, password)).rejects.toThrow();
    await expect(unlockReport({ ...payload, security: { ...defaultSecurity, exports: 'min' } }, password)).rejects.toThrow();
    const second = await buildPublicStamp(report, defaultSecurity, password);
    expect(second.sealed?.salt).not.toBe(payload.sealed?.salt); expect(second.sealed?.iv).not.toBe(payload.sealed?.iv);
  });
  it('fails closed without a password, and rejects weak passwords', async () => {
    await expect(buildPublicStamp(report, defaultSecurity, '')).rejects.toThrow('ESTAMPER_PASSWORD');
    await expect(buildPublicStamp(report, defaultSecurity, 'short')).rejects.toThrow('16');
  });
  it('never embeds report or ciphertext with backend access', async () => {
    const payload = await buildPublicStamp(report, { ...defaultSecurity, access: 'max' });
    expect(Object.keys(payload).sort()).toEqual(['security','stamp']);
  });
  it('only publishes full details through explicit min access and disclosure', async () => {
    const payload = await buildPublicStamp(report, { ...defaultSecurity, access: 'min', disclosure: 'min' });
    expect(payload.report).toEqual(report);
    const minimal = await buildPublicStamp(report, { ...defaultSecurity, access: 'min', disclosure: 'max' });
    expect(minimal.report?.parts).toEqual({ mode: 'emoji' });
  });
  it('rejects missing Git identity and uncertain/dirty max releases', () => {
    expect(() => checkRelease(defaultSecurity, { commit:'0000000', user:'x', dirty:false })).toThrow('commit');
    expect(() => checkRelease({ ...defaultSecurity, release:'max' }, { commit:'abcdef1',user:'x',dirty:true })).toThrow('clean');
    expect(() => checkRelease({ ...defaultSecurity, release:'max' }, { commit:'abcdef1',user:'x',dirty:false,available:false })).toThrow('clean');
  });
  it('validates all 81 independent policy combinations and rejects typos', () => {
    for (const access of ['min','mid','max']) for (const disclosure of ['min','mid','max']) for (const exports of ['min','mid','max']) for (const release of ['min','mid','max']) expect(resolveSecurity({ access, disclosure, exports, release })).toEqual({ access, disclosure, exports, release });
    expect(() => resolveSecurity({ access:'off' })).toThrow(); expect(() => resolveSecurity({ acess:'min' })).toThrow();
  });
  it('roundtrips complete YAML/JSON without mutating defaults', () => {
    for (const format of ['yaml', 'json'] as const) {
      const config = structuredClone(defaultConfig); config.security.exports = 'max';
      expect(parseConfig(format === 'yaml' ? YAML.stringify(config) : JSON.stringify(config), format)).toEqual(config);
    }
    expect(defaultConfig.security.exports).toBe('mid');
  });
  it('rejects config pollution, aliases, size, credentials and missing explicit files', async () => {
    expect(() => parseConfig('{"__proto__":{"polluted":true}}', 'json')).toThrow('Unsafe');
    expect(() => parseConfig('words: { allow: &x [a] }\nascii: { allow: *x }')).toThrow();
    expect(() => parseConfig('x'.repeat(131073))).toThrow('128');
    expect(() => parseConfig('password: secret')).toThrow('secret');
    await expect(loadConfig('/nonexistent/estamper-config.yml')).rejects.toThrow('Could not load');
  });
});
