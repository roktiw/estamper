import { execFileSync } from 'node:child_process';
import { getGithubActionsInfo } from './getGithubActionsInfo.js';

export interface GitInfo {
  commit: string;
  branch?: string;
  user: string;
  dirty: boolean;
}

function git(args: string[]): string | undefined {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return undefined;
  }
}

export function getGitInfo(commitLength = 7): GitInfo {
  const gha = getGithubActionsInfo();
  const commit = (gha.commit ?? git(['rev-parse', 'HEAD']) ?? 'unknown').slice(0, commitLength);
  const branch = gha.branch ?? git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const user = gha.user ?? git(['config', 'user.name']) ?? 'unknown';
  const status = git(['status', '--porcelain']) ?? '';
  return {
    commit,
    branch: branch === 'HEAD' ? undefined : branch,
    user,
    dirty: status.length > 0,
  };
}
