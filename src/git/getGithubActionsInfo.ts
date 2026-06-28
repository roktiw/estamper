export interface GithubActionsInfo {
  commit?: string;
  branch?: string;
  user?: string;
}

export function getGithubActionsInfo(env: NodeJS.ProcessEnv = process.env): GithubActionsInfo {
  return {
    commit: env.GITHUB_SHA,
    branch: env.GITHUB_REF_NAME,
    user: env.GITHUB_ACTOR,
  };
}
