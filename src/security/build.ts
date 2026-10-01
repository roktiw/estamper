import { createHash, webcrypto } from 'node:crypto';
import type { StampResult } from '../core/types.js';
import type { GitInfo } from '../git/getGitInfo.js';
import { resolveSecurity, type SecurityPolicy } from './policy.js';
import { sealReport, redactReport, type PublicStamp } from './envelope.js';
export function checkRelease(security: SecurityPolicy, git: GitInfo): void {
  if (security.release !== 'min' && (!/^[a-f0-9]{7,64}$/i.test(git.commit) || /^0+$/.test(git.commit))) throw new Error('Release policy requires a Git commit');
  if (security.release === 'max' && (git.dirty || git.available === false)) throw new Error('Release policy requires a verified clean working tree');
}
export async function buildPublicStamp(result: StampResult, policy: SecurityPolicy, password = process.env.ESTAMPER_PASSWORD): Promise<PublicStamp> {
  const security = resolveSecurity(policy);
  const identity = createHash('sha256').update(result.stamp).digest('hex').slice(0, 16);
  const stamp = `build-${identity}`;
  const report = redactReport(result, security, stamp);
  if (security.access === 'max') return { stamp, security };
  if (security.access === 'min') return { stamp: security.disclosure === 'min' ? result.stamp : stamp, security, report };
  if (!password) throw new Error('Password access requires ESTAMPER_PASSWORD at build time; never put it in config or VITE_* variables');
  return { stamp, security, sealed: await sealReport(report, password, stamp, security, webcrypto as unknown as Crypto) };
}
