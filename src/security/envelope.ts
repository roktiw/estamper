import type { StampResult } from '../core/types.js';
import { resolveSecurity, type SecurityPolicy } from './policy.js';

export interface SealedReport {
  version: 1;
  salt: string;
  iv: string;
  ciphertext: string;
}
export interface PublicStamp {
  stamp: string;
  security: SecurityPolicy;
  sealed?: SealedReport;
  report?: StampResult;
}
const encoder = new TextEncoder();
const iterations = 600_000;
function encode(bytes: Uint8Array): string { return btoa(String.fromCharCode(...bytes)); }
function decode(value: string, length?: number): Uint8Array<ArrayBuffer> {
  if (typeof value !== 'string' || value.length > 90_000 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new Error('Invalid sealed report');
  const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  if (length && bytes.length !== length) throw new Error('Invalid sealed report');
  return bytes;
}
function aad(stamp: string, security: SecurityPolicy): Uint8Array<ArrayBuffer> {
  return encoder.encode(JSON.stringify({ stamp, security: resolveSecurity(security), version: 1 }));
}
async function key(password: string, salt: Uint8Array<ArrayBuffer>, crypto: Crypto): Promise<CryptoKey> {
  if (typeof password !== 'string' || password.length < 16 || password.length > 1024) throw new Error('Use a password of 16–1024 characters');
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export function validateReport(value: unknown): StampResult {
  if (!value || typeof value !== 'object') throw new Error('Invalid report');
  const report = value as StampResult;
  if (typeof report.stamp !== 'string' || !report.stamp || report.stamp.length > 512 || !report.parts || typeof report.parts !== 'object' || Array.isArray(report.parts)) throw new Error('Invalid report');
  if (JSON.stringify(report).length > 32_768) throw new Error('Report too large');
  for (const value of Object.values(report.parts)) {
    if (value !== null && value !== undefined && !['string', 'boolean'].includes(typeof value)) throw new Error('Invalid report field');
  }
  return report;
}
export function redactReport(value: StampResult, security: SecurityPolicy, identity: string): StampResult {
  const report = structuredClone(validateReport(value));
  if (security.disclosure !== 'min') { delete report.parts.user; delete report.parts.branch; report.stamp = identity; }
  if (security.disclosure === 'max') report.parts = { mode: report.parts.mode };
  return report;
}
export async function sealReport(report: StampResult, password: string, stamp: string, security: SecurityPolicy, crypto: Crypto = globalThis.crypto): Promise<SealedReport> {
  validateReport(report);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad(stamp, security) }, await key(password, salt, crypto), encoder.encode(JSON.stringify(report)));
  return { version: 1, salt: encode(salt), iv: encode(iv), ciphertext: encode(new Uint8Array(ciphertext)) };
}
export async function unlockReport(payload: PublicStamp, password: string, crypto: Crypto = globalThis.crypto): Promise<StampResult> {
  const sealed = payload.sealed;
  if (!sealed || sealed.version !== 1) throw new Error('Invalid sealed report');
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(sealed.iv, 12), additionalData: aad(payload.stamp, payload.security) }, await key(password, decode(sealed.salt, 16), crypto), decode(sealed.ciphertext));
  return validateReport(JSON.parse(new TextDecoder().decode(plaintext)));
}
