export type SecurityLevel = 'min' | 'mid' | 'max';
export interface SecurityPolicy {
  access: SecurityLevel;
  disclosure: SecurityLevel;
  exports: SecurityLevel;
  release: SecurityLevel;
}
export const defaultSecurity: Readonly<SecurityPolicy> = Object.freeze({ access: 'mid', disclosure: 'mid', exports: 'mid', release: 'mid' });
export const securityChoices = {
  access: ['Public details (explicit opt-in)', 'Password-encrypted details', 'Authenticated backend, no embedded details'],
  disclosure: ['Full report', 'No actor or branch', 'Build identity only'],
  exports: ['TXT and JSON after unlock', 'TXT after unlock', 'No export controls'],
  release: ['Local experiments', 'Require Git commit', 'Require Git commit and clean working tree'],
} as const;
export function resolveSecurity(value: unknown = {}): SecurityPolicy {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('security must be an object');
  const input = value as Record<string, unknown>;
  for (const key of Object.keys(input)) {
    if (!Object.hasOwn(defaultSecurity, key)) throw new Error(`Unknown security option: ${key}`);
  }
  const result = { ...defaultSecurity, ...input };
  for (const [key, level] of Object.entries(result)) {
    if (!['min', 'mid', 'max'].includes(level as string)) throw new Error(`security.${key} must be min, mid or max`);
  }
  return result as SecurityPolicy;
}
