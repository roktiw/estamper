import { describe, expect, it } from 'vitest';
import { getGithubActionsInfo } from '../src/git/getGithubActionsInfo.js';

describe('GitHub Actions env parsing', () => {
  it('maps GitHub env to stamp fields', () => {
    expect(getGithubActionsInfo({
      GITHUB_SHA: 'abcdef123456',
      GITHUB_REF_NAME: 'main',
      GITHUB_ACTOR: 'roktiw',
    })).toEqual({
      commit: 'abcdef123456',
      branch: 'main',
      user: 'roktiw',
    });
  });
});
