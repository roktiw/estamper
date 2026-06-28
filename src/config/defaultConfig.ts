import { defaultAscii, defaultEmojis, defaultFormat, defaultWords } from '../core/defaults.js';
import type { StampogMode } from '../core/types.js';

export interface StampogConfig {
  name: string;
  mode: StampogMode;
  format: string;
  date: {
    format: string;
    timezone: 'local' | 'utc';
  };
  words: {
    allow: string[];
  };
  emojis: {
    allow: string[];
  };
  ascii: {
    allow: string[];
  };
  git: {
    commitLength: number;
    includeBranch: boolean;
    includeDirty: boolean;
    usernameSource: string;
    fallbackUsernameSource: string;
  };
  badge: {
    enabled: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
    startVisible: boolean;
    copyOnClick: boolean;
    showDetailsOnClick: boolean;
    theme: 'light' | 'dark';
  };
  output: {
    json: string;
    js: string;
    htmlSnippet: string;
  };
}

export const defaultConfig: StampogConfig = {
  name: 'stampog',
  mode: 'emoji',
  format: defaultFormat,
  date: {
    format: 'yyyy-mm-dd-hh:mm:ss',
    timezone: 'local',
  },
  words: {
    allow: defaultWords,
  },
  emojis: {
    allow: defaultEmojis,
  },
  ascii: {
    allow: defaultAscii,
  },
  git: {
    commitLength: 7,
    includeBranch: true,
    includeDirty: true,
    usernameSource: 'github',
    fallbackUsernameSource: 'git-config',
  },
  badge: {
    enabled: true,
    position: 'bottom-right',
    startVisible: true,
    copyOnClick: true,
    showDetailsOnClick: true,
    theme: 'dark',
  },
  output: {
    json: 'dist/stampog.json',
    js: 'dist/stampog.js',
    htmlSnippet: 'dist/stampog-snippet.html',
  },
};
